package models

import (
	"encoding/json"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Todo struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description,omitempty" json:"description,omitempty"`
	Completed   bool               `bson:"completed" json:"completed"`
	TaskDate    string             `bson:"taskDate" json:"taskDate"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// MarshalJSON customizes JSON serialization to output ObjectID as string hex
func (t Todo) MarshalJSON() ([]byte, error) {
	type Alias Todo
	idHex := ""
	if !t.ID.IsZero() {
		idHex = t.ID.Hex()
	}
	
	// Create struct representation for JSON output
	return json.Marshal(&struct {
		ID string `json:"id"`
		Alias
	}{
		ID:    idHex,
		Alias: Alias(t),
	})
}
