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
	UserID          uint
	Title           string
	Author          string
	Type            string // "Libro" o "Manga"
	Language        string
	PublicationYear string
	Status          string // "Leyendo", "Terminado", "Pendiente"
	Rating          int
	Notes           string
	CoverURL        string
	Tags            []Tag `gorm:"many2many:item_tags"`
}

type ItemTag struct {
	ItemID uint
	TagID  uint
}
