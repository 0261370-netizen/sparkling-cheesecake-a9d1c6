// Editorial archive of THE DESIGN DAILY.
// News always comes from real RSS articles; the pieces below are curated, evergreen editorial content
// (cover lines, palettes, iconic objects and challenges) that rotate so no two editions feel alike.

export type ThemeKey = "industrial" | "color" | "nature" | "experimental" | "furniture" | "slow" | "review";

export type Theme = {
  key: ThemeKey;
  name: string;
  day: string;
  kicker: string;
  description: string;
  keywords: string[];
};

// Index = JS getUTCDay() (0 = domingo).
export const THEMES_BY_WEEKDAY: ThemeKey[] = ["review", "industrial", "color", "nature", "experimental", "furniture", "slow"];

export const THEMES: Record<ThemeKey, Theme> = {
  industrial: {
    key: "industrial", name: "Industrial Stories", day: "Lunes", kicker: "Planos, procesos y fabricación",
    description: "Materiales, estructuras metálicas, fabricación, ingeniería de producto y diseño para manufactura.",
    keywords: ["manufactur", "factory", "engineer", "steel", "alumin", "metal", "process", "production", "injection", "cnc", "prototype", "mechanic", "structure", "assembl", "modular", "flat-pack", "flatpack", "robot", "3d-print", "3d print", "printed", "industrial", "recycl", "technical", "tool", "machine", "extru", "cast", "welded", "joint", "material"],
  },
  color: {
    key: "color", name: "Color & Form", day: "Martes", kicker: "Color, materia y proporción",
    description: "Color, materialidad, acabados, proporciones, formas escultóricas y tendencias CMF.",
    keywords: ["colour", "color", "pastel", "palette", "hue", "bright", "vibrant", "finish", "glaze", "lacquer", "sculptural", "form", "shape", "terrazzo", "ceramic", "glass", "texture", "pigment", "chrome", "curv", "rounded", "chunky", "red", "pink", "yellow", "blue", "green", "orange"],
  },
  nature: {
    key: "nature", name: "Nature Lab", day: "Miércoles", kicker: "Biofilia y biomímesis",
    description: "Biofilia, biomímesis, estructuras naturales, materiales biológicos y diseño inspirado en la naturaleza.",
    keywords: ["bio", "nature", "natural", "plant", "mycel", "fung", "algae", "seaweed", "biomim", "organic", "leaf", "tree", "forest", "ocean", "coral", "botanic", "garden", "living", "wood", "timber", "cork", "hemp", "bamboo", "earth", "clay", "waste", "sustainab", "circular", "regenerat", "flower", "animal"],
  },
  experimental: {
    key: "experimental", name: "The Experimental Issue", day: "Jueves", kicker: "Ideas radicales y prototipos",
    description: "Ideas radicales, diseñadores emergentes, muebles conceptuales, nuevos materiales y soluciones inesperadas.",
    keywords: ["concept", "experiment", "speculat", "prototype", "ai ", "artificial intelligence", "emerging", "graduate", "student", "unexpected", "radical", "future", "innovat", "inflatable", "new material", "research", "lab", "kinetic", "transform", "robot", "surreal", "playful", "unusual", "hack", "debut", "young"],
  },
  furniture: {
    key: "furniture", name: "Furniture Futures", day: "Viernes", kicker: "Mobiliario, oficinas y sistemas",
    description: "Tendencias de mobiliario, oficinas, sistemas modulares, colecciones y nuevos estilos de vida y trabajo.",
    keywords: ["furniture", "chair", "sofa", "table", "desk", "office", "workplace", "workspace", "lamp", "lighting", "light", "shelv", "storage", "collection", "launch", "milan", "salone", "modular", "bed", "stool", "bench", "seating", "cabinet", "interior", "home", "living room", "rug"],
  },
  slow: {
    key: "slow", name: "The Slow Design Journal", day: "Sábado", kicker: "Historia, oficio y cultura visual",
    description: "Historia del diseño, libros, documentales, diseñadores icónicos, artesanía e ilustración.",
    keywords: ["craft", "handmade", "hand-made", "artisan", "heritage", "history", "histor", "archive", "book", "exhibition", "museum", "documentary", "retrospective", "vintage", "weav", "illustrat", "tradition", "legacy", "icon", "classic", "reissue", "anniversary", "ceramic", "pottery", "textile", "festival", "biennale", "week"],
  },
  review: {
    key: "review", name: "The Creative Review", day: "Domingo", kicker: "El suplemento de la semana",
    description: "Resumen de los descubrimientos de la semana, objetos favoritos, ideas desarrolladas y retos.",
    keywords: [],
  },
};

export type CoverLine = { headline: string; dek: string };

