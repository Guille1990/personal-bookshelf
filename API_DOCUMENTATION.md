# Personal Bookshelf API Documentation

## Información General

**Base URL:** `http://localhost:8080`  
**Versión:** 1.0.0  
**Formato de respuesta:** JSON  
**Autenticación:** JWT Bearer Token  

---

## Índice

1. [Autenticación](#autenticación)
2. [Endpoints de Usuarios](#endpoints-de-usuarios)
3. [Endpoints de Items (Libros/Manga)](#endpoints-de-items-librosmanga)
4. [Endpoints de Etiquetas](#endpoints-de-etiquetas)
5. [Health Check](#health-check)
6. [Códigos de Estado](#códigos-de-estado)
7. [Modelos de Datos](#modelos-de-datos)

---

## Autenticación

### Registro de Usuario

**POST** `/api/register`

Registra un nuevo usuario en el sistema.

#### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

#### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (400 Bad Request)
```json
{
  "error": "Datos inválidos"
}
```

#### Response (500 Internal Server Error)
```json
{
  "error": "Error al crear el usuario"
}
```

---

### Inicio de Sesión

**POST** `/api/login`

Inicia sesión y obtiene tokens de acceso y renovación.

#### Request Body
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

#### Response (400 Bad Request)
```json
{
  "error": "Datos inválidos"
}
```

#### Response (401 Unauthorized)
```json
{
  "error": "Credenciales inválidas"
}
```

#### Response (423 Locked)
```json
{
  "error": "cuenta bloqueada temporalmente"
}
```

#### Response (429 Too Many Requests)
```json
{
  "error": "Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo más tarde."
}
```

---

### Renovar Token

**POST** `/api/refresh`

Renueva el token de acceso usando el refresh token.

#### Request Body
```json
{
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "new_refresh_token_here",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

#### Response (400 Bad Request)
```json
{
  "error": "Datos inválidos"
}
```

#### Response (401 Unauthorized)
```json
{
  "error": "Token de refresco inválido"
}
```

---

### Cerrar Sesión

**POST** `/api/logout`

Cierra la sesión del usuario y revoca sus tokens.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)
```json
{
  "message": "Cierre de sesión exitoso"
}
```

#### Response (400 Bad Request)
```json
{
  "error": "Token no proporcionado"
}
```

#### Response (500 Internal Server Error)
```json
{
  "error": "Error al cerrar sesión"
}
```

---

## Endpoints de Items (Libros/Manga)

> **Nota:** Todos los endpoints de items requieren autenticación (Bearer Token)

### Crear Item

**POST** `/api/items`

Crea un nuevo item en la biblioteca personal.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "El Señor de los Anillos",
  "author": "J.R.R. Tolkien",
  "type": "Libro",
  "genre": "Fantasía",
  "language": "Español",
  "publication_year": "1954",
  "status": "Leyendo",
  "rating": 5,
  "notes": "Una obra maestra de la literatura fantástica",
  "cover_url": "https://ejemplo.com/portada.jpg",
  "tags": [
    {"name": "fantasía"},
    {"name": "clásico"}
  ]
}
```

#### Response (201 Created)
```json
{
  "ID": 1,
  "CreatedAt": "2025-10-27T10:00:00Z",
  "UpdatedAt": "2025-10-27T10:00:00Z",
  "DeletedAt": null,
  "title": "El Señor de los Anillos",
  "author": "J.R.R. Tolkien",
  "type": "Libro",
  "genre": "Fantasía",
  "language": "Español",
  "publication_year": "1954",
  "status": "Leyendo",
  "rating": 5,
  "notes": "Una obra maestra de la literatura fantástica",
  "cover_url": "https://ejemplo.com/portada.jpg",
  "tags": []
}
```

---

### Obtener Todos los Items

**GET** `/api/items`

Obtiene todos los items del usuario autenticado.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)
```json
[
  {
    "ID": 1,
    "CreatedAt": "2025-10-27T10:00:00Z",
    "UpdatedAt": "2025-10-27T10:00:00Z",
    "DeletedAt": null,
    "title": "El Señor de los Anillos",
    "author": "J.R.R. Tolkien",
    "type": "Libro",
    "genre": "Fantasía",
    "language": "Español",
    "publication_year": "1954",
    "status": "Leyendo",
    "rating": 5,
    "notes": "Una obra maestra",
    "cover_url": "https://ejemplo.com/portada.jpg",
    "tags": [
      {
        "ID": 1,
        "name": "fantasía"
      }
    ]
  }
]
```

---

### Obtener Item por ID

**GET** `/api/items/{id}`

Obtiene un item específico por su ID.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters
- `id` (integer): ID del item a obtener

#### Response (200 OK)
```json
{
  "ID": 1,
  "CreatedAt": "2025-10-27T10:00:00Z",
  "UpdatedAt": "2025-10-27T10:00:00Z",
  "DeletedAt": null,
  "title": "El Señor de los Anillos",
  "author": "J.R.R. Tolkien",
  "type": "Libro",
  "genre": "Fantasía",
  "language": "Español",
  "publication_year": "1954",
  "status": "Leyendo",
  "rating": 5,
  "notes": "Una obra maestra",
  "cover_url": "https://ejemplo.com/portada.jpg",
  "tags": [
    {
      "ID": 1,
      "name": "fantasía"
    }
  ]
}
```

#### Response (404 Not Found)
```json
{
  "error": "Ítem no encontrado"
}
```

---

### Actualizar Item

**PUT** `/api/items/{id}`

Actualiza un item existente.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Path Parameters
- `id` (integer): ID del item a actualizar

#### Request Body
```json
{
  "title": "El Hobbit",
  "author": "J.R.R. Tolkien",
  "type": "Libro",
  "genre": "Fantasía",
  "language": "Español",
  "publication_year": "1937",
  "status": "Terminado",
  "rating": 4,
  "notes": "Precuela del Señor de los Anillos",
  "cover_url": "https://ejemplo.com/hobbit.jpg",
  "tags_ids": [1, 2]
}
```

#### Response (200 OK)
```json
{
  "ID": 1,
  "CreatedAt": "2025-10-27T10:00:00Z",
  "UpdatedAt": "2025-10-27T11:00:00Z",
  "DeletedAt": null,
  "title": "El Hobbit",
  "author": "J.R.R. Tolkien",
  "type": "Libro",
  "genre": "Fantasía",
  "language": "Español",
  "publication_year": "1937",
  "status": "Terminado",
  "rating": 4,
  "notes": "Precuela del Señor de los Anillos",
  "cover_url": "https://ejemplo.com/hobbit.jpg",
  "tags": [
    {
      "ID": 1,
      "name": "fantasía"
    },
    {
      "ID": 2,
      "name": "aventura"
    }
  ]
}
```

---

### Eliminar Item

**DELETE** `/api/items/{id}`

Elimina un item de la biblioteca.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters
- `id` (integer): ID del item a eliminar

#### Response (200 OK)
```json
{
  "message": "Ítem eliminado exitosamente",
  "deleted_item": {
    "id": 1,
    "title": "El Hobbit",
    "author": "J.R.R. Tolkien",
    "type": "Libro"
  }
}
```

#### Response (404 Not Found)
```json
{
  "error": "Ítem no encontrado"
}
```

---

### Filtrar Items por Etiquetas

**GET** `/api/items/filter`

Filtra items por etiquetas usando parámetros de consulta.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters
- `tags` (string): IDs de etiquetas separados por comas (ej: "1,2,3")
- `mode` (string, opcional): Modo de filtrado
  - `or` (default): Items que tengan cualquiera de las etiquetas
  - `and`: Items que tengan todas las etiquetas

#### Ejemplo
```
GET /api/items/filter?tags=1,2&mode=and
```

#### Response (200 OK)
```json
[
  {
    "ID": 1,
    "title": "El Señor de los Anillos",
    "author": "J.R.R. Tolkien",
    "type": "Libro",
    "tags": [
      {"ID": 1, "name": "fantasía"},
      {"ID": 2, "name": "aventura"}
    ]
  }
]
```

---

## Endpoints de Etiquetas

> **Nota:** Todos los endpoints de etiquetas requieren autenticación (Bearer Token)

### Crear Etiqueta

**POST** `/api/tags`

Crea una nueva etiqueta.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "ciencia-ficción"
}
```

#### Response (201 Created)
```json
{
  "ID": 3,
  "CreatedAt": "2025-10-27T10:00:00Z",
  "UpdatedAt": "2025-10-27T10:00:00Z",
  "DeletedAt": null,
  "name": "ciencia-ficción"
}
```

#### Response (400 Bad Request)
```json
{
  "error": "Datos inválidos"
}
```

---

### Obtener Todas las Etiquetas

**GET** `/api/tags`

Obtiene todas las etiquetas disponibles.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (200 OK)
```json
[
  {
    "ID": 1,
    "CreatedAt": "2025-10-27T09:00:00Z",
    "UpdatedAt": "2025-10-27T09:00:00Z",
    "DeletedAt": null,
    "name": "fantasía"
  },
  {
    "ID": 2,
    "CreatedAt": "2025-10-27T09:30:00Z",
    "UpdatedAt": "2025-10-27T09:30:00Z",
    "DeletedAt": null,
    "name": "aventura"
  }
]
```

---

### Obtener Items por Etiqueta

**GET** `/api/tags/{id}/items`

Obtiene todos los items asociados a una etiqueta específica.

#### Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Path Parameters
- `id` (integer): ID de la etiqueta

#### Response (200 OK)
```json
[
  {
    "ID": 1,
    "title": "El Señor de los Anillos",
    "author": "J.R.R. Tolkien",
    "type": "Libro",
    "genre": "Fantasía",
    "tags": [
      {
        "ID": 1,
        "name": "fantasía"
      }
    ]
  }
]
```

#### Response (404 Not Found)
```json
{
  "error": "Etiqueta no encontrada"
}
```

---

## Health Check

### Verificar Estado del Servicio

**GET** `/health`

Endpoint para verificar el estado del servicio (útil para monitoreo y contenedores).

#### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": 1698417600,
  "version": "1.0.0"
}
```

---

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token inválido o faltante |
| 404 | Not Found - Recurso no encontrado |
| 423 | Locked - Cuenta bloqueada temporalmente |
| 429 | Too Many Requests - Demasiados intentos |
| 500 | Internal Server Error - Error interno del servidor |

---

## Modelos de Datos

### Usuario
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "name": "Nombre Usuario",
  "last_login_at": "2025-10-27T10:00:00Z",
  "created_at": "2025-10-27T08:00:00Z",
  "updated_at": "2025-10-27T10:00:00Z"
}
```

### Item (Libro/Manga)
```json
{
  "ID": 1,
  "CreatedAt": "2025-10-27T10:00:00Z",
  "UpdatedAt": "2025-10-27T10:00:00Z",
  "DeletedAt": null,
  "title": "Título del libro",
  "author": "Autor del libro",
  "type": "Libro", // o "Manga"
  "genre": "Género literario",
  "language": "Idioma",
  "publication_year": "Año de publicación",
  "status": "Estado", // "Leyendo", "Terminado", "Pendiente"
  "rating": 5, // 1-5
  "notes": "Notas personales",
  "cover_url": "URL de la portada",
  "tags": [
    {
      "ID": 1,
      "name": "etiqueta"
    }
  ]
}
```

### Etiqueta
```json
{
  "ID": 1,
  "CreatedAt": "2025-10-27T10:00:00Z",
  "UpdatedAt": "2025-10-27T10:00:00Z",
  "DeletedAt": null,
  "name": "nombre-etiqueta"
}
```

### Token Response
```json
{
  "access_token": "JWT token string",
  "refresh_token": "Refresh token string", 
  "expires_in": 3600,
  "token_type": "bearer"
}
```

---

## Notas Adicionales

### Autenticación
- Los tokens de acceso tienen una duración limitada (configurada en el servidor)
- Use el endpoint `/api/refresh` para renovar tokens expirados
- Incluya el token en el header Authorization: `Bearer {token}`

### Rate Limiting
- Máximo 10 intentos de login por IP cada 15 minutos
- Después de 5 intentos fallidos, la cuenta se bloquea por 15 minutos

### Tipos de Items
- **Libro**: Para libros tradicionales
- **Manga**: Para manga japonés

### Estados de Lectura
- **Leyendo**: Actualmente en progreso
- **Terminado**: Completado
- **Pendiente**: En lista de espera

### Relaciones
- Los items pertenecen a un usuario específico
- Los items pueden tener múltiples etiquetas
- Las etiquetas son compartidas entre todos los usuarios