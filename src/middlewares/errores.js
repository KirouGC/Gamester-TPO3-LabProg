// Middlewares para los errores generales de la API.

// Se ejecuta cuando se pide una ruta de /api que no existe.
function rutaNoEncontrada(req, res) {
    res.status(404).json({ error: "No existe la ruta " + req.method + " " + req.originalUrl });
}

// Se ejecuta cuando ocurre un error en cualquier parte del servidor.
// Express sabe que es un manejador de errores porque recibe 4 parametros.
function manejarErrores(err, req, res, next) {
    // Este error lo genera express.json() cuando el body no es un JSON valido.
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "El body enviado no es un JSON válido" });
    }

    console.log(err);
    res.status(500).json({ error: "Ocurrió un error inesperado en el servidor" });
}

module.exports = { rutaNoEncontrada, manejarErrores };
