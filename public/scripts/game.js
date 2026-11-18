// Carga la pagina de un juego desde la API.
// El id del juego viene en la direccion: /pages/game/index.html?id=1

const CANTIDAD_RESENAS = 3
const CANTIDAD_SIMILARES = 6

// Nombre que se muestra para cada plataforma.
const NOMBRES_PLATAFORMAS = {
    pc: "PC",
    ps: "PlayStation",
    xbox: "Xbox",
    nintendo: "Nintendo",
    sega: "Sega"
}

const parametros = new URLSearchParams(window.location.search)
const idJuego = parametros.get("id")

const botonLog = document.querySelector(".log-button")
// En la pagina hay dos "Load More..." (reseñas y listas). Este es el de las reseñas.
const botonCargarMas = document.querySelector(".review-container .load-more-text")
const formulario = document.querySelector("#review-form")
const errorFormulario = document.querySelector("#review-error")

// Cuantas reseñas se pidieron hasta ahora (se usa como "from" del proximo pedido).
let resenasCargadas = 0

/*******************************************************
************************ JUEGO *************************
*******************************************************/

async function cargarJuego() {
    try {
        const respuesta = await fetch("/api/juegos/" + idJuego)
        const juego = await respuesta.json()

        // Si el juego no existe (404) o el id es invalido (400), se muestra el error.
        if (!respuesta.ok) {
            mostrarErrorDePagina(juego.error)
            return
        }

        mostrarJuego(juego)
        cargarSimilares(juego)
        cargarResenas()
    } catch (error) {
        mostrarErrorDePagina("Could not connect to the server")
    }
}

function mostrarJuego(juego) {
    document.title = juego.titulo + " - Gamester"

    const portada = document.querySelector(".game-pic img")
    portada.src = juego.portada
    portada.alt = juego.titulo

    // El titulo, el año, el desarrollador y la descripcion estan dos veces en el HTML
    // (una para pantallas grandes y otra para celulares), por eso se usa querySelectorAll.
    document.querySelectorAll(".game-name").forEach((elemento) => {
        elemento.textContent = juego.titulo
    })

    document.querySelectorAll(".game-title-date").forEach((elemento) => {
        elemento.textContent = juego.anio
    })

    document.querySelectorAll(".company-name").forEach((elemento) => {
        elemento.textContent = juego.desarrollador
    })

    document.querySelectorAll(".game-description p").forEach((elemento) => {
        elemento.textContent = juego.descripcion
    })

    // Estos datos vienen de IGDB. Si el juego no esta vinculado con IGDB no existen,
    // y la pagina queda como antes (banner y puntaje por defecto, sin generos).
    if (juego.banner) {
        document.querySelector(".game-banner").style.backgroundImage = "url(" + juego.banner + ")"
    }

    if (juego.generos) {
        document.querySelectorAll(".game-genres").forEach((elemento) => {
            elemento.textContent = juego.generos.join(", ")
        })
    }

    if (juego.puntaje) {
        document.querySelector(".review-number").textContent = juego.puntaje
        document.querySelector(".review-count").textContent = "From " + formatearLikes(juego.cantidadPuntajes) + " IGDB ratings"
    }

    const cajaPlataformas = document.querySelector(".platforms-box")

    juego.plataformas.forEach((plataforma) => {
        cajaPlataformas.appendChild(crearFilaPlataforma(plataforma))
    })
}

// Arma una fila de la caja "Platforms": el logo y el nombre.
function crearFilaPlataforma(plataforma) {
    const fila = document.createElement("div")
    fila.classList.add("platform-row")

    const logo = document.createElement("img")
    logo.classList.add("platforms-image")
    logo.src = "/assets/game-page/platform-logos/" + plataforma + "-logo.webp"
    logo.alt = plataforma

    const nombre = document.createElement("p")
    nombre.classList.add("state-text", "platforms-text")
    nombre.textContent = NOMBRES_PLATAFORMAS[plataforma]

    fila.appendChild(logo)
    fila.appendChild(nombre)

    return fila
}

// Reemplaza todo el contenido de la pagina por un mensaje de error.
function mostrarErrorDePagina(mensaje) {
    const contenedor = document.querySelector(".game-container")
    contenedor.innerHTML = ""

    const texto = document.createElement("p")
    texto.classList.add("dummy-text")
    texto.textContent = mensaje

    contenedor.appendChild(texto)
}

/*******************************************************
******************* JUEGOS SIMILARES *******************
*******************************************************/

// Los juegos similares son los que tienen el mismo genero.
async function cargarSimilares(juego) {
    const contenedor = document.querySelector("#similar-games")

    try {
        // Se pide uno de mas porque en la lista puede venir el mismo juego que se esta viendo.
        const cantidad = CANTIDAD_SIMILARES + 1
        const respuesta = await fetch("/api/juegos?genero=" + juego.genero + "&cantidad=" + cantidad + "&from=0")
        const datos = await respuesta.json()

        const similares = datos.juegos.filter((otroJuego) => otroJuego.id !== juego.id)

        similares.slice(0, CANTIDAD_SIMILARES).forEach((otroJuego) => {
            contenedor.appendChild(crearTarjeta(otroJuego))
        })

        if (similares.length === 0) {
            mostrarTextoEnContenedor(contenedor, "No similar games yet")
        }
    } catch (error) {
        mostrarTextoEnContenedor(contenedor, "Could not load similar games")
    }
}

