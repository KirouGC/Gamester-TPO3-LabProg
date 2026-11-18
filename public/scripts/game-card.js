// Crea la tarjeta de un juego (la portada con el nombre que aparece al pasar el mouse).
// Recibe un juego de la API y devuelve el elemento listo para agregar a la pagina.
//
// Queda armado asi:
// <a class="game-box" href="/pages/game/index.html?id=1">
//     <img src="..." alt="Hal Lai">
//     <span class="hidden-name">
//         Hal Lai
//         <span class="hidden-year">(1998)</span>
//     </span>
// </a>

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

    const anio = document.createElement("span")
    anio.classList.add("hidden-year")
    anio.textContent = "(" + juego.anio + ")"

    nombre.appendChild(anio)
    tarjeta.appendChild(portada)
    tarjeta.appendChild(nombre)

    return tarjeta
}
