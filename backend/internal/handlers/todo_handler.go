package handlers

import (
	"context"
	"net/http"
	"regexp"
	"strings"
	"time"

	"backend/internal/models"
	"backend/internal/repositories"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var dateRegex = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)

type TodoHandler struct {
	repo repositories.TodoRepository
}

func NewTodoHandler(repo repositories.TodoRepository) *TodoHandler {
	return &TodoHandler{repo: repo}
}

// Response envelopes helper
func successResponse(c *gin.Context, statusCode int, data interface{}, count *int) {
	resp := gin.H{
		"success": true,
		"data":    data,
	}
	if count != nil {
		resp["count"] = *count
	}
	c.JSON(statusCode, resp)
}

func errorResponse(c *gin.Context, statusCode int, errMsg string) {
	c.JSON(statusCode, gin.H{
		"success": false,
		"error":   errMsg,
		"data":    nil,
	})
}

// ListTodos returns all todos, optionally filtered by date query param
func (h *TodoHandler) ListTodos(c *gin.Context) {
	dateParam := c.Query("date")
	if dateParam != "" && !dateRegex.MatchString(dateParam) {
		errorResponse(c, http.StatusBadRequest, "Invalid date format. Must be YYYY-MM-DD")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	todos, err := h.repo.GetAll(ctx, dateParam)
	if err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to retrieve todos")
		return
	}

	count := len(todos)
	successResponse(c, http.StatusOK, todos, &count)
}

// GetTodoByID returns a single todo by ID
func (h *TodoHandler) GetTodoByID(c *gin.Context) {
	idHex := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	todo, err := h.repo.GetByID(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			errorResponse(c, http.StatusNotFound, "Todo not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to retrieve todo")
		return
	}

	successResponse(c, http.StatusOK, todo, nil)
}

// CreateTodo handles adding a new Todo with input validations
func (h *TodoHandler) CreateTodo(c *gin.Context) {
	var req struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		TaskDate    string `json:"taskDate" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		errorResponse(c, http.StatusBadRequest, "Missing required fields (title, taskDate)")
		return
	}

	title := strings.TrimSpace(req.Title)
	if title == "" {
		errorResponse(c, http.StatusBadRequest, "Title cannot be empty")
		return
	}

	taskDate := strings.TrimSpace(req.TaskDate)
	if !dateRegex.MatchString(taskDate) {
		errorResponse(c, http.StatusBadRequest, "Invalid taskDate format. Must be YYYY-MM-DD")
		return
	}

	todo := &models.Todo{
		Title:       title,
		Description: req.Description,
		TaskDate:    taskDate,
		Completed:   false,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := h.repo.Create(ctx, todo); err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to create todo")
		return
	}

	successResponse(c, http.StatusCreated, todo, nil)
}

// UpdateTodo handles partial updates using a map representation of JSON body
func (h *TodoHandler) UpdateTodo(c *gin.Context) {
	idHex := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	// Read generic JSON map to identify which fields are present for partial updates
	var reqMap map[string]interface{}
	if err := c.ShouldBindJSON(&reqMap); err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid JSON body")
		return
	}

	updateFields := bson.M{}

	if val, ok := reqMap["title"]; ok {
		strVal, isStr := val.(string)
		if !isStr {
			errorResponse(c, http.StatusBadRequest, "Title must be a string")
			return
		}
		title := strings.TrimSpace(strVal)
		if title == "" {
			errorResponse(c, http.StatusBadRequest, "Title cannot be empty")
			return
		}
		updateFields["title"] = title
	}

	if val, ok := reqMap["description"]; ok {
		strVal, isStr := val.(string)
		if !isStr {
			errorResponse(c, http.StatusBadRequest, "Description must be a string")
			return
		}
		updateFields["description"] = strVal
	}

	if val, ok := reqMap["completed"]; ok {
		boolVal, isBool := val.(bool)
		if !isBool {
			errorResponse(c, http.StatusBadRequest, "Completed must be a boolean")
			return
		}
		updateFields["completed"] = boolVal
	}

	if val, ok := reqMap["taskDate"]; ok {
		strVal, isStr := val.(string)
		if !isStr {
			errorResponse(c, http.StatusBadRequest, "TaskDate must be a string")
			return
		}
		taskDate := strings.TrimSpace(strVal)
		if !dateRegex.MatchString(taskDate) {
			errorResponse(c, http.StatusBadRequest, "Invalid taskDate format. Must be YYYY-MM-DD")
			return
		}
		updateFields["taskDate"] = taskDate
	}

	if len(updateFields) == 0 {
		errorResponse(c, http.StatusBadRequest, "No fields to update")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	updatedTodo, err := h.repo.Update(ctx, id, updateFields)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			errorResponse(c, http.StatusNotFound, "Todo not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to update todo")
		return
	}

	successResponse(c, http.StatusOK, updatedTodo, nil)
}

// DeleteTodo deletes a todo by ID
func (h *TodoHandler) DeleteTodo(c *gin.Context) {
	idHex := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		errorResponse(c, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Verify existence first to return proper 404 if not found
	_, err = h.repo.GetByID(ctx, id)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			errorResponse(c, http.StatusNotFound, "Todo not found")
			return
		}
		errorResponse(c, http.StatusInternalServerError, "Failed to retrieve todo details before deletion")
		return
	}

	if err := h.repo.Delete(ctx, id); err != nil {
		errorResponse(c, http.StatusInternalServerError, "Failed to delete todo")
		return
	}

	successResponse(c, http.StatusOK, nil, nil)
}
