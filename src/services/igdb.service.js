// Conexion con IGDB (https://api-docs.igdb.com).
// IGDB completa los juegos locales con datos reales: titulo, año, desarrollador,
// descripcion, generos, banner y puntaje.
//
// Como se sabe que juego de IGDB corresponde a cada juego local:
// las portadas de src/data/juegos.js ya son imagenes de IGDB, por ejemplo
// ".../t_cover_big/co7zzj.webp". El codigo "co7zzj" identifica a esa portada,
// y IGDB sabe a que juego pertenece cada portada.

const config = require("../config/config");
const juegos = require("../data/juegos");

const URL_TOKEN = "https://id.twitch.tv/oauth2/token";
const URL_API = "https://api.igdb.com/v4/";
const URL_IMAGENES = "https://images.igdb.com/igdb/image/upload/";

// Token de acceso de Twitch y el momento en que vence (en milisegundos).
let token = null;
let vencimientoToken = 0;

// Datos de IGDB de cada juego, guardados por el id local del juego.
// Por ejemplo: datosIgdb[1] = { titulo: "Half-Life", anio: 1998, ... }
const datosIgdb = {};

// Devuelve true si se cargaron las dos claves en el archivo .env
function estaConfigurado() {
    return Boolean(config.IGDB_CLIENT_ID && config.IGDB_CLIENT_SECRET);
}

// Pide un token a Twitch (IGDB es de Twitch). Se reutiliza mientras no venza.
async function obtenerToken() {
    if (token && Date.now() < vencimientoToken) {
        return token;
    }

    const url = URL_TOKEN + "?client_id=" + config.IGDB_CLIENT_ID + "&client_secret=" + config.IGDB_CLIENT_SECRET + "&grant_type=client_credentials";
    const respuesta = await fetch(url, { method: "POST" });

    if (!respuesta.ok) {
        throw new Error("Twitch rechazo las claves, revisar IGDB_CLIENT_ID y IGDB_CLIENT_SECRET en el archivo .env");
    }

    const datos = await respuesta.json();
    token = datos.access_token;

    // Se renueva un minuto antes de que venza, por las dudas.
    vencimientoToken = Date.now() + (datos.expires_in - 60) * 1000;

    return token;
}

// Hace una consulta a IGDB. Las consultas se escriben en el lenguaje de IGDB,
// por ejemplo: "fields name; where id = 1;"
async function consultar(endpoint, consulta) {
    const respuesta = await fetch(URL_API + endpoint, {
        method: "POST",
        headers: {
            "Client-ID": config.IGDB_CLIENT_ID,
            "Authorization": "Bearer " + await obtenerToken()
        },
        body: consulta
    });

    if (!respuesta.ok) {
        throw new Error("IGDB respondio con error " + respuesta.status + " al consultar " + endpoint);
    }

    return respuesta.json();
}

// Arma el link de una imagen de IGDB. El tamaño puede ser "t_cover_big", "t_1080p", etc.
function linkDeImagen(codigo, tamanio) {
    return URL_IMAGENES + tamanio + "/" + codigo + ".webp";
}

// Saca el codigo de la imagen del link de una portada.
// ".../t_cover_big/co7zzj.webp" -> "co7zzj"
// Si la portada no es de IGDB devuelve null.
function codigoDePortada(portada) {
    if (!portada.startsWith(URL_IMAGENES)) {
        return null;
    }

    const archivo = portada.split("/").pop();   // "co7zzj.webp"
    return archivo.split(".")[0];               // "co7zzj"
}

