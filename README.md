# MatchHub — Backend API

> Plataforma de emparejamiento de gamers por compatibilidad de juegos, gustos y disponibilidad horaria.

---

## Descripción del Proyecto

**MatchHub** resuelve el problema de encontrar compañeros de juego compatibles. Los jugadores con afición a los videojuegos carecen de una plataforma centralizada que les permita conectar con otros según sus juegos favoritos, estilo de juego y horarios disponibles.

### Objetivo General
Desarrollar una API REST que permita a los gamers encontrar compañeros de juego compatibles mediante perfiles personalizados y un algoritmo de matching ponderado.

### Funcionalidades Principales
- **Autenticación vía Clerk** — JWT sin manejar contraseñas en nuestro backend
- **Perfil de jugador** — juegos, preferencias, disponibilidad semanal y avatar (DiceBear)
- **Algoritmo de compatibilidad** — ponderación: horario 40% + juegos 30% + preferencias 30%
- **Solicitudes de match** — envío, aceptación, rechazo y cancelación con expiración de 7 días
- **Matches confirmados** — discord visible sólo tras aceptar un match
- **Catálogo de juegos** — integración con RAWG Video Games API



## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/register` | Registrar jugador en BD local (post-Clerk signup) |
| `GET` | `/auth/me` | Obtener jugador autenticado |

### Profile
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/profile` | Perfil completo del usuario |
| `PUT` | `/profile` | Actualizar perfil (juegos, prefs, disponibilidad) |
| `GET` | `/profile/avatars` | Opciones de avatar DiceBear |
| `PATCH` | `/profile/online` | Actualizar estado online |

### Players
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/players/compatible` | Jugadores compatibles paginados por score |
| `GET` | `/players` | Listar con filtros (región, estilo, plataforma, juego) |
| `GET` | `/players/:id` | Perfil público + compatibilidad |

### Games
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/games` | Catálogo de videojuegos |
| `GET` | `/games/search?q=valorant` | Buscar en RAWG API |
| `POST` | `/games` | Agregar juego al catálogo |

### Preferences
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/preferences` | Listar preferencias del sistema |
| `GET` | `/preferences/compare?other_id=5` | Comparar con otro jugador |

### Match Requests
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/match-requests` | Enviar solicitud de match |
| `GET` | `/match-requests/received` | Solicitudes recibidas pendientes |
| `GET` | `/match-requests/sent` | Solicitudes enviadas |
| `PUT` | `/match-requests/:id/accept` | Aceptar solicitud (crea match) |
| `PUT` | `/match-requests/:id/reject` | Rechazar solicitud |
| `DELETE` | `/match-requests/:id` | Cancelar solicitud enviada |

### Matches
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/matches` | Matches activos (con discord del otro jugador) |
| `GET` | `/matches/stats` | Estadísticas del dashboard |
| `GET` | `/matches/:id` | Detalle de un match |

---

## Autenticación

Todos los endpoints requieren el JWT de Clerk en el header:

```
Authorization: Bearer <clerk_session_token>
```

**Flujo de registro:**
1. El usuario se registra con Clerk (email + contraseña)
2. Clerk emite un JWT
3. El frontend llama `POST /auth/register` con el token → se crea el registro en BD
4. Al hacer `GET /auth/me`, si `profileComplete: false`, el frontend redirige a `/profile`

---

## Algoritmo de Compatibilidad

```
total_score = horario_score + juego_score + preferencia_score

horario_score    = (días coincidentes / días totales del usuario) × 100 × 0.40
juego_score      = (juegos coincidentes / juegos del usuario)    × 100 × 0.30
preferencia_score= (prefs coincidentes  / prefs del usuario)     × 100 × 0.30
```

- Máximo posible: **100 puntos**
- Se excluyen jugadores con match activo o solicitud pendiente
- Discord sólo es visible entre jugadores con match `activo`


## 👥 Integraciones Externas

### Clerk
- Gestiona registro, login y sesiones
- El backend sólo verifica el JWT, no guarda contraseñas
- Dashboard: https://dashboard.clerk.dev

### RAWG Video Games API
- Búsqueda de juegos por nombre
- Obtención de plataformas disponibles
- Docs: https://rawg.io/apidocs

### DiceBear
- Generación de avatares SVG por estilo y semilla (username)
- 12 estilos disponibles: pixel-art, avataaars, bottts, etc.
- Docs: https://www.dicebear.com/

---

