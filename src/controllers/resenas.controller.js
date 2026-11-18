const config = require("../config/config");
const juegosService = require("../services/juegos.service");
const resenasService = require("../services/resenas.service");

// GET /api/juegos/:idJuego/resenas?cantidad=10&from=0
function listarResenas(req, res) {
    const idJuego = Number(req.params.idJuego);
    const cantidad = Number(req.query.cantidad) || config.CANTIDAD_POR_DEFECTO;
    const from = Number(req.query.from) || 0;

    // Si el juego no existe, no tiene sentido buscar sus reseñas.
    const juego = juegosService.obtenerJuegoPorId(idJuego);

    if (!juego) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    const resultado = resenasService.obtenerResenasDeJuego(idJuego, cantidad, from);

    res.json(resultado);
}

// POST /api/juegos/:idJuego/resenas
function crearResena(req, res) {
    const idJuego = Number(req.params.idJuego);

    const juego = juegosService.obtenerJuegoPorId(idJuego);

    if (!juego) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    const resena = resenasService.crearResena(idJuego, req.body);

    res.status(201).json(resena);
}

module.exports = { listarResenas, crearResena };
