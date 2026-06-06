package models

type WeatherCondition string

const (
	Sunny   WeatherCondition = "sunny"
	Cloudy  WeatherCondition = "cloudy"
	Rainy   WeatherCondition = "rainy"
	Snowy   WeatherCondition = "snowy"
	Foggy   WeatherCondition = "foggy"
	Default WeatherCondition = "default"
)

type WeatherData struct {
	Province      string           `json:"province"`
	City          string           `json:"city"`
	Adcode        string           `json:"adcode"`
	Weather       string           `json:"weather"`
	Condition     WeatherCondition `json:"condition"`
	Temperature   string           `json:"temperature"`
	Humidity      string           `json:"humidity"`
	WindDirection string           `json:"windDirection"`
	WindPower     string           `json:"windPower"`
	ReportTime    string           `json:"reportTime"`
}
