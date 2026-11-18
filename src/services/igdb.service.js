// Conexion con IGDB (https://api-docs.igdb.com).
// IGDB completa los juegos locales con datos reales: titulo, año, desarrollador,
// descripcion, generos, banner y puntaje.
//
// Como se sabe que juego de IGDB corresponde a cada juego local:
// las portadas de src/data/juegos.js ya son imagenes de IGDB, por ejemplo
// ".../t_cover_big/co7zzj.webp". El codigo "co7zzj" identifica a esa portada,
// y IGDB sabe a que juego pertenece cada portada.
//
// Ademas, este servicio trae las CATEGORIAS del home directamente desde IGDB
// (Popular Right Now, Most Anticipated, Recently Released, Coming Soon y todas las
// categorias de popularidad que IGDB ofrece) y los datos de los juegos de IGDB.
// Los juegos que vienen de IGDB tienen id "igdb-1234" para que no se confundan
// con los ids numericos de los juegos locales (src/data/juegos.js).

const config = require("../config/config");
const juegos = require("../data/juegos");

const URL_TOKEN = "https://id.twitch.tv/oauth2/token";
const URL_API = "https://api.igdb.com/v4/";
const URL_IMAGENES = "https://images.igdb.com/igdb/image/upload/";

// Error que se tira cuando falla algo con IGDB o con Twitch.
// El manejador de errores (middlewares/errores.js) lo responde con un 502.
class ErrorIgdb extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.esIgdb = true;
    }
}

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
    const respuesta = await fetch(url, { method: "POST", signal: AbortSignal.timeout(15000) });

    if (!respuesta.ok) {
        throw new ErrorIgdb("Twitch rechazo las claves, revisar IGDB_CLIENT_ID y IGDB_CLIENT_SECRET en el archivo .env");
    }

    const datos = await respuesta.json();
    token = datos.access_token;

    // Se renueva un minuto antes de que venza, por las dudas.
    vencimientoToken = Date.now() + (datos.expires_in - 60) * 1000;

    return token;
}

// Hace una consulta a IGDB. Las consultas se escriben en el lenguaje de IGDB,
// por ejemplo: "fields name; where id = 1;"
//
// IGDB solo permite 4 pedidos por segundo. Como el home pide muchas categorias a la vez,
// los pedidos se ponen en una fila: cada uno espera a que termine el anterior y deja
// pasar MS_ENTRE_PEDIDOS_IGDB milisegundos antes de salir.
let filaDePedidos = Promise.resolve();
let momentoUltimoPedido = 0;

