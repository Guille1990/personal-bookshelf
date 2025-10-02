package config

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	database, error := gorm.Open(sqlite.Open("bookshelf.db"), &gorm.Config{})

	if error != nil {
		panic("Error al conectarse a la base de datos")
	}

	DB = database
}
