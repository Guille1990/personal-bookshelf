# Modelo de datos

```mermaid
classDiagram
    class User {
        +uint ID
        +string Email
        +string Password
        +string Name
        +int FailedAttempts
        +bool IsLocked
        +time LockedUntil
        +time LastLoginAt
        +time CreatedAt
        +time UpdatedAt
        +time DeletedAt
        +[]Item Items
    }

    class Item {
        +uint ID
        +uint UserID
        +string Title
        +string Author
        +enum Type ("Libro", "Manga")
        +string Genre
        +string Language
        +string PublicationYear
        +enum Status ("Leyendo", "Terminado", "Pendiente")
        +int Rating (1-5)
        +string Notes
        +string CoverUrl
        +time CreatedAt
        +time UpdatedAt
        +time DeletedAt
        +User User
        +[]Tag Tags
    }

    class Tag {
        +uint ID
        +string Name
        +time CreatedAt
        +time UpdatedAt
        +time DeletedAt
        +[]Item Items
    }

    class ItemTags {
        +uint ItemID
        +uint TagID
    }

    class RefreshToken {
        +uint ID
        +uint UserID
        +string Token
        +time ExpiresAt
        +bool IsRevoked
        +time CreatedAt
        +time UpdatedAt
        +User User
    }

    class TokenBlacklist {
        +uint ID
        +string Token
        +time ExpiresAt
        +time CreatedAt
    }

    User "1" --> "many" Item : posee
    User "1" --> "many" RefreshToken : genera
    Item "many" --> "many" Tag : etiquetado_con
    ItemTags --> Item : referencia
    ItemTags --> Tag : referencia
    RefreshToken --> User : pertenece_a
```

## Características del modelo actualizado

### 🔐 Seguridad mejorada
- **Control de acceso**: Sistema de bloqueo temporal de cuentas
- **Refresh tokens**: Gestión segura de sesiones prolongadas  
- **Token blacklisting**: Revocación explícita de tokens
- **Rate limiting**: Protección contra ataques de fuerza bruta

### 📊 Estructura de datos
- **Soft deletes**: Eliminación lógica con `DeletedAt`
- **Timestamps automáticos**: `CreatedAt`, `UpdatedAt` en todas las entidades
- **Relaciones GORM**: Asociaciones many-to-many optimizadas
- **Campos de seguridad**: Seguimiento de intentos fallidos y bloqueos

### 🏷️ Sistema de etiquetado
- **Tags flexibles**: Sistema de etiquetado many-to-many
- **Asociaciones GORM**: Manejo automático de relaciones
- **Prevención de duplicados**: Lógica mejorada para evitar tags duplicadas