// Pasa un juego de IGDB al formato que usa Gamester.
// IGDB no siempre tiene todos los datos, por eso cada campo se revisa antes de usarlo.
function convertirDatos(juegoIgdb) {
    const datos = {};

    datos.titulo = juegoIgdb.name;

    if (juegoIgdb.summary) {
        datos.descripcion = juegoIgdb.summary;
    }

    // IGDB da la fecha como la cantidad de segundos desde 1970.
    if (juegoIgdb.first_release_date) {
        datos.anio = new Date(juegoIgdb.first_release_date * 1000).getUTCFullYear();
    }

    // De todas las empresas que participaron, se busca la que lo desarrollo.
    if (juegoIgdb.involved_companies) {
        const desarrolladora = juegoIgdb.involved_companies.find((empresa) => empresa.developer);

        if (desarrolladora) {
            datos.desarrollador = desarrolladora.company.name;
        }
    }

    if (juegoIgdb.genres) {
        datos.generos = juegoIgdb.genres.map((genero) => genero.name);
    }

    // Banner: un "artwork" del juego, y si no tiene, una captura de pantalla.
    if (juegoIgdb.artworks) {
        datos.banner = linkDeImagen(juegoIgdb.artworks[0].image_id, "t_1080p");
    } else if (juegoIgdb.screenshots) {
        datos.banner = linkDeImagen(juegoIgdb.screenshots[0].image_id, "t_1080p");
    }

    // Puntaje: IGDB lo da de 0 a 100 y Gamester lo muestra de 0 a 5 (con un decimal).
    if (juegoIgdb.total_rating) {
        datos.puntaje = Math.round(juegoIgdb.total_rating / 20 * 10) / 10;
        datos.cantidadPuntajes = juegoIgdb.total_rating_count;
    }

    return datos;
}

// Se ejecuta una vez al prender el servidor.
// Busca en IGDB los datos de todos los juegos locales y los guarda en datosIgdb.
// Se piden todos juntos (son 2 consultas) para no pasarse del limite de IGDB,
// que es de 4 pedidos por segundo.
async function cargarDatos() {
    if (!estaConfigurado()) {
        console.log("IGDB: no hay claves en el archivo .env, se usan solo los datos locales");
        return;
    }

    try {
        // 1. Con los codigos de las portadas se averigua el id de cada juego en IGDB.
        const codigos = [];

        for (const juego of juegos) {
            const codigo = codigoDePortada(juego.portada);

            if (codigo) {
                codigos.push(codigo);
            }
        }

        // Queda algo como: image_id = "co7zzj" | image_id = "cob5mk" | ...
        const condicion = codigos.map((codigo) => "image_id = \"" + codigo + "\"").join(" | ");
        const portadas = await consultar("covers", "fields image_id, game; where " + condicion + "; limit 500;");

        // 2. Se piden los datos de todos esos juegos en una sola consulta.
        const idsIgdb = portadas.map((portada) => portada.game);

        const juegosIgdb = await consultar("games",
            "fields name, summary, first_release_date, genres.name, " +
            "involved_companies.developer, involved_companies.company.name, " +
            "artworks.image_id, screenshots.image_id, total_rating, total_rating_count; " +
            "where id = (" + idsIgdb.join(",") + "); limit 500;");

        // 3. Se guardan los datos que corresponden a cada juego local.
        for (const juego of juegos) {
            const portada = portadas.find((p) => p.image_id === codigoDePortada(juego.portada));

            if (!portada) {
                continue;
            }

            const juegoIgdb = juegosIgdb.find((j) => j.id === portada.game);

            if (juegoIgdb) {
                datosIgdb[juego.id] = convertirDatos(juegoIgdb);
            }
        }

        console.log("IGDB: se cargaron los datos de " + Object.keys(datosIgdb).length + " de " + juegos.length + " juegos");
    } catch (error) {
        // Si IGDB falla, la pagina sigue funcionando con los datos locales.
        console.log("IGDB: no se pudieron cargar los datos (" + error.message + "). Se usan solo los datos locales");
    }
}

// Devuelve una copia del juego con los datos de IGDB encima.
// Si el juego no esta vinculado con IGDB, lo devuelve tal cual.
function completarJuego(juego) {
    const datos = datosIgdb[juego.id];

    if (!datos) {
        return juego;
    }

    return { ...juego, ...datos };
}

// Se usa cuando se edita un juego con PUT: desde ese momento se muestran
// los datos que mando el usuario y no los de IGDB.
function desvincularJuego(id) {
    delete datosIgdb[id];
}

module.exports = { cargarDatos, completarJuego, desvincularJuego };
