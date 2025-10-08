package routes

import (
	"github.com/Guille1990/personal-bookshelf/controllers"
	"github.com/Guille1990/personal-bookshelf/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)

	authItem := r.Group("/items")
	authItem.Use(middleware.AuthMiddleware())
	{
		authItem.POST("/", controllers.CreateItem)
		authItem.GET("/", controllers.GetItems)
		authItem.PUT("/:id", controllers.UpdateItems)
		authItem.DELETE("/:id", controllers.DeleteItems)
	}

	authTag := r.Group("/tags")
	authTag.Use(middleware.AuthMiddleware())
	{
		authTag.POST("/", controllers.CreateTag)
		authTag.GET("/", controllers.GetTags)
	}

	return r
}
