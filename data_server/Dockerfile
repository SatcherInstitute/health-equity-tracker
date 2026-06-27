# Build stage
FROM golang:1.26.3-alpine AS builder
WORKDIR /build
COPY data_server/go.mod data_server/go.sum ./
RUN go mod download
COPY data_server/*.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o data_server .

# Runtime stage — minimal image, no shell or package manager
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /build/data_server /data_server
USER nonroot
CMD ["/data_server"]
