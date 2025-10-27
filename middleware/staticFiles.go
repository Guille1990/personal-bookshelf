package middleware

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func StaticFiles() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Si es una ruta de API, continuar
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.Next()
			return
		}

		// Health check endpoint
		if c.Request.URL.Path == "/health" {
			c.JSON(http.StatusOK, gin.H{
				"status":    "ok",
				"timestamp": time.Now().Unix(),
				"version":   "1.0.0",
			})
			return
		}

		// Directorio de archivos estáticos
		staticDir := "./web/dist/browser"
		requestPath := c.Request.URL.Path

		// Si es la raíz, servir index.html
		if requestPath == "/" {
			c.File(filepath.Join(staticDir, "index.html"))
			return
		}

		// Intentar servir el archivo solicitado
		staticFilePath := filepath.Join(staticDir, requestPath)

		// Verificar si el archivo existe
		if info, err := os.Stat(staticFilePath); err == nil && !info.IsDir() {
			c.File(staticFilePath)
			return
		}

		// Para rutas de Angular (SPA), servir index.html
		// Solo si no contiene extensión de archivo
		if !strings.Contains(requestPath, ".") {
			c.File(filepath.Join(staticDir, "index.html"))
			return
		}

		// Si llegamos aquí, el archivo no existe
		c.Status(http.StatusNotFound)
	})
}
