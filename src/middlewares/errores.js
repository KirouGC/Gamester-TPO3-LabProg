// Middlewares para los errores generales de la API.

// Se ejecuta cuando se pide una ruta de /api que no existe.
function rutaNoEncontrada(req, res) {
    res.status(404).json({ error: "No existe la ruta " + req.method + " " + req.originalUrl });
}

// Se ejecuta cuando ocurre un error en cualquier parte del servidor.
function manejarErrores(err, req, res, next) {
    // Cuando el body en JSON no es valido.
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "El body enviado no es un JSON válido" });
    }

    // Fallo algo con IGDB.
    if (err.esIgdb) {
        console.log(err.message);
        return res.status(502).json({ error: "No se pudieron obtener los datos de IGDB" });
    }

    console.log(err);
    res.status(500).json({ error: "Ocurrió un error inesperado en el servidor" });
}

module.exports = { rutaNoEncontrada, manejarErrores };