function mostrarTextoEnContenedor(contenedor, mensaje) {
    const texto = document.createElement("p")
    texto.classList.add("error-text")
    texto.textContent = mensaje
    contenedor.appendChild(texto)
}

/*******************************************************
*********************** RESEÑAS ************************
*******************************************************/

// Pide la siguiente "pagina" de reseñas y las agrega arriba del "Load More...".
async function cargarResenas() {
    try {
        const respuesta = await fetch("/api/juegos/" + idJuego + "/resenas?cantidad=" + CANTIDAD_RESENAS + "&from=" + resenasCargadas)
        const datos = await respuesta.json()

        datos.resenas.forEach((resena) => {
            // Si la reseña ya esta en pantalla (porque se acaba de crear), no se repite.
            if (!document.querySelector("#review-" + resena.id)) {
                botonCargarMas.before(crearCajaResena(resena))
            }
        })

        resenasCargadas = resenasCargadas + datos.resenas.length

        // Si ya se pidieron todas, se esconde el "Load More...".
        if (resenasCargadas >= datos.total) {
            botonCargarMas.style.display = "none"
        }

        if (datos.total === 0) {
            const texto = document.createElement("p")
            texto.classList.add("state-text")
            texto.id = "no-reviews"
            texto.textContent = "No reviews yet. Be the first!"
            botonCargarMas.before(texto)
        }
    } catch (error) {
        botonCargarMas.textContent = "Could not load reviews"
    }
}

// Arma la caja de una reseña.
function crearCajaResena(resena) {
    const caja = document.createElement("article")
    caja.classList.add("review-box")
    caja.id = "review-" + resena.id

    // Estrellas: amarillas hasta el puntaje, grises las que faltan para llegar a 5.
    let estrellas = ""

    for (let i = 1; i <= 5; i++) {
        if (i <= resena.estrellas) {
            estrellas = estrellas + "<i class=\"yellow-star fa-solid fa-star\" aria-hidden=\"true\"></i>"
        } else {
            estrellas = estrellas + "<i class=\"grey-star fa-solid fa-star\" aria-hidden=\"true\"></i>"
        }
    }

    caja.innerHTML = `
        <img class="mini-pfp">
        <div class="review-content">
            <p class="state-text review-user"></p>
            <div class="reviewed-stars" role="img" aria-label="Rated ${resena.estrellas} out of 5 stars">${estrellas}</div>
            <p class="state-text review-text"></p>
            <div class="like-container">
                <div class="image-with-text">
                    <img src="/assets/game-page/review/like-hand.webp" alt="Mano like">
                    <p class="state-text like-text">Like</p>
                </div>
                <p class="like-counter">${formatearLikes(resena.likes)} Likes</p>
            </div>
        </div>
    `

    // Lo que escribio el usuario se pone con textContent para que se muestre como texto
    // (y no se interprete como HTML).
    caja.querySelector(".mini-pfp").src = resena.avatar
    caja.querySelector(".mini-pfp").alt = resena.usuario
    caja.querySelector(".review-user").textContent = "Review by " + resena.usuario
    caja.querySelector(".review-text").textContent = resena.texto

    return caja
}

// 99000 -> "99K", 154 -> "154"
function formatearLikes(likes) {
    if (likes >= 1000) {
        return Math.floor(likes / 1000) + "K"
    }

    return likes
}

botonCargarMas.addEventListener("click", cargarResenas)

/*******************************************************
******************** CREAR RESEÑA **********************
*******************************************************/

// El boton "Log and Review" muestra u oculta el formulario.
botonLog.addEventListener("click", () => {
    formulario.classList.toggle("review-form-open")
    formulario.scrollIntoView({ behavior: "smooth", block: "center" })
})

formulario.addEventListener("submit", async (evento) => {
    // Evita que el navegador recargue la pagina al enviar el formulario.
    evento.preventDefault()

    const nuevaResena = {
        usuario: document.querySelector("#review-user").value,
        estrellas: Number(document.querySelector("#review-stars").value),
        texto: document.querySelector("#review-text").value
    }

    try {
        const respuesta = await fetch("/api/juegos/" + idJuego + "/resenas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaResena)
        })
        const datos = await respuesta.json()

        // Si la API rechazo los datos (400), se muestra el mensaje que mando.
        if (!respuesta.ok) {
            errorFormulario.textContent = datos.error
            return
        }

        // La reseña nueva se muestra primera, justo abajo del formulario.
        formulario.after(crearCajaResena(datos))

        const textoSinResenas = document.querySelector("#no-reviews")

        if (textoSinResenas) {
            textoSinResenas.remove()
        }

        formulario.reset()
        errorFormulario.textContent = ""
        formulario.classList.remove("review-form-open")
    } catch (error) {
        errorFormulario.textContent = "Could not connect to the server"
    }
})

cargarJuego()
