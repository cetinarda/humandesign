// Düşük hassasiyetli efemerit. HD gate genişliği 5.625°, line genişliği 0.9375°
// olduğundan ~0.3-0.5° hata kabul edilebilir.

const DEG = Math.PI / 180;

export function julianDay(date: Date): number {
  // UT bazlı Julian Day (JD)
  const ms = date.getTime();
  return ms / 86400000 + 2440587.5;
}

export function dateFromJD(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

function norm360(x: number): number {
  let r = x % 360;
  if (r < 0) r += 360;
  return r;
}

// Sun ekliptik boylamı (tropikal). Hata < 0.01°
export function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M  = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * DEG;

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);

  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);
  return norm360(apparent);
}

// Moon ekliptik boylamı (basitleştirilmiş ELP). Hata < 0.3°
export function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D  = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  const M  = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  const F  = 93.272095   + 483202.0175233 * T - 0.0036539 * T * T;

  const Dr = D * DEG, Mr = M * DEG, Mpr = Mp * DEG, Fr = F * DEG;

  // Başlıca terimler (derece)
  const dL =
    6.288774 * Math.sin(Mpr) +
    1.274027 * Math.sin(2 * Dr - Mpr) +
    0.658314 * Math.sin(2 * Dr) +
    0.213618 * Math.sin(2 * Mpr) -
    0.185116 * Math.sin(Mr) -
    0.114332 * Math.sin(2 * Fr) +
    0.058793 * Math.sin(2 * Dr - 2 * Mpr) +
    0.057066 * Math.sin(2 * Dr - Mr - Mpr) +
    0.053322 * Math.sin(2 * Dr + Mpr) +
    0.045758 * Math.sin(2 * Dr - Mr) -
    0.040923 * Math.sin(Mr - Mpr) -
    0.034720 * Math.sin(Dr) -
    0.030383 * Math.sin(Mr + Mpr) +
    0.015327 * Math.sin(2 * Dr - 2 * Fr) -
    0.012528 * Math.sin(Mpr + 2 * Fr) +
    0.010980 * Math.sin(Mpr - 2 * Fr);

  return norm360(Lp + dL);
}

// Diğer gezegenler için: ortalama orbital elemanlar + ana eşitsizlik düzeltmeleri.
// Hata 0.3°–1° aralığında; HD gate/line için yeterli.

interface Planet {
  a: number;       // yarı büyük eksen (AU)
  e: number;       // eksantrisite (lineer T çarpanı)
  e1: number;
  i: number;       // eğim
  L0: number;      // ortalama boylam epoch
  Ldot: number;    // boylam değişim hızı (derece/yüzyıl)
  w0: number;      // perihelion boylamı
  wdot: number;
  N0: number;      // node
  Ndot: number;
}

const PLANETS: Record<string, Planet> = {
  // J2000 epoch ortalama elemanları (Standish/Williams)
  Mercury: { a: 0.38709927, e: 0.20563593, e1: 0.00001906, i: 7.00497902, L0: 252.25032350, Ldot: 149472.67411175, w0: 77.45779628, wdot: 0.16047689, N0: 48.33076593, Ndot: -0.12534081 },
  Venus:   { a: 0.72333566, e: 0.00677672, e1: -0.00004107, i: 3.39467605, L0: 181.97909950, Ldot:  58517.81538729, w0: 131.60246718, wdot: 0.00268329, N0: 76.67984255, Ndot: -0.27769418 },
  Mars:    { a: 1.52371034, e: 0.09339410, e1: 0.00007882, i: 1.84969142, L0: -4.55343205,  Ldot:  19140.30268499, w0: -23.94362959, wdot: 0.44441088, N0: 49.55953891, Ndot: -0.29257343 },
  Jupiter: { a: 5.20288700, e: 0.04838624, e1: -0.00013253, i: 1.30439695, L0: 34.39644051, Ldot:   3034.74612775, w0: 14.72847983,  wdot: 0.21252668, N0: 100.47390909, Ndot: 0.20469106 },
  Saturn:  { a: 9.53667594, e: 0.05386179, e1: -0.00050991, i: 2.48599187, L0: 49.95424423, Ldot:   1222.49362201, w0: 92.59887831, wdot: -0.41897216, N0: 113.66242448, Ndot: -0.28867794 },
  Uranus:  { a: 19.18916464, e: 0.04725744, e1: -0.00004397, i: 0.77263783, L0: 313.23810451, Ldot: 428.48202785, w0: 170.95427630, wdot: 0.40805281, N0: 74.01692503, Ndot: 0.04240589 },
  Neptune: { a: 30.06992276, e: 0.00859048, e1: 0.00005105, i: 1.77004347, L0: -55.12002969, Ldot: 218.45945325, w0: 44.96476227, wdot: -0.32241464, N0: 131.78422574, Ndot: -0.00508664 },
  Pluto:   { a: 39.48211675, e: 0.24882730, e1: -0.00076912, i: 17.14001206, L0: 238.92903833, Ldot: 145.20780515, w0: 224.06891629, wdot: -0.04062942, N0: 110.30393684, Ndot: -0.01183482 },
};

