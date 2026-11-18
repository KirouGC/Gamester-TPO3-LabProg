const config = require("../config/config");
const juegosService = require("../services/juegos.service");
const resenasService = require("../services/resenas.service");
const igdbService = require("../services/igdb.service");

// Con que id se guardan las reseñas de un juego:
// los juegos locales usan su numero (1) y los de IGDB su id completo ("igdb-1942").
function claveDeJuego(idJuego) {
    return igdbService.esIdIgdb(idJuego) ? idJuego : Number(idJuego);
}

// GET /api/juegos/:idJuego/resenas?cantidad=10&from=0
async function listarResenas(req, res) {
    const idJuego = claveDeJuego(req.params.idJuego);
    const cantidad = Number(req.query.cantidad) || config.CANTIDAD_POR_DEFECTO;
    const from = Number(req.query.from) || 0;

    // Si el juego no existe, no tiene sentido buscar sus reseñas.
    if (!await juegosService.existeJuego(req.params.idJuego)) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    const resultado = resenasService.obtenerResenasDeJuego(idJuego, cantidad, from);

    res.json(resultado);
}

// POST /api/juegos/:idJuego/resenas
async function crearResena(req, res) {
    const idJuego = claveDeJuego(req.params.idJuego);

    if (!await juegosService.existeJuego(req.params.idJuego)) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    const resena = resenasService.crearResena(idJuego, req.body);

    res.status(201).json(resena);
}

module.exports = { listarResenas, crearResena };