export const COVER_LINES: Record<ThemeKey, CoverLine[]> = {
  industrial: [
    { headline: "La belleza está en la unión", dek: "Tornillos, pliegues y soldaduras: hoy leemos los objetos desde su despiece." },
    { headline: "Diseñar es también fabricar", dek: "Procesos, tolerancias y moldes: la fábrica como primer cliente del diseño." },
    { headline: "Menos piezas, más ideas", dek: "Lo que se elimina en el plano también es diseño." },
    { headline: "El plano antes que la forma", dek: "Cortes, cotas y secciones para entender cómo se sostiene un objeto." },
    { headline: "Acero, aire y precisión", dek: "Estructuras ligeras y materiales honestos en las noticias de hoy." },
  ],
  color: [
    { headline: "El color también es estructura", dek: "Acabados, pigmentos y volúmenes que cambian cómo percibimos un objeto." },
    { headline: "Formas que se pueden tocar con los ojos", dek: "Curvas, brillos y texturas: una edición para mirar despacio." },
    { headline: "Una paleta puede contar una historia", dek: "CMF, proporción y emoción en el diseño de esta semana." },
    { headline: "La superficie es el mensaje", dek: "Lacas, esmaltes y metales: lo que el acabado dice antes que la función." },
    { headline: "Escultura de uso diario", dek: "Objetos que no tienen miedo a la forma ni al color." },
  ],
  nature: [
    { headline: "Aprender del organismo", dek: "Estructuras naturales, biomateriales y diseño que crece en lugar de fabricarse." },
    { headline: "La naturaleza ya lo resolvió", dek: "Hojas, panales y raíces: patrones que se convierten en ingeniería." },
    { headline: "Materiales que respiran", dek: "Micelio, algas, madera y tierra: la nueva materia prima del diseño." },
    { headline: "Diseñar con el tiempo de las plantas", dek: "Biofilia, ciclos y materiales que vuelven a la tierra." },
    { headline: "Geometrías vivas", dek: "Lo que un coral, una semilla o una concha pueden enseñarle a un mueble." },
  ],
  experimental: [
    { headline: "¿Y si fuera al revés?", dek: "Prototipos, conceptos y propuestas que se atreven a romper la regla." },
    { headline: "El error como método", dek: "Diseñadores emergentes y materiales que todavía no tienen nombre." },
    { headline: "Ideas que aún no existen", dek: "Una edición para incomodar a la costumbre." },
    { headline: "Laboratorio abierto", dek: "Experimentos, prototipos y preguntas sin respuesta." },
    { headline: "Lo inesperado también es funcional", dek: "Muebles conceptuales y soluciones que sorprenden." },
  ],
  furniture: [
    { headline: "Cómo viviremos y trabajaremos", dek: "Colecciones, oficinas y sistemas modulares para los próximos años." },
    { headline: "El mueble como sistema", dek: "Piezas que se combinan, crecen y cambian con quien las usa." },
    { headline: "Nuevas formas de sentarse", dek: "Lanzamientos y tendencias del mobiliario contemporáneo." },
    { headline: "La oficina se vuelve casa", dek: "Espacios híbridos, objetos flexibles y confort con intención." },
    { headline: "Colecciones que miran al futuro", dek: "Lo más reciente del diseño de mobiliario internacional." },
  ],
  slow: [
    { headline: "Mirar despacio", dek: "Historia, oficio y cultura visual para un sábado sin prisa." },
    { headline: "Las manos que diseñan", dek: "Artesanía, tradición y diseñadores que nos enseñaron a mirar." },
    { headline: "Todo objeto tiene una biografía", dek: "Archivos, libros y exposiciones para entender de dónde venimos." },
    { headline: "El oficio no tiene prisa", dek: "Técnicas que tardan años en aprenderse y segundos en admirarse." },
    { headline: "Clásicos que siguen enseñando", dek: "Diseño, memoria e ilustración en la edición de hoy." },
  ],
  review: [
    { headline: "La semana en diseño", dek: "Los descubrimientos que merecen quedarse: un suplemento para leer con café." },
    { headline: "Lo que vimos, lo que aprendimos", dek: "Resumen de la semana, un objeto para recordar y un reto para el lunes." },
    { headline: "El suplemento del domingo", dek: "Lecturas largas, objetos favoritos e ideas para seguir desarrollando." },
    { headline: "Siete días, mil ideas", dek: "Una selección de lo mejor de la semana en diseño y mobiliario." },
    { headline: "Pausa creativa", dek: "Repasar, conectar y elegir qué idea llevar al cuaderno." },
  ],
};

export type Swatch = { hex: string; name: string };
export type ColorStory = { title: string; swatches: Swatch[]; materials: string[]; finish: string; note: string };