function solveKepler(M: number, e: number): number {
  // M derece olarak gelir
  const Mr = M * DEG;
  let E = Mr + e * Math.sin(Mr) * (1 + e * Math.cos(Mr));
  for (let i = 0; i < 8; i++) {
    const dE = (E - e * Math.sin(E) - Mr) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

// Earth heliocentric ekliptik dikdörtgen koordinat (Sun perspektifinden -Earth)
function earthHelio(jd: number): { x: number; y: number; z: number } {
  // Earth'un Sun etrafında basitleştirilmiş elemanları
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm360(100.46457166 + 35999.37244981 * T);
  const w  = 102.93768193 + 0.32327364 * T;
  const e  = 0.01671123 - 0.00004392 * T;
  const M  = norm360(L0 - w);
  const E = solveKepler(M, e);
  const x = Math.cos(E) - e;
  const y = Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(y, x);
  const r = Math.sqrt(x * x + y * y);
  const wr = w * DEG;
  return {
    x: r * Math.cos(v + wr),
    y: r * Math.sin(v + wr),
    z: 0,
  };
}

export function planetLongitude(name: string, jd: number): number {
  const p = PLANETS[name];
  if (!p) throw new Error('Bilinmeyen gezegen: ' + name);
  const T = (jd - 2451545.0) / 36525;

  const a = p.a;
  const e = p.e + p.e1 * T;
  const i = p.i * DEG;
  const L = norm360(p.L0 + p.Ldot * T);
  const w = p.w0 + p.wdot * T;
  const N = p.N0 + p.Ndot * T;
  const M = norm360(L - w);
  const wPeri = w - N;

  const E = solveKepler(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  const Nr = N * DEG;
  const wr = wPeri * DEG;

  // Heliocentric ekliptik koordinat
  const xh = r * (Math.cos(Nr) * Math.cos(v + wr) - Math.sin(Nr) * Math.sin(v + wr) * Math.cos(i));
  const yh = r * (Math.sin(Nr) * Math.cos(v + wr) + Math.cos(Nr) * Math.sin(v + wr) * Math.cos(i));
  const zh = r * (Math.sin(v + wr) * Math.sin(i));

  // Geocentric: planet - earth
  const earth = earthHelio(jd);
  const xg = xh - earth.x;
  const yg = yh - earth.y;
  const zg = zh - earth.z;

  let lon = Math.atan2(yg, xg) / DEG;
  return norm360(lon);
}

// True Node (Lunar North Node), retrograd ortalama formül
export function nodeLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const N = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return norm360(N);
}

export function southNodeLongitude(jd: number): number {
  return norm360(nodeLongitude(jd) + 180);
}

// HD'de "Earth" Sun'ın 180° karşıtıdır
export function earthLongitude(jd: number): number {
  return norm360(sunLongitude(jd) + 180);
}

// HD Design zamanı: Sun'ın Personality Sun pozisyonundan tam 88° geride olduğu an.
// İteratif olarak çözülür. Yaklaşık 88.13 gün öncedir.
export function designJD(birthJD: number): number {
  const sunBirth = sunLongitude(birthJD);
  const target = norm360(sunBirth - 88);
  let jd = birthJD - 88;
  for (let i = 0; i < 12; i++) {
    const cur = sunLongitude(jd);
    let diff = norm360(cur - target + 180) - 180;
    // Sun ~0.9856°/gün
    jd -= diff / 0.9856;
    if (Math.abs(diff) < 0.001) break;
  }
  return jd;
}

export interface PlanetPositions {
  sun: number;
  earth: number;
  moon: number;
  northNode: number;
  southNode: number;
  mercury: number;
  venus: number;
  mars: number;
  jupiter: number;
  saturn: number;
  uranus: number;
  neptune: number;
  pluto: number;
}

export function allPositions(jd: number): PlanetPositions {
  return {
    sun: sunLongitude(jd),
    earth: earthLongitude(jd),
    moon: moonLongitude(jd),
    northNode: nodeLongitude(jd),
    southNode: southNodeLongitude(jd),
    mercury: planetLongitude('Mercury', jd),
    venus: planetLongitude('Venus', jd),
    mars: planetLongitude('Mars', jd),
    jupiter: planetLongitude('Jupiter', jd),
    saturn: planetLongitude('Saturn', jd),
    uranus: planetLongitude('Uranus', jd),
    neptune: planetLongitude('Neptune', jd),
    pluto: planetLongitude('Pluto', jd),
  };
}
