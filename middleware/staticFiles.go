package middleware

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

func StaticFiles() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.Next()
			return
		}

		staticFilePath := filepath.Join("./web/dist/browser", c.Request.URL.Path)

		if info, err := os.Stat(staticFilePath); err == nil && !info.IsDir() {
			c.File(staticFilePath)
			return
		}

		c.File("./web/dist/browser/index.html")
	})
}
