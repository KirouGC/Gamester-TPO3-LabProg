const config = require("../config/config");
const juegosService = require("../services/juegos.service");
const igdbService = require("../services/igdb.service");

// GET /api/juegos?cantidad=10&from=0
function listarJuegos(req, res) {
    const cantidad = Number(req.query.cantidad) || config.CANTIDAD_POR_DEFECTO;
    const from = Number(req.query.from) || 0;

    const resultado = juegosService.obtenerJuegos(cantidad, from, req.query.seccion, req.query.genero);

    // Antes de responder, cada juego se completa con los datos de IGDB.
    resultado.juegos = resultado.juegos.map((juego) => igdbService.completarJuego(juego));

    res.json(resultado);
}

// GET /api/juegos/:idJuego
function obtenerJuego(req, res) {
    const id = Number(req.params.idJuego);
    const juego = juegosService.obtenerJuegoPorId(id);

    if (!juego) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    res.json(igdbService.completarJuego(juego));
}

// POST /api/juegos
function crearJuego(req, res) {
    const juego = juegosService.crearJuego(req.body);

    // 201 significa "creado".
    res.status(201).json(juego);
}

// PUT /api/juegos/:idJuego
function actualizarJuego(req, res) {
    const id = Number(req.params.idJuego);
    const juego = juegosService.actualizarJuego(id, req.body);

    if (!juego) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    // Si el usuario edita el juego, se muestran sus datos y no los de IGDB.
    igdbService.desvincularJuego(id);

    res.json(juego);
}

module.exports = { listarJuegos, obtenerJuego, crearJuego, actualizarJuego };
