package handlers

import (
	"net/http"
	"strings"

	"backend/internal/services"

	"github.com/gin-gonic/gin"
)

type WeatherHandler struct {
	service *services.WeatherService
}

func NewWeatherHandler(service *services.WeatherService) *WeatherHandler {
	return &WeatherHandler{service: service}
}

// GetTodayWeather handles GET /api/weather/today?lat=...&lng=...
func (h *WeatherHandler) GetTodayWeather(c *gin.Context) {
	lat := strings.TrimSpace(c.Query("lat"))
	lng := strings.TrimSpace(c.Query("lng"))

	if lat == "" || lng == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Missing required query parameters: 'lat' and 'lng'",
			"data":    nil,
		})
		return
	}

	data, err := h.service.GetWeatherByCoords(lat, lng)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
