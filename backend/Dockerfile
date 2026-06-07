FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

FROM alpine:3.22

RUN adduser -D -H appuser
WORKDIR /app

COPY --from=builder /server /app/server

USER appuser
EXPOSE 3001

CMD ["/app/server"]
