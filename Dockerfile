# ===============================
# Etapa 1: Construcción Backend
# ===============================
FROM golang:1.25-alpine AS backend-builder

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    git \
    gcc \
    musl-dev \
    sqlite-dev \
    ca-certificates

# Establecer variables de entorno para Go
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=amd64

WORKDIR /app

# Copiar go.mod y go.sum primero para aprovechar el cache de Docker
COPY go.mod go.sum ./

# Verificar que los archivos son válidos y descargar dependencias
RUN go version && \
    go mod download && \
    go mod verify

# Copiar el resto del código fuente
COPY . .

# Verificar que podemos compilar
RUN go list ./...

# Construir la aplicación
RUN go build -a -installsuffix cgo -ldflags="-w -s" -o main .

# ===============================
# Etapa 2: Imagen Final
# ===============================
FROM alpine:latest

# Instalar dependencias de runtime
RUN apk --no-cache add ca-certificates sqlite tzdata wget

# Crear usuario no-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copiar binario compilado
COPY --from=backend-builder /app/main .

# Copiar archivos estáticos del frontend desde la ubicación correcta
COPY web/dist/browser ./web/dist/browser/

# Configurar permisos
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app && \
    chmod +x ./main

USER appuser

EXPOSE 8080

ENV GIN_MODE=release
ENV PORT=8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./main"]
