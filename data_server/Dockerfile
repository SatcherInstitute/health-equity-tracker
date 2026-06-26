# Build stage
FROM golang:1.26.3-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o data_server .

# Runtime stage — minimal image, no shell or package manager
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /build/data_server /data_server
USER nonroot
CMD ["/data_server"]
