const config = require("../config/config");
const juegosService = require("../services/juegos.service");
const igdbService = require("../services/igdb.service");

function listarJuegos(req, res) {
    const cantidad = Number(req.query.cantidad) || config.CANTIDAD_POR_DEFECTO;
    const from = Number(req.query.from) || 0;

    const resultado = juegosService.obtenerJuegos(cantidad, from, req.query.seccion, req.query.genero);

    resultado.juegos = resultado.juegos.map((juego) => igdbService.completarJuego(juego));

    res.json(resultado);
}

async function obtenerJuego(req, res) {
    if (igdbService.esIdIgdb(req.params.idJuego)) {
        const juegoIgdb = igdbService.estaConfigurado() ? await igdbService.obtenerJuegoIgdb(req.params.idJuego) : undefined;

        if (!juegoIgdb) {
            return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
        }

        return res.json(juegoIgdb);
    }

    const id = Number(req.params.idJuego);
    const juego = juegosService.obtenerJuegoPorId(id);

    if (!juego) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    res.json(igdbService.completarJuego(juego));
}

function crearJuego(req, res) {
    const juego = juegosService.crearJuego(req.body);

    res.status(201).json(juego);
}

function actualizarJuego(req, res) {
    const id = Number(req.params.idJuego);
    const juego = juegosService.actualizarJuego(id, req.body);

    if (!juego) {
        return res.status(404).json({ error: "No existe un juego con id " + req.params.idJuego });
    }

    igdbService.desvincularJuego(id);

    res.json(juego);
}

module.exports = { listarJuegos, obtenerJuego, crearJuego, actualizarJuego };
