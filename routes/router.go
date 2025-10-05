package routes

import (
	"github.com/Guille1990/personal-bookshelf/controllers"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)

	return r
}
