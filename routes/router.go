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

	auth := r.Group("/items")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.POST("/", controllers.CreateItem)
		auth.GET("/", controllers.GetItems)
		auth.PUT("/:id", controllers.UpdateItems)
		auth.DELETE("/:id", controllers.DeleteItems)
	}

	return r
}
