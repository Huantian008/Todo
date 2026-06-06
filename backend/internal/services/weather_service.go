package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"backend/internal/models"
)

type WeatherService struct {
	apiKey string
}

func NewWeatherService(apiKey string) *WeatherService {
	return &WeatherService{apiKey: apiKey}
}

// AMap Geocoding Structs
type aMapRegeoResponse struct {
	Status    string `json:"status"`
	Info      string `json:"info"`
	Infocode  string `json:"infocode"`
	Regeocode struct {
		AddressComponent struct {
			Province string      `json:"province"`
			City     interface{} `json:"city"` // Can be string or empty array [] in AMap JSON
			Adcode   string      `json:"adcode"`
		} `json:"addressComponent"`
	} `json:"regeocode"`
}

// AMap Weather Structs
type aMapWeatherResponse struct {
	Status   string `json:"status"`
	Info     string `json:"info"`
	Infocode string `json:"infocode"`
	Lives    []struct {
		Province      string `json:"province"`
		City          string `json:"city"`
		Adcode        string `json:"adcode"`
		Weather       string `json:"weather"`
		Temperature   string `json:"temperature"`
		WindDirection string `json:"winddirection"`
		WindPower     string `json:"windpower"`
		Humidity      string `json:"humidity"`
		ReportTime    string `json:"reporttime"`
	} `json:"lives"`
}

// GetWeatherByCoords performs reverse geocoding to find the adcode, then retrieves live weather
func (s *WeatherService) GetWeatherByCoords(lat, lng string) (*models.WeatherData, error) {
	if s.apiKey == "" {
		return nil, fmt.Errorf("AMap API Key is not configured")
	}

	// 1. Call Reverse Geocoding API to fetch adcode
	// AMap expects: location=lng,lat
	regeoURL := fmt.Sprintf(
		"https://restapi.amap.com/v3/geocode/regeo?key=%s&location=%s,%s&extensions=base&output=json",
		s.apiKey, lng, lat,
	)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(regeoURL)
	if err != nil {
		return nil, fmt.Errorf("failed calling AMap geocode: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("geocode API returned non-200 code: %d", resp.StatusCode)
	}

	var regeoData aMapRegeoResponse
	if err := json.NewDecoder(resp.Body).Decode(&regeoData); err != nil {
		return nil, fmt.Errorf("failed decoding geocode response: %w", err)
	}

	if regeoData.Status != "1" {
		return nil, fmt.Errorf("geocode API error: %s (infocode: %s)", regeoData.Info, regeoData.Infocode)
	}

	adcode := regeoData.Regeocode.AddressComponent.Adcode
	if adcode == "" {
		return nil, fmt.Errorf("could not retrieve adcode from geocode component")
	}

	// 2. Call Weather Info API
	weatherURL := fmt.Sprintf(
		"https://restapi.amap.com/v3/weather/weatherInfo?key=%s&city=%s&extensions=base&output=json",
		s.apiKey, adcode,
	)

	wResp, err := client.Get(weatherURL)
	if err != nil {
		return nil, fmt.Errorf("failed calling AMap weather: %w", err)
	}
	defer wResp.Body.Close()

	if wResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("weather API returned non-200 code: %d", wResp.StatusCode)
	}

	var weatherData aMapWeatherResponse
	if err := json.NewDecoder(wResp.Body).Decode(&weatherData); err != nil {
		return nil, fmt.Errorf("failed decoding weather response: %w", err)
	}

	if weatherData.Status != "1" {
		return nil, fmt.Errorf("weather API error: %s (infocode: %s)", weatherData.Info, weatherData.Infocode)
	}

	if len(weatherData.Lives) == 0 {
		return nil, fmt.Errorf("weather API returned empty live weather data list")
	}

	live := weatherData.Lives[0]

	// 3. Build response and normalize condition
	result := &models.WeatherData{
		Province:      live.Province,
		City:          live.City,
		Adcode:        live.Adcode,
		Weather:       live.Weather,
		Condition:     NormalizeCondition(live.Weather),
		Temperature:   live.Temperature,
		Humidity:      live.Humidity,
		WindDirection: live.WindDirection,
		WindPower:     live.WindPower,
		ReportTime:    live.ReportTime,
	}

	return result, nil
}

// NormalizeCondition maps raw weather descriptions to theme groups
func NormalizeCondition(weather string) models.WeatherCondition {
	if strings.Contains(weather, "晴") {
		return models.Sunny
	}
	if strings.Contains(weather, "云") || strings.Contains(weather, "阴") {
		return models.Cloudy
	}
	if strings.Contains(weather, "雨") {
		return models.Rainy
	}
	if strings.Contains(weather, "雪") {
		return models.Snowy
	}
	if strings.Contains(weather, "雾") || strings.Contains(weather, "霾") || strings.Contains(weather, "沙") || strings.Contains(weather, "尘") {
		return models.Foggy
	}
	return models.Default
}
