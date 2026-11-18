const express = require("express");
const router = express.Router();

const juegosController = require("../controllers/juegos.controller");
const resenasController = require("../controllers/resenas.controller");
const validaciones = require("../middlewares/validaciones");

// Estas rutas quedan todas con /api/juegos adelante (ver api.routes.js).
// En cada ruta primero se ejecutan las validaciones y al final el controlador.

router.get("/", validaciones.validarPaginacion, validaciones.validarFiltrosJuegos, juegosController.listarJuegos);
router.get("/:idJuego", validaciones.validarIdJuego, juegosController.obtenerJuego);
router.get("/:idJuego/resenas", validaciones.validarIdJuego, validaciones.validarPaginacion, resenasController.listarResenas);

router.post("/", validaciones.validarJuego, juegosController.crearJuego);
router.put("/:idJuego", validaciones.validarIdJuego, validaciones.validarJuego, juegosController.actualizarJuego);
router.post("/:idJuego/resenas", validaciones.validarIdJuego, validaciones.validarResena, resenasController.crearResena);

module.exports = router;