export const COLOR_STORIES: Record<ThemeKey, ColorStory[]> = {
  industrial: [
    { title: "Taller en grafito", swatches: [{ hex: "#2F3437", name: "Grafito" }, { hex: "#8A9399", name: "Acero cepillado" }, { hex: "#D9D4C7", name: "Papel técnico" }, { hex: "#E0592A", name: "Naranja seguridad" }, { hex: "#1F4E79", name: "Azul plano" }], materials: ["Acero laminado en frío", "Aluminio extruido", "Contrachapado de abedul"], finish: "Pintura en polvo satinada", note: "El naranja se reserva para los puntos de contacto: dónde se ajusta, se abre o se sujeta." },
    { title: "Fundición y vapor", swatches: [{ hex: "#3B3A36", name: "Hierro fundido" }, { hex: "#B5652F", name: "Óxido" }, { hex: "#CFC6B4", name: "Arena de molde" }, { hex: "#6F7C80", name: "Zinc" }, { hex: "#F2EFE6", name: "Yeso" }], materials: ["Hierro fundido", "Acero corten", "Fibrocemento"], finish: "Pátina natural sellada", note: "Paleta que deja ver el proceso: marcas de molde y oxidación como textura." },
    { title: "Blueprint", swatches: [{ hex: "#1C3F6E", name: "Cianotipo" }, { hex: "#F4F1E8", name: "Línea blanca" }, { hex: "#9FB3C8", name: "Vidrio templado" }, { hex: "#C9A227", name: "Latón" }, { hex: "#262626", name: "Negro máquina" }], materials: ["Chapa perforada", "Latón mecanizado", "Vidrio templado"], finish: "Anodizado mate", note: "Una dirección técnica y precisa, ideal para sistemas de estantería y mobiliario de taller." },
  ],
  color: [
    { title: "Sorbete brutal", swatches: [{ hex: "#F4A7B9", name: "Rosa chicle" }, { hex: "#F6D55C", name: "Mantequilla" }, { hex: "#3CAEA3", name: "Menta profunda" }, { hex: "#ED553B", name: "Tomate" }, { hex: "#20639B", name: "Azul Klein suave" }], materials: ["Polietileno rotomoldeado", "Terrazo de colores", "Acero lacado"], finish: "Laca brillante", note: "Colores puros sobre volúmenes simples: el color hace el trabajo de la ornamentación." },
    { title: "Arcilla y sol", swatches: [{ hex: "#C8553D", name: "Terracota" }, { hex: "#F28F3B", name: "Mandarina" }, { hex: "#FFD5C2", name: "Melocotón" }, { hex: "#588B8B", name: "Agave" }, { hex: "#2D3047", name: "Noche" }], materials: ["Cerámica esmaltada", "Lino teñido", "Madera de nogal"], finish: "Esmalte semimate", note: "Cálida y mexicana: funciona en piezas de cerámica, tapizados y textiles." },
    { title: "Cromo y caramelo", swatches: [{ hex: "#C0C5CE", name: "Cromo" }, { hex: "#A0522D", name: "Caramelo" }, { hex: "#F3E9DC", name: "Crema" }, { hex: "#5E3A1F", name: "Cacao" }, { hex: "#E8B04B", name: "Ámbar" }], materials: ["Tubo de acero cromado", "Cuero vegetal", "Vidrio ámbar"], finish: "Pulido espejo", note: "El contraste frío/cálido da lujo sin ornamento: una referencia directa a los años 70." },
  ],
  nature: [
    { title: "Sotobosque", swatches: [{ hex: "#2E4A3A", name: "Musgo profundo" }, { hex: "#6B8F5E", name: "Helecho" }, { hex: "#C9B98F", name: "Micelio" }, { hex: "#8C5A3C", name: "Corteza" }, { hex: "#EDE6D3", name: "Hueso" }], materials: ["Micelio moldeado", "Corcho expandido", "Fresno macizo"], finish: "Aceite natural", note: "Tonos que envejecen bien: elige acabados que dejen ver la fibra y el poro." },
    { title: "Laguna", swatches: [{ hex: "#1B6F73", name: "Alga" }, { hex: "#8CC5B2", name: "Agua clara" }, { hex: "#E6D7B9", name: "Arena" }, { hex: "#F1A66A", name: "Coral" }, { hex: "#2B3A42", name: "Profundidad" }], materials: ["Bioplástico de algas", "Vidrio reciclado", "Ratán"], finish: "Mate translúcido", note: "Una paleta acuática para superficies que juegan con la luz y la transparencia." },
    { title: "Tierra cruda", swatches: [{ hex: "#A1643A", name: "Barro" }, { hex: "#D9B48F", name: "Adobe" }, { hex: "#5C6B48", name: "Olivo" }, { hex: "#F0E6D2", name: "Cal" }, { hex: "#3A2E25", name: "Carbón vegetal" }], materials: ["Tierra compactada", "Fibra de cáñamo", "Bambú laminado"], finish: "Encerado", note: "Materiales locales y de bajo impacto: la paleta nace del propio material, no de un pigmento." },
  ],
  experimental: [
    { title: "Señal ácida", swatches: [{ hex: "#C6F432", name: "Lima ácida" }, { hex: "#111111", name: "Negro" }, { hex: "#E9E4DA", name: "Gris papel" }, { hex: "#7B2FF7", name: "Violeta eléctrico" }, { hex: "#FF4F79", name: "Rosa neón" }], materials: ["Espuma de poliuretano", "Policarbonato alveolar", "Malla de acero"], finish: "Fluorescente mate", note: "Una dirección provocadora: úsala para prototipos que necesitan llamar la atención." },
    { title: "Laboratorio translúcido", swatches: [{ hex: "#DDE7F0", name: "Escarcha" }, { hex: "#9BC1BC", name: "Silicona" }, { hex: "#F4F1BB", name: "Gel" }, { hex: "#ED6A5A", name: "Señal" }, { hex: "#5D576B", name: "Humo" }], materials: ["Resina colada", "Silicona", "Acrílico reciclado"], finish: "Satinado translúcido", note: "Transparencias que muestran el interior: el mecanismo como protagonista." },
    { title: "Collage industrial", swatches: [{ hex: "#FF6B35", name: "Naranja" }, { hex: "#004E89", name: "Azul cobalto" }, { hex: "#F7C59F", name: "Cartón" }, { hex: "#EFEFD0", name: "Marfil" }, { hex: "#1A1A1A", name: "Tinta" }], materials: ["Tablero de fibras reciclado", "Cartón estructural", "Aluminio plegado"], finish: "Serigrafía", note: "Mezcla de materiales pobres y color intenso: ideal para muebles efímeros." },
  ],
  furniture: [
    { title: "Oficina serena", swatches: [{ hex: "#E8E2D6", name: "Lino" }, { hex: "#B7A98B", name: "Roble claro" }, { hex: "#6F7D6B", name: "Salvia" }, { hex: "#2F3E46", name: "Pizarra" }, { hex: "#D08C60", name: "Cobre suave" }], materials: ["Roble FSC", "Lana bouclé", "Acero pintado"], finish: "Barniz al agua mate", note: "Una base neutra para sistemas modulares: el color acentúa solo módulos o tapizados." },
    { title: "Milano sera", swatches: [{ hex: "#5B1E2D", name: "Burdeos" }, { hex: "#C9A66B", name: "Latón" }, { hex: "#EFE7DA", name: "Travertino" }, { hex: "#2B2B2B", name: "Ébano" }, { hex: "#8E9B90", name: "Verde gris" }], materials: ["Travertino", "Terciopelo", "Nogal americano"], finish: "Latón cepillado", note: "Sofisticación cálida: piedra, madera oscura y terciopelo para mobiliario residencial." },
    { title: "Sistema abierto", swatches: [{ hex: "#F2F2F0", name: "Blanco tiza" }, { hex: "#3D5A80", name: "Azul taller" }, { hex: "#98C1D9", name: "Cielo" }, { hex: "#EE6C4D", name: "Bermellón" }, { hex: "#293241", name: "Marino" }], materials: ["Aluminio anodizado", "Tablero compacto HPL", "Fieltro PET reciclado"], finish: "HPL antihuellas", note: "Pensada para piezas reconfigurables: cada color identifica una función." },
  ],
  slow: [
    { title: "Biblioteca de tarde", swatches: [{ hex: "#6B4F3A", name: "Cuero viejo" }, { hex: "#C9B79C", name: "Papel kraft" }, { hex: "#8C9A7A", name: "Liquen" }, { hex: "#2E2B28", name: "Tinta sepia" }, { hex: "#E9DFCB", name: "Pergamino" }], materials: ["Nogal macizo", "Cuero curtido vegetal", "Papel de algodón"], finish: "Goma laca", note: "Tonos que piden luz cálida y tiempo: piezas para leer, guardar y heredar." },
    { title: "Oficio textil", swatches: [{ hex: "#A23B2A", name: "Grana cochinilla" }, { hex: "#E3B23C", name: "Cempasúchil" }, { hex: "#2F5D62", name: "Añil" }, { hex: "#F3EAD8", name: "Algodón crudo" }, { hex: "#4E3B31", name: "Nogalina" }], materials: ["Lana teñida a mano", "Palma tejida", "Madera de parota"], finish: "Tintes naturales", note: "Pigmentos de tradición mexicana: cochinilla, añil y cempasúchil como paleta contemporánea." },
    { title: "Taller de cerámica", swatches: [{ hex: "#D8CFC0", name: "Gres crudo" }, { hex: "#9E7B5B", name: "Barro cocido" }, { hex: "#5F7470", name: "Celadón oscuro" }, { hex: "#F5F0E6", name: "Engobe" }, { hex: "#3B3632", name: "Óxido de hierro" }], materials: ["Gres", "Engobe", "Fresno"], finish: "Esmalte de ceniza", note: "La imperfección como valor: huellas, goteos y variaciones de cada horneada." },
  ],
  review: [
    { title: "Suplemento dominical", swatches: [{ hex: "#C8102E", name: "Rojo rotativa" }, { hex: "#F3EBDD", name: "Papel prensa" }, { hex: "#1D3557", name: "Azul tinta" }, { hex: "#F2C14E", name: "Amarillo cómic" }, { hex: "#1A1A1A", name: "Negro" }], materials: ["Papel reciclado", "Acero lacado", "Contrachapado"], finish: "Impresión en semitono", note: "Colores primarios de imprenta: una paleta gráfica para piezas con mucha personalidad." },
    { title: "Mesa de domingo", swatches: [{ hex: "#E07A5F", name: "Pomelo" }, { hex: "#F4F1DE", name: "Mantel" }, { hex: "#81B29A", name: "Pistache" }, { hex: "#3D405B", name: "Ciruela" }, { hex: "#F2CC8F", name: "Pan dulce" }], materials: ["Cerámica", "Lino lavado", "Madera de pino"], finish: "Mate suave", note: "Cálida y doméstica: pensada para mobiliario de comedor y objetos de mesa." },
    { title: "Archivo de la semana", swatches: [{ hex: "#264653", name: "Petróleo" }, { hex: "#2A9D8F", name: "Turquesa" }, { hex: "#E9C46A", name: "Mostaza" }, { hex: "#F4A261", name: "Arena tostada" }, { hex: "#E76F51", name: "Ladrillo" }], materials: ["Corcho", "Acero perforado", "Tablero de bambú"], finish: "Semimate", note: "Una paleta de síntesis: reúne lo cálido, lo natural y lo técnico de toda la semana." },
  ],
};

