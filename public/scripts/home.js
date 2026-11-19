// Carga los juegos desde la API. Lo usan el home (index.html) y la pagina de usuario

const CANTIDAD_POR_SECCION = 6

/*******************************************************
******************** FUNCIONES COMUNES *****************
*******************************************************/

function mostrarError(contenedor, mensaje) {
    const texto = document.createElement("p")
    texto.classList.add("error-text")
    texto.textContent = mensaje
    contenedor.appendChild(texto)
}

async function cargarJuegosEn(contenedor, url) {
    try {
        const respuesta = await fetch(url)
        const datos = await respuesta.json()

        if (!respuesta.ok) {
            mostrarError(contenedor, datos.error)
            return
        }

        datos.juegos.forEach((juego) => {
            contenedor.appendChild(crearTarjeta(juego))
        })

        if (datos.juegos.length === 0) {
            mostrarError(contenedor, "No games to show right now")
        }
    } catch (error) {
        mostrarError(contenedor, "Could not load games")
    }
}

/*******************************************************
************************ HOME **************************
*******************************************************/

function crearSeccion(categoria) {
    const seccion = document.createElement("section")
    seccion.classList.add("main-box-container")

    const encabezado = document.createElement("div")
    encabezado.classList.add("gradient-lined-text")

    const titulo = document.createElement("h2")
    titulo.textContent = categoria.nombre
    encabezado.appendChild(titulo)

    const contenedor = document.createElement("div")
    contenedor.classList.add("box-container-games")
    contenedor.id = categoria.id

    seccion.appendChild(encabezado)
    seccion.appendChild(contenedor)

    return seccion
}

function cargarCategoria(categoria, contenedor) {
    const url = "/api/categorias/" + categoria.id + "/juegos?cantidad=" + CANTIDAD_POR_SECCION + "&from=0"
    cargarJuegosEn(contenedor, url)
}


async function cargarCategorias() {
    const zonaSuperior = document.querySelector("#categorias-inicio")
    const zonaInferior = document.querySelector("#categorias-resto")

    let categorias

    try {
        const respuesta = await fetch("/api/categorias")
        const datos = await respuesta.json()

        if (!respuesta.ok) {
            mostrarError(zonaSuperior, datos.error)
            return
        }

        categorias = datos.categorias
    } catch (error) {
        mostrarError(zonaSuperior, "Could not load games")
        return
    }

    const observador = "IntersectionObserver" in window
        ? new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    observador.unobserve(entrada.target)
                    cargarCategoria(entrada.target.categoria, entrada.target)
                }
            })
        }, { rootMargin: "400px" })
        : null

    categorias.forEach((categoria, posicion) => {
        const seccion = crearSeccion(categoria)
        const contenedor = seccion.querySelector(".box-container-games")

        if (posicion === 0) {
            zonaSuperior.appendChild(seccion)
            cargarCategoria(categoria, contenedor)
            return
        }

        zonaInferior.appendChild(seccion)

        if (observador) {
            contenedor.categoria = categoria
            observador.observe(contenedor)
        } else {
            cargarCategoria(categoria, contenedor)
        }
    })
}

/*******************************************************
*********************** LOGGED *************************
*******************************************************/

async function cargarSeccion(seccion) {
    const contenedor = document.querySelector("#" + seccion)

    if (!contenedor) {
        return
    }

    cargarJuegosEn(contenedor, "/api/juegos?seccion=" + seccion + "&cantidad=" + CANTIDAD_POR_SECCION + "&from=0")
}

/*******************************************************
*********************** INICIO *************************
*******************************************************/

if (document.querySelector("#categorias-inicio")) {
    cargarCategorias()
} else {
    cargarSeccion("trending")
    cargarSeccion("recently-reviewed")
    cargarSeccion("recently-released")
    cargarSeccion("weekly-selection")
}
