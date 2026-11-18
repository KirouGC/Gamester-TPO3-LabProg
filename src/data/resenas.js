// Lista de reseñas de Gamester.
// Igual que los juegos, viven en este arreglo mientras el servidor esta prendido.
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
        usuario: "GordonFan98",
        avatar: "/assets/logo.png",
        estrellas: 5,
        texto: "The best intro in videogame history. That train ride never gets old.",
        likes: 48
    },
    {
        id: 5,
        idJuego: 1,
        usuario: "crowbar_enjoyer",
        avatar: "/assets/logo.png",
        estrellas: 4,
        texto: "Great game, but the Xen levels are too long.",
        likes: 31
    },
    {
        id: 6,
        idJuego: 1,
        usuario: "BlackMesaIntern",
        avatar: "/assets/logo.png",
        estrellas: 5,
        texto: "I played it for the first time this year and it still feels modern.",
        likes: 12
    },
    {
        id: 7,
        idJuego: 1,
        usuario: "headcrab_hater",
        avatar: "/assets/logo.png",
        estrellas: 3,
        texto: "Good shooter, but I got lost too many times.",
        likes: 5
    },

    // ----------------------- Otros juegos -----------------------
    {
        id: 8,
        idJuego: 3,
        usuario: "juanpi",
        avatar: "/assets/game-page/review/juanpi.webp",
        estrellas: 4,
        texto: "Perfect to play with friends. Alone it gets boring.",
        likes: 20
    },
    {
        id: 9,
        idJuego: 8,
        usuario: "Xx_LeonSKratos666_xX",
        avatar: "/assets/game-page/review/leonskratos.webp",
        estrellas: 5,
        texto: "Would you kindly play this game?",
        likes: 310
    },
    {
        id: 10,
        idJuego: 10,
        usuario: "Jose Riquelme Joe Metry",
        avatar: "/assets/game-page/review/quiensera.webp",
        estrellas: 5,
        texto: "200 hours and I am still in act 1.",
        likes: 87
    },
    {
        id: 11,
        idJuego: 22,
        usuario: "juanpi",
        avatar: "/assets/game-page/review/juanpi.webp",
        estrellas: 5,
        texto: "Hard but fair. The bosses are incredible.",
        likes: 64
    },
    {
        id: 12,
        idJuego: 28,
        usuario: "GordonFan98",
        avatar: "/assets/logo.png",
        estrellas: 5,
        texto: "Short, funny and smart. The cake is a lie.",
        likes: 142
    }
];

module.exports = resenas;
