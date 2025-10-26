package controllers

import (
	"github.com/Guille1990/personal-bookshelf/config"
	"github.com/Guille1990/personal-bookshelf/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

type TagController struct{}

func (tc *TagController) CreateTag(c *gin.Context) {
	var tag models.Tag
	if err := c.ShouldBindJSON(&tag); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if err := config.DB.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la etiqueta"})
		return
	}

	c.JSON(http.StatusCreated, tag)
}

func (tc *TagController) GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := config.DB.Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener las etiquetas"})
		return
	}

	c.JSON(http.StatusOK, tags)
}
