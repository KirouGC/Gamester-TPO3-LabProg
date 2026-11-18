// Middlewares que validan los datos de entrada.
// Si algo esta mal, responden con error 400 y un mensaje explicando el problema.
// Si esta todo bien, llaman a next() para que siga el controlador.

const config = require("../config/config");

// Valores permitidos para algunos campos de los juegos.
const GENEROS = ["shooter", "action", "adventure", "rpg", "survival", "horror", "platformer", "puzzle"];
const PLATAFORMAS = ["pc", "ps", "xbox", "nintendo", "sega"];
const SECCIONES = ["trending", "recently-reviewed", "recently-released", "weekly-selection", "catalogo"];

// Devuelve true si el valor es un texto que no esta vacio.
function esTexto(valor) {
    return typeof valor === "string" && valor.trim() !== "";
}

// Valida el :idJuego de la URL.
function validarIdJuego(req, res, next) {
    const id = Number(req.params.idJuego);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "El id del juego debe ser un número entero mayor a 0" });
    }

    next();
}

// Valida ?cantidad= y ?from= de los listados.
// Los dos son opcionales, pero si se mandan tienen que ser numeros validos.
function validarPaginacion(req, res, next) {
    if (req.query.cantidad !== undefined) {
        const cantidad = Number(req.query.cantidad);

        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > config.CANTIDAD_MAXIMA) {
            return res.status(400).json({ error: "\"cantidad\" debe ser un número entero entre 1 y " + config.CANTIDAD_MAXIMA });
        }
    }

    if (req.query.from !== undefined) {
        const from = Number(req.query.from);

        if (!Number.isInteger(from) || from < 0) {
            return res.status(400).json({ error: "\"from\" debe ser un número entero mayor o igual a 0" });
        }
    }

    next();
}

// Valida los filtros ?seccion= y ?genero= del listado de juegos (son opcionales).
function validarFiltrosJuegos(req, res, next) {
    if (req.query.seccion !== undefined && !SECCIONES.includes(req.query.seccion)) {
        return res.status(400).json({ error: "\"seccion\" debe ser uno de estos valores: " + SECCIONES.join(", ") });
    }

    if (req.query.genero !== undefined && !GENEROS.includes(req.query.genero)) {
        return res.status(400).json({ error: "\"genero\" debe ser uno de estos valores: " + GENEROS.join(", ") });
    }

    next();
}

// Valida el body para crear o actualizar un juego.
function validarJuego(req, res, next) {
    const datos = req.body;

    if (!datos) {
        return res.status(400).json({ error: "Falta el body con los datos del juego (en formato JSON)" });
    }

    if (!esTexto(datos.titulo)) {
        return res.status(400).json({ error: "El campo \"titulo\" es obligatorio y debe ser un texto" });
    }

    if (!Number.isInteger(datos.anio)) {
        return res.status(400).json({ error: "El campo \"anio\" es obligatorio y debe ser un número entero" });
    }

    if (!esTexto(datos.portada)) {
        return res.status(400).json({ error: "El campo \"portada\" es obligatorio y debe ser un texto" });
    }

    if (!esTexto(datos.desarrollador)) {
        return res.status(400).json({ error: "El campo \"desarrollador\" es obligatorio y debe ser un texto" });
    }

    if (!esTexto(datos.descripcion)) {
        return res.status(400).json({ error: "El campo \"descripcion\" es obligatorio y debe ser un texto" });
    }

    if (!GENEROS.includes(datos.genero)) {
        return res.status(400).json({ error: "El campo \"genero\" es obligatorio y debe ser uno de estos valores: " + GENEROS.join(", ") });
    }

    if (!Array.isArray(datos.plataformas) || datos.plataformas.length === 0) {
        return res.status(400).json({ error: "El campo \"plataformas\" es obligatorio y debe ser una lista con al menos una plataforma" });
    }

    for (const plataforma of datos.plataformas) {
        if (!PLATAFORMAS.includes(plataforma)) {
            return res.status(400).json({ error: "Cada plataforma debe ser uno de estos valores: " + PLATAFORMAS.join(", ") });
        }
    }

    if (!SECCIONES.includes(datos.seccion)) {
        return res.status(400).json({ error: "El campo \"seccion\" es obligatorio y debe ser uno de estos valores: " + SECCIONES.join(", ") });
    }

    next();
}

// Valida el body para crear una reseña.
function validarResena(req, res, next) {
    const datos = req.body;

    if (!datos) {
        return res.status(400).json({ error: "Falta el body con los datos de la reseña (en formato JSON)" });
    }

    if (!esTexto(datos.usuario)) {
        return res.status(400).json({ error: "El campo \"usuario\" es obligatorio y debe ser un texto" });
    }

    if (!Number.isInteger(datos.estrellas) || datos.estrellas < 1 || datos.estrellas > 5) {
        return res.status(400).json({ error: "El campo \"estrellas\" es obligatorio y debe ser un número entero entre 1 y 5" });
    }

    if (!esTexto(datos.texto)) {
        return res.status(400).json({ error: "El campo \"texto\" es obligatorio y debe ser un texto" });
    }

    next();
}

module.exports = { validarIdJuego, validarPaginacion, validarFiltrosJuegos, validarJuego, validarResena };
