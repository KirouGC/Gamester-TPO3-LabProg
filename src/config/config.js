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

module.exports = { PORT, CANTIDAD_POR_DEFECTO, CANTIDAD_MAXIMA, IGDB_CLIENT_ID, IGDB_CLIENT_SECRET };
