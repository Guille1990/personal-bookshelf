package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/Guille1990/personal-bookshelf/config"
	"github.com/Guille1990/personal-bookshelf/models"
	"github.com/gin-gonic/gin"
)

type itemInput struct {
	Title           string `json:"title"`
	Author          string `json:"author"`
	Type            string `json:"type"` // "Libro" o "Manga"
	Genre           string `json:"genre"`
	Language        string `json:"language"`
	PublicationYear string `json:"publication_year"`
	Status          string `json:"status"` // "Leyendo", "Terminado", "Pendiente"
	Rating          int    `json:"rating"`
	Notes           string `json:"notes"`
	CoverURL        string `json:"cover_url"`
	TagsIDs         []uint `json:"tags_ids"`
}

func CreateItem(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var input models.Item

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "details": err.Error()})
		return
	}

	input.UserID = userID

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el ítem"})
		return
	}

	// si vienen tags, asociarlas
	if len(input.Tags) > 0 {
		var tags []models.Tag
		var existingTag models.Tag
		for _, t := range input.Tags {
			if err := config.DB.Where("name = ?", t.Name).First(&existingTag).Error; err == nil {
				tags = append(tags, existingTag)
				continue
			}
		}
		config.DB.Model(&input).Association("Tags").Replace(&tags)
	}

	c.JSON(http.StatusCreated, input)
}

func GetItems(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var items []models.Item
	if err := config.DB.Preload("Tags").Where("user_id = ?", userID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los ítems", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

func GetItemByID(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	id := c.Param("id")

	var item models.Item
	if err := config.DB.Preload("Tags").Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ítem no encontrado"})
		return
	}

	c.JSON(http.StatusOK, item)
}

func GetItemsByTag(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	tagID := c.Param("id")
	fmt.Println("Tag ID============================================:", tagID)
	var tag models.Tag
	if err := config.DB.Where("id = ?", tagID).First(&tag).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Etiqueta no encontrada"})
		return
	}

	var items []models.Item
	if err := config.DB.Preload("Tags").Joins("JOIN item_tags ON item_tags.item_id = items.id").
		Where("item_tags.tag_id = ? AND items.user_id = ?", tag.ID, userID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los ítems", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

func FilterItemsByTags(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	tagsIDs := strings.Split(c.Query("tags"), ",")
	mode := c.DefaultQuery("mode", "or")

	fmt.Println("Tags IDs============================================:", tagsIDs)
	fmt.Println("Mode============================================:", mode)
	var items []models.Item

	query := config.DB.Model(&models.Item{}).
		Joins("JOIN item_tags ON item_tags.item_id = items.id").
		Where("items.user_id = ?", userID)

	if mode == "and" {
		query = query.
			Where("item_tags.tag_id IN (?)", tagsIDs).
			Group("items.id").
			Having("COUNT(DISTINCT item_tags.tag_id) = ?", len(tagsIDs))
	} else {
		query = query.Where("item_tags.tag_id IN (?)", tagsIDs)
	}

	if err := query.Preload("Tags").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los ítems", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

func UpdateItems(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	itemID := c.Param("id")

	var item models.Item
	if err := config.DB.Preload("Tags").Where("id = ? AND user_id = ?", itemID, userID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ítem no encontrado"})
		return
	}

	var input itemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "details": err.Error()})
		return
	}

	updates := validateItemInput(input)

	if err := config.DB.Model(&item).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el ítem", "details": err.Error()})
		return
	}

	// Actualizar tags si se proporcionaron
	if len(input.TagsIDs) > 0 {
		var tags []models.Tag
		if err := config.DB.Where("id IN ?", input.TagsIDs).Find(&tags).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al encontrar las etiquetas", "details": err.Error()})
			return
		}

		if err := config.DB.Model(&item).Association("Tags").Replace(&tags); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al asociar las etiquetas", "details": err.Error()})
			return
		}
	} else if input.TagsIDs != nil && len(input.TagsIDs) == 0 {
		// Si se envía un array vacío, limpiar las tags
		if err := config.DB.Model(&item).Association("Tags").Clear(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al limpiar las etiquetas", "details": err.Error()})
			return
		}
	}

	// Recargar el item con las tags actualizadas
	if err := config.DB.Preload("Tags").Where("id = ?", item.ID).First(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al recargar el ítem", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

func DeleteItems(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	id := c.Param("id")

	var item models.Item
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ítem no encontrado"})
		return
	}

	config.DB.Model(&item).Association("Tags").Clear()
	config.DB.Delete(&item)
	c.JSON(http.StatusOK, gin.H{"message": "Ítem eliminado exitosamente"})
}

func validateItemInput(input itemInput) map[string]interface{} {
	updates := map[string]interface{}{}

	if input.Title != "" {
		updates["title"] = input.Title
	}
	if input.Author != "" {
		updates["author"] = input.Author
	}
	if input.Type != "" {
		updates["type"] = input.Type
	}
	if input.Genre != "" {
		updates["genre"] = input.Genre
	}
	if input.Language != "" {
		updates["language"] = input.Language
	}
	if input.PublicationYear != "" {
		updates["publication_year"] = input.PublicationYear
	}
	if input.Status != "" {
		updates["status"] = input.Status
	}
	if input.Rating != 0 {
		updates["rating"] = input.Rating
	}
	if input.Notes != "" {
		updates["notes"] = input.Notes
	}
	if input.CoverURL != "" {
		updates["cover_url"] = input.CoverURL
	}

	return updates
}
