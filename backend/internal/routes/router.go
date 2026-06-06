package routes

import (
	"net/http"

	"backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

// SetupRouter configures routes, middleware, and handlers for the Gin engine
func SetupRouter(todoHandler *handlers.TodoHandler, weatherHandler *handlers.WeatherHandler, corsOrigin string) *gin.Engine {
	r := gin.Default()

	// CORS middleware configuration
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", corsOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// API endpoints group
	api := r.Group("/api")
	{
		// Todo CRUD
		api.GET("/todos", todoHandler.ListTodos)
		api.GET("/todos/:id", todoHandler.GetTodoByID)
		api.POST("/todos", todoHandler.CreateTodo)
		api.PUT("/todos/:id", todoHandler.UpdateTodo)
		api.DELETE("/todos/:id", todoHandler.DeleteTodo)

		// Weather Proxy
		api.GET("/weather/today", weatherHandler.GetTodayWeather)
	}

	return r
}
