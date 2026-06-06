package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MongoURI      string
	MongoDatabase string
	AmapKey       string
	CorsOrigin    string
}

// Load loads configurations from .env and environment variables
func Load() *Config {
	// Load .env from backend directory
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found, using system environment variables")
	}

	return &Config{
		Port:          getEnv("PORT", "3001"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDatabase: getEnv("MONGO_DATABASE", "todo_app"),
		AmapKey:       getEnv("AMAP_KEY", ""),
		CorsOrigin:    getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
