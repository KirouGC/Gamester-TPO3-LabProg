const express = require("express");
const path = require("path");
const config = require("./src/config/config");
const apiRoutes = require("./src/routes/api.routes");
const errores = require("./src/middlewares/errores");
const igdbService = require("./src/services/igdb.service");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", apiRoutes);

app.use(errores.manejarErrores);

app.listen(config.PORT, () => console.log("Servidor abierto en http://localhost:"+config.PORT));

// Al prender el servidor se piden a IGDB los datos de los juegos (si es que está presente la clave en .env).
igdbService.cargarDatos();