export type DesignObject = {
  name: string;
  designer: string;
  year: string;
  material: string;
  maker: string;
  story: string;
  question: string;
  tags: ThemeKey[];
};

export const OBJECTS: DesignObject[] = [
  { name: "Silla Nº 14", designer: "Michael Thonet", year: "1859", material: "Madera de haya curvada al vapor", maker: "Gebrüder Thonet", story: "Seis piezas de madera curvada y unos pocos tornillos permitieron enviar sillas desmontadas por todo el mundo. Es uno de los primeros grandes éxitos de la producción en serie.", question: "¿Qué producto actual podría reducirse a seis piezas sin perder resistencia?", tags: ["industrial", "slow"] },
  { name: "Wassily (B3)", designer: "Marcel Breuer", year: "1925–1926", material: "Tubo de acero y tela tensada", maker: "Standard-Möbel / Thonet / Knoll", story: "Breuer se inspiró en el manillar de su bicicleta para llevar el tubo de acero al mobiliario doméstico. La estructura se convierte en dibujo.", question: "¿Qué otro objeto cotidiano podría prestar su estructura a un mueble?", tags: ["industrial", "experimental", "slow"] },
  { name: "Panton Chair", designer: "Verner Panton", year: "Diseñada en 1959–1960, producida desde 1967", material: "Plástico moldeado en una sola pieza", maker: "Vitra", story: "Primera silla en voladizo fabricada de una sola pieza de plástico. Tardó años en encontrar un material y un proceso capaces de producirla.", question: "¿Qué forma tuya está esperando el material adecuado?", tags: ["color", "experimental", "industrial"] },
  { name: "LCW (Lounge Chair Wood)", designer: "Charles y Ray Eames", year: "1945", material: "Contrachapado moldeado", maker: "Evans Products / Herman Miller", story: "Nació de los experimentos de los Eames con contrachapado moldeado durante la guerra, incluidas férulas para la Marina de EE. UU.", question: "¿Qué técnica de otra industria podrías trasladar al mobiliario?", tags: ["furniture", "industrial", "slow"] },
  { name: "Eames Lounge Chair", designer: "Charles y Ray Eames", year: "1956", material: "Contrachapado moldeado, cuero y aluminio", maker: "Herman Miller", story: "Pensada con la calidez de un guante de béisbol usado: un clásico del confort que expone su estructura de conchas y uniones.", question: "¿Cómo se ve el confort si lo dibujas como un diagrama de capas?", tags: ["furniture", "slow"] },
  { name: "Tulip Chair", designer: "Eero Saarinen", year: "1955–1956", material: "Base de aluminio fundido y concha de fibra de vidrio", maker: "Knoll", story: "Saarinen quería acabar con el «barrio de patas» bajo mesas y sillas. Su respuesta fue un único pie escultórico.", question: "¿Qué «desorden visual» podrías eliminar de un mueble actual?", tags: ["color", "furniture"] },
  { name: "Butterfly Stool", designer: "Sori Yanagi", year: "1954", material: "Contrachapado moldeado", maker: "Tendo Mokko", story: "Dos piezas idénticas de contrachapado unidas por un eje metálico. Mezcla técnica occidental y sensibilidad japonesa.", question: "¿Qué puedes resolver con dos piezas iguales?", tags: ["color", "slow", "industrial"] },
  { name: "Ball Chair", designer: "Eero Aarnio", year: "1963", material: "Fibra de vidrio y tapizado", maker: "Asko / Eero Aarnio Originals", story: "Una esfera que funciona como habitación dentro de la habitación: aísla el sonido y crea un pequeño refugio personal.", question: "¿Cómo diseñarías privacidad sin paredes?", tags: ["experimental", "color"] },
  { name: "Lámpara Arco", designer: "Achille y Pier Giacomo Castiglioni", year: "1962", material: "Base de mármol de Carrara y arco de acero inoxidable", maker: "Flos", story: "Luz cenital sin perforar el techo: el contrapeso de mármol resuelve el problema estructural y el orificio de la base permite levantarla con un palo de escoba.", question: "¿Qué problema estructural podría convertirse en el rasgo más bello de tu diseño?", tags: ["industrial", "furniture"] },
  { name: "Mezzadro", designer: "Achille y Pier Giacomo Castiglioni", year: "1957 (producido por Zanotta desde 1970)", material: "Asiento de tractor en acero, ballesta y haya", maker: "Zanotta", story: "Un ready-made de diseño: un asiento de tractor convertido en taburete. Reutiliza componentes industriales con humor.", question: "¿Qué componente industrial existente podrías reutilizar en un mueble?", tags: ["experimental", "industrial"] },
  { name: "Valentine", designer: "Ettore Sottsass con Perry King", year: "1969", material: "Plástico ABS", maker: "Olivetti", story: "Una máquina de escribir portátil roja que se presentó como un objeto pop para usar en cualquier lugar, no solo en la oficina.", question: "¿Qué herramienta de trabajo podría convertirse en un objeto emocional?", tags: ["color", "experimental"] },
  { name: "Juicy Salif", designer: "Philippe Starck", year: "1990", material: "Aluminio fundido", maker: "Alessi", story: "Un exprimidor que se convirtió en icono escultórico y en debate permanente sobre forma y función.", question: "¿Dónde está el límite entre objeto útil y objeto de conversación?", tags: ["experimental", "color"] },
  { name: "Tizio", designer: "Richard Sapper", year: "1972", material: "Aluminio y plástico, con contrapesos", maker: "Artemide", story: "Lámpara de equilibrio por contrapesos: los brazos conducen la corriente y eliminan los cables visibles.", question: "¿Qué función podría resolver la propia estructura en lugar de una pieza añadida?", tags: ["industrial", "furniture"] },
  { name: "Anglepoise", designer: "George Carwardine", year: "1932", material: "Acero y muelles", maker: "Herbert Terry & Sons", story: "Un ingeniero de suspensiones de automóviles aplicó el equilibrio de muelles a una lámpara que se queda en cualquier posición.", question: "¿Qué principio mecánico de un vehículo podría vivir en tu escritorio?", tags: ["industrial", "slow"] },
  { name: "Sillón Paimio", designer: "Alvar Aalto", year: "1931–1932", material: "Abedul laminado y curvado", maker: "Artek", story: "Diseñado para el sanatorio de Paimio: el ángulo del respaldo buscaba facilitar la respiración de los pacientes.", question: "¿Cómo cambiaría un mueble si lo diseñaras para un cuerpo en recuperación?", tags: ["nature", "slow", "furniture"] },
  { name: "Taburete 60", designer: "Alvar Aalto", year: "1933", material: "Abedul con pata en «L» curvada", maker: "Artek", story: "La pata curvada en L, unida directamente al asiento, resolvió una unión clave y permite apilar el taburete de forma infinita.", question: "¿Qué unión de tu proyecto podría simplificarse a una sola curva?", tags: ["nature", "furniture", "industrial"] },
  { name: "Aeron", designer: "Bill Stumpf y Don Chadwick", year: "1994", material: "Malla elastomérica y aluminio", maker: "Herman Miller", story: "Cambió la silla de oficina: malla en lugar de espuma, tres tallas y un enfoque centrado en la ergonomía.", question: "¿Qué parte de un mueble podrías sustituir por una membrana?", tags: ["furniture", "industrial"] },
  { name: "Action Office", designer: "Robert Propst", year: "1964–1968", material: "Paneles, superficies y sistemas modulares", maker: "Herman Miller", story: "Un sistema pensado para dar movilidad y autonomía en la oficina. Su versión posterior derivó, paradójicamente, en el cubículo.", question: "¿Cómo evitarías que un sistema flexible termine siendo rígido?", tags: ["furniture", "experimental"] },
  { name: "USM Haller", designer: "Fritz Haller y Paul Schärer", year: "1963–1965", material: "Tubo de acero cromado, rótula y paneles de acero", maker: "USM", story: "Nació como mobiliario para las oficinas de la propia fábrica USM y se convirtió en un sistema infinito basado en una pequeña rótula.", question: "¿Cuál sería la «rótula» de tu propio sistema modular?", tags: ["furniture", "industrial"] },
  { name: "606 Universal Shelving System", designer: "Dieter Rams", year: "1960", material: "Aluminio extruido y acero", maker: "Vitsœ", story: "Un sistema de estantería pensado para crecer, moverse y durar décadas: menos, pero mejor.", question: "¿Cómo diseñarías un mueble para que su dueño nunca necesite tirarlo?", tags: ["furniture", "industrial", "slow"] },
  { name: "Componibili", designer: "Anna Castelli Ferrieri", year: "1967", material: "Plástico ABS", maker: "Kartell", story: "Módulos cilíndricos apilables sin tornillos: un sistema de almacenaje que sigue fabricándose y aparece en casas de todo el mundo.", question: "¿Qué geometría permite apilar sin herrajes?", tags: ["color", "furniture"] },
  { name: "Superleggera", designer: "Gio Ponti", year: "1957", material: "Fresno", maker: "Cassina", story: "Una silla tan ligera —en torno a 1,7 kg— que, según la leyenda, un niño podía levantarla con un dedo. La ligereza como logro técnico y estético.", question: "¿Cuánto material podrías quitar a tu diseño antes de que deje de funcionar?", tags: ["slow", "industrial"] },
  { name: "Selene", designer: "Vico Magistretti", year: "1969", material: "Plástico moldeado en una sola pieza", maker: "Artemide", story: "Las patas de sección en «S» dan rigidez a una silla de plástico de una sola pieza. La geometría resuelve el problema estructural.", question: "¿Qué sección o perfil podría dar rigidez sin añadir material?", tags: ["experimental", "industrial", "color"] },
  { name: "Vegetal", designer: "Ronan y Erwan Bouroullec", year: "2008", material: "Poliamida moldeada", maker: "Vitra", story: "Una silla inspirada en el crecimiento de las plantas: ramas que se entrelazan para formar el asiento.", question: "¿Cómo dibujarías una estructura que «crece» en lugar de construirse?", tags: ["nature", "experimental"] },
  { name: "Algue", designer: "Ronan y Erwan Bouroullec", year: "2004", material: "Polipropileno inyectado", maker: "Vitra", story: "Elementos con forma de alga que se enganchan entre sí para crear divisiones, cortinas o celosías de cualquier tamaño.", question: "¿Qué pieza mínima podría repetirse para crear un espacio?", tags: ["nature", "color", "furniture"] },
  { name: "Velcro", designer: "George de Mestral", year: "Patentado en 1955", material: "Ganchos y bucles textiles", maker: "Velcro", story: "Surgió al observar cómo las semillas de bardana se enganchaban al pelo de su perro: uno de los ejemplos más citados de biomímesis.", question: "¿Qué mecanismo de unión de una semilla o un animal podrías estudiar hoy?", tags: ["nature", "industrial"] },
  { name: "Living Tower", designer: "Verner Panton", year: "1969", material: "Espuma tapizada sobre estructura", maker: "Herman Miller / Stega / Vitra", story: "Un mueble-escultura para sentarse en varios niveles, más cercano a un paisaje que a un sofá.", question: "¿Cómo sería un mueble pensado como paisaje y no como objeto?", tags: ["experimental", "color"] },
  { name: "Sacco", designer: "Piero Gatti, Cesare Paolini y Franco Teodoro", year: "1968", material: "Bolitas de poliestireno expandido y funda", maker: "Zanotta", story: "Un asiento sin forma fija que se adapta a cada cuerpo: la antítesis de la silla rígida.", question: "¿Qué pasaría si tu mueble no tuviera una forma definitiva?", tags: ["experimental", "slow"] },
  { name: "Air-Chair", designer: "Jasper Morrison", year: "1999", material: "Polipropileno con fibra de vidrio, moldeado por inyección asistida por gas", maker: "Magis", story: "El gas inyectado deja huecas las secciones gruesas: una silla ligera, resistente y económica de una sola pieza.", question: "¿Cómo puede un proceso de fabricación definir la estética de un objeto?", tags: ["industrial", "furniture"] },
  { name: "Chair One", designer: "Konstantin Grcic", year: "2004", material: "Aluminio fundido a presión", maker: "Magis", story: "Construida como un balón de fútbol, con superficies planas que forman una estructura tridimensional calada.", question: "¿Qué objeto podría construirse a partir de facetas planas?", tags: ["industrial", "experimental"] },
  { name: "Knotted Chair", designer: "Marcel Wanders", year: "1996", material: "Cuerda de aramida y carbono impregnada en resina epoxi", maker: "Droog / Cappellini", story: "Una técnica de macramé que se endurece con resina: lo textil se convierte en estructura.", question: "¿Qué material blando podría volverse estructural con un tratamiento?", tags: ["experimental", "slow"] },
  { name: "Plia", designer: "Giancarlo Piretti", year: "1967", material: "Acero cromado y plástico transparente", maker: "Anonima Castelli", story: "Una silla plegable cuyo mecanismo de tres discos permite plegarla en un grosor mínimo.", question: "¿Qué mueble de tu casa debería plegarse y no lo hace?", tags: ["furniture", "industrial"] },
  { name: "Thinking Man's Chair", designer: "Jasper Morrison", year: "1986", material: "Tubo y pletina de acero pintado", maker: "Cappellini", story: "Morrison dibujó a mano medidas y anotaciones sobre el propio prototipo: el dibujo técnico como parte del objeto.", question: "¿Qué anotación de tu proceso merecería quedar visible en el objeto final?", tags: ["slow", "industrial"] },
  { name: "Butaque", designer: "Clara Porset", year: "Década de 1940", material: "Madera y tejido o cuero", maker: "Producción artesanal mexicana", story: "Porset reinterpretó el butaque tradicional, de raíz colonial y popular, como una pieza moderna. Es un referente del diseño mexicano.", question: "¿Qué objeto tradicional de tu entorno podrías reinterpretar sin perder su origen?", tags: ["slow", "nature", "furniture"] },
  { name: "Hang It All", designer: "Charles y Ray Eames", year: "1953", material: "Varilla de acero y esferas de madera pintada", maker: "Tigrett Enterprises / Vitra", story: "Un perchero pensado para que los niños colgaran sus cosas: color, juego y alambre industrial.", question: "¿Cómo invitarías a alguien a ordenar a través del juego?", tags: ["color", "experimental"] },
];

