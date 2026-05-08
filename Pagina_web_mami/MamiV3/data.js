// ===================================================================
// DATA.JS — BASE DE DATOS DE LA PASTELERÍA
// ===================================================================
// Todo lo que está aquí se ve igual para TODOS los visitantes.
// Para cambiar algo: edita este archivo y vuelve a subir a tu hosting.
//
// ⚠️ IMPORTANTE — CADA VEZ QUE HAGAS UN CAMBIO:
// Sube el número de DATA_VERSION en 1 (ejemplo: '2' → '3')
// Esto hace que todos los visitantes vean los datos nuevos
// automáticamente, sin importar si ya habían visitado la página.
// ===================================================================

const DATA_VERSION = '2'; // ← SUBE ESTE NÚMERO CADA VEZ QUE HAGAS UN CAMBIO Y LOS SUBAS ALA WEB

// Si la versión guardada es diferente a la del código, limpia todo
// y carga los datos nuevos del código.
if (localStorage.getItem('data_version') !== DATA_VERSION) {
  localStorage.clear();
  localStorage.setItem('data_version', DATA_VERSION);
}

const DB = {

  // ==================================================================
  // CONFIGURACIÓN GENERAL
  // ==================================================================
  getConfig() {
    const hardcoded = {
      nombre:   'Tradiciones que enamoran',
      slogan:   'Hecho con amor, entregado con cariño',
      whatsapp: '528715145631'
    };
    return JSON.parse(localStorage.getItem('cfg') || JSON.stringify(hardcoded));
  },
  saveConfig(cfg) {
    localStorage.setItem('cfg', JSON.stringify(cfg));
  },

  // ==================================================================
  // SABORES
  // imagen: ruta de la foto del pastel con ese sabor (o '' si no tienes)
  // ==================================================================
  getSabores() {
    const hardcoded = [
      { id: 1,  nombre: 'Mazapan',           color: '#fde68a',   imagen: 'imagenes/Sabores/Mazapan.jpeg'},
      { id: 2,  nombre: 'Oreo',              color: '#78350f',   imagen: 'imagenes/Sabores/Oreo.jpeg' },
      { id: 3,  nombre: 'Hershey',           color: '#59460b',   imagen: '' },
      { id: 4,  nombre: 'Duvalin',           color: '#1df5f180', imagen: '' },
      { id: 5,  nombre: 'Lunetas de yogurt', color: '#ffffff',   imagen: 'imagenes/Sabores/lunetas-yogurd.jpeg' },
      { id: 6,  nombre: 'CarlosV',           color: '#da0909',   imagen: 'imagenes/Sabores/CarlosV.jpeg' },
      { id: 7,  nombre: 'Fresas con crema',  color: '#fef3c7',   imagen: '' },
      { id: 8,  nombre: 'Nuez',              color: '#dc8726b3', imagen: 'imagenes/Sabores/Nuez.jpeg' },
      { id: 9,  nombre: 'Almendra',          color: '#dc872685', imagen: '' },
      { id: 10, nombre: 'Coco',              color: '#c8c8c8b3', imagen: '' },
      { id: 11, nombre: 'Mango',             color: '#ff9d00',   imagen: '' },
      { id: 12, nombre: 'Cafe',              color: '#9b53007b', imagen: '' },
      { id: 13, nombre: 'Fresas',            color: '#d60505ee', imagen: '' },
      { id: 14, nombre: 'Cajeta',            color: '#b86d16c7', imagen: 'imagenes/Sabores/Cajeta.jpeg' },
      { id: 15, nombre: 'Mermelada de fresa',color: '#c40101ac', imagen: '' },
      // AGREGA MÁS SABORES AQUÍ:
      // { id: 16, nombre: 'NuevoSabor', color: '#1c1c1c', imagen: '' },
    ];
    return JSON.parse(localStorage.getItem('sabores') || JSON.stringify(hardcoded));
  },
  saveSabores(s) { localStorage.setItem('sabores', JSON.stringify(s)); },

  // ==================================================================
  // TIPOS DE BETÚN
  // ==================================================================
  getBetunes() {
    const hardcoded = [
      { id: 1, nombre: 'Betún Chocolate',    color: '#5c3317' },
      { id: 2, nombre: 'Betún Mantequilla',  color: '#f5d06a' },
      { id: 3, nombre: 'Betún Vainilla',     color: '#fdf3c0' },
    ];
    return JSON.parse(localStorage.getItem('betunes') || JSON.stringify(hardcoded));
  },
  saveBetunes(b) { localStorage.setItem('betunes', JSON.stringify(b)); },

  // ==================================================================
  // POSTRES DEL MENÚ
  // imagenDetalle: imagen que se muestra al SELECCIONAR el postre
  //               (puede ser diferente a la imagen de portada)
  // ==================================================================
  getPostres() {
    const hardcoded = [

      {
        id: 1,
        nombre:       'Mojadito',
        descripcion:  'Esponjoso, lechoso y decorado a mano con amor',
        precio:       65,
        emoji:        '🍮',
        imagen:       'imagenes/mojadito3.jpeg',
        imagenDetalle: 'imagenes/mojadito3.jpeg',
        activo:       true,
        tieneSabores: true,
        numSabores:   2,
      },


      // AGREGA MÁS POSTRES AQUÍ — copia el bloque de arriba y cambia los datos:
      // {
      //   id: 2,
      //   nombre:       'Gelatina de Mosaico',
      //   descripcion:  'Colorida y fresca para cualquier ocasión',
      //   precio:       80,
      //   emoji:        '🟩',
      //   imagen:       '',
      //   imagenDetalle: '',
      //   activo:       true,
      //   tieneSabores: false,
      //   numSabores:   0,
      // },

    ];
    return JSON.parse(localStorage.getItem('postres') || JSON.stringify(hardcoded));
  },
  savePostres(p) { localStorage.setItem('postres', JSON.stringify(p)); },

  // ==================================================================
  // COMBINACIONES DE SABORES
  // Cuando el cliente elige 2 sabores, muestra una foto especial.
  // saboresIds: los ids de los sabores que se combinan
  // imagen:     ruta de la foto para esa combinación ('' = mensaje especial)
  // ==================================================================
  getCombinaciones() {
    const hardcoded = [
      // ── COMBINACIONES CON FOTO ─────────────────────────────────────
      {
        id: 1,
        saboresIds: [13, 14],
        nombres:    'Fresas + Cajeta',
        imagen:     'imagenes/Sabores/Fresas-Cajeta.jpeg',
      },
      {
        id: 2,
        saboresIds: [13, 6],
        nombres:    'Fresas + CarlosV',
        imagen:     'imagenes/Sabores/Fresas-CarlosV.jpeg',
      },
      {
        id: 3,
        saboresIds: [13, 8],
        nombres:    'Fresas + Nuez',
        imagen:     'imagenes/Sabores/Fresas-Nuez.jpeg',
      },
      {
        id: 4,
        saboresIds: [3, 9],
        nombres:    'Hershey + Almendra',
        imagen:     'imagenes/Sabores/Chocolate-Almendra.jpeg',
      },
      {
        id: 5,
        saboresIds: [4, 3],
        nombres:    'Duvalin + Hershey',
        imagen:     'imagenes/Sabores/Duvalin-Hershys.jpeg',
      },
      {
        id: 6,
        saboresIds: [3, 6],
        nombres:    'Hershey + CarlosV',
        imagen:     'imagenes/Sabores/Hershey-CarlosV.jpeg',
      },
      {
        id: 7,
        saboresIds: [5, 3],
        nombres:    'Lunetas de yogurt + Hershey',
        imagen:     'imagenes/Sabores/Lunetas-Chocolate.jpeg',
      },
      {
        id: 8,
        saboresIds: [11, 8],
        nombres:    'Mango + Nuez',
        imagen:     'imagenes/Sabores/Mango-Nuez.jpeg',
      },
      {
        id: 9,
        saboresIds: [1, 3],
        nombres:    'Mazapan + Hershey',
        imagen:     'imagenes/Sabores/Mazapan-hershys.jpeg',
      },
      {
        id: 10,
        saboresIds: [2, 3],
        nombres:    'Oreo + Hershey',
        imagen:     'imagenes/Sabores/Oreo-hershys.jpeg',
      },
    
      // ── COMBINACIONES DESCUBIERTAS (sin foto aún) ──────────────────
      { id: 11, saboresIds: [1, 2],  nombres: 'Mazapan + Oreo',             imagen: '' },
      { id: 12, saboresIds: [1, 4],  nombres: 'Mazapan + Duvalin',          imagen: '' },
      { id: 13, saboresIds: [1, 5],  nombres: 'Mazapan + Lunetas de yogurt',imagen: '' },
      { id: 14, saboresIds: [1, 6],  nombres: 'Mazapan + CarlosV',          imagen: '' },
      { id: 15, saboresIds: [1, 7],  nombres: 'Mazapan + Fresas con crema', imagen: '' },
      { id: 16, saboresIds: [1, 8],  nombres: 'Mazapan + Nuez',             imagen: '' },
      { id: 17, saboresIds: [1, 9],  nombres: 'Mazapan + Almendra',         imagen: '' },
      { id: 18, saboresIds: [1, 10], nombres: 'Mazapan + Coco',             imagen: '' },
      { id: 19, saboresIds: [1, 11], nombres: 'Mazapan + Mango',            imagen: '' },
      { id: 20, saboresIds: [1, 12], nombres: 'Mazapan + Cafe',             imagen: '' },
      { id: 21, saboresIds: [1, 13], nombres: 'Mazapan + Fresas',           imagen: '' },
      { id: 22, saboresIds: [1, 14], nombres: 'Mazapan + Cajeta',           imagen: '' },
      { id: 23, saboresIds: [1, 15], nombres: 'Mazapan + Mermelada de fresa',imagen: '' },
      { id: 24, saboresIds: [2, 4],  nombres: 'Oreo + Duvalin',             imagen: '' },
      { id: 25, saboresIds: [2, 5],  nombres: 'Oreo + Lunetas de yogurt',   imagen: '' },
      { id: 26, saboresIds: [2, 6],  nombres: 'Oreo + CarlosV',             imagen: '' },
      { id: 27, saboresIds: [2, 7],  nombres: 'Oreo + Fresas con crema',    imagen: '' },
      { id: 28, saboresIds: [2, 8],  nombres: 'Oreo + Nuez',                imagen: '' },
      { id: 29, saboresIds: [2, 9],  nombres: 'Oreo + Almendra',            imagen: '' },
      { id: 30, saboresIds: [2, 10], nombres: 'Oreo + Coco',                imagen: '' },
      { id: 31, saboresIds: [2, 11], nombres: 'Oreo + Mango',               imagen: '' },
      { id: 32, saboresIds: [2, 12], nombres: 'Oreo + Cafe',                imagen: '' },
      { id: 33, saboresIds: [2, 13], nombres: 'Oreo + Fresas',              imagen: '' },
      { id: 34, saboresIds: [2, 14], nombres: 'Oreo + Cajeta',              imagen: '' },
      { id: 35, saboresIds: [2, 15], nombres: 'Oreo + Mermelada de fresa',  imagen: '' },
      { id: 36, saboresIds: [3, 4],  nombres: 'Hershey + Duvalin',          imagen: '' },
      { id: 37, saboresIds: [3, 5],  nombres: 'Hershey + Lunetas de yogurt',imagen: '' },
      { id: 38, saboresIds: [3, 7],  nombres: 'Hershey + Fresas con crema', imagen: '' },
      { id: 39, saboresIds: [3, 8],  nombres: 'Hershey + Nuez',             imagen: '' },
      { id: 40, saboresIds: [3, 10], nombres: 'Hershey + Coco',             imagen: '' },
      { id: 41, saboresIds: [3, 11], nombres: 'Hershey + Mango',            imagen: '' },
      { id: 42, saboresIds: [3, 12], nombres: 'Hershey + Cafe',             imagen: '' },
      { id: 43, saboresIds: [3, 13], nombres: 'Hershey + Fresas',           imagen: '' },
      { id: 44, saboresIds: [3, 14], nombres: 'Hershey + Cajeta',           imagen: '' },
      { id: 45, saboresIds: [3, 15], nombres: 'Hershey + Mermelada de fresa',imagen: '' },
      { id: 46, saboresIds: [4, 5],  nombres: 'Duvalin + Lunetas de yogurt',imagen: '' },
      { id: 47, saboresIds: [4, 6],  nombres: 'Duvalin + CarlosV',          imagen: '' },
      { id: 48, saboresIds: [4, 7],  nombres: 'Duvalin + Fresas con crema', imagen: '' },
      { id: 49, saboresIds: [4, 8],  nombres: 'Duvalin + Nuez',             imagen: '' },
      { id: 50, saboresIds: [4, 9],  nombres: 'Duvalin + Almendra',         imagen: '' },
      { id: 51, saboresIds: [4, 10], nombres: 'Duvalin + Coco',             imagen: '' },
      { id: 52, saboresIds: [4, 11], nombres: 'Duvalin + Mango',            imagen: '' },
      { id: 53, saboresIds: [4, 12], nombres: 'Duvalin + Cafe',             imagen: '' },
      { id: 54, saboresIds: [4, 13], nombres: 'Duvalin + Fresas',           imagen: '' },
      { id: 55, saboresIds: [4, 14], nombres: 'Duvalin + Cajeta',           imagen: '' },
      { id: 56, saboresIds: [4, 15], nombres: 'Duvalin + Mermelada de fresa',imagen: '' },
      { id: 57, saboresIds: [5, 6],  nombres: 'Lunetas de yogurt + CarlosV',imagen: '' },
      { id: 58, saboresIds: [5, 7],  nombres: 'Lunetas de yogurt + Fresas con crema',imagen: '' },
      { id: 59, saboresIds: [5, 8],  nombres: 'Lunetas de yogurt + Nuez',   imagen: '' },
      { id: 60, saboresIds: [5, 9],  nombres: 'Lunetas de yogurt + Almendra',imagen: '' },
      { id: 61, saboresIds: [5, 10], nombres: 'Lunetas de yogurt + Coco',   imagen: '' },
      { id: 62, saboresIds: [5, 11], nombres: 'Lunetas de yogurt + Mango',  imagen: '' },
      { id: 63, saboresIds: [5, 12], nombres: 'Lunetas de yogurt + Cafe',   imagen: '' },
      { id: 64, saboresIds: [5, 13], nombres: 'Lunetas de yogurt + Fresas', imagen: '' },
      { id: 65, saboresIds: [5, 14], nombres: 'Lunetas de yogurt + Cajeta', imagen: '' },
      { id: 66, saboresIds: [5, 15], nombres: 'Lunetas de yogurt + Mermelada de fresa',imagen: '' },
      { id: 67, saboresIds: [6, 7],  nombres: 'CarlosV + Fresas con crema', imagen: '' },
      { id: 68, saboresIds: [6, 8],  nombres: 'CarlosV + Nuez',             imagen: '' },
      { id: 69, saboresIds: [6, 9],  nombres: 'CarlosV + Almendra',         imagen: '' },
      { id: 70, saboresIds: [6, 10], nombres: 'CarlosV + Coco',             imagen: '' },
      { id: 71, saboresIds: [6, 11], nombres: 'CarlosV + Mango',            imagen: '' },
      { id: 72, saboresIds: [6, 12], nombres: 'CarlosV + Cafe',             imagen: '' },
      { id: 73, saboresIds: [6, 13], nombres: 'CarlosV + Fresas',           imagen: '' },
      { id: 74, saboresIds: [6, 14], nombres: 'CarlosV + Cajeta',           imagen: '' },
      { id: 75, saboresIds: [6, 15], nombres: 'CarlosV + Mermelada de fresa',imagen: '' },
      { id: 76, saboresIds: [7, 8],  nombres: 'Fresas con crema + Nuez',    imagen: '' },
      { id: 77, saboresIds: [7, 9],  nombres: 'Fresas con crema + Almendra',imagen: '' },
      { id: 78, saboresIds: [7, 10], nombres: 'Fresas con crema + Coco',    imagen: '' },
      { id: 79, saboresIds: [7, 11], nombres: 'Fresas con crema + Mango',   imagen: '' },
      { id: 80, saboresIds: [7, 12], nombres: 'Fresas con crema + Cafe',    imagen: '' },
      { id: 81, saboresIds: [7, 13], nombres: 'Fresas con crema + Fresas',  imagen: '' },
      { id: 82, saboresIds: [7, 14], nombres: 'Fresas con crema + Cajeta',  imagen: '' },
      { id: 83, saboresIds: [7, 15], nombres: 'Fresas con crema + Mermelada de fresa',imagen: '' },
      { id: 84, saboresIds: [8, 9],  nombres: 'Nuez + Almendra',            imagen: '' },
      { id: 85, saboresIds: [8, 10], nombres: 'Nuez + Coco',                imagen: '' },
      { id: 86, saboresIds: [8, 11], nombres: 'Nuez + Mango',               imagen: '' },
      { id: 87, saboresIds: [8, 12], nombres: 'Nuez + Cafe',                imagen: '' },
      { id: 88, saboresIds: [8, 13], nombres: 'Nuez + Fresas',              imagen: '' },
      { id: 89, saboresIds: [8, 14], nombres: 'Nuez + Cajeta',              imagen: '' },
      { id: 90, saboresIds: [8, 15], nombres: 'Nuez + Mermelada de fresa',  imagen: '' },
      { id: 91, saboresIds: [9, 10], nombres: 'Almendra + Coco',            imagen: '' },
      { id: 92, saboresIds: [9, 11], nombres: 'Almendra + Mango',           imagen: '' },
      { id: 93, saboresIds: [9, 12], nombres: 'Almendra + Cafe',            imagen: '' },
      { id: 94, saboresIds: [9, 13], nombres: 'Almendra + Fresas',          imagen: '' },
      { id: 95, saboresIds: [9, 14], nombres: 'Almendra + Cajeta',          imagen: '' },
      { id: 96, saboresIds: [9, 15], nombres: 'Almendra + Mermelada de fresa',imagen: '' },
      { id: 97, saboresIds: [10, 11],nombres: 'Coco + Mango',               imagen: '' },
      { id: 98, saboresIds: [10, 12],nombres: 'Coco + Cafe',                imagen: '' },
      { id: 99, saboresIds: [10, 13],nombres: 'Coco + Fresas',              imagen: '' },
      { id: 100,saboresIds: [10, 14],nombres: 'Coco + Cajeta',              imagen: '' },
      { id: 101,saboresIds: [10, 15],nombres: 'Coco + Mermelada de fresa',  imagen: '' },
      { id: 102,saboresIds: [11, 12],nombres: 'Mango + Cafe',               imagen: '' },
      { id: 103,saboresIds: [11, 13],nombres: 'Mango + Fresas',             imagen: '' },
      { id: 104,saboresIds: [11, 14],nombres: 'Mango + Cajeta',             imagen: '' },
      { id: 105,saboresIds: [11, 15],nombres: 'Mango + Mermelada de fresa', imagen: '' },
      { id: 106,saboresIds: [12, 13],nombres: 'Cafe + Fresas',              imagen: '' },
      { id: 107,saboresIds: [12, 14],nombres: 'Cafe + Cajeta',              imagen: '' },
      { id: 108,saboresIds: [12, 15],nombres: 'Cafe + Mermelada de fresa',  imagen: '' },
      { id: 109,saboresIds: [13, 15],nombres: 'Fresas + Mermelada de fresa',imagen: '' },
      { id: 110,saboresIds: [14, 15],nombres: 'Cajeta + Mermelada de fresa',imagen: '' },
    ];
    return JSON.parse(localStorage.getItem('combinaciones') || JSON.stringify(hardcoded));
  },
  saveCombinaciones(c) { localStorage.setItem('combinaciones', JSON.stringify(c)); },

  nextId(arr) {
    return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
  }

};
