// Carga la pagina de un juego desde la API.

const CANTIDAD_RESENAS = 3
const CANTIDAD_SIMILARES = 6

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
const botonCargarMas = document.querySelector(".review-container .load-more-text")
const formulario = document.querySelector("#review-form")
const errorFormulario = document.querySelector("#review-error")

let resenasCargadas = 0

/*******************************************************
************************ JUEGO *************************
*******************************************************/

async function cargarJuego() {
    try {
        const respuesta = await fetch("/api/juegos/" + idJuego)
        const juego = await respuesta.json()

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

    document.querySelectorAll(".game-name").forEach((elemento) => {
        elemento.textContent = juego.titulo
    })

    document.querySelectorAll(".game-title-date").forEach((elemento) => {
        elemento.textContent = juego.anio || "TBA"
    })

    document.querySelectorAll(".company-name").forEach((elemento) => {
        elemento.textContent = juego.desarrollador
    })

    document.querySelectorAll(".game-description p").forEach((elemento) => {
        elemento.textContent = juego.descripcion
    })

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

async function cargarSimilares(juego) {
    const contenedor = document.querySelector("#similar-games")

    if (juego.similares) {
        juego.similares.slice(0, CANTIDAD_SIMILARES).forEach((otroJuego) => {
            contenedor.appendChild(crearTarjeta(otroJuego))
        })

        if (juego.similares.length === 0) {
            mostrarTextoEnContenedor(contenedor, "No similar games yet")
        }

        return
    }

    try {
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

async function cargarResenas() {
    try {
        const respuesta = await fetch("/api/juegos/" + idJuego + "/resenas?cantidad=" + CANTIDAD_RESENAS + "&from=" + resenasCargadas)
        const datos = await respuesta.json()

        datos.resenas.forEach((resena) => {
            if (!document.querySelector("#review-" + resena.id)) {
                botonCargarMas.before(crearCajaResena(resena))
            }
        })

        resenasCargadas = resenasCargadas + datos.resenas.length

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

function crearCajaResena(resena) {
    const caja = document.createElement("article")
    caja.classList.add("review-box")
    caja.id = "review-" + resena.id

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

    caja.querySelector(".mini-pfp").src = resena.avatar
    caja.querySelector(".mini-pfp").alt = resena.usuario
    caja.querySelector(".review-user").textContent = "Review by " + resena.usuario
    caja.querySelector(".review-text").textContent = resena.texto

    return caja
}

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

botonLog.addEventListener("click", () => {
    formulario.classList.toggle("review-form-open")
    formulario.scrollIntoView({ behavior: "smooth", block: "center" })
})

formulario.addEventListener("submit", async (evento) => {
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

        if (!respuesta.ok) {
            errorFormulario.textContent = datos.error
            return
        }

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
