package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username     string `gorm:"unique"`
	Email        string `gorm:"unique"`
	PasswordHash string
	Items        []Item
}

type Tag struct {
	gorm.Model
	Name  string `gorm:"unique"`
	Items []Item `gorm:"many2many:item_tags"`
}

type Item struct {
	gorm.Model
	UserID          uint   `json:"-"`
	Title           string `json:"title"`
	Author          string `json:"author"`
	Type            string `json:"type"` // "Libro" o "Manga"
	Language        string `json:"language"`
	PublicationYear string `json:"publication_year"`
	Status          string `json:"status"` // "Leyendo", "Terminado", "Pendiente"
	Rating          int    `json:"rating"`
	Notes           string `json:"notes"`
	CoverURL        string `json:"cover_url"`
	Tags            []Tag  `gorm:"many2many:item_tags" json:"tags"`
}

type ItemTag struct {
	ItemID uint
	TagID  uint
}
