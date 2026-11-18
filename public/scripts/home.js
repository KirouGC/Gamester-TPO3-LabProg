// Carga las secciones de juegos desde la API.
// Lo usan el home (index.html) y la pagina de usuario logueado (pages/logged/index.html).
// Cada seccion tiene un contenedor vacio en el HTML con su id
// (trending, recently-reviewed, recently-released, weekly-selection).

const CANTIDAD_POR_SECCION = 6

async function cargarSeccion(seccion) {
    const contenedor = document.querySelector("#" + seccion)

    // Este script se usa en mas de una pagina y no todas tienen las 4 secciones.
    // Si la pagina no tiene el contenedor de esta seccion, no se pide nada.
    if (!contenedor) {
        return
    }

    try {
        const respuesta = await fetch("/api/juegos?seccion=" + seccion + "&cantidad=" + CANTIDAD_POR_SECCION + "&from=0")
        const datos = await respuesta.json()

        // Si la API respondio con un error (400, 404, 500), se muestra el mensaje.
        if (!respuesta.ok) {
            mostrarError(contenedor, datos.error)
            return
        }

        datos.juegos.forEach((juego) => {
            contenedor.appendChild(crearTarjeta(juego))
        })
    } catch (error) {
        // Entra aca si no se pudo conectar con el servidor.
        mostrarError(contenedor, "Could not load games")
    }
}

function mostrarError(contenedor, mensaje) {
    const texto = document.createElement("p")
    texto.classList.add("error-text")
    texto.textContent = mensaje
    contenedor.appendChild(texto)
}

cargarSeccion("trending")
cargarSeccion("recently-reviewed")
cargarSeccion("recently-released")
cargarSeccion("weekly-selection")
