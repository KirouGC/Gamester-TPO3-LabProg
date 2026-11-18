const config = require("../config/config");
const categoriasService = require("../services/categorias.service");

// GET /api/categorias
async function listarCategorias(req, res) {
    const categorias = await categoriasService.listarCategorias();

    // Solo se devuelve lo que necesita la pagina: el id y el nombre para mostrar.
    res.json({
        categorias: categorias.map((categoria) => ({ id: categoria.id, nombre: categoria.nombre, origen: categoria.origen }))
    });
}

// GET /api/categorias/:idCategoria/juegos?cantidad=6&from=0
async function listarJuegosDeCategoria(req, res) {
    const cantidad = Number(req.query.cantidad) || config.CANTIDAD_POR_DEFECTO;
    const from = Number(req.query.from) || 0;

    const juegos = await categoriasService.obtenerJuegosDeCategoria(req.params.idCategoria, cantidad, from);

    if (!juegos) {
        return res.status(404).json({ error: "No existe la categoria " + req.params.idCategoria });
    }

    res.json({ juegos: juegos });
}

module.exports = { listarCategorias, listarJuegosDeCategoria };
