FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy source
COPY . .

# Download dependencies (will generate go.sum if missing locally)
RUN go mod tidy
RUN go mod download

# Build API binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/api ./cmd/api

FROM alpine:latest

# Add ca-certificates for external API calls (e.g., Paystack, Resend)
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/bin/api /app/api

EXPOSE 8080

CMD ["/app/api"]
