const juegos = require("../data/juegos");

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

// Devuelve el juego con ese id, o undefined si no existe.
function obtenerJuegoPorId(id) {
    return juegos.find((juego) => juego.id === id);
}

// Crea un juego nuevo con los datos recibidos y lo agrega a la lista.
function crearJuego(datos) {
    // El id nuevo es el id del ultimo juego + 1.
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

// Reemplaza los datos de un juego que ya existe.
// Devuelve el juego actualizado, o undefined si no existe.
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

module.exports = { obtenerJuegos, obtenerJuegoPorId, crearJuego, actualizarJuego };
