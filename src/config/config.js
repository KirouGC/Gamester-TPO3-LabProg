// Configuracion general del servidor.

const PORT = 3000;

const CANTIDAD_POR_DEFECTO = 10;

const CANTIDAD_MAXIMA = 50;

// Claves de IGDB. Se leen del archivo .env. Si estan vacias, la pagina funciona igual, con los datos locales.
const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

const MS_ENTRE_PEDIDOS_IGDB = 350;

const MINUTOS_CACHE_LISTAS = 10;     
const MINUTOS_CACHE_DETALLE = 60;    

const CATEGORIAS_OCULTAS = [];

module.exports = {
    PORT, CANTIDAD_POR_DEFECTO, CANTIDAD_MAXIMA,
    IGDB_CLIENT_ID, IGDB_CLIENT_SECRET,
    MS_ENTRE_PEDIDOS_IGDB, MINUTOS_CACHE_LISTAS, MINUTOS_CACHE_DETALLE, CATEGORIAS_OCULTAS
};
