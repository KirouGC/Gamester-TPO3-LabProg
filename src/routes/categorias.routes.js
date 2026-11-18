const express = require("express");
const router = express.Router();

const categoriasController = require("../controllers/categorias.controller");
const validaciones = require("../middlewares/validaciones");

// Estas rutas quedan todas con /api/categorias adelante (ver api.routes.js).

router.get("/", categoriasController.listarCategorias);
router.get("/:idCategoria/juegos", validaciones.validarPaginacion, categoriasController.listarJuegosDeCategoria);

module.exports = router;
