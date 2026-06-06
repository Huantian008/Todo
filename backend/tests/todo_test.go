package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/handlers"
	"backend/internal/models"
	"backend/internal/routes"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// MockTodoRepository is an in-memory implementation of repositories.TodoRepository
type MockTodoRepository struct {
	todos map[primitive.ObjectID]models.Todo
}

func NewMockTodoRepository() *MockTodoRepository {
	return &MockTodoRepository{
		todos: make(map[primitive.ObjectID]models.Todo),
	}
}

func (m *MockTodoRepository) GetAll(ctx context.Context, date string) ([]models.Todo, error) {
	var list []models.Todo
	for _, t := range m.todos {
		if date == "" || t.TaskDate == date {
			list = append(list, t)
		}
	}
	return list, nil
}

func (m *MockTodoRepository) GetByID(ctx context.Context, id primitive.ObjectID) (*models.Todo, error) {
	todo, ok := m.todos[id]
	if !ok {
		return nil, mongo.ErrNoDocuments
	}
	return &todo, nil
}

func (m *MockTodoRepository) Create(ctx context.Context, todo *models.Todo) error {
	todo.ID = primitive.NewObjectID()
	now := time.Now()
	todo.CreatedAt = now
	todo.UpdatedAt = now
	m.todos[todo.ID] = *todo
	return nil
}

func (m *MockTodoRepository) Update(ctx context.Context, id primitive.ObjectID, updateFields bson.M) (*models.Todo, error) {
	todo, ok := m.todos[id]
	if !ok {
		return nil, mongo.ErrNoDocuments
	}

	if val, ok := updateFields["title"]; ok {
		todo.Title = val.(string)
	}
	if val, ok := updateFields["description"]; ok {
		todo.Description = val.(string)
	}
	if val, ok := updateFields["completed"]; ok {
		todo.Completed = val.(bool)
	}
	if val, ok := updateFields["taskDate"]; ok {
		todo.TaskDate = val.(string)
	}

	todo.UpdatedAt = time.Now()
	m.todos[id] = todo
	return &todo, nil
}

func (m *MockTodoRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	delete(m.todos, id)
	return nil
}

func setupTestRouter() (*gin.Engine, *MockTodoRepository) {
	gin.SetMode(gin.TestMode)
	repo := NewMockTodoRepository()
	todoHandler := handlers.NewTodoHandler(repo)
	weatherHandler := handlers.NewWeatherHandler(nil) // Weather is not tested here
	router := routes.SetupRouter(todoHandler, weatherHandler, "http://localhost:5173")
	return router, repo
}

func TestCreateTodo(t *testing.T) {
	router, _ := setupTestRouter()

	t.Run("Create Success", func(t *testing.T) {
		body := map[string]string{
			"title":    "Test Todo",
			"taskDate": "2026-06-06",
		}
		jsonBody, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected status 201, got %d", w.Code)
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if resp["success"] != true {
			t.Errorf("Expected success true, got false")
		}

		data := resp["data"].(map[string]interface{})
		if data["title"] != "Test Todo" {
			t.Errorf("Expected title 'Test Todo', got '%v'", data["title"])
		}
		if data["completed"] != false {
			t.Errorf("Expected completed false, got '%v'", data["completed"])
		}
	})

	t.Run("Create Empty Title Failure", func(t *testing.T) {
		body := map[string]string{
			"title":    "   ",
			"taskDate": "2026-06-06",
		}
		jsonBody, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", w.Code)
		}
	})

	t.Run("Create Invalid Date Failure", func(t *testing.T) {
		body := map[string]string{
			"title":    "Test Todo",
			"taskDate": "06-06-2026",
		}
		jsonBody, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", w.Code)
		}
	})
}

func TestListTodos(t *testing.T) {
	router, repo := setupTestRouter()

	id1 := primitive.NewObjectID()
	repo.todos[id1] = models.Todo{
		ID:        id1,
		Title:     "Todo One",
		Completed: false,
		TaskDate:  "2026-06-06",
	}

	id2 := primitive.NewObjectID()
	repo.todos[id2] = models.Todo{
		ID:        id2,
		Title:     "Todo Two",
		Completed: true,
		TaskDate:  "2026-06-07",
	}

	t.Run("List All", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/todos", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if resp["success"] != true {
			t.Errorf("Expected success true")
		}

		count := resp["count"].(float64)
		if count != 2 {
			t.Errorf("Expected count 2, got %f", count)
		}
	})

	t.Run("Filter by Date", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/todos?date=2026-06-06", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)

		count := resp["count"].(float64)
		if count != 1 {
			t.Errorf("Expected count 1, got %f", count)
		}
	})
}

func TestUpdateTodo(t *testing.T) {
	router, repo := setupTestRouter()

	id := primitive.NewObjectID()
	repo.todos[id] = models.Todo{
		ID:        id,
		Title:     "Original Title",
		Completed: false,
		TaskDate:  "2026-06-06",
	}

	t.Run("Partial Update Success", func(t *testing.T) {
		body := map[string]interface{}{
			"completed": true,
		}
		jsonBody, _ := json.Marshal(body)

		req, _ := http.NewRequest("PUT", "/api/todos/"+id.Hex(), bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)

		data := resp["data"].(map[string]interface{})
		if data["title"] != "Original Title" {
			t.Errorf("Expected title 'Original Title', got '%v'", data["title"])
		}
		if data["completed"] != true {
			t.Errorf("Expected completed true, got '%v'", data["completed"])
		}
	})

	t.Run("Update Non-existent 404", func(t *testing.T) {
		body := map[string]interface{}{
			"title": "New Title",
		}
		jsonBody, _ := json.Marshal(body)

		fakeId := primitive.NewObjectID().Hex()
		req, _ := http.NewRequest("PUT", "/api/todos/"+fakeId, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("Expected status 404, got %d", w.Code)
		}
	})
}
