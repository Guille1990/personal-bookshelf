package config

import (
	"crypto/rand"
	"fmt"
	"os"
	"time"
)

var (
	JWTSecret     []byte
	RefreshSecret []byte
)

func InitJWTSecrets() {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		JWTSecret = []byte(secret)
	} else {
		JWTSecret = generateSecret()
		fmt.Println("Advertencia: Usando un JWT_SECRET generado aleatoriamente. Los tokens serán inválidos al reiniciar la aplicación.")
	}

	if refreshSecret := os.Getenv("REFRESH_SECRET"); refreshSecret != "" {
		RefreshSecret = []byte(refreshSecret)
	} else {
		RefreshSecret = generateSecret()
		fmt.Println("Advertencia: Usando un REFRESH_SECRET generado aleatoriamente. Los tokens serán inválidos al reiniciar la aplicación.")
	}
}

func generateSecret() []byte {
	bytes := make([]byte, 32)

	if _, err := rand.Read(bytes); err != nil {
		panic("Error generando secreto seguro: " + err.Error())
	}

	return bytes
}

const (
	AccessTokenExpiry  = 15 * time.Minute
	RefreshTokenExpiry = 7 * 24 * time.Hour
)
