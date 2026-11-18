// Carga los juegos desde la API. Lo usan el home (index.html) y la pagina de usuario
// logueado (pages/logged/index.html).
//
// HOME: las categorias (Popular Right Now, Most Anticipated, Recently Released,
// Coming Soon, etc.) vienen de la API (/api/categorias), que las toma de IGDB.
// El HTML no tiene las secciones: se crean aca, una por cada categoria.
//
// LOGGED: sigue teniendo sus secciones escritas en el HTML, cada una con un contenedor
// con su id (trending, recently-reviewed, weekly-selection) que se completa con /api/juegos.

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

// Pide una lista de juegos a la API y agrega una tarjeta por cada uno.
async function cargarJuegosEn(contenedor, url) {
    try {
        const respuesta = await fetch(url)
        const datos = await respuesta.json()

        // Si la API respondio con un error (400, 404, 500, 502), se muestra el mensaje.
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
        // Entra aca si no se pudo conectar con el servidor.
        mostrarError(contenedor, "Could not load games")
    }
}

/*******************************************************
************************ HOME **************************
*******************************************************/

// Arma el HTML de una categoria. Queda igual que las secciones que antes estaban escritas a mano:
// <section class="main-box-container">
//     <div class="gradient-lined-text"><h2>Popular Right Now</h2></div>
//     <div class="box-container-games" id="popular-right-now"></div>
// </section>
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

// Pide la lista de categorias y arma una seccion por cada una.
//
// Hay muchas categorias y cada una es un pedido a IGDB, que tiene un limite de pedidos.
// Por eso solo la primera se carga de entrada; las demas se cargan cuando el usuario
// esta por llegar a ellas con el scroll.
async function cargarCategorias() {
    // La primera categoria va arriba de "What Gamester lets you do" y las demas abajo.
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

    // Se usa para cargar cada categoria cuando aparece en pantalla.
    // (Si el navegador no tiene IntersectionObserver, se cargan todas de una vez.)
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

    // Si la pagina no tiene el contenedor de esta seccion, no se pide nada.
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