function esperar(milisegundos) {
    return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

function consultar(endpoint, consulta) {
    const turno = filaDePedidos.then(async () => {
        const espera = momentoUltimoPedido + config.MS_ENTRE_PEDIDOS_IGDB - Date.now();

        if (espera > 0) {
            await esperar(espera);
        }

        momentoUltimoPedido = Date.now();
        return hacerPedido(endpoint, consulta, true);
    });

    // Si un pedido falla, no tiene que trabar a los que vienen despues en la fila.
    filaDePedidos = turno.catch(() => {});

    return turno;
}

async function hacerPedido(endpoint, consulta, puedeReintentar) {
    let respuesta;

    try {
        respuesta = await fetch(URL_API + endpoint, {
            method: "POST",
            headers: {
                "Client-ID": config.IGDB_CLIENT_ID,
                "Authorization": "Bearer " + await obtenerToken()
            },
            body: consulta,
            signal: AbortSignal.timeout(15000)
        });
    } catch (error) {
        if (error.esIgdb) {
            throw error;
        }

        throw new ErrorIgdb("No se pudo conectar con IGDB al consultar " + endpoint + " (" + error.message + ")");
    }

    // 429 = "demasiados pedidos". Se espera un poco y se prueba una vez mas.
    if (respuesta.status === 429 && puedeReintentar) {
        await esperar(1000);
        momentoUltimoPedido = Date.now();
        return hacerPedido(endpoint, consulta, false);
    }

    if (!respuesta.ok) {
        // IGDB explica en el body que estuvo mal en la consulta, se muestra para poder arreglarla.
        const detalle = (await respuesta.text()).slice(0, 300);
        throw new ErrorIgdb("IGDB respondio con error " + respuesta.status + " al consultar " + endpoint + ": " + detalle);
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


/*******************************************************
*************** CATEGORIAS Y JUEGOS DE IGDB ************
*******************************************************/

// Prefijo que lleva el id de los juegos que vienen de IGDB: "igdb-1234".
const PREFIJO_ID = "igdb-";

// En IGDB, "popularity_type" indica que se mide: 1 son las visitas a la pagina del juego.
// Se usa para "Popular Right Now".
const TIPO_POPULAR_AHORA = 1;

// Campos que se piden para dibujar una tarjeta (portada, nombre y año).
const CAMPOS_TARJETA = "name, first_release_date, cover.image_id";

// Campos que se piden para la pagina de un juego.
const CAMPOS_DETALLE =
    "name, summary, first_release_date, genres.name, " +
    "involved_companies.developer, involved_companies.company.name, " +
    "artworks.image_id, screenshots.image_id, total_rating, total_rating_count, " +
    "cover.image_id, platforms.name, " +
    "similar_games.name, similar_games.first_release_date, similar_games.cover.image_id";

// Las 4 categorias de la portada de igdb.com. Las demas (las de popularidad)
// se le piden a IGDB cuando se necesitan, ver obtenerCategorias().
//
//   consulta -> arma lo que va despues de "fields ...;" en la consulta a IGDB.
//               "ahora" es la fecha de hoy en segundos (asi lo guarda IGDB).
//
// "hypes > 0" deja afuera la enorme cantidad de juegos de IGDB que casi nadie sigue.
const CATEGORIAS_FIJAS = [
    {
        id: "popular-right-now",
        nombre: "Popular Right Now",
        tipoPopularidad: TIPO_POPULAR_AHORA
    },
    {
        id: "most-anticipated",
        nombre: "Most Anticipated",
        consulta: (ahora) => "where first_release_date > " + ahora + " & hypes > 0 & cover != null & version_parent = null; sort hypes desc;"
    },
    {
        id: "recently-released",
        nombre: "Recently Released",
        consulta: (ahora) => "where first_release_date <= " + ahora + " & hypes > 0 & cover != null & version_parent = null; sort first_release_date desc;"
    },
    {
        id: "coming-soon",
        nombre: "Coming Soon",
        consulta: (ahora) => "where first_release_date > " + ahora + " & hypes > 0 & cover != null & version_parent = null; sort first_release_date asc;"
    }
];

// Cache: se guarda la PROMESA del resultado, asi si dos personas piden lo mismo a la vez
// se hace un solo pedido a IGDB. Si el pedido falla, no se guarda.
const cache = new Map();

function conCache(clave, minutos, pedir) {
    const guardado = cache.get(clave);

    if (guardado && Date.now() < guardado.vence) {
        return guardado.promesa;
    }

    const promesa = pedir();
    cache.set(clave, { promesa: promesa, vence: Date.now() + minutos * 60 * 1000 });

    promesa.catch(() => {
        if (cache.get(clave) && cache.get(clave).promesa === promesa) {
            cache.delete(clave);
        }
    });

    return promesa;
}

// Devuelve true si el id es de un juego de IGDB ("igdb-1234").
function esIdIgdb(id) {
    return /^igdb-[0-9]+$/.test(String(id));
}

// "igdb-1234" -> 1234
function numeroDeId(id) {
    return Number(String(id).slice(PREFIJO_ID.length));
}

// Devuelve la lista de categorias del home: las 4 fijas mas todas las de popularidad
// que IGDB tenga (se las pide a IGDB, asi si IGDB agrega una nueva aparece sola).
// Cada categoria es { id, nombre, origen: "igdb", tipoPopularidad? }.
function obtenerCategorias() {
    return conCache("categorias", config.MINUTOS_CACHE_DETALLE, async () => {
        // Si las claves estan mal, esto falla y el home usa los datos locales.
        await obtenerToken();

        const categorias = CATEGORIAS_FIJAS.map((categoria) => ({ ...categoria, origen: "igdb" }));

        try {
            const tipos = await consultar("popularity_types", "fields id, name; sort id asc; limit 100;");

            for (const tipo of tipos) {
                // El tipo 1 ya esta como "Popular Right Now".
                if (tipo.id === TIPO_POPULAR_AHORA || config.CATEGORIAS_OCULTAS.includes(tipo.id)) {
                    continue;
                }

                categorias.push({
                    id: "popularity-" + tipo.id,
                    nombre: tipo.name,
                    origen: "igdb",
                    tipoPopularidad: tipo.id
                });
            }
        } catch (error) {
            // Sin esta lista igual se pueden mostrar las 4 categorias fijas.
            console.log("IGDB: no se pudieron pedir las categorias de popularidad (" + error.message + "). Se muestran solo las 4 fijas");
        }

        return categorias;
    });
}

// Pasa un juego de IGDB a una tarjeta del home: { id, titulo, anio, portada }.
function convertirTarjeta(juegoIgdb) {
    const tarjeta = {
        id: PREFIJO_ID + juegoIgdb.id,
        titulo: juegoIgdb.name,
        portada: linkDeImagen(juegoIgdb.cover.image_id, "t_cover_big")
    };

    // Los juegos que todavia no tienen fecha no llevan año.
    if (juegoIgdb.first_release_date) {
        tarjeta.anio = new Date(juegoIgdb.first_release_date * 1000).getUTCFullYear();
    }

    return tarjeta;
}

// Devuelve los juegos de una categoria (una "pagina": cantidad juegos desde la posicion from).
// "categoria" es un elemento de la lista de obtenerCategorias().
function obtenerJuegosDeCategoria(categoria, cantidad, from) {
    const clave = "categoria:" + categoria.id + ":" + cantidad + ":" + from;

    return conCache(clave, config.MINUTOS_CACHE_LISTAS, async () => {
        let juegosIgdb;

        if (categoria.tipoPopularidad) {
            juegosIgdb = await pedirJuegosPopulares(categoria.tipoPopularidad, cantidad, from);
        } else {
            const ahora = Math.floor(Date.now() / 1000);

            juegosIgdb = await consultar("games",
                "fields " + CAMPOS_TARJETA + "; " + categoria.consulta(ahora) +
                " limit " + cantidad + "; offset " + from + ";");
        }

        // Una tarjeta sin portada quedaria rota, por eso se saltean esos juegos.
        return juegosIgdb.filter((juego) => juego.cover).map(convertirTarjeta);
    });
}

// Las categorias de popularidad funcionan en dos pasos:
// 1. "popularity_primitives" dice que juegos tienen mas puntos en ese tipo (solo ids).
// 2. "games" da los datos de esos juegos. IGDB los devuelve en cualquier orden,
//    asi que despues se vuelven a poner en el orden de popularidad.
async function pedirJuegosPopulares(tipoPopularidad, cantidad, from) {
    const primitivas = await consultar("popularity_primitives",
        "fields game_id, value; where popularity_type = " + tipoPopularidad + "; " +
        "sort value desc; limit " + cantidad + "; offset " + from + ";");

    const ids = primitivas.map((primitiva) => primitiva.game_id);

    if (ids.length === 0) {
        return [];
    }

    const juegosIgdb = await consultar("games",
        "fields " + CAMPOS_TARJETA + "; where id = (" + ids.join(",") + "); limit " + ids.length + ";");

    const ordenados = [];

    for (const id of ids) {
        const juego = juegosIgdb.find((juegoIgdb) => juegoIgdb.id === id);

        if (juego) {
            ordenados.push(juego);
        }
    }

    return ordenados;
}

// Los logos que tiene la pagina son los de estas 5 plataformas.
// Cada plataforma de IGDB se pasa a la que le corresponde segun su nombre
// ("PlayStation 5" -> "ps", "Nintendo Switch" -> "nintendo"). Las que no encajan se ignoran.
const PLATAFORMAS_LOCALES = [
    { id: "pc", nombre: /\bPC(?! Engine)\b|Windows|Linux|Mac|Steam/i },
    { id: "ps", nombre: /PlayStation|PSP|PS Vita/i },
    { id: "xbox", nombre: /Xbox/i },
    { id: "nintendo", nombre: /Nintendo|Switch|Wii|Game ?Boy|Famicom|\bNES\b|\bSNES\b/i },
    { id: "sega", nombre: /Sega|Dreamcast|Mega Drive|Genesis|Saturn|Game Gear|Master System/i }
];

function convertirPlataformas(plataformasIgdb) {
    const plataformas = [];

    for (const plataformaIgdb of plataformasIgdb || []) {
        const local = PLATAFORMAS_LOCALES.find((plataforma) => plataforma.nombre.test(plataformaIgdb.name));

        if (local && !plataformas.includes(local.id)) {
            plataformas.push(local.id);
        }
    }

    return plataformas;
}

// Devuelve los datos de un juego de IGDB con el mismo formato que los juegos locales
// (mas "generos", "banner", "puntaje" y "similares"). Si IGDB no lo tiene, devuelve undefined.
function obtenerJuegoIgdb(id) {
    return conCache("juego:" + id, config.MINUTOS_CACHE_DETALLE, async () => {
        const resultado = await consultar("games",
            "fields " + CAMPOS_DETALLE + "; where id = " + numeroDeId(id) + "; limit 1;");

        if (resultado.length === 0) {
            return undefined;
        }

        const juegoIgdb = resultado[0];

        // convertirDatos pone titulo, descripcion, anio, desarrollador, generos, banner y puntaje.
        // Lo que IGDB no tenga se completa con un texto por defecto.
        const juego = {
            id: PREFIJO_ID + juegoIgdb.id,
            descripcion: "No description available yet.",
            desarrollador: "Unknown developer",
            portada: "/assets/logo.png",
            ...convertirDatos(juegoIgdb),
            plataformas: convertirPlataformas(juegoIgdb.platforms),
            similares: (juegoIgdb.similar_games || []).filter((otro) => otro.cover).map(convertirTarjeta)
        };

        if (juegoIgdb.cover) {
            juego.portada = linkDeImagen(juegoIgdb.cover.image_id, "t_cover_big");
        }

        return juego;
    });
}

module.exports = {
    cargarDatos, completarJuego, desvincularJuego,
    estaConfigurado, esIdIgdb, obtenerCategorias, obtenerJuegosDeCategoria, obtenerJuegoIgdb
};
