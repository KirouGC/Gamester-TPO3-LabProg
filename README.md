# Gamester — TPO 3 (Servidores Web)

API REST hecha con Express para Gamester, la página de registro y reseñas de videojuegos
del TPO 2. El mismo servidor sirve la página y la API.

## Cómo ejecutarlo

```
npm install
npm start
```

Después abrir http://localhost:3000

## Datos de IGDB (opcional)

Los juegos se pueden completar con datos reales de IGDB (título, descripción, géneros,
banner y puntaje). Para activarlo, pegar el Client ID y el Client Secret de una app de
Twitch (https://dev.twitch.tv/console/apps) en el archivo `.env`:

```
IGDB_CLIENT_ID=...
IGDB_CLIENT_SECRET=...
```

Si el archivo no existe, copiar `.env.example` como `.env`. Sin claves, la página
funciona igual con los datos locales. El detalle está en `HITO-10.md`.

## Estructura

```
index.js              Arranca el servidor
public/               La página (html, css, js, imágenes)
src/
├── config/           Configuración (puerto, cantidades por defecto, claves de IGDB)
├── data/             Los datos, en memoria (juegos y reseñas)
├── routes/           Qué función atiende cada ruta
├── middlewares/      Validaciones y manejo de errores
├── controllers/      Leen el pedido y arman la respuesta
└── services/         Trabajan con los datos (y con IGDB)
```

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/juegos?cantidad=10&from=0` | Lista de juegos paginada. Filtros opcionales: `seccion`, `genero` |
| GET | `/api/juegos/:idJuego` | Un juego |
| POST | `/api/juegos` | Crea un juego |
| PUT | `/api/juegos/:idJuego` | Actualiza un juego (se mandan todos los campos) |
| GET | `/api/juegos/:idJuego/resenas?cantidad=10&from=0` | Reseñas de un juego, paginadas |
| POST | `/api/juegos/:idJuego/resenas` | Crea una reseña |

Si no se manda `cantidad` se devuelven 10. El máximo es 50.

### Body de un juego (POST y PUT)

```json
{
    "titulo": "Hollow Knight",
    "anio": 2017,
    "portada": "https://images.igdb.com/igdb/image/upload/t_cover_big/co93cr.webp",
    "desarrollador": "Team Cherry",
    "descripcion": "A 2D action adventure.",
    "genero": "platformer",
    "plataformas": ["pc", "nintendo"],
    "seccion": "catalogo"
}
```

- `genero`: shooter, action, adventure, rpg, survival, horror, platformer o puzzle
- `plataformas`: pc, ps, xbox, nintendo, sega
- `seccion`: trending, recently-reviewed, recently-released, weekly-selection o catalogo

### Body de una reseña (POST)

```json
{
    "usuario": "juanpi",
    "estrellas": 5,
    "texto": "Muy bueno"
}
```

### Respuestas

| Código | Cuándo |
|---|---|
| 200 | Todo bien |
| 201 | Se creó un juego o una reseña |
| 400 | Datos de entrada incorrectos |
| 404 | El juego o la ruta no existe |
| 500 | Error inesperado del servidor |

Los errores tienen siempre esta forma:

```json
{ "error": "El campo \"titulo\" es obligatorio y debe ser un texto" }
```

## Notas

- No se usa base de datos: lo que se crea o modifica se pierde al reiniciar el servidor.
- El paso a paso de cómo se armó está en los archivos `HITO-1.md` a `HITO-8.md`, y la
  conexión con IGDB en `HITO-10.md`.
