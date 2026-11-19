// Crea la tarjeta de un juego.

function crearTarjeta(juego) {
    const tarjeta = document.createElement("a")
    tarjeta.classList.add("game-box")
    tarjeta.href = "/pages/game/index.html?id=" + juego.id

    const portada = document.createElement("img")
    portada.src = juego.portada
    portada.alt = juego.titulo

    const nombre = document.createElement("span")
    nombre.classList.add("hidden-name")
    nombre.textContent = juego.titulo + " "

    if (juego.anio) {
        const anio = document.createElement("span")
        anio.classList.add("hidden-year")
        anio.textContent = "(" + juego.anio + ")"
        nombre.appendChild(anio)
    }

    tarjeta.appendChild(portada)
    tarjeta.appendChild(nombre)

    return tarjeta
}
