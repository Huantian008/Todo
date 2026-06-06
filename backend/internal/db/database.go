package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDatabase *mongo.Database

// Connect initializes a connection to MongoDB and checks if the server is responsive
func Connect(mongoURI, dbName string) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, err
	}

	// Ping connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	log.Printf("Connected to MongoDB at: %s", mongoURI)
	MongoClient = client
	MongoDatabase = client.Database(dbName)
	return client, nil
}

// Disconnect cleans up database connections
func Disconnect() {
	if MongoClient == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := MongoClient.Disconnect(ctx); err != nil {
		log.Printf("Error during MongoDB disconnect: %v", err)
	}
}
