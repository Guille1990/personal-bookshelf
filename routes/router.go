package routes

import (
	"github.com/Guille1990/personal-bookshelf/controllers"
	"github.com/Guille1990/personal-bookshelf/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.StaticFiles())

	authController := &controllers.AuthController{}
	itemController := &controllers.ItemController{}
	tagController := &controllers.TagController{}

	api := r.Group("/api")
	{
		api.POST("/register", authController.Register)
		api.POST("/login", authController.Login)
		api.POST("/refresh", authController.RefreshToken)
		api.POST("/logout", middleware.AuthMiddleware(), authController.Logout)

		authItem := api.Group("/items")
		authItem.Use(middleware.AuthMiddleware())
		{
			authItem.POST("/", itemController.CreateItem)
			authItem.GET("/", itemController.GetItems)
			authItem.GET("/:id", itemController.GetItemByID)
			authItem.PUT("/:id", itemController.UpdateItems)
			authItem.DELETE("/:id", itemController.DeleteItems)
			authItem.GET("/filter", itemController.FilterItemsByTags)
		}

		authTag := api.Group("/tags")
		authTag.Use(middleware.AuthMiddleware())
		{
			authTag.POST("/", tagController.CreateTag)
			authTag.GET("/", tagController.GetTags)
			authTag.GET("/:id/items", itemController.GetItemsByTag)
		}
	}

	return r
}
