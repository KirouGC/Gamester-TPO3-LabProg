// Categorias del home ("Popular Right Now", "Coming Soon", etc.).
// Si hay claves de IGDB, las categorias y sus juegos vienen de IGDB.
// Si no hay claves (o estan mal), se usan las secciones de los datos locales
// para que la pagina siga funcionando.

const juegosService = require("./juegos.service");
const igdbService = require("./igdb.service");

// Secciones de los datos locales (campo "seccion" de src/data/juegos.js).
const CATEGORIAS_LOCALES = [
    { id: "trending", nombre: "Trending", origen: "local" },
    { id: "recently-reviewed", nombre: "Recently Reviewed", origen: "local" },
    { id: "recently-released", nombre: "Recently Released", origen: "local" },
    { id: "weekly-selection", nombre: "This week's selection", origen: "local" }
];

// Devuelve la lista de categorias: las de IGDB, o las locales si IGDB no se puede usar.
async function listarCategorias() {
    if (!igdbService.estaConfigurado()) {
        return CATEGORIAS_LOCALES;
    }

    try {
        return await igdbService.obtenerCategorias();
    } catch (error) {
        console.log("IGDB: no se pudieron pedir las categorias (" + error.message + "). Se usan las secciones locales");
        return CATEGORIAS_LOCALES;
    }
}

// Devuelve los juegos de una categoria, o undefined si la categoria no existe.
async function obtenerJuegosDeCategoria(idCategoria, cantidad, from) {
    const categorias = await listarCategorias();
    const categoria = categorias.find((c) => c.id === idCategoria);

    if (!categoria) {
        return undefined;
    }

    if (categoria.origen === "local") {
        const resultado = juegosService.obtenerJuegos(cantidad, from, categoria.id);
        return resultado.juegos.map((juego) => igdbService.completarJuego(juego));
    }

    return igdbService.obtenerJuegosDeCategoria(categoria, cantidad, from);
}

module.exports = { listarCategorias, obtenerJuegosDeCategoria };
