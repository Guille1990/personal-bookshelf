package main

import (
	"github.com/Guille1990/personal-bookshelf/config"
	"github.com/Guille1990/personal-bookshelf/models"
	"github.com/Guille1990/personal-bookshelf/routes"
)

func main() {
	config.ConnectDatabase()
	config.DB.AutoMigrate(&models.User{}, &models.Item{}, &models.Tag{}, &models.ItemTag{})

	r := routes.SetupRouter()
	r.Run(":8080")
}
