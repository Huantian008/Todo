package repositories

import (
	"context"
	"time"

	"backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type TodoRepository interface {
	GetAll(ctx context.Context, date string) ([]models.Todo, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*models.Todo, error)
	Create(ctx context.Context, todo *models.Todo) error
	Update(ctx context.Context, id primitive.ObjectID, updateFields bson.M) (*models.Todo, error)
	Delete(ctx context.Context, id primitive.ObjectID) error
}

type MongoTodoRepository struct {
	collection *mongo.Collection
}

// NewMongoTodoRepository creates a new MongoTodoRepository
func NewMongoTodoRepository(db *mongo.Database) *MongoTodoRepository {
	return &MongoTodoRepository{
		collection: db.Collection("todos"),
	}
}

// GetAll returns todos optionally filtered by task date, sorted by completed status (active first) then createdAt
func (r *MongoTodoRepository) GetAll(ctx context.Context, date string) ([]models.Todo, error) {
	filter := bson.M{}
	if date != "" {
		filter["taskDate"] = date
	}

	// Sort completed ascending (false is 0, true is 1, so false comes first)
	// and then by createdAt ascending
	findOpts := options.Find().SetSort(bson.D{
		{Key: "completed", Value: 1},
		{Key: "createdAt", Value: 1},
	})

	cursor, err := r.collection.Find(ctx, filter, findOpts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var todos []models.Todo
	if err := cursor.All(ctx, &todos); err != nil {
		return nil, err
	}

	// Always return an empty slice rather than nil to keep JSON array formats clean
	if todos == nil {
		todos = []models.Todo{}
	}

	return todos, nil
}

// GetByID fetches a single Todo by its ObjectID
func (r *MongoTodoRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*models.Todo, error) {
	var todo models.Todo
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&todo)
	if err != nil {
		return nil, err
	}
	return &todo, nil
}

// Create inserts a new Todo, defaulting fields if not specified
func (r *MongoTodoRepository) Create(ctx context.Context, todo *models.Todo) error {
	todo.ID = primitive.NewObjectID()
	now := time.Now()
	todo.CreatedAt = now
	todo.UpdatedAt = now
	if todo.TaskDate == "" {
		todo.TaskDate = now.Format("2006-01-02")
	}

	_, err := r.collection.InsertOne(ctx, todo)
	return err
}

// Update partially updates fields in a Todo document and returns the post-update state
func (r *MongoTodoRepository) Update(ctx context.Context, id primitive.ObjectID, updateFields bson.M) (*models.Todo, error) {
	updateFields["updatedAt"] = time.Now()
	update := bson.M{"$set": updateFields}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedTodo models.Todo
	err := r.collection.FindOneAndUpdate(ctx, bson.M{"_id": id}, update, opts).Decode(&updatedTodo)
	if err != nil {
		return nil, err
	}
	return &updatedTodo, nil
}

// Delete removes a Todo by its ID
func (r *MongoTodoRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
