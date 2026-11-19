// Conexion con IGDB (https://api-docs.igdb.com).
// IGDB completa los juegos locales con datos reales: titulo, año, desarrollador,
// descripcion, generos, banner y puntaje.

const config = require("../config/config");
const juegos = require("../data/juegos");

const URL_TOKEN = "https://id.twitch.tv/oauth2/token";
const URL_API = "https://api.igdb.com/v4/";
const URL_IMAGENES = "https://images.igdb.com/igdb/image/upload/";

class ErrorIgdb extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.esIgdb = true;
    }
}

let token = null;
let vencimientoToken = 0;

// Datos de IGDB de cada juego, guardados por el id local del juego.
const datosIgdb = {};

function estaConfigurado() {
    return Boolean(config.IGDB_CLIENT_ID && config.IGDB_CLIENT_SECRET);
}

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

    vencimientoToken = Date.now() + (datos.expires_in - 60) * 1000;

    return token;
}

// Hace una consulta a IGDB. Las consultas se escriben en el lenguaje de IGDB

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

    if (respuesta.status === 429 && puedeReintentar) {
        await esperar(1000);
        momentoUltimoPedido = Date.now();
        return hacerPedido(endpoint, consulta, false);
    }

    if (!respuesta.ok) {
        const detalle = (await respuesta.text()).slice(0, 300);
        throw new ErrorIgdb("IGDB respondio con error " + respuesta.status + " al consultar " + endpoint + ": " + detalle);
    }

    return respuesta.json();
}

function linkDeImagen(codigo, tamanio) {
    return URL_IMAGENES + tamanio + "/" + codigo + ".webp";
}

function codigoDePortada(portada) {
    if (!portada.startsWith(URL_IMAGENES)) {
        return null;
    }

    const archivo = portada.split("/").pop();   
    return archivo.split(".")[0];               
}

function convertirDatos(juegoIgdb) {
    const datos = {};

    datos.titulo = juegoIgdb.name;

    if (juegoIgdb.summary) {
        datos.descripcion = juegoIgdb.summary;
    }

    if (juegoIgdb.first_release_date) {
        datos.anio = new Date(juegoIgdb.first_release_date * 1000).getUTCFullYear();
    }

    if (juegoIgdb.involved_companies) {
        const desarrolladora = juegoIgdb.involved_companies.find((empresa) => empresa.developer);

        if (desarrolladora) {
            datos.desarrollador = desarrolladora.company.name;
        }
    }

    if (juegoIgdb.genres) {
        datos.generos = juegoIgdb.genres.map((genero) => genero.name);
    }

    if (juegoIgdb.artworks) {
        datos.banner = linkDeImagen(juegoIgdb.artworks[0].image_id, "t_1080p");
    } else if (juegoIgdb.screenshots) {
        datos.banner = linkDeImagen(juegoIgdb.screenshots[0].image_id, "t_1080p");
    }

    if (juegoIgdb.total_rating) {
        datos.puntaje = Math.round(juegoIgdb.total_rating / 20 * 10) / 10;
        datos.cantidadPuntajes = juegoIgdb.total_rating_count;
    }

    return datos;
}

async function cargarDatos() {
    if (!estaConfigurado()) {
        console.log("IGDB: no hay claves en el archivo .env, se usan solo los datos locales");
        return;
    }

    try {
        const codigos = [];

        for (const juego of juegos) {
            const codigo = codigoDePortada(juego.portada);

            if (codigo) {
                codigos.push(codigo);
            }
        }

        const condicion = codigos.map((codigo) => "image_id = \"" + codigo + "\"").join(" | ");
        const portadas = await consultar("covers", "fields image_id, game; where " + condicion + "; limit 500;");

        const idsIgdb = portadas.map((portada) => portada.game);

        const juegosIgdb = await consultar("games",
            "fields name, summary, first_release_date, genres.name, " +
            "involved_companies.developer, involved_companies.company.name, " +
            "artworks.image_id, screenshots.image_id, total_rating, total_rating_count; " +
            "where id = (" + idsIgdb.join(",") + "); limit 500;");

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
        console.log("IGDB: no se pudieron cargar los datos (" + error.message + "). Se usan solo los datos locales");
    }
}


function completarJuego(juego) {
    const datos = datosIgdb[juego.id];

    if (!datos) {
        return juego;
    }

    return { ...juego, ...datos };
}

function desvincularJuego(id) {
    delete datosIgdb[id];
}


/*******************************************************
*************** CATEGORIAS Y JUEGOS DE IGDB ************
*******************************************************/

const PREFIJO_ID = "igdb-";


const TIPO_POPULAR_AHORA = 1;

const CAMPOS_TARJETA = "name, first_release_date, cover.image_id";

const CAMPOS_DETALLE =
    "name, summary, first_release_date, genres.name, " +
    "involved_companies.developer, involved_companies.company.name, " +
    "artworks.image_id, screenshots.image_id, total_rating, total_rating_count, " +
    "cover.image_id, platforms.name, " +
    "similar_games.name, similar_games.first_release_date, similar_games.cover.image_id";

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

function esIdIgdb(id) {
    return /^igdb-[0-9]+$/.test(String(id));
}

function numeroDeId(id) {
    return Number(String(id).slice(PREFIJO_ID.length));
}

function obtenerCategorias() {
    return conCache("categorias", config.MINUTOS_CACHE_DETALLE, async () => {
        await obtenerToken();

        const categorias = CATEGORIAS_FIJAS.map((categoria) => ({ ...categoria, origen: "igdb" }));

        try {
            const tipos = await consultar("popularity_types", "fields id, name; sort id asc; limit 100;");

            for (const tipo of tipos) {
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
            console.log("IGDB: no se pudieron pedir las categorias de popularidad (" + error.message + "). Se muestran solo las 4 fijas");
        }

        return categorias;
    });
}

function convertirTarjeta(juegoIgdb) {
    const tarjeta = {
        id: PREFIJO_ID + juegoIgdb.id,
        titulo: juegoIgdb.name,
        portada: linkDeImagen(juegoIgdb.cover.image_id, "t_cover_big")
    };

    if (juegoIgdb.first_release_date) {
        tarjeta.anio = new Date(juegoIgdb.first_release_date * 1000).getUTCFullYear();
    }

    return tarjeta;
}

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

        return juegosIgdb.filter((juego) => juego.cover).map(convertirTarjeta);
    });
}

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

function obtenerJuegoIgdb(id) {
    return conCache("juego:" + id, config.MINUTOS_CACHE_DETALLE, async () => {
        const resultado = await consultar("games",
            "fields " + CAMPOS_DETALLE + "; where id = " + numeroDeId(id) + "; limit 1;");

        if (resultado.length === 0) {
            return undefined;
        }

        const juegoIgdb = resultado[0];

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
