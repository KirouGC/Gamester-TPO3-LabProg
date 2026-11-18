// Configuracion general del servidor.
// Si hay que cambiar el puerto, se cambia solamente aca.

const PORT = 3000;

// Cuantos elementos devuelven los listados si no se manda "cantidad".
const CANTIDAD_POR_DEFECTO = 10;

// Lo maximo que se puede pedir en "cantidad".
const CANTIDAD_MAXIMA = 50;

// Claves de IGDB. Se leen del archivo .env (ver .env.example).
// Si estan vacias, la pagina funciona igual, con los datos locales.
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

// Pausa minima entre un pedido a IGDB y el siguiente (en milisegundos).
// IGDB permite 4 pedidos por segundo. Con 350 ms salen como mucho 3 por segundo,
// asi queda margen por si la red demora algun pedido.
const MS_ENTRE_PEDIDOS_IGDB = 350;

// Cuanto tiempo se guardan en memoria las respuestas de IGDB (en minutos),
// para no volver a pedir lo mismo cada vez que alguien abre la pagina.
const MINUTOS_CACHE_LISTAS = 10;     // juegos de cada categoria
const MINUTOS_CACHE_DETALLE = 60;    // datos de un juego y lista de categorias

// Categorias de popularidad de IGDB que NO se quieren mostrar en el home.
// Se escriben los ids de IGDB, por ejemplo [7] para ocultar la 7.
// Por defecto se muestran todas (ver /api/categorias para saber cuales son).
const CATEGORIAS_OCULTAS = [];

module.exports = {
    PORT, CANTIDAD_POR_DEFECTO, CANTIDAD_MAXIMA,
    IGDB_CLIENT_ID, IGDB_CLIENT_SECRET,
    MS_ENTRE_PEDIDOS_IGDB, MINUTOS_CACHE_LISTAS, MINUTOS_CACHE_DETALLE, CATEGORIAS_OCULTAS
};