export type Challenge = { title: string; brief: string; constraints: string[]; time: string };

export const CHALLENGES: Record<ThemeKey, Challenge[]> = {
  industrial: [
    { title: "Despiece en 10 líneas", brief: "Elige un objeto de tu escritorio y dibuja su vista explotada con no más de diez líneas.", constraints: ["Numera cada pieza", "Marca las uniones con un círculo", "Señala una pieza que eliminarías"], time: "15 min" },
    { title: "Una sola lámina", brief: "Diseña un soporte para libros a partir de una única lámina de metal cortada y doblada.", constraints: ["Sin soldaduras", "Máximo tres pliegues", "Anota el espesor"], time: "20 min" },
    { title: "Pensar en el molde", brief: "Redibuja una silla de plástico que conozcas indicando dónde iría la línea de partición del molde.", constraints: ["Señala ángulos de desmoldeo", "Marca nervios de refuerzo", "Propón un cambio"], time: "20 min" },
    { title: "Unión sin herrajes", brief: "Inventa una unión para dos tablones que no use tornillos, clavos ni pegamento.", constraints: ["Debe desmontarse", "Dibuja dos vistas", "Escribe qué carga soporta"], time: "25 min" },
  ],
  color: [
    { title: "Tres acabados, un objeto", brief: "Dibuja el mismo taburete tres veces con acabados distintos y escribe qué emoción transmite cada uno.", constraints: ["Mate, brillante y texturizado", "Una palabra por versión", "Elige un usuario para cada uno"], time: "15 min" },
    { title: "Paleta de la calle", brief: "Fotografía o recuerda cinco colores de tu camino de hoy y conviértelos en una paleta CMF para una lámpara.", constraints: ["Asigna material a cada color", "Un color dominante", "Un acento pequeño"], time: "15 min" },
    { title: "Forma en 3 gestos", brief: "Diseña un objeto usando solo tres gestos formales: una curva, un corte y una extrusión.", constraints: ["Sin ornamentos", "Dibuja en perspectiva", "Nombra el objeto"], time: "20 min" },
    { title: "Proporción áurea doméstica", brief: "Mide un mueble de tu casa y rediseña sus proporciones para que se sienta más ligero.", constraints: ["Anota las medidas originales", "Cambia solo dos dimensiones", "Compara antes y después"], time: "20 min" },
  ],
  nature: [
    { title: "Estructura de hoja", brief: "Observa las nervaduras de una hoja y tradúcelas a la estructura inferior de una mesa.", constraints: ["Dibuja la hoja primero", "Identifica la nervadura principal", "Propón un material"], time: "20 min" },
    { title: "Unión de semilla", brief: "Investiga cómo se dispersa una semilla y diseña un mecanismo de unión inspirado en ella.", constraints: ["Describe el principio en una frase", "Boceto de la unión", "Un uso en mobiliario"], time: "25 min" },
    { title: "Mueble que vuelve a la tierra", brief: "Diseña una pequeña mesa auxiliar 100 % compostable o reciclable.", constraints: ["Máximo dos materiales", "Explica su fin de vida", "Sin adhesivos tóxicos"], time: "20 min" },
    { title: "Panal y repetición", brief: "Usa la geometría hexagonal para diseñar un sistema de almacenaje de pared.", constraints: ["Un módulo base", "Muestra cómo se conectan", "Dibuja una combinación de 7 módulos"], time: "20 min" },
  ],
  experimental: [
    { title: "Al revés", brief: "Elige una silla y rediseñala invirtiendo una de sus reglas (por ejemplo, el respaldo como soporte principal).", constraints: ["Escribe la regla que rompes", "Un boceto rápido", "Un posible problema"], time: "15 min" },
    { title: "Material equivocado", brief: "Diseña una estantería en un material que nunca se usaría para eso.", constraints: ["Justifica en tres líneas", "Resuelve una limitación", "Dale un nombre provocador"], time: "20 min" },
    { title: "Objeto de dos vidas", brief: "Crea un mueble que cambie de función al girarlo 90°.", constraints: ["Dibuja ambas posiciones", "Marca el centro de gravedad", "Define el usuario"], time: "25 min" },
    { title: "Prototipo de 5 minutos", brief: "Con papel, cinta y clips construye la maqueta de una lámpara en menos de cinco minutos.", constraints: ["Fotografíala", "Escribe qué aprendiste", "Propón la siguiente versión"], time: "10 min" },
  ],
  furniture: [
    { title: "Escritorio de 60 cm", brief: "Diseña un puesto de trabajo completo que quepa en 60 × 60 cm.", constraints: ["Incluye almacenaje", "Piensa en la iluminación", "Indica la altura de trabajo"], time: "25 min" },
    { title: "Sistema de tres piezas", brief: "Crea un sistema modular con solo tres tipos de pieza que pueda ser banco, mesa y estantería.", constraints: ["Dibuja las tres piezas", "Muestra tres configuraciones", "Una unión común"], time: "25 min" },
    { title: "Silla para 2035", brief: "¿Cómo trabajaremos en diez años? Diseña la silla que lo acompañe.", constraints: ["Una hipótesis de futuro", "Un material actual", "Un detalle ergonómico"], time: "20 min" },
    { title: "Colección en una línea", brief: "Dibuja una silla, una mesa y una lámpara que pertenezcan claramente a la misma familia.", constraints: ["Un rasgo formal común", "Un material común", "Nombra la colección"], time: "20 min" },
  ],
  slow: [
    { title: "Dibujo de observación", brief: "Dibuja durante 15 minutos un objeto artesanal de tu casa, sin borrar.", constraints: ["Una sola línea continua", "Anota tres detalles de fabricación", "Escribe quién crees que lo hizo"], time: "15 min" },
    { title: "Biografía de un objeto", brief: "Escribe la historia de un mueble de tu familia: de dónde vino, quién lo usó y qué le pasó.", constraints: ["Máximo 100 palabras", "Un boceto", "¿Qué conservarías en un rediseño?"], time: "20 min" },
    { title: "Técnica tradicional, uso nuevo", brief: "Elige una técnica artesanal mexicana (tejido de palma, laca, barro) y aplícala a un objeto contemporáneo.", constraints: ["Investiga el proceso", "Respeta su origen", "Dibuja el objeto"], time: "25 min" },
    { title: "Copia para aprender", brief: "Redibuja un mueble clásico de memoria y luego compáralo con una foto real.", constraints: ["Sin mirar al principio", "Marca las diferencias", "¿Qué no habías visto?"], time: "20 min" },
  ],
  review: [
    { title: "Tres de la semana", brief: "Vuelve a tus lecturas de la semana y elige tres que combinarías en un solo concepto.", constraints: ["Una frase por referencia", "Un boceto de síntesis", "Un nombre para la idea"], time: "20 min" },
    { title: "Lo que me quedó", brief: "Escribe en tu cuaderno qué viste esta semana que cambió tu forma de mirar un objeto.", constraints: ["Máximo 5 líneas", "Una imagen o boceto", "Una pregunta para el lunes"], time: "10 min" },
    { title: "Mejora tu boceto", brief: "Recupera un boceto de esta semana y haz una segunda versión mejorada.", constraints: ["Mantén una idea", "Cambia una proporción", "Anota qué mejoró"], time: "20 min" },
    { title: "El objeto favorito", brief: "Elige el objeto que más te gustó de la semana y analízalo en problema, principio y material.", constraints: ["Tres columnas", "Un detalle dibujado", "¿Qué harías distinto?"], time: "15 min" },
  ],
};
