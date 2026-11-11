// ===== Configuración editable =====

// Umbrales (en % de aciertos) para valorar el resultado.
// >= bueno  -> "Bueno"   |   >= regular -> "Regular"   |   resto -> "Malo"
const THRESHOLDS = { bueno: 80, regular: 50 };

// Países del test. `id` = nombre en el mapa de Natural Earth (inglés).
// anchor = [longitud, latitud] donde se pinta el selector.
// hint   = desplazamiento inicial en píxeles (para países pequeños, que apuntan al mar).
// micro  = país diminuto: se marca con un punto grande.
const COUNTRIES = [
  { id: 'Albania', es: 'Albania', cap: 'Tirana', anchor: [20.0, 41.0] },
  { id: 'Andorra', es: 'Andorra', cap: 'Andorra la Vella', anchor: [1.55, 42.55], micro: true, hint: [-90, 60] },
  { id: 'Austria', es: 'Austria', cap: 'Viena', anchor: [14.3, 47.4] },
  { id: 'Belarus', es: 'Bielorrusia', cap: 'Minsk', anchor: [28.0, 53.5] },
  { id: 'Belgium', es: 'Bélgica', cap: 'Bruselas', anchor: [4.6, 50.6] },
  { id: 'Bosnia and Herz.', es: 'Bosnia y Herzegovina', cap: 'Sarajevo', anchor: [17.8, 44.2] },
  { id: 'Bulgaria', es: 'Bulgaria', cap: 'Sofía', anchor: [25.2, 42.8] },
  { id: 'Croatia', es: 'Croacia', cap: 'Zagreb', anchor: [16.2, 45.3] },
  { id: 'Czechia', es: 'República Checa', cap: 'Praga', anchor: [15.5, 49.8] },
  { id: 'Denmark', es: 'Dinamarca', cap: 'Copenhague', anchor: [9.3, 56.0] },
  { id: 'Estonia', es: 'Estonia', cap: 'Tallin', anchor: [25.5, 58.7] },
  { id: 'Finland', es: 'Finlandia', cap: 'Helsinki', anchor: [26.0, 63.5] },
  { id: 'France', es: 'Francia', cap: 'París', anchor: [2.5, 46.7] },
  { id: 'Germany', es: 'Alemania', cap: 'Berlín', anchor: [10.3, 51.2] },
  { id: 'Greece', es: 'Grecia', cap: 'Atenas', anchor: [22.0, 39.5] },
  { id: 'Hungary', es: 'Hungría', cap: 'Budapest', anchor: [19.5, 47.1] },
  { id: 'Iceland', es: 'Islandia', cap: 'Reikiavik', anchor: [-18.8, 64.9] },
  { id: 'Ireland', es: 'Irlanda', cap: 'Dublín', anchor: [-8.0, 53.2] },
  { id: 'Italy', es: 'Italia', cap: 'Roma', anchor: [12.4, 42.8] },
  { id: 'Kosovo', es: 'Kosovo', cap: 'Pristina', anchor: [20.9, 42.6], micro: true },
  { id: 'Latvia', es: 'Letonia', cap: 'Riga', anchor: [25.0, 56.9] },
  { id: 'Liechtenstein', es: 'Liechtenstein', cap: 'Vaduz', anchor: [9.55, 47.15], micro: true, hint: [-30, -70] },
  { id: 'Lithuania', es: 'Lituania', cap: 'Vilna', anchor: [23.9, 55.3] },
  { id: 'Luxembourg', es: 'Luxemburgo', cap: 'Luxemburgo', anchor: [6.1, 49.8], micro: true, hint: [-80, -10] },
  { id: 'Malta', es: 'Malta', cap: 'La Valeta', anchor: [14.4, 35.9], micro: true, hint: [0, 55] },
  { id: 'Moldova', es: 'Moldavia', cap: 'Chisináu', anchor: [28.5, 47.2] },
  { id: 'Monaco', es: 'Mónaco', cap: 'Mónaco', anchor: [7.42, 43.74], micro: true, hint: [-20, 90] },
  { id: 'Montenegro', es: 'Montenegro', cap: 'Podgorica', anchor: [19.2, 42.8], micro: true },
  { id: 'Netherlands', es: 'Países Bajos', cap: 'Ámsterdam', anchor: [5.5, 52.2] },
  { id: 'Macedonia', es: 'Macedonia del Norte', cap: 'Skopie', anchor: [21.7, 41.6] },
  { id: 'Norway', es: 'Noruega', cap: 'Oslo', anchor: [9.5, 61.5] },
  { id: 'Poland', es: 'Polonia', cap: 'Varsovia', anchor: [19.4, 52.1] },
  { id: 'Portugal', es: 'Portugal', cap: 'Lisboa', anchor: [-8.0, 39.6] },
  { id: 'Romania', es: 'Rumanía', cap: 'Bucarest', anchor: [24.9, 45.9] },
  { id: 'Russia', es: 'Rusia', cap: 'Moscú', anchor: [38.0, 56.5] },
  { id: 'San Marino', es: 'San Marino', cap: 'San Marino', anchor: [12.46, 43.94], micro: true, hint: [70, 30] },
  { id: 'Serbia', es: 'Serbia', cap: 'Belgrado', anchor: [20.8, 44.0] },
  { id: 'Slovakia', es: 'Eslovaquia', cap: 'Bratislava', anchor: [19.5, 48.7] },
  { id: 'Slovenia', es: 'Eslovenia', cap: 'Liubliana', anchor: [14.8, 46.1] },
  { id: 'Spain', es: 'España', cap: 'Madrid', anchor: [-3.7, 40.2] },
  { id: 'Sweden', es: 'Suecia', cap: 'Estocolmo', anchor: [16.0, 62.3] },
  { id: 'Switzerland', es: 'Suiza', cap: 'Berna', anchor: [8.2, 46.8] },
  { id: 'Ukraine', es: 'Ucrania', cap: 'Kiev', anchor: [31.0, 49.2] },
  { id: 'United Kingdom', es: 'Reino Unido', cap: 'Londres', anchor: [-2.0, 53.0] },
];
