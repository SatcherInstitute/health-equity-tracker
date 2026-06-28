# Stage 1: Build the React frontend
FROM node:24-slim AS react_build
ARG DEPLOY_CONTEXT
WORKDIR /usr/src/build
COPY ./frontend/package*.json ./
# --ignore-scripts defers postinstall (npm run tokens) until source files exist.
# The prebuild hook in npm run build:$DEPLOY_CONTEXT runs tokens at the right time.
RUN npm ci --ignore-scripts
COPY ./frontend .
ENV NODE_OPTIONS="--max_old_space_size=4096"
RUN npm run build:${DEPLOY_CONTEXT}

# Stage 2: Build the Go binary
FROM golang:1.26.3-alpine AS go_build
WORKDIR /build
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/*.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server .

# Stage 3: Minimal runtime — no shell, no package manager, ~10 MB image
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=go_build /build/server /server
COPY --from=react_build /usr/src/build/build /static
USER nonroot
ENV STATIC_DIR=/static
CMD ["/server"]
