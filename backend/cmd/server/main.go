package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/config"
	"backend/internal/db"
	"backend/internal/handlers"
	"backend/internal/repositories"
	"backend/internal/routes"
	"backend/internal/services"
)

func main() {
	// 1. Load Configurations
	cfg := config.Load()

	// 2. Connect to MongoDB
	client, err := db.Connect(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Disconnect()

	// 3. Instantiate Layers
	todoRepo := repositories.NewMongoTodoRepository(client.Database(cfg.MongoDatabase))
	weatherService := services.NewWeatherService(cfg.AmapKey)

	todoHandler := handlers.NewTodoHandler(todoRepo)
	weatherHandler := handlers.NewWeatherHandler(weatherService)

	router := routes.SetupRouter(todoHandler, weatherHandler, cfg.CorsOrigin)

	// 4. Start HTTP Server
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Run server in a goroutine
	go func() {
		log.Printf("Server running on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server Listen error: %v", err)
		}
	}()

	// Setup channel to catch interrupt signals for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Server is shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited successfully")
}
