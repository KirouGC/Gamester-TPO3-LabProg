const config = require("../config/config");
const juegosService = require("../services/juegos.service");
const resenasService = require("../services/resenas.service");
const igdbService = require("../services/igdb.service");

function claveDeJuego(idJuego) {
    return igdbService.esIdIgdb(idJuego) ? idJuego : Number(idJuego);
}

async function listarResenas(req, res) {
    const idJuego = claveDeJuego(req.params.idJuego);
    const cantidad = Number(req.query.cantidad) || config.CANTIDAD_POR_DEFECTO;
    const from = Number(req.query.from) || 0;

    if (!await juegosService.existeJuego(req.params.idJuego)) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    const resultado = resenasService.obtenerResenasDeJuego(idJuego, cantidad, from);

    res.json(resultado);
}

async function crearResena(req, res) {
    const idJuego = claveDeJuego(req.params.idJuego);

    if (!await juegosService.existeJuego(req.params.idJuego)) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    const resena = resenasService.crearResena(idJuego, req.body);

    res.status(201).json(resena);
}

module.exports = { listarResenas, crearResena };
