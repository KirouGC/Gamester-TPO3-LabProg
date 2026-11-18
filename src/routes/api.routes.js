const express = require("express");
const router = express.Router();

const juegosRoutes = require("./juegos.routes");
const errores = require("../middlewares/errores");

// Todas las rutas que se agreguen a este router empiezan con /api
// (eso se define en index.js con app.use("/api", apiRoutes)).

router.use("/juegos", juegosRoutes);

// Va al final: si ninguna ruta de arriba coincidio, se responde 404.
router.use(errores.rutaNoEncontrada);

module.exports = router;
