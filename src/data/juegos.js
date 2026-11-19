// Lista de juegos locales de Gamester.
//
// Cada juego tiene:
//   id            -> numero unico
//   titulo        -> nombre del juego
//   anio          -> año de lanzamiento
//   portada       -> link a la imagen de portada
//   desarrollador -> empresa que lo hizo
//   descripcion   -> texto corto sobre el juego
//   genero        -> "shooter", "action", "adventure", "rpg", "survival", "horror", "platformer" o "puzzle"
//   plataformas   -> arreglo con "pc", "ps", "xbox", "nintendo" y/o "sega"
//   seccion       -> en que parte del home aparece:
//                    "trending", "recently-reviewed", "recently-released", "weekly-selection"
//                    o "catalogo" (no aparece en el home)

const juegos = [
    // ---------------------- TRENDING ----------------------
    {
        id: 1,
        titulo: "Hal Lai",
        anio: 1998,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7zzj.webp",
        desarrollador: "Valve Corporation",
        descripcion: "Half-Life is a 1998 first-person shooter (FPS) game developed by Valve Corporation and published by Sierra Studios for Windows. It was Valve's debut product and the first game in the Half-Life series. The player assumes the role of Gordon Freeman, a theoretical physicist who must escape from the Black Mesa Research Facility after it is overrun by aliens following a disastrous scientific experiment. Its gameplay consists of diverse combat, exploration and puzzles.",
        genero: "shooter",
        plataformas: ["pc", "ps"],
        seccion: "trending"
    },
    {
        id: 2,
        titulo: "Wolverine",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cob5mk.webp",
        desarrollador: "Insomniac Games",
        descripcion: "An action-adventure game where the player controls Logan, the mutant known as Wolverine, in a dark and violent story full of claws and fast combat.",
        genero: "action",
        plataformas: ["ps"],
        seccion: "trending"
    },
    {
        id: 3,
        titulo: "PAYDAY 2",
        anio: 2013,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/coaaqu.webp",
        desarrollador: "Overkill Software",
        descripcion: "A cooperative first-person shooter where a crew of four players plans and executes bank robberies and other heists.",
        genero: "shooter",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "trending"
    },
    {
        id: 4,
        titulo: "Assassin's Creed Black Flag: Resynced",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobyue.webp",
        desarrollador: "Ubisoft",
        descripcion: "A remake of the pirate adventure of Edward Kenway. Sail the Caribbean, board enemy ships and explore islands during the golden age of piracy.",
        genero: "adventure",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "trending"
    },
    {
        id: 5,
        titulo: "El GTA 6",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cocv1v.webp",
        desarrollador: "Rockstar Games",
        descripcion: "The next entry of the Grand Theft Auto series. An open world crime story set in the state of Leonida, with Jason and Lucia as main characters.",
        genero: "action",
        plataformas: ["ps", "xbox"],
        seccion: "trending"
    },
    {
        id: 6,
        titulo: "The Legend of Zelda: Ocarina of Time",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cocv5r.webp",
        desarrollador: "Nintendo",
        descripcion: "Link travels through time to stop Ganondorf and save the kingdom of Hyrule, exploring dungeons and solving puzzles along the way.",
        genero: "adventure",
        plataformas: ["nintendo"],
        seccion: "trending"
    },

    // ------------------ RECENTLY REVIEWED ------------------
    {
        id: 7,
        titulo: "Valheim",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cocygu.webp",
        desarrollador: "Iron Gate Studio",
        descripcion: "A survival and exploration game for up to ten players, set in a procedurally generated world inspired by viking culture.",
        genero: "survival",
        plataformas: ["pc", "xbox"],
        seccion: "recently-reviewed"
    },
    {
        id: 8,
        titulo: "BioShock",
        anio: 2007,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2mli.webp",
        desarrollador: "Irrational Games",
        descripcion: "A first-person shooter set in Rapture, an underwater city that was meant to be a utopia and ended up in ruins.",
        genero: "shooter",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-reviewed"
    },
    {
        id: 9,
        titulo: "Palworld",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7n02.webp",
        desarrollador: "Pocketpair",
        descripcion: "A survival and crafting game where the player catches creatures called Pals and uses them to fight, build and work in factories.",
        genero: "survival",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-reviewed"
    },
    {
        id: 10,
        titulo: "Baldur's Gate III",
        anio: 2023,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp",
        desarrollador: "Larian Studios",
        descripcion: "A role-playing game based on Dungeons & Dragons. Gather a party, make choices that change the story and fight in turn-based combat.",
        genero: "rpg",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-reviewed"
    },
    {
        id: 11,
        titulo: "Resident Evil Requiem",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobmj0.webp",
        desarrollador: "Capcom",
        descripcion: "A new chapter of the survival horror series. Investigate a series of strange deaths and survive with limited resources.",
        genero: "horror",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-reviewed"
    },
    {
        id: 12,
        titulo: "Devil May Cry 5",
        anio: 2019,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb4.webp",
        desarrollador: "Capcom",
        descripcion: "A fast action game where Nero, Dante and V fight hordes of demons with swords, guns and stylish combos.",
        genero: "action",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-reviewed"
    },

    // ------------------ RECENTLY RELEASED ------------------
    {
        id: 13,
        titulo: "The Witcher 3: Wild Hunt Remastered",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cocrjd.webp",
        desarrollador: "CD Projekt Red",
        descripcion: "Geralt of Rivia, a monster hunter, searches for his adopted daughter in a huge open world full of contracts and hard decisions.",
        genero: "rpg",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-released"
    },
    {
        id: 14,
        titulo: "Minecraft Dungeions II",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/coc75p.webp",
        desarrollador: "Mojang Studios",
        descripcion: "A dungeon crawler set in the Minecraft universe. Explore levels alone or with friends, collect loot and defeat mobs.",
        genero: "rpg",
        plataformas: ["pc", "ps", "xbox", "nintendo"],
        seccion: "recently-released"
    },
    {
        id: 15,
        titulo: "Control Resonant",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/coc64f.webp",
        desarrollador: "Remedy Entertainment",
        descripcion: "An action game with supernatural powers, set in a Manhattan that has been twisted by a paranormal force.",
        genero: "action",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-released"
    },
    {
        id: 16,
        titulo: "Silent Hill: Townfall",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/coc5sw.webp",
        desarrollador: "Screen Burn Interactive",
        descripcion: "A psychological horror game of the Silent Hill series, with a new story set in a foggy coastal town.",
        genero: "horror",
        plataformas: ["pc", "ps"],
        seccion: "recently-released"
    },
    {
        id: 17,
        titulo: "Fire Emblem: Fortune's Weave",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/coc7ma.webp",
        desarrollador: "Intelligent Systems",
        descripcion: "A tactical role-playing game. Command an army of heroes on grid-based battlefields where every move matters.",
        genero: "rpg",
        plataformas: ["nintendo"],
        seccion: "recently-released"
    },
    {
        id: 18,
        titulo: "The Blood of Dawnwalker",
        anio: 2026,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cob7ym.webp",
        desarrollador: "Rebel Wolves",
        descripcion: "A dark fantasy role-playing game set in medieval Europe, where the main character is half human and half vampire.",
        genero: "rpg",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "recently-released"
    },

    // ---------------- THIS WEEK'S SELECTION ----------------
    {
        id: 19,
        titulo: "Halo Infinite",
        anio: 2021,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2dto.webp",
        desarrollador: "343 Industries",
        descripcion: "Master Chief returns in a first-person shooter set on the ring world Zeta Halo, with an open campaign and online multiplayer.",
        genero: "shooter",
        plataformas: ["pc", "xbox"],
        seccion: "weekly-selection"
    },
    {
        id: 20,
        titulo: "Shadow of the Colossus",
        anio: 2005,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1ozz.webp",
        desarrollador: "Team Ico",
        descripcion: "A young man travels across a forbidden land to defeat sixteen giant creatures and bring a girl back to life.",
        genero: "adventure",
        plataformas: ["ps"],
        seccion: "weekly-selection"
    },
    {
        id: 21,
        titulo: "God of War",
        anio: 2005,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3ddc.webp",
        desarrollador: "Santa Monica Studio",
        descripcion: "Kratos, a spartan warrior, fights against the gods of Greek mythology in a brutal action game.",
        genero: "action",
        plataformas: ["ps"],
        seccion: "weekly-selection"
    },
    {
        id: 22,
        titulo: "Dark Souls III",
        anio: 2016,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/cob9ed.webp",
        desarrollador: "FromSoftware",
        descripcion: "A difficult action role-playing game set in the kingdom of Lothric, known for its hard bosses and dark atmosphere.",
        genero: "rpg",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "weekly-selection"
    },
    {
        id: 23,
        titulo: "Infamous: Second Son",
        anio: 2014,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1izy.webp",
        desarrollador: "Sucker Punch Productions",
        descripcion: "Delsin Rowe discovers he has superpowers and uses them to move freely around an open world version of Seattle.",
        genero: "action",
        plataformas: ["ps"],
        seccion: "weekly-selection"
    },
    {
        id: 24,
        titulo: "Super Mario Galaxy",
        anio: 2007,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co21ro.webp",
        desarrollador: "Nintendo",
        descripcion: "Mario jumps from planet to planet collecting stars to rescue Princess Peach from Bowser.",
        genero: "platformer",
        plataformas: ["nintendo"],
        seccion: "weekly-selection"
    },

    // ----------- CATALOGO (no aparecen en el home) -----------
    {
        id: 25,
        titulo: "Doom",
        anio: 1993,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5rav.webp",
        desarrollador: "id Software",
        descripcion: "One of the first and most influential first-person shooters. A space marine fights demons on the moons of Mars.",
        genero: "shooter",
        plataformas: ["pc"],
        seccion: "catalogo"
    },
    {
        id: 26,
        titulo: "Counter-Strike",
        anio: 2000,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/coc32b.webp",
        desarrollador: "Valve Corporation",
        descripcion: "A team-based online shooter where terrorists and counter-terrorists compete round after round.",
        genero: "shooter",
        plataformas: ["pc"],
        seccion: "catalogo"
    },
    {
        id: 27,
        titulo: "Call of Duty 2",
        anio: 2005,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3acf.webp",
        desarrollador: "Infinity Ward",
        descripcion: "A first-person shooter set in World War II, with campaigns for Soviet, British and American soldiers.",
        genero: "shooter",
        plataformas: ["pc", "xbox"],
        seccion: "catalogo"
    },
    {
        id: 28,
        titulo: "Portal",
        anio: 2007,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/coay61.webp",
        desarrollador: "Valve Corporation",
        descripcion: "A first-person puzzle game. Use a portal gun to solve test chambers while an artificial intelligence called GLaDOS watches.",
        genero: "puzzle",
        plataformas: ["pc", "ps", "xbox"],
        seccion: "catalogo"
    },
    {
        id: 29,
        titulo: "Quake II",
        anio: 1997,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co9bg8.webp",
        desarrollador: "id Software",
        descripcion: "A fast first-person shooter where a marine fights alone against an alien race called the Strogg.",
        genero: "shooter",
        plataformas: ["pc"],
        seccion: "catalogo"
    },
    {
        id: 30,
        titulo: "Duke Nukem",
        anio: 1999,
        portada: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7xtx.webp",
        desarrollador: "3D Realms",
        descripcion: "A shooter starring Duke Nukem, an action hero who saves the Earth from an alien invasion with a lot of attitude.",
        genero: "shooter",
        plataformas: ["pc"],
        seccion: "catalogo"
    }
];

module.exports = juegos;
