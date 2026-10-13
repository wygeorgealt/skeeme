FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy source
COPY . .

# Download dependencies (will generate go.sum if missing locally)
RUN go mod tidy
RUN go mod download

# Build API and CLI binaries
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/cli ./cmd/cli

FROM alpine:latest

# Add ca-certificates for external API calls, tzdata, and postgresql-client tools
RUN apk --no-cache add ca-certificates tzdata postgresql-client gzip bash

WORKDIR /app
COPY --from=builder /app/bin/api /app/api
COPY --from=builder /app/bin/cli /app/cli
COPY --from=builder /app/bin/cli /usr/local/bin/cli

EXPOSE 8080

CMD ["/app/api"]
