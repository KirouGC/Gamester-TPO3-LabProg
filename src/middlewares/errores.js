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

    // Fallo algo con IGDB (claves mal, IGDB caido, limite de pedidos...).
    // 502 significa "el servidor al que le pedi los datos fallo".
    if (err.esIgdb) {
        console.log(err.message);
        return res.status(502).json({ error: "No se pudieron obtener los datos de IGDB" });
    }

    console.log(err);
    res.status(500).json({ error: "Ocurrió un error inesperado en el servidor" });
}

module.exports = { rutaNoEncontrada, manejarErrores };
