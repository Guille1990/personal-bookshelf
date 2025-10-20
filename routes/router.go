package routes

import (
	"github.com/Guille1990/personal-bookshelf/controllers"
	"github.com/Guille1990/personal-bookshelf/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.StaticFiles())

	api := r.Group("/api")
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)

		authItem := api.Group("/items")
		authItem.Use(middleware.AuthMiddleware())
		{
			authItem.POST("/", controllers.CreateItem)
			authItem.GET("/", controllers.GetItems)
			authItem.GET("/:id", controllers.GetItemByID)
			authItem.PUT("/:id", controllers.UpdateItems)
			authItem.DELETE("/:id", controllers.DeleteItems)
			authItem.GET("/filter", controllers.FilterItemsByTags)
		}

		authTag := api.Group("/tags")
		authTag.Use(middleware.AuthMiddleware())
		{
			authTag.POST("/", controllers.CreateTag)
			authTag.GET("/", controllers.GetTags)
			authTag.GET("/:id/items", controllers.GetItemsByTag)
		}
	}

	return r
}
