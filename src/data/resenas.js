// Lista de reseñas de Gamester.
//
// Cada reseña tiene:
//   id       -> numero unico
//   idJuego  -> id del juego al que pertenece (ver juegos.js)
//   usuario  -> nombre de quien la escribio
//   avatar   -> ruta a la foto de perfil (dentro de public)
//   estrellas -> puntaje del 1 al 5
//   texto    -> contenido de la reseña
//   likes    -> cantidad de likes

const resenas = [
    // ------------------- Hal Lai (juego 1) -------------------
    {
        id: 1,
        idJuego: 1,
        usuario: "Jose Riquelme Joe Metry",
        avatar: "/assets/game-page/review/quiensera.webp",
        estrellas: 2,
        texto: "Masterpiece.",
        likes: 2
    },
    {
        id: 2,
        idJuego: 1,
        usuario: "Xx_LeonSKratos666_xX",
        avatar: "/assets/game-page/review/leonskratos.webp",
        estrellas: 4,
        texto: "Enriqueeeeeeeeeeeeeee.",
        likes: 154
    },
    {
        id: 3,
        idJuego: 1,
        usuario: "juanpi",
        avatar: "/assets/game-page/review/juanpi.webp",
        estrellas: 5,
        texto: "juanpi",
        likes: 99000
    },
    {
        id: 4,
        idJuego: 1,
        usuario: "Gman",
        avatar: "/assets/logo.png",
        estrellas: 5,
        texto: "muy bueno el aplauso",
        likes: 48
    },
    {
        id: 5,
        idJuego: 1,
        usuario: "lol",
        avatar: "/assets/logo.png",
        estrellas: 4,
        texto: "una vez yo era el lol",
        likes: 31
    },
    {
        id: 6,
        idJuego: 1,
        usuario: "Carlito",
        avatar: "/assets/logo.png",
        estrellas: 5,
        texto: "soy carlito",
        likes: 12
    },
    {
        id: 7,
        idJuego: 1,
        usuario: "mysteryMan",
        avatar: "/assets/logo.png",
        estrellas: 3,
        texto: "yogur",
        likes: 5
    },

    // ----------------------- Otros juegos -----------------------
    {
        id: 8,
        idJuego: 3,
        usuario: "juanpi",
        avatar: "/assets/game-page/review/juanpi.webp",
        estrellas: 4,
        texto: "viva israel",
        likes: 20
    },
    {
        id: 9,
        idJuego: 8,
        usuario: "Xx_LeonSKratos666_xX",
        avatar: "/assets/game-page/review/leonskratos.webp",
        estrellas: 5,
        texto: "like y me subscribo",
        likes: 310
    },
    {
        id: 10,
        idJuego: 10,
        usuario: "Jose Riquelme Joe Metry",
        avatar: "/assets/game-page/review/quiensera.webp",
        estrellas: 5,
        texto: "los odio a todos",
        likes: 87
    },
    {
        id: 11,
        idJuego: 22,
        usuario: "juanpi",
        avatar: "/assets/game-page/review/juanpi.webp",
        estrellas: 5,
        texto: "aVION 912",
        likes: 64
    },
    {
        id: 12,
        idJuego: 28,
        usuario: "GordonFan67",
        avatar: "/assets/logo.png",
        estrellas: 5,
        texto: "Me gusta mucho el queque",
        likes: 142
    },

    {
        id: 13,
        idJuego: "igdb-1025",
        usuario: "GordonFan67",
        avatar: "/assets/logo.png",
        estrellas: 5,
        texto: "Me gusta mucho el queque parte dos",
        likes: 142
    }
];

module.exports = resenas;
