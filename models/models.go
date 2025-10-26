package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID             uint           `json:"id" gorm:"primaryKey"`
	Email          string         `json:"email" gorm:"unique;not null"`
	Password       string         `json:"password" gorm:"not null"`
	Name           string         `json:"name"`
	FailedAttempts int            `json:"-" gorm:"default:0"`
	IsLocked       bool           `json:"-" gorm:"default:false"`
	LockedUntil    time.Time      `json:"-"`
	LastLoginAt    time.Time      `json:"last_login_at"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`

	Items []Item `json:"items,omitempty" gorm:"foreignKey:UserID"`
}

type Tag struct {
	gorm.Model
	Name  string `gorm:"unique" json:"name"`
	Items []Item `gorm:"many2many:item_tags"`
}

type Item struct {
	gorm.Model
	UserID          uint   `json:"-"`
	Title           string `json:"title"`
	Author          string `json:"author"`
	Type            string `json:"type"` // "Libro" o "Manga"
	Genre           string `json:"genre"`
	Language        string `json:"language"`
	PublicationYear string `json:"publication_year"`
	Status          string `json:"status"` // "Leyendo", "Terminado", "Pendiente"
	Rating          int    `json:"rating"`
	Notes           string `json:"notes"`
	CoverURL        string `json:"cover_url"`
	Tags            []Tag  `gorm:"many2many:item_tags" json:"tags"`
}

type ItemTags struct {
	ItemID uint
	TagID  uint
}

type RefreshToken struct {
	gorm.Model
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	Token     string    `json:"token" gorm:"unique;not null"`
	ExpiresAt time.Time `json:"expires_at"`
	IsRevoked bool      `json:"is_revoked" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	User User `json:"user" gorm:"foreignKey:UserID"`
}

type TokenBlacklist struct {
	gorm.Model
	ID        uint      `json:"id" gorm:"primaryKey"`
	Token     string    `json:"token" gorm:"unique;not null"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}
