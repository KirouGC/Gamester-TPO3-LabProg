const juegos = require("../data/juegos");
const igdbService = require("./igdb.service");

// Devuelve una "pagina" de juegos.
//   cantidad -> cuantos juegos devolver
//   from     -> desde que posicion empezar (0 es el primero)
//   seccion y genero son filtros opcionales
function obtenerJuegos(cantidad, from, seccion, genero) {
    let lista = juegos;

    if (seccion) {
        lista = lista.filter((juego) => juego.seccion === seccion);
    }

    if (genero) {
        lista = lista.filter((juego) => juego.genero === genero);
    }

    return {
        total: lista.length,
        juegos: lista.slice(from, from + cantidad)
    };
}

function obtenerJuegoPorId(id) {
    return juegos.find((juego) => juego.id === id);
}

async function existeJuego(idJuego) {
    if (igdbService.esIdIgdb(idJuego)) {
        return igdbService.estaConfigurado() && Boolean(await igdbService.obtenerJuegoIgdb(idJuego));
    }

    return obtenerJuegoPorId(Number(idJuego)) !== undefined;
}

function crearJuego(datos) {
    const ultimoJuego = juegos[juegos.length - 1];

    const juego = {
        id: ultimoJuego.id + 1,
        titulo: datos.titulo,
        anio: datos.anio,
        portada: datos.portada,
        desarrollador: datos.desarrollador,
        descripcion: datos.descripcion,
        genero: datos.genero,
        plataformas: datos.plataformas,
        seccion: datos.seccion
    };

    juegos.push(juego);

    return juego;
}

function actualizarJuego(id, datos) {
    const juego = obtenerJuegoPorId(id);

    if (!juego) {
        return undefined;
    }

    juego.titulo = datos.titulo;
    juego.anio = datos.anio;
    juego.portada = datos.portada;
    juego.desarrollador = datos.desarrollador;
    juego.descripcion = datos.descripcion;
    juego.genero = datos.genero;
    juego.plataformas = datos.plataformas;
    juego.seccion = datos.seccion;

    return juego;
}

module.exports = { obtenerJuegos, obtenerJuegoPorId, existeJuego, crearJuego, actualizarJuego };
