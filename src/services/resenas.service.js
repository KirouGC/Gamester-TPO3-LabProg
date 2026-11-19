const resenas = require("../data/resenas");

function obtenerResenasDeJuego(idJuego, cantidad, from) {
    const lista = resenas.filter((resena) => resena.idJuego === idJuego);

    return {
        total: lista.length,
        resenas: lista.slice(from, from + cantidad)
    };
}

// Crea una reseña nueva para un juego y la agrega a la lista.
function crearResena(idJuego, datos) {
    const ultimaResena = resenas[resenas.length - 1];

    const resena = {
        id: ultimaResena.id + 1,
        idJuego: idJuego,
        usuario: datos.usuario,
        avatar: "/assets/logo.png",
        estrellas: datos.estrellas,
        texto: datos.texto,
        likes: 0
    };

    resenas.push(resena);

    return resena;
}

module.exports = { obtenerResenasDeJuego, crearResena };
