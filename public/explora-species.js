/* Bitácora silvestre — catálogo inicial verificado de especies poco conocidas.
   Fotos: Wikimedia Commons, licencias libres (autor y licencia en cada ficha), redimensionadas para la web.
   Paletas: cinco colores extraídos de cada fotografía. Datos con afirmaciones concretas: fuente revisada enlazada (DOI).
   Textos originales. Generado a partir de un archivo de contenido; edítalo con cuidado. */
(() => {
  'use strict';
  const GROUPS = { marinos: 'Marinos', insectos: 'Insectos', reptiles: 'Reptiles', aves: 'Aves', anfibios: 'Anfibios', aracnidos: 'Arácnidos', mamiferos: 'Mamíferos', microscopicos: 'Microscópicos' };
  const INSP = { patron: 'Patrón', textura: 'Textura', estructura: 'Estructura', movimiento: 'Movimiento', color: 'Color', camuflaje: 'Camuflaje' };
  const AREAS = { mobiliario: 'Mobiliario', iluminacion: 'Iluminación', textiles: 'Textiles', objetos: 'Objetos' };
  const SPECIES = [
 {
  "id": "seadragon",
  "name": "Dragón de mar foliáceo",
  "sci": "Phycodurus eques",
  "group": "marinos",
  "where": "Costas del sur de Australia",
  "insp": [
   "camuflaje",
   "estructura",
   "movimiento"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 50,
   "y": 50
  },
  "hook": "Parece un trozo de alga a la deriva: sus apéndices con forma de hoja ondulan con la corriente.",
  "observe": {
   "kind": "Estructura",
   "text": "Los apéndices foliáceos salen de un cuerpo rígido y segmentado; casi no se mueven por sí solos, se dejan llevar por el agua."
  },
  "questions": [
   "¿Qué partes del cuerpo son rígidas y cuáles flexibles?",
   "¿Cómo se repiten los apéndices a lo largo del cuerpo?",
   "¿Qué te dice la silueta sobre el lugar donde vive?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una lámpara colgante con un eje rígido y \"hojas\" de papel o tela que se muevan con el aire de la habitación."
  },
  "img": {
   "src": "/bio/sp/seadragon.jpg",
   "w": 1200,
   "h": 618
  },
  "colors": [
   "#24312d",
   "#576d4d",
   "#709755",
   "#96c157",
   "#86ddf5"
  ],
  "credit": {
   "author": "Derek Ramsey (Ram-Man)",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Leafy_Seadragon_Phycodurus_eques_2500px.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Phycodurus_eques"
 },
 {
  "id": "glaucus",
  "name": "Dragón azul",
  "sci": "Glaucus atlanticus",
  "group": "marinos",
  "where": "Superficie de océanos templados y tropicales",
  "insp": [
   "color",
   "estructura"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 45,
   "y": 50
  },
  "hook": "Un nudibranquio de tres centímetros que flota boca arriba en la superficie del mar.",
  "observe": {
   "kind": "Patrón",
   "text": "Seis grupos de apéndices se abren en abanico desde un cuerpo alargado, con bandas de azul intenso, plata y azul oscuro."
  },
  "questions": [
   "¿Cuántas veces se repite el mismo gesto de \"abanico\"?",
   "¿Dónde está el color más intenso y dónde se apaga?",
   "¿Qué simetría tiene el cuerpo?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña un perchero de pared con brazos que se abren en abanico desde un eje central, en tres tonos de azul."
  },
  "img": {
   "src": "/bio/sp/glaucus.jpg",
   "w": 1200,
   "h": 1165
  },
  "colors": [
   "#17192c",
   "#3d569e",
   "#5d6e95",
   "#949dab",
   "#ffffff"
  ],
  "credit": {
   "author": "Taro Taylor from Sydney, Australia",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Glaucus_atlanticus_1_cropped.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Glaucus_atlanticus"
 },
 {
  "id": "frogfish",
  "name": "Pez sapo peludo",
  "sci": "Antennarius striatus",
  "group": "marinos",
  "where": "Fondos marinos de aguas cálidas",
  "insp": [
   "textura",
   "camuflaje"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 50,
   "y": 50
  },
  "hook": "Su piel está cubierta de filamentos que lo hacen pasar por una esponja o un alga.",
  "observe": {
   "kind": "Textura",
   "text": "Cientos de filamentos finos cubren el cuerpo y desdibujan su contorno: no hay una línea clara entre el pez y el fondo."
  },
  "questions": [
   "¿Dónde termina el animal y dónde empieza el fondo?",
   "¿Qué longitud y densidad tienen los filamentos?",
   "¿Qué sensación táctil imaginas?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña un cojín o tapete con flecos de distintas longitudes que desdibujen su forma, en una paleta de ocres."
  },
  "img": {
   "src": "/bio/sp/frogfish.jpg",
   "w": 1200,
   "h": 900
  },
  "colors": [
   "#191c24",
   "#4c3520",
   "#70542e",
   "#af8a3f",
   "#8b9191"
  ],
  "credit": {
   "author": "Rickard Zerpe",
   "license": "CC BY-SA 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Hairy_frogfish_(Antennarius_striatus)_(16059517767).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Antennarius_striatus"
 },
 {
  "id": "bluering",
  "name": "Pulpo de anillos azules",
  "sci": "Hapalochlaena maculosa",
  "group": "marinos",
  "where": "Pozas y arrecifes del sur de Australia",
  "insp": [
   "patron",
   "color"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 45,
   "y": 42
  },
  "hook": "Pequeño y discreto hasta que muestra sus anillos azules: una de las señales de advertencia más claras del mar.",
  "observe": {
   "kind": "Patrón",
   "text": "Anillos azules con borde oscuro sobre un fondo moteado de ocre: el contraste de matiz y de valor hace que el azul destaque."
  },
  "questions": [
   "¿Qué hace que el azul destaque tanto sobre el ocre?",
   "¿Los anillos son todos iguales o cambian de tamaño?",
   "¿Dónde se concentran?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña un sistema de señalización para un taller usando un solo color de advertencia sobre una base neutra y cálida."
  },
  "img": {
   "src": "/bio/sp/bluering.jpg",
   "w": 1200,
   "h": 798
  },
  "colors": [
   "#28221e",
   "#584c36",
   "#294e9c",
   "#918876",
   "#cac4b2"
  ],
  "credit": {
   "author": "Julian Finn",
   "license": "CC BY 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Hapalochlaena_maculosa_side.jpg"
  },
  "more": "https://en.wikipedia.org/wiki/Southern_blue-ringed_octopus"
 },
 {
  "id": "mantisshrimp",
  "name": "Camarón mantis pavo real",
  "sci": "Odontodactylus scyllarus",
  "group": "marinos",
  "where": "Arrecifes del Indo-Pacífico",
  "insp": [
   "estructura",
   "color"
  ],
  "focus": "55% 45%",
  "zoom": {
   "x": 62,
   "y": 28
  },
  "hook": "Golpea con unas mazas tan rápidas que rompe conchas; y sus ojos ven el color de una forma propia.",
  "observe": {
   "kind": "Estructura",
   "text": "Las mazas delanteras se pliegan como una navaja; los ojos, sobre tallos, se mueven por separado."
  },
  "fact": {
   "text": "Sus mazas resisten miles de impactos gracias a una estructura en capas con fibras dispuestas en espiral (tipo \"Bouligand\"), que frena la propagación de grietas.",
   "source": {
    "label": "Weaver, J. C. et al. (2012). The stomatopod dactyl club: a formidable damage-tolerant biological hammer. Science, 336.",
    "url": "https://doi.org/10.1126/science.1218764"
   }
  },
  "questions": [
   "¿Cómo se pliega la maza cuando no golpea?",
   "¿Cuántos colores distintos puedes contar en el cuerpo?",
   "¿Qué partes parecen armadura?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña el canto de una mesa de taller con capas de chapa giradas en ángulo, pensado para resistir golpes."
  },
  "img": {
   "src": "/bio/sp/mantisshrimp.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#100a0d",
   "#503422",
   "#374a52",
   "#916d4d",
   "#6a8f99"
  ],
  "credit": {
   "author": "Cédric Péneau",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Odontodactylus_scyllarus_R%C3%A9union.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Odontodactylus_scyllarus"
 },
 {
  "id": "pygmyseahorse",
  "name": "Caballito de mar pigmeo",
  "sci": "Hippocampus bargibanti",
  "group": "marinos",
  "where": "Abanicos de mar del Pacífico occidental",
  "insp": [
   "camuflaje",
   "textura"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 45,
   "y": 48
  },
  "hook": "Mide unos dos centímetros y vive sobre un abanico de mar cuyos nódulos imita.",
  "observe": {
   "kind": "Textura",
   "text": "Tubérculos redondos sobre la piel repiten los pólipos del coral donde vive: forma y color copian el entorno."
  },
  "questions": [
   "¿Qué se repite entre el animal y el coral?",
   "¿Qué tamaño tienen los tubérculos respecto al cuerpo?",
   "¿Cómo se agarra con la cola?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña un tapiz con relieves redondos (bordado, nudos o fieltro) que se confunda con un muro de textura similar."
  },
  "img": {
   "src": "/bio/sp/pygmyseahorse.jpg",
   "w": 800,
   "h": 1200
  },
  "colors": [
   "#181212",
   "#573a22",
   "#67555d",
   "#ae8d6c",
   "#a48f99"
  ],
  "credit": {
   "author": "Diego Delso",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Caballito_de_mar_pigmeo_(Hippocampus_bargibanti),_Anilao,_Filipinas,_2023-08-25,_DD_27.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Hippocampus_bargibanti"
 },
 {
  "id": "cowfish",
  "name": "Pez cofre cornudo",
  "sci": "Lactoria cornuta",
  "group": "marinos",
  "where": "Arrecifes del Indo-Pacífico",
  "insp": [
   "estructura",
   "patron"
  ],
  "focus": "62% 50%",
  "zoom": {
   "x": 72,
   "y": 42
  },
  "hook": "Su cuerpo es una caja rígida de placas con dos \"cuernos\" sobre los ojos.",
  "observe": {
   "kind": "Estructura",
   "text": "Un caparazón de placas óseas soldadas forma una caja; solo la cola y las aletas se mueven."
  },
  "questions": [
   "¿Qué forma geométrica describe mejor el cuerpo?",
   "¿Qué partes quedan fuera de la caja para moverse?",
   "¿Cómo se distribuyen los puntos claros?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña una caja de herramientas de placas rígidas con solo dos piezas móviles, y puntos claros como señalética."
  },
  "img": {
   "src": "/bio/sp/cowfish.jpg",
   "w": 1200,
   "h": 901
  },
  "colors": [
   "#060f0a",
   "#2e352d",
   "#706952",
   "#b7a95a",
   "#aeab92"
  ],
  "credit": {
   "author": "Nick Hobgood",
   "license": "CC BY-SA 3.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
   "page": "https://commons.wikimedia.org/wiki/File:Lactoria_cornuta_(Longhorn_cowfish)_Timor.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Lactoria_cornuta"
 },
 {
  "id": "venusbasket",
  "name": "Cesta de flores de Venus",
  "sci": "Euplectella aspergillum",
  "group": "marinos",
  "where": "Fondos profundos del Pacífico",
  "insp": [
   "estructura",
   "patron"
  ],
  "focus": "52% 50%",
  "zoom": {
   "x": 52,
   "y": 48
  },
  "hook": "Una esponja de vidrio cuyo esqueleto parece una cesta tejida.",
  "observe": {
   "kind": "Estructura",
   "text": "Una retícula cuadrada con diagonales de refuerzo forma un tubo curvo y ligero, de base estrecha."
  },
  "fact": {
   "text": "Su esqueleto de sílice está organizado en varios niveles, desde la nanoescala hasta la retícula visible, lo que le da rigidez con muy poco material.",
   "source": {
    "label": "Aizenberg, J. et al. (2005). Skeleton of Euplectella sp.: structural hierarchy from the nanoscale to the macroscale. Science, 309.",
    "url": "https://doi.org/10.1126/science.1112255"
   }
  },
  "questions": [
   "¿Qué patrón forman las barras y dónde están las diagonales?",
   "¿Cómo cambia la retícula de la base a la boca?",
   "¿Qué proporción es hueco y qué es material?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una pantalla de lámpara tubular con retícula de varilla y diagonales de refuerzo solo donde haga falta."
  },
  "img": {
   "src": "/bio/sp/venusbasket.jpg",
   "w": 1200,
   "h": 900
  },
  "colors": [
   "#0e1010",
   "#2b3330",
   "#4f544c",
   "#827c74",
   "#a6b5c2"
  ],
  "credit": {
   "author": "NOAA/Monterey Bay Aquarium Research Institute",
   "license": "Dominio público",
   "licenseUrl": "",
   "page": "https://commons.wikimedia.org/wiki/File:Euplectella_aspergillum.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Euplectella_aspergillum"
 },
 {
  "id": "cuttlefish",
  "name": "Sepia gigante australiana",
  "sci": "Sepia apama",
  "group": "marinos",
  "where": "Costas del sur de Australia",
  "insp": [
   "color",
   "patron",
   "camuflaje"
  ],
  "focus": "60% 55%",
  "zoom": {
   "x": 68,
   "y": 58
  },
  "hook": "Cambia el color, el patrón y hasta la textura de su piel en menos de un segundo.",
  "observe": {
   "kind": "Movimiento",
   "text": "Las manchas y bandas de la piel cambian de intensidad y se desplazan como ondas sobre el cuerpo."
  },
  "fact": {
   "text": "Los cefalópodos combinan cromatóforos controlados por el sistema nervioso con estructuras que reflejan la luz para cambiar su apariencia muy rápido.",
   "source": {
    "label": "Hanlon, R. (2007). Cephalopod dynamic camouflage. Current Biology, 17.",
    "url": "https://doi.org/10.1016/j.cub.2007.03.034"
   }
  },
  "questions": [
   "¿Qué zonas cambian más de color?",
   "¿El patrón es manchado, en bandas o uniforme?",
   "¿Qué haría que una superficie cambie de apariencia sin cambiar de forma?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña una cortina de dos capas (malla y tela) cuyo patrón cambie según la luz y el ángulo desde donde se mire."
  },
  "img": {
   "src": "/bio/sp/cuttlefish.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#101215",
   "#52332f",
   "#666358",
   "#a8543e",
   "#8d9572"
  ],
  "credit": {
   "author": "Sylke Rohrlach from Sydney",
   "license": "CC BY-SA 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Giant_Cuttlefish-sepia_apama_(11258129224).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Ascarosepion_apama"
 },
 {
  "id": "flamingotongue",
  "name": "Caracol lengua de flamenco",
  "sci": "Cyphoma gibbosum",
  "group": "marinos",
  "where": "Arrecifes del Caribe",
  "insp": [
   "patron",
   "color"
  ],
  "focus": "55% 50%",
  "zoom": {
   "x": 55,
   "y": 45
  },
  "hook": "El patrón de manchas no está en la concha: es el manto vivo que la cubre.",
  "observe": {
   "kind": "Patrón",
   "text": "Manchas redondeadas con contorno oscuro sobre fondo crema, de tamaños parecidos pero nunca idénticos."
  },
  "questions": [
   "¿Qué tan regular es la separación entre manchas?",
   "¿Qué color tiene el contorno y cuál el centro?",
   "¿Cómo se deforma el patrón sobre la curva?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña una serie de piezas de cerámica donde un mismo patrón de manchas se adapte a curvas distintas."
  },
  "img": {
   "src": "/bio/sp/flamingotongue.jpg",
   "w": 1200,
   "h": 900
  },
  "colors": [
   "#0b0a09",
   "#6d4c2f",
   "#656667",
   "#cb9d69",
   "#f6dda0"
  ],
  "credit": {
   "author": "LASZLO ILYES (laszlo-photo) from Cleveland, Ohio, USA",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Cyphoma_gibbosum_(living)_2.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Cyphoma_gibbosum"
 },
 {
  "id": "leafinsect",
  "name": "Insecto hoja gigante",
  "sci": "Pulchriphyllium giganteum",
  "group": "insectos",
  "where": "Selvas del sudeste asiático",
  "insp": [
   "camuflaje",
   "estructura"
  ],
  "focus": "45% 45%",
  "zoom": {
   "x": 45,
   "y": 42
  },
  "hook": "Su cuerpo aplanado imita una hoja, con nervaduras e incluso bordes que parecen mordidos.",
  "observe": {
   "kind": "Estructura",
   "text": "Un cuerpo plano y ancho con una \"nervadura\" central y patas con expansiones foliáceas."
  },
  "questions": [
   "¿Qué rasgos de hoja copia el insecto?",
   "¿Dónde se esconden las uniones de las patas?",
   "¿Cómo se ve de perfil, no de frente?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña un biombo de paneles planos con una \"nervadura\" estructural que esconda las bisagras."
  },
  "img": {
   "src": "/bio/sp/leafinsect.jpg",
   "w": 1200,
   "h": 788
  },
  "colors": [
   "#1c1d21",
   "#483a27",
   "#506a14",
   "#5f6e4d",
   "#8f9d5e"
  ],
  "credit": {
   "author": "Bernard DUPONT from FRANCE",
   "license": "CC BY-SA 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Giant_Leaf_Insect_(Phyllium_giganteum)_(8758260988).jpg"
  },
  "more": "https://en.wikipedia.org/wiki/Pulchriphyllium_giganteum"
 },
 {
  "id": "orchidmantis",
  "name": "Mantis orquídea",
  "sci": "Hymenopus coronatus",
  "group": "insectos",
  "where": "Selvas del sudeste asiático",
  "insp": [
   "camuflaje",
   "color",
   "estructura"
  ],
  "focus": "40% 50%",
  "zoom": {
   "x": 38,
   "y": 48
  },
  "hook": "Sus patas parecen pétalos y su color se asemeja al de una flor.",
  "observe": {
   "kind": "Estructura",
   "text": "Las patas tienen lóbulos anchos y redondeados, como pétalos, en blanco y rosa pálido."
  },
  "fact": {
   "text": "Un estudio de campo encontró que la mantis orquídea atrae a insectos polinizadores con más éxito que las flores de su entorno: no se esconde entre flores, se comporta como una.",
   "source": {
    "label": "O'Hanlon, J. C., Holwell, G. I. y Herberstein, M. E. (2014). Pollinator deception in the orchid mantis. The American Naturalist, 183.",
    "url": "https://doi.org/10.1086/673858"
   }
  },
  "questions": [
   "¿Qué partes recuerdan a un pétalo?",
   "¿Cómo pasa el color de blanco a rosa?",
   "¿Qué atrae la mirada primero?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una lámpara de mesa con pantallas en forma de lóbulo, en blanco cálido y un toque de rosa en el interior."
  },
  "img": {
   "src": "/bio/sp/orchidmantis.jpg",
   "w": 1200,
   "h": 1199
  },
  "colors": [
   "#5d6907",
   "#ad709f",
   "#a19e5f",
   "#aeb008",
   "#cac7b8"
  ],
  "credit": {
   "author": "Luc Viatour",
   "license": "CC BY-SA 3.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
   "page": "https://commons.wikimedia.org/wiki/File:Mantis_Hymenopus_coronatus_6_Luc_Viatour.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Hymenopus_coronatus"
 },
 {
  "id": "treehopper",
  "name": "Membrácido de globos",
  "sci": "Bocydium globulare",
  "group": "insectos",
  "where": "Bosques de Sudamérica",
  "insp": [
   "estructura"
  ],
  "focus": "50% 40%",
  "zoom": {
   "x": 50,
   "y": 18
  },
  "hook": "Sobre su espalda lleva una estructura con esferas peludas, como un pequeño móvil.",
  "observe": {
   "kind": "Estructura",
   "text": "Un tallo delgado sostiene varias esferas en equilibrio, muy por encima del cuerpo."
  },
  "questions": [
   "¿Cómo se reparte el peso de las esferas?",
   "¿Qué parte es soporte y qué parte es adorno?",
   "¿Qué escala tendría si midiera un metro?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña un móvil de luz con un tallo delgado y cuatro esferas difusoras en equilibrio."
  },
  "img": {
   "src": "/bio/sp/treehopper.jpg",
   "w": 1200,
   "h": 797
  },
  "colors": [
   "#5c5652",
   "#737271",
   "#998975",
   "#c39d6b",
   "#a9aaaa"
  ],
  "credit": {
   "author": "Pavel Kirillov from St.Petersburg, Russia",
   "license": "CC BY-SA 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Globe-bearing_Treehopper_Bocydium_globulare_(14801858422).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Bocydium_globulare"
 },
 {
  "id": "jewelscarab",
  "name": "Escarabajo glorioso",
  "sci": "Chrysina gloriosa",
  "group": "insectos",
  "where": "Sur de Estados Unidos y norte de México",
  "insp": [
   "color",
   "patron"
  ],
  "focus": "55% 50%",
  "zoom": {
   "x": 55,
   "y": 45
  },
  "hook": "Verde metálico con franjas plateadas, como si estuviera esmaltado.",
  "observe": {
   "kind": "Patrón",
   "text": "Franjas longitudinales plateadas alternan con verde brillante; el brillo cambia al girar."
  },
  "fact": {
   "text": "Su caparazón refleja luz con polarización circular gracias a una estructura helicoidal de quitina organizada en celdas.",
   "source": {
    "label": "Sharma, V. et al. (2009). Structural origin of circularly polarized iridescence in jeweled beetles. Science, 325.",
    "url": "https://doi.org/10.1126/science.1172051"
   }
  },
  "questions": [
   "¿Cuántas franjas plateadas hay y qué anchura tienen?",
   "¿Dónde está el brillo máximo?",
   "¿Qué material humano se parece a este acabado?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña el frente de una cajonera con franjas de dos acabados (mate y brillante) del mismo verde."
  },
  "img": {
   "src": "/bio/sp/jewelscarab.jpg",
   "w": 1200,
   "h": 1058
  },
  "colors": [
   "#1f2319",
   "#415235",
   "#6e915c",
   "#8d918e",
   "#d4dadb"
  ],
  "credit": {
   "author": "Charles Miles from Tucson, AZ, USA",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Jewel_Scarab_-_Chrysina_gloriosa_(7898749892).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Chrysina_gloriosa"
 },
 {
  "id": "atlasmoth",
  "name": "Polilla atlas",
  "sci": "Attacus atlas",
  "group": "insectos",
  "where": "Bosques del sur y sudeste de Asia",
  "insp": [
   "patron",
   "color"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 22,
   "y": 28
  },
  "hook": "Una de las polillas más grandes del mundo, con puntas de ala que recuerdan una cabeza de serpiente.",
  "observe": {
   "kind": "Patrón",
   "text": "Ventanas triangulares translúcidas, líneas blancas y negras que siguen el contorno y degradados de óxido a canela."
  },
  "questions": [
   "¿Dónde está la simetría y dónde se rompe?",
   "¿Qué hacen las \"ventanas\" translúcidas con la luz?",
   "¿Cómo acompañan las líneas al contorno?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña una cortina simétrica con zonas translúcidas triangulares y un borde de líneas que siga su contorno."
  },
  "img": {
   "src": "/bio/sp/atlasmoth.jpg",
   "w": 1200,
   "h": 776
  },
  "colors": [
   "#633722",
   "#a95425",
   "#9f6e55",
   "#b2a199",
   "#e5e3e5"
  ],
  "credit": {
   "author": "Quartl",
   "license": "CC BY-SA 3.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
   "page": "https://commons.wikimedia.org/wiki/File:Attacus_atlas_qtl1.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Attacus_atlas"
 },
 {
  "id": "flowermantis",
  "name": "Mantis flor espinosa",
  "sci": "Pseudocreobotra wahlbergii",
  "group": "insectos",
  "where": "Sur y este de África",
  "insp": [
   "patron",
   "camuflaje"
  ],
  "focus": "55% 50%",
  "zoom": {
   "x": 60,
   "y": 58
  },
  "hook": "En sus alas lleva un dibujo en espiral que parece un ojo.",
  "observe": {
   "kind": "Patrón",
   "text": "Una espiral verde y crema en las alas, rodeada de manchas claras sobre fondo blanco."
  },
  "questions": [
   "¿Dónde empieza y dónde termina la espiral?",
   "¿Cómo cambia el grosor de la línea?",
   "¿Qué efecto produce visto desde lejos?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña un plato o charola con una espiral que se lea como \"ojo\" desde lejos y como textura de cerca."
  },
  "img": {
   "src": "/bio/sp/flowermantis.jpg",
   "w": 1200,
   "h": 797
  },
  "colors": [
   "#5b5526",
   "#996d34",
   "#c7993b",
   "#cfb690",
   "#d0cfcd"
  ],
  "credit": {
   "author": "Yasunori Koide",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Pseudocreobotra_wahlbergii_DSC_6864.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Pseudocreobotra_wahlbergii"
 },
 {
  "id": "ghostmantis",
  "name": "Mantis fantasma",
  "sci": "Phyllocrania paradoxa",
  "group": "insectos",
  "where": "África y Madagascar",
  "insp": [
   "camuflaje",
   "estructura"
  ],
  "focus": "55% 45%",
  "zoom": {
   "x": 56,
   "y": 42
  },
  "hook": "Parece una hoja seca y retorcida que cobró vida.",
  "observe": {
   "kind": "Estructura",
   "text": "Expansiones irregulares y retorcidas en la cabeza y el abdomen rompen la silueta del insecto."
  },
  "questions": [
   "¿Qué partes rompen la silueta?",
   "¿Qué color dominaría su paleta?",
   "¿Cómo cambia si la miras de perfil?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña un portalápices de lámina doblada cuya silueta irregular parezca una hoja seca."
  },
  "img": {
   "src": "/bio/sp/ghostmantis.jpg",
   "w": 1200,
   "h": 900
  },
  "colors": [
   "#1e1b1b",
   "#824a3d",
   "#63615d",
   "#c89888",
   "#cdcdc9"
  ],
  "credit": {
   "author": "Fungus Guy",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Ghost_mantis_(Phyllocrania_paradoxa),_Entomica.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Phyllocrania_paradoxa"
 },
 {
  "id": "armadillolizard",
  "name": "Lagarto armadillo",
  "sci": "Ouroborus cataphractus",
  "group": "reptiles",
  "where": "Desiertos del oeste de Sudáfrica",
  "insp": [
   "textura",
   "estructura"
  ],
  "focus": "62% 55%",
  "zoom": {
   "x": 64,
   "y": 58
  },
  "hook": "Cuando se asusta, se muerde la cola y se convierte en un anillo de escamas.",
  "observe": {
   "kind": "Textura",
   "text": "Escamas gruesas y aquilladas forman anillos en el cuerpo y la cola, como una armadura flexible."
  },
  "questions": [
   "¿Cómo se superponen las escamas?",
   "¿Qué zonas quedan protegidas al enrollarse?",
   "¿Qué textura sentirías al tocarlo?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña un puf de anillos rígidos unidos por tela que pueda enrollarse para guardarlo."
  },
  "img": {
   "src": "/bio/sp/armadillolizard.jpg",
   "w": 1200,
   "h": 900
  },
  "colors": [
   "#170c02",
   "#542c06",
   "#774e15",
   "#b58637",
   "#f3d485"
  ],
  "credit": {
   "author": "frank wouters",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Armadillo_girdle-tailed_lizard.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Ouroborus_cataphractus"
 },
 {
  "id": "leaftailgecko",
  "name": "Geco cola de hoja satánico",
  "sci": "Uroplatus phantasticus",
  "group": "reptiles",
  "where": "Bosques húmedos de Madagascar",
  "insp": [
   "camuflaje",
   "textura"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 52,
   "y": 50
  },
  "hook": "Su cola es una hoja seca, con muescas incluidas.",
  "observe": {
   "kind": "Textura",
   "text": "La piel imita la superficie arrugada de una hoja muerta; la cola tiene bordes irregulares, como mordidos."
  },
  "questions": [
   "¿Qué detalle copia mejor a una hoja?",
   "¿Dónde hay brillo y dónde todo es mate?",
   "¿Cómo se integra el ojo en el camuflaje?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña un tapizado con relieve arrugado y bordes irregulares en tonos de hojarasca."
  },
  "img": {
   "src": "/bio/sp/leaftailgecko.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#12100b",
   "#553422",
   "#5c5a29",
   "#986e50",
   "#6d8934"
  ],
  "credit": {
   "author": "Charles J. Sharp",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Satanic_leaf-tailed_gecko_(Uroplatus_phantasticus)_Ranomafana_4.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Uroplatus_phantasticus"
 },
 {
  "id": "thornydevil",
  "name": "Diablo espinoso",
  "sci": "Moloch horridus",
  "group": "reptiles",
  "where": "Desiertos de Australia",
  "insp": [
   "textura",
   "estructura"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 52,
   "y": 48
  },
  "hook": "Cubierto de espinas cónicas, bebe el agua que toca su piel.",
  "observe": {
   "kind": "Textura",
   "text": "Espinas cónicas de tamaños distintos y, entre ellas, una piel con surcos finos."
  },
  "fact": {
   "text": "Su piel tiene canales entre las escamas que conducen el agua por capilaridad hasta la boca, incluso desde arena húmeda.",
   "source": {
    "label": "Comanns, P. et al. (2016). Cutaneous water collection by a moisture-harvesting lizard, the thorny devil (Moloch horridus). Journal of Experimental Biology, 219.",
    "url": "https://doi.org/10.1242/jeb.148791"
   }
  },
  "questions": [
   "¿Cómo se ordenan las espinas grandes y pequeñas?",
   "¿Por dónde correría una gota?",
   "¿Qué colores usa para mezclarse con la arena?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña una maceta de exterior con surcos que conduzcan el rocío hacia la tierra."
  },
  "img": {
   "src": "/bio/sp/thornydevil.jpg",
   "w": 1200,
   "h": 864
  },
  "colors": [
   "#26110e",
   "#5b2f21",
   "#914e36",
   "#ce7855",
   "#ada39b"
  ],
  "credit": {
   "author": "Stu's Images",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Moloch_horridus,_Thorny_Devil,_Alice_Springs.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Moloch_horridus"
 },
 {
  "id": "frilledlizard",
  "name": "Lagarto de collar",
  "sci": "Chlamydosaurus kingii",
  "group": "reptiles",
  "where": "Norte de Australia y Nueva Guinea",
  "insp": [
   "movimiento",
   "estructura"
  ],
  "focus": "45% 40%",
  "zoom": {
   "x": 45,
   "y": 32
  },
  "hook": "Despliega un collar de piel alrededor del cuello que lo hace parecer mucho más grande.",
  "observe": {
   "kind": "Movimiento",
   "text": "El collar se abre como un paraguas, sostenido por varillas de cartílago, y se pliega pegado al cuerpo."
  },
  "questions": [
   "¿Dónde están las \"varillas\" del collar?",
   "¿Qué superficie gana al abrirse?",
   "¿Cómo queda plegado?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una lámpara de pared plegable cuyo difusor se abra como un collar sobre varillas."
  },
  "img": {
   "src": "/bio/sp/frilledlizard.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#15150e",
   "#5c5c57",
   "#a15b2f",
   "#b19270",
   "#ead0a0"
  ],
  "credit": {
   "author": "Matt from Melbourne, Australia",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Frill-necked_Lizard_(Chlamydosaurus_kingii)_(8692607976).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Chlamydosaurus_kingii"
 },
 {
  "id": "brookesia",
  "name": "Camaleón hoja de Decary",
  "sci": "Brookesia decaryi",
  "group": "reptiles",
  "where": "Bosques secos de Madagascar",
  "insp": [
   "camuflaje",
   "textura"
  ],
  "focus": "65% 45%",
  "zoom": {
   "x": 66,
   "y": 40
  },
  "hook": "Un camaleón diminuto con crestas que lo hacen pasar por una hoja seca.",
  "observe": {
   "kind": "Textura",
   "text": "Crestas y tubérculos a lo largo del lomo y la cabeza rompen el contorno del cuerpo."
  },
  "questions": [
   "¿Qué línea dibujan las crestas del lomo?",
   "¿Qué color tiene frente al verde de la hoja?",
   "¿Cómo se sostiene en la superficie?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña un perfil de estante con una cresta continua que funcione como tope y como adorno."
  },
  "img": {
   "src": "/bio/sp/brookesia.jpg",
   "w": 1200,
   "h": 801
  },
  "colors": [
   "#4b522f",
   "#6e941e",
   "#c0b0a7",
   "#aaca1e",
   "#c6d792"
  ],
  "credit": {
   "author": "Charles J. Sharp",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Decary%27s_leaf_chameleon_(Brookesia_decaryi)_Ranomafana.jpg"
  },
  "more": "https://en.wikipedia.org/wiki/Brookesia_decaryi"
 },
 {
  "id": "lyrebird",
  "name": "Ave lira soberbia",
  "sci": "Menura novaehollandiae",
  "group": "aves",
  "where": "Bosques del sureste de Australia",
  "insp": [
   "movimiento",
   "estructura"
  ],
  "focus": "55% 45%",
  "zoom": {
   "x": 55,
   "y": 40
  },
  "hook": "Imita casi cualquier sonido que oye, y el macho despliega una cola en forma de lira.",
  "observe": {
   "kind": "Movimiento",
   "text": "Durante el cortejo, el macho levanta y abre la cola en un abanico de plumas finas que tiemblan."
  },
  "fact": {
   "text": "Los machos crean durante el cortejo la ilusión acústica de una bandada de varias especies alarmadas, imitando sus cantos.",
   "source": {
    "label": "Dalziell, A. H. et al. (2021). Male lyrebirds create a complex acoustic illusion of a mobbing flock during courtship and copulation. Current Biology, 31.",
    "url": "https://doi.org/10.1016/j.cub.2021.02.003"
   }
  },
  "questions": [
   "¿Cómo se pasa de una pluma gruesa a otras muy finas?",
   "¿Qué forma tiene la cola abierta?",
   "¿Qué sonido imaginas para esta forma?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña un aplique cuyo difusor se abra como una lira de varillas finas."
  },
  "img": {
   "src": "/bio/sp/lyrebird.jpg",
   "w": 1200,
   "h": 712
  },
  "colors": [
   "#606150",
   "#61973c",
   "#a4a6a3",
   "#b3b05b",
   "#e7e0e0"
  ],
  "credit": {
   "author": "Dominic Sherony",
   "license": "CC BY-SA 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Superb_Lyrebird_(Menura_novaehollandiae)_(30571971863).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Menura_novaehollandiae"
 },
 {
  "id": "bowerbird",
  "name": "Pájaro glorieta satinado",
  "sci": "Ptilonorhynchus violaceus",
  "group": "aves",
  "where": "Este de Australia",
  "insp": [
   "color",
   "estructura"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 50,
   "y": 55
  },
  "hook": "El macho construye una avenida de ramas y la decora con objetos azules.",
  "observe": {
   "kind": "Estructura",
   "text": "Dos muros paralelos de ramitas forman un pasillo; enfrente, una \"alfombra\" de objetos azules elegidos uno a uno."
  },
  "questions": [
   "¿Qué objetos eligió y por qué todos azules?",
   "¿Cómo se sostienen las ramas sin uniones?",
   "¿Qué diferencia hay entre la estructura y la decoración?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña un recibidor de dos muros de listones con una repisa para objetos de un solo color."
  },
  "img": {
   "src": "/bio/sp/bowerbird.jpg",
   "w": 1200,
   "h": 784
  },
  "colors": [
   "#0e0e0e",
   "#595c65",
   "#94959e",
   "#54a7de",
   "#dbd9db"
  ],
  "credit": {
   "author": "Brocken Inaglory",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Bower_of_Ptilonorhynchus_violaceus.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Ptilonorhynchus_violaceus"
 },
 {
  "id": "tailorbird",
  "name": "Pájaro sastre común",
  "sci": "Orthotomus sutorius",
  "group": "aves",
  "where": "Sur y sudeste de Asia",
  "insp": [
   "estructura",
   "textura"
  ],
  "focus": "40% 40%",
  "zoom": {
   "x": 40,
   "y": 32
  },
  "hook": "Cose hojas con fibras vegetales o seda de araña para formar su nido.",
  "observe": {
   "kind": "Estructura",
   "text": "El nido es una bolsa hecha con hojas vivas perforadas y unidas por puntadas."
  },
  "questions": [
   "¿Qué material une y qué material cubre?",
   "¿Cuántas puntadas harían falta?",
   "¿Cómo cambia el nido cuando la hoja crece?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña una bolsa o funda de fieltro unida solo con puntadas visibles de un hilo contrastante."
  },
  "img": {
   "src": "/bio/sp/tailorbird.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#19180a",
   "#615232",
   "#926c2d",
   "#a18e6d",
   "#86a3d0"
  ],
  "credit": {
   "author": "Charles J. Sharp",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Common_tailorbird_(Orthotomus_sutorius_guzuratus)_male_Kerala.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Orthotomus_sutorius"
 },
 {
  "id": "shoebill",
  "name": "Picozapato",
  "sci": "Balaeniceps rex",
  "group": "aves",
  "where": "Pantanos del este de África",
  "insp": [
   "estructura"
  ],
  "focus": "50% 45%",
  "zoom": {
   "x": 50,
   "y": 62
  },
  "hook": "Un ave enorme e inmóvil, con un pico en forma de zueco.",
  "observe": {
   "kind": "Estructura",
   "text": "El pico ancho tiene una arista central y termina en un gancho; la mirada es frontal."
  },
  "questions": [
   "¿Qué volumen ocupa el pico respecto a la cabeza?",
   "¿Dónde está la arista y qué hace con la luz?",
   "¿Qué sensación transmite su quietud?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña una regadera o jarra cuyo pico tenga una arista central que guíe el agua."
  },
  "img": {
   "src": "/bio/sp/shoebill.jpg",
   "w": 1200,
   "h": 797
  },
  "colors": [
   "#2b361a",
   "#325508",
   "#4f8c05",
   "#939b2b",
   "#9a979a"
  ],
  "credit": {
   "author": "Olaf Oliviero Riemer",
   "license": "CC BY-SA 3.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
   "page": "https://commons.wikimedia.org/wiki/File:Balaeniceps_rex_(Schuhschnabel_-_Shoebill)_-_Weltvogelpark_Walsrode_2010-10.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Balaeniceps_rex"
 },
 {
  "id": "hoatzin",
  "name": "Hoatzín",
  "sci": "Opisthocomus hoazin",
  "group": "aves",
  "where": "Ríos de la Amazonía y el Orinoco",
  "insp": [
   "color",
   "textura"
  ],
  "focus": "50% 30%",
  "zoom": {
   "x": 50,
   "y": 18
  },
  "hook": "Un ave que digiere hojas como una vaca y tiene una cresta despeinada.",
  "observe": {
   "kind": "Color",
   "text": "Cresta de plumas sueltas, piel azul alrededor del ojo rojo y un cuerpo en castaños y cremas."
  },
  "fact": {
   "text": "Es el único ave conocida con fermentación en el buche: digiere hojas con ayuda de bacterias, como los rumiantes.",
   "source": {
    "label": "Grajal, A. et al. (1989). Foregut fermentation in the hoatzin, a neotropical leaf-eating bird. Science, 245.",
    "url": "https://doi.org/10.1126/science.245.4923.1236"
   }
  },
  "questions": [
   "¿Cuántos colores distintos ves en la cabeza?",
   "¿Qué textura tiene la cresta frente al cuerpo?",
   "¿Qué color sería el acento?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña una manta en castaños y crema con un solo acento azul y rojo."
  },
  "img": {
   "src": "/bio/sp/hoatzin.jpg",
   "w": 800,
   "h": 1200
  },
  "colors": [
   "#302e2e",
   "#635b2c",
   "#9d6931",
   "#99922d",
   "#b0c8d8"
  ],
  "credit": {
   "author": "Charles J. Sharp",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Hoatzin_(Opisthocomus_hoazin)_Rio_Napo.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Opisthocomus_hoazin"
 },
 {
  "id": "weaver",
  "name": "Tejedor cabecinegro",
  "sci": "Ploceus cucullatus",
  "group": "aves",
  "where": "África subsahariana",
  "insp": [
   "estructura",
   "textura"
  ],
  "focus": "60% 40%",
  "zoom": {
   "x": 56,
   "y": 32
  },
  "hook": "El macho teje un nido colgante, nudo a nudo, con tiras de hierba.",
  "observe": {
   "kind": "Estructura",
   "text": "Un nido esférico colgado de una rama, tejido con tiras verdes y con la entrada hacia abajo."
  },
  "questions": [
   "¿Dónde se ancla el nido a la rama?",
   "¿El tejido es regular o caótico?",
   "¿Por qué la entrada mira hacia abajo?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una lámpara colgante tejida con fibra natural y la abertura de luz hacia abajo."
  },
  "img": {
   "src": "/bio/sp/weaver.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#2b2918",
   "#51502d",
   "#8f906a",
   "#839cc3",
   "#e6b21a"
  ],
  "credit": {
   "author": "Charles J. Sharp",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Black-headed_weaver_(Ploceus_cucullatus_bohndorffi)_male_nest_building.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Ploceus_cucullatus"
 },
 {
  "id": "axolotl",
  "name": "Ajolote",
  "sci": "Ambystoma mexicanum",
  "group": "anfibios",
  "where": "Lago de Xochimilco, Ciudad de México",
  "insp": [
   "estructura",
   "movimiento"
  ],
  "focus": "40% 55%",
  "zoom": {
   "x": 38,
   "y": 55
  },
  "hook": "Una salamandra mexicana que conserva toda su vida las branquias de su etapa larvaria.",
  "observe": {
   "kind": "Estructura",
   "text": "Tres pares de branquias externas, ramificadas como plumas, a cada lado de la cabeza."
  },
  "fact": {
   "text": "Es uno de los principales modelos para estudiar la regeneración: puede rehacer extremidades y otros tejidos.",
   "source": {
    "label": "Joven, A., Elewa, A. y Simon, A. (2019). Model systems for regeneration: salamanders. Development, 146.",
    "url": "https://doi.org/10.1242/dev.167700"
   }
  },
  "questions": [
   "¿Cómo se ramifican las branquias?",
   "¿Qué forma tiene la cabeza vista desde arriba?",
   "¿Qué movimiento harían las branquias en el agua?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña un perchero o colgador de pared con tres brazos ramificados a cada lado."
  },
  "img": {
   "src": "/bio/sp/axolotl.jpg",
   "w": 1200,
   "h": 981
  },
  "colors": [
   "#2e2711",
   "#3a4816",
   "#6e512c",
   "#ab8e58",
   "#a7a93c"
  ],
  "credit": {
   "author": "FakirNL",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Ambystoma_mexicanum_in_Ouwehands_Dierenpark_01.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Ambystoma_mexicanum"
 },
 {
  "id": "mossyfrog",
  "name": "Rana musgo vietnamita",
  "sci": "Theloderma corticale",
  "group": "anfibios",
  "where": "Bosques del norte de Vietnam",
  "insp": [
   "textura",
   "camuflaje"
  ],
  "focus": "40% 50%",
  "zoom": {
   "x": 40,
   "y": 50
  },
  "hook": "Su piel parece un parche de musgo sobre la roca.",
  "observe": {
   "kind": "Textura",
   "text": "Tubérculos verdes y marrones con puntas oscuras forman una superficie irregular, como musgo."
  },
  "questions": [
   "¿Cuántos tonos de verde y marrón hay?",
   "¿Los tubérculos tienen tamaños distintos?",
   "¿Dónde termina la rana y empieza la roca?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña un tapete de nudos de dos alturas que parezca musgo, en tres verdes y un marrón."
  },
  "img": {
   "src": "/bio/sp/mossyfrog.jpg",
   "w": 1200,
   "h": 792
  },
  "colors": [
   "#2e1d0d",
   "#714915",
   "#5f5427",
   "#758c22",
   "#b1916e"
  ],
  "credit": {
   "author": "H. Zell",
   "license": "CC BY-SA 3.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
   "page": "https://commons.wikimedia.org/wiki/File:Theloderma_corticale_-_Karlsruhe_Zoo_02.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Theloderma_corticale"
 },
 {
  "id": "glassfrog",
  "name": "Rana de cristal",
  "sci": "Hyalinobatrachium colymbiphyllum",
  "group": "anfibios",
  "where": "Bosques de Centroamérica",
  "insp": [
   "color",
   "estructura"
  ],
  "focus": "45% 45%",
  "zoom": {
   "x": 45,
   "y": 40
  },
  "hook": "Vista desde abajo, se le ven los órganos: su piel es casi transparente.",
  "observe": {
   "kind": "Color",
   "text": "Verde lima translúcido; junto a ella, sus huevos se ven como un grupo de perlas sobre la hoja."
  },
  "fact": {
   "text": "En un estudio con la rana de cristal Hyalinobatrachium fleischmanni, el hígado guardaba casi todos los glóbulos rojos mientras dormía, y así su cuerpo se volvía mucho más transparente.",
   "source": {
    "label": "Taboada, C. et al. (2022). Glassfrogs conceal blood in their liver to maintain transparency. Science, 378.",
    "url": "https://doi.org/10.1126/science.abl6620"
   }
  },
  "questions": [
   "¿Qué se ve a través del cuerpo?",
   "¿Cómo cambia el verde entre la rana y la hoja?",
   "¿Qué agrupación forman los huevos?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una lámpara de vidrio verde translúcido que deje ver su estructura interior."
  },
  "img": {
   "src": "/bio/sp/glassfrog.jpg",
   "w": 1200,
   "h": 900
  },
  "colors": [
   "#020202",
   "#2c2f19",
   "#778d4d",
   "#8da832",
   "#ccdba8"
  ],
  "credit": {
   "author": "bgv23",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Hyalinobatrachium_colymbiphyllum_edit.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Hyalinobatrachium"
 },
 {
  "id": "flyingfrog",
  "name": "Rana voladora de Wallace",
  "sci": "Rhacophorus nigropalmatus",
  "group": "anfibios",
  "where": "Selvas de Malasia y Borneo",
  "insp": [
   "movimiento",
   "estructura"
  ],
  "focus": "55% 50%",
  "zoom": {
   "x": 52,
   "y": 72
  },
  "hook": "Planea entre árboles usando las membranas de sus patas como paracaídas.",
  "observe": {
   "kind": "Estructura",
   "text": "Dedos muy largos unidos por membranas oscuras que se abren como velas."
  },
  "questions": [
   "¿Qué superficie gana la pata al abrir los dedos?",
   "¿Qué contraste hay entre membrana y cuerpo?",
   "¿Cómo plegarías esa membrana?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña una silla plegable de tela tensada entre varillas que se abra como la pata de la rana."
  },
  "img": {
   "src": "/bio/sp/flyingfrog.jpg",
   "w": 1200,
   "h": 769
  },
  "colors": [
   "#090e03",
   "#4a4d2e",
   "#5d631e",
   "#a79965",
   "#a8a038"
  ],
  "credit": {
   "author": "Bernard DUPONT from FRANCE",
   "license": "CC BY-SA 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Wallace%27s_Flying_Frog_(Rhacophorus_nigropalmatus)_(23189284839).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Rhacophorus_nigropalmatus"
 },
 {
  "id": "peacockspider",
  "name": "Araña pavo real",
  "sci": "Maratus volans",
  "group": "aracnidos",
  "where": "Sureste de Australia",
  "insp": [
   "color",
   "patron",
   "movimiento"
  ],
  "focus": "50% 45%",
  "zoom": {
   "x": 50,
   "y": 45
  },
  "hook": "Mide unos cinco milímetros y baila levantando un abdomen de colores.",
  "observe": {
   "kind": "Patrón",
   "text": "El abdomen del macho tiene bandas rojas, azules y ocres con bordes muy definidos; lo levanta y lo agita al cortejar."
  },
  "fact": {
   "text": "En algunas arañas pavo real, los colores más intensos se producen por estructuras microscópicas en las escamas, no por pigmentos.",
   "source": {
    "label": "Hsiung, B.-K. et al. (2017). Rainbow peacock spiders inspire miniature super-iridescent optics. Nature Communications, 8.",
    "url": "https://doi.org/10.1038/s41467-017-02451-x"
   }
  },
  "questions": [
   "¿Cuántos colores hay y cómo se separan?",
   "¿Qué simetría tiene el abdomen?",
   "¿Qué movimiento acompaña al color?"
  ],
  "challenge": {
   "area": "textiles",
   "text": "Diseña un cojín simétrico con bandas de color de bordes muy nítidos, en rojo, azul y ocre."
  },
  "img": {
   "src": "/bio/sp/peacockspider.jpg",
   "w": 1200,
   "h": 801
  },
  "colors": [
   "#4c422a",
   "#996044",
   "#899550",
   "#d5915e",
   "#b3af93"
  ],
  "credit": {
   "author": "Nigel Main",
   "license": "CC BY 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Maratus_volans_152652557.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Maratus_volans"
 },
 {
  "id": "spinyorb",
  "name": "Araña cangrejo espinosa",
  "sci": "Gasteracantha cancriformis",
  "group": "aracnidos",
  "where": "América, del sur de EE. UU. a Argentina",
  "insp": [
   "estructura",
   "patron"
  ],
  "focus": "50% 50%",
  "zoom": {
   "x": 50,
   "y": 50
  },
  "hook": "Un abdomen duro con seis espinas, en medio de una tela circular.",
  "observe": {
   "kind": "Estructura",
   "text": "Un caparazón ancho con espinas en el perímetro y manchas negras; alrededor, los hilos radiales de la tela."
  },
  "questions": [
   "¿Cuántas espinas hay y cómo se reparten?",
   "¿Qué relación hay entre el cuerpo y los radios de la tela?",
   "¿Qué patrón forman las manchas?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una lámpara de techo con un núcleo rígido y seis brazos tensados con cable."
  },
  "img": {
   "src": "/bio/sp/spinyorb.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#040402",
   "#4f352a",
   "#6e685d",
   "#b44929",
   "#d1c9bc"
  ],
  "credit": {
   "author": "Korall",
   "license": "CC BY 3.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
   "page": "https://commons.wikimedia.org/wiki/File:Gasteracantha_cancriformis_in_Secret_Woods.JPG"
  },
  "more": "https://es.wikipedia.org/wiki/Gasteracantha_cancriformis"
 },
 {
  "id": "pangolin",
  "name": "Pangolín malayo",
  "sci": "Manis javanica",
  "group": "mamiferos",
  "where": "Sudeste asiático (en peligro crítico)",
  "insp": [
   "textura",
   "estructura",
   "patron"
  ],
  "focus": "50% 45%",
  "zoom": {
   "x": 50,
   "y": 42
  },
  "hook": "El único mamífero cubierto de escamas, que se enrolla como una piña.",
  "observe": {
   "kind": "Patrón",
   "text": "Escamas superpuestas en filas, como tejas, que se abren al curvarse el cuerpo."
  },
  "fact": {
   "text": "Sus escamas de queratina se solapan de forma que el cuerpo sigue siendo flexible y protegido a la vez.",
   "source": {
    "label": "Wang, B. et al. (2016). Pangolin armor: overlapping, structure, and mechanical properties of the keratinous scales. Acta Biomaterialia, 41.",
    "url": "https://doi.org/10.1016/j.actbio.2016.05.028"
   }
  },
  "questions": [
   "¿Cuánto se solapa una escama sobre la siguiente?",
   "¿Cómo cambian de tamaño de la cabeza a la cola?",
   "¿Qué pasa con el patrón al curvarse?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña una persiana o puerta de mueble de tablillas solapadas que se curve sin dejar huecos."
  },
  "img": {
   "src": "/bio/sp/pangolin.jpg",
   "w": 1200,
   "h": 801
  },
  "colors": [
   "#2c342c",
   "#384832",
   "#364a19",
   "#5a6765",
   "#9aa1a5"
  ],
  "credit": {
   "author": "Frendi Apen Irawan",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Trenggiling_Sunda_Sunda_Pangolin_Manis_javanica.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Manis_javanica"
 },
 {
  "id": "okapi",
  "name": "Okapi",
  "sci": "Okapia johnstoni",
  "group": "mamiferos",
  "where": "Selvas de la República Democrática del Congo",
  "insp": [
   "patron",
   "color"
  ],
  "focus": "35% 55%",
  "zoom": {
   "x": 38,
   "y": 74
  },
  "hook": "Pariente de la jirafa, con rayas de cebra solo en las patas.",
  "observe": {
   "kind": "Patrón",
   "text": "Rayas blancas horizontales en patas y ancas sobre un pelaje castaño casi violáceo."
  },
  "questions": [
   "¿Dónde empiezan las rayas y dónde desaparecen?",
   "¿Qué color tiene el cuerpo cuando le da la luz?",
   "¿Qué parte del cuerpo \"señala\" el patrón?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña un banco de madera oscura con rayas claras solo en las patas."
  },
  "img": {
   "src": "/bio/sp/okapi.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#33322b",
   "#706d50",
   "#99683c",
   "#a1a393",
   "#c2ae66"
  ],
  "credit": {
   "author": "k7hpn",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Okapi_(Okapia_johnstoni).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Okapia_johnstoni"
 },
 {
  "id": "ayeaye",
  "name": "Aye-aye",
  "sci": "Daubentonia madagascariensis",
  "group": "mamiferos",
  "where": "Bosques de Madagascar",
  "insp": [
   "estructura",
   "movimiento"
  ],
  "focus": "45% 40%",
  "zoom": {
   "x": 45,
   "y": 32
  },
  "hook": "Un lémur nocturno que golpea la madera con un dedo larguísimo para encontrar larvas.",
  "observe": {
   "kind": "Estructura",
   "text": "Ojos enormes, orejas como radares y un dedo medio muy delgado, casi un alambre articulado."
  },
  "questions": [
   "¿Qué proporción tienen los ojos respecto a la cara?",
   "¿Cómo se articula un dedo tan largo?",
   "¿Qué textura tiene el pelaje?"
  ],
  "challenge": {
   "area": "objetos",
   "text": "Diseña una herramienta de cocina larga y delgada para alcanzar el fondo de frascos."
  },
  "img": {
   "src": "/bio/sp/ayeaye.jpg",
   "w": 1200,
   "h": 900
  },
  "colors": [
   "#070807",
   "#524f4a",
   "#6e5730",
   "#82521a",
   "#9f9693"
  ],
  "credit": {
   "author": "Frank Vassen from Brussels, Belgium",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Aye-aye_(Daubentonia_madagascariensis),_Tsimbazaza_Zoo,_Madagascar_(3897947810).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Daubentonia_madagascariensis"
 },
 {
  "id": "tarsier",
  "name": "Tarsero filipino",
  "sci": "Carlito syrichta",
  "group": "mamiferos",
  "where": "Islas del sur de Filipinas",
  "insp": [
   "estructura"
  ],
  "focus": "45% 35%",
  "zoom": {
   "x": 45,
   "y": 28
  },
  "hook": "Cada uno de sus ojos es tan grande como su cerebro.",
  "observe": {
   "kind": "Estructura",
   "text": "Ojos enormes y fijos, dedos largos con almohadillas y un cuerpo pequeño que se aferra a la rama."
  },
  "questions": [
   "¿Qué ocupa más espacio en la cara?",
   "¿Cómo se agarran los dedos a la rama?",
   "¿Qué emoción transmite la mirada?"
  ],
  "challenge": {
   "area": "iluminacion",
   "text": "Diseña una lámpara de buró con dos difusores circulares grandes y una base que se \"agarra\" al borde de la mesa."
  },
  "img": {
   "src": "/bio/sp/tarsier.jpg",
   "w": 1200,
   "h": 800
  },
  "colors": [
   "#393c30",
   "#5f5f2c",
   "#749915",
   "#9f9666",
   "#a6d61d"
  ],
  "credit": {
   "author": "Charles J. Sharp",
   "license": "CC BY-SA 4.0",
   "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
   "page": "https://commons.wikimedia.org/wiki/File:Philippine_tarsier_(Carlito_syrichta_fraterculus)_Bohol.jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Carlito_syrichta"
 },
 {
  "id": "tardigrade",
  "name": "Tardígrado u oso de agua",
  "sci": "Milnesium tardigradum (Tardigrada)",
  "group": "microscopicos",
  "where": "Musgos y líquenes de todo el mundo",
  "insp": [
   "estructura",
   "textura"
  ],
  "focus": "45% 55%",
  "zoom": {
   "x": 40,
   "y": 70
  },
  "hook": "Mide menos de un milímetro y sobrevive a la desecación casi total.",
  "observe": {
   "kind": "Estructura",
   "text": "Un cuerpo segmentado y regordete, con ocho patas cortas terminadas en garras (imagen de microscopio electrónico)."
  },
  "fact": {
   "text": "Para sobrevivir a la desecación producen proteínas desordenadas que forman un estado parecido al vidrio dentro de sus células.",
   "source": {
    "label": "Boothby, T. C. et al. (2017). Tardigrades use intrinsically disordered proteins to survive desiccation. Molecular Cell, 65.",
    "url": "https://doi.org/10.1016/j.molcel.2017.02.018"
   }
  },
  "questions": [
   "¿Cuántos segmentos tiene el cuerpo?",
   "¿Cómo son las patas frente al tamaño del cuerpo?",
   "¿Qué textura muestra la superficie?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña un puf segmentado de cuatro módulos acolchados con patas cortas y robustas."
  },
  "img": {
   "src": "/bio/sp/tardigrade.jpg",
   "w": 1200,
   "h": 920
  },
  "colors": [
   "#343a3e",
   "#677278",
   "#9ea9af",
   "#d0d9df",
   "#f0f4f9"
  ],
  "credit": {
   "author": "Schokraie E, Warnken U, Hotz-Wagenblatt A, Grohme MA, Hengherr S, et a",
   "license": "CC BY 2.5",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.5",
   "page": "https://commons.wikimedia.org/wiki/File:SEM_image_of_Milnesium_tardigradum_in_active_state_-_journal.pone.0045682.g001-2.png"
  },
  "more": "https://es.wikipedia.org/wiki/Tardigrada"
 },
 {
  "id": "sunbittern",
  "name": "Garza sol",
  "sci": "Eurypyga helias",
  "group": "aves",
  "where": "Ríos de Centro y Sudamérica",
  "insp": [
   "patron",
   "movimiento"
  ],
  "focus": "30% 50%",
  "zoom": {
   "x": 25,
   "y": 45
  },
  "hook": "Al abrir las alas, aparece un dibujo de \"ojos\" naranjas y negros.",
  "observe": {
   "kind": "Patrón",
   "text": "Bandas finas de gris y marrón cubren el cuerpo; al abrir las alas aparecen grandes manchas naranja, negro y crema."
  },
  "questions": [
   "¿Qué se oculta con las alas cerradas?",
   "¿Qué tan finas son las bandas del cuerpo?",
   "¿Dónde está el centro de cada \"ojo\"?"
  ],
  "challenge": {
   "area": "mobiliario",
   "text": "Diseña un mueble cuyo exterior sea discreto y que al abrirlo revele un interior de color intenso."
  },
  "img": {
   "src": "/bio/sp/sunbittern.jpg",
   "w": 1200,
   "h": 728
  },
  "colors": [
   "#281b15",
   "#57572c",
   "#9d6434",
   "#a49c36",
   "#a69e94"
  ],
  "credit": {
   "author": "Tony Hisgett from Birmingham, UK",
   "license": "CC BY 2.0",
   "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
   "page": "https://commons.wikimedia.org/wiki/File:Eurypyga_helias_-London_Zoo,_England-8a_(2).jpg"
  },
  "more": "https://es.wikipedia.org/wiki/Eurypyga_helias"
 }
];
  window.TDX_SPECIES = { GROUPS, INSP, AREAS, SPECIES };
})();
