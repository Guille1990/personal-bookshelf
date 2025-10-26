package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/Guille1990/personal-bookshelf/config"
	"github.com/Guille1990/personal-bookshelf/middleware"
	"github.com/Guille1990/personal-bookshelf/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct{}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

func (ac *AuthController) Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	user := models.User{
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el usuario"})
	}

	token, _ := middleware.GenerateToken(user.ID)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func (ac *AuthController) Login(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if !checkRateLimit(c.ClientIP()) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo más tarde."})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	if user.IsLocked && time.Now().Before(user.LockedUntil) {
		c.JSON(http.StatusLocked, gin.H{"error": "cuenta bloqueada temporalmente"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		handleFailedLogin(&user)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	resetFailedAttempts(&user)

	accessToken, refreshToken, err := generateTokenPair(user.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar tokens"})
		return
	}

	if err := saveRefreshToken(user.ID, refreshToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar el token de refresco"})
		return
	}

	c.JSON(http.StatusOK, TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(config.AccessTokenExpiry.Seconds()),
		TokenType:    "bearer",
	})
}

var loginAttempts = make(map[string][]time.Time)

func checkRateLimit(ip string) bool {
	now := time.Now()
	attempts := loginAttempts[ip]

	// Limpiar intentos antiguos (últimos 15 minutos)
	var recentAttempts []time.Time
	for _, attempt := range attempts {
		if now.Sub(attempt) < 15*time.Minute {
			recentAttempts = append(recentAttempts, attempt)
		}
	}

	if len(recentAttempts) >= 10 { // Máximo 10 intentos en 15 minutos
		return false
	}

	recentAttempts = append(recentAttempts, now)
	loginAttempts[ip] = recentAttempts
	return true
}

func (ac *AuthController) RefreshToken(c *gin.Context) {
	type RefreshInput struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	var req RefreshInput

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var storedToken models.RefreshToken
	if err := config.DB.Where("token = ? AND is_revoked = false AND expires_at > ?",
		req.RefreshToken, time.Now()).First(&storedToken).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de refresco inválido"})
		return
	}

	storedToken.IsRevoked = true
	config.DB.Save(&storedToken)

	accessToken, refreshToken, err := generateTokenPair(storedToken.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar tokens"})
		return
	}

	if err := saveRefreshToken(storedToken.UserID, refreshToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar el token de refresco"})
		return
	}

	c.JSON(http.StatusOK, TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(config.AccessTokenExpiry.Seconds()),
		TokenType:    "Bearer",
	})
}

func (ac *AuthController) Logout(c *gin.Context) {
	tokenString := extractTokenFromHeader(c)
	if tokenString == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token no proporcionado"})
		return
	}

	if err := blacklistToken(tokenString); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al cerrar sesión"})
		return
	}

	userID, _ := c.Get("userID")
	if uid, ok := userID.(uint); ok {
		config.DB.Model(&models.RefreshToken{}).
			Where("user_id = ? AND is_revoked = false", uid).
			Update("is_revoked", true)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cierre de sesión exitoso"})
}

func resetFailedAttempts(user *models.User) {
	user.FailedAttempts = 0
	user.IsLocked = false
	user.LockedUntil = time.Time{}
	config.DB.Save(user)
}

func handleFailedLogin(user *models.User) {
	user.FailedAttempts++
	if user.FailedAttempts >= 5 {
		user.IsLocked = true
		user.LockedUntil = time.Now().Add(15 * time.Minute)
	}
	config.DB.Save(user)
}

func generateTokenPair(userID uint) (string, string, error) {
	accessClaims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(config.AccessTokenExpiry).Unix(),
		"iat":     time.Now().Unix(),
		"type":    "access",
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(config.JWTSecret)
	if err != nil {
		return "", "", err
	}

	refreshTokenBytes := make([]byte, 32)
	rand.Read(refreshTokenBytes)
	refreshTokenString := hex.EncodeToString(refreshTokenBytes)

	return accessTokenString, refreshTokenString, nil
}

func saveRefreshToken(userID uint, tokenString string) error {
	refreshToken := models.RefreshToken{
		UserID:    userID,
		Token:     tokenString,
		ExpiresAt: time.Now().Add(config.RefreshTokenExpiry),
	}

	return config.DB.Create(&refreshToken).Error
}

func extractTokenFromHeader(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		return authHeader[7:]
	}
	return ""
}

func blacklistToken(token string) error {
	parsedToken, _ := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return config.JWTSecret, nil
	})

	var expiresAt time.Time
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok {
		if exp, ok := claims["exp"].(float64); ok {
			expiresAt = time.Unix(int64(exp), 0)
		}
	}

	blacklistEntry := models.TokenBlacklist{
		Token:     token,
		ExpiresAt: expiresAt,
	}
	return config.DB.Create(&blacklistEntry).Error
}
