package controllers

import (
	"github.com/Guille1990/personal-bookshelf/config"
	"github.com/Guille1990/personal-bookshelf/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func CreateItem(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var input models.Item

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	input.UserID = userID

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el ítem"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

func GetItems(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var items []models.Item
	if err := config.DB.Where("user_id = ?", userID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener los ítems"})
		return
	}

	c.JSON(http.StatusOK, items)
}

func UpdateItems(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	itemID := c.Param("id")

	var item models.Item
	if err := config.DB.Where("id = ? AND user_id = ?", itemID, userID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ítem no encontrado"})
		return
	}

	var input models.Item
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	config.DB.Model(&item).Updates(input)
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

	config.DB.Delete(&item)
	c.JSON(http.StatusOK, gin.H{"message": "Ítem eliminado exitosamente"})
}
