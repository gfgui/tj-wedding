/**
 * Filtro polaroide.
 *
 * A previa ao vivo e a foto gravada precisam bater. Para isso as duas usam a
 * mesma receita, em tres camadas que existem nos dois mundos:
 *
 *   1. cor      — CSS `filter` no video / matriz equivalente no canvas
 *   2. veu creme — overlay rgba (levanta os pretos, o "desbotado" do polaroide)
 *   3. vinheta  — gradiente radial
 *
 * As funcoes de cor do CSS sao definidas por matriz na spec de Filter Effects,
 * entao da para reproduzi-las exatamente no canvas em vez de chutar valores.
 * Nada de grao: nao ha como reproduzir ruido identico na previa em CSS, e um
 * efeito que so aparece depois de tirar a foto quebra a promessa da previa.
 */

const SEPIA = 0.28;
const SATURATE = 1.25;
const CONTRAST = 0.92;
const BRIGHTNESS = 1.06;

/** Usado no `filter` do elemento de video da previa. */
export const POLAROID_CSS_FILTER = `sepia(${SEPIA}) saturate(${SATURATE}) contrast(${CONTRAST}) brightness(${BRIGHTNESS})`;

const VEIL = { r: 249, g: 245, b: 238, alpha: 0.05 } as const;

export const POLAROID_VEIL_CSS = `rgba(${VEIL.r}, ${VEIL.g}, ${VEIL.b}, ${VEIL.alpha})`;

const VIGNETTE_INNER_STOP = 0.45;
const VIGNETTE_ALPHA = 0.28;

export const POLAROID_VIGNETTE_CSS = `radial-gradient(ellipse at center, rgba(44,24,16,0) ${
  VIGNETTE_INNER_STOP * 100
}%, rgba(44,24,16,${VIGNETTE_ALPHA}) 100%)`;

/**
 * Matriz combinada de sepia + saturate, nessa ordem, como o CSS aplicaria.
 * Ambas sao lineares em sRGB, entao o produto das duas resolve as duas etapas
 * numa multiplicacao so por pixel.
 */
function buildColorMatrix(): number[] {
  // sepia(a) interpola entre a identidade e a matriz sepia da spec.
  const a = SEPIA;
  const sepia = [
    1 - 0.607 * a,
    0.769 * a,
    0.189 * a,
    0.349 * a,
    1 - 0.314 * a,
    0.168 * a,
    0.272 * a,
    0.534 * a,
    1 - 0.869 * a,
  ];

  const s = SATURATE;
  const saturate = [
    0.213 + 0.787 * s,
    0.715 - 0.715 * s,
    0.072 - 0.072 * s,
    0.213 - 0.213 * s,
    0.715 + 0.285 * s,
    0.072 - 0.072 * s,
    0.213 - 0.213 * s,
    0.715 - 0.715 * s,
    0.072 + 0.928 * s,
  ];

  // saturate · sepia
  const out = new Array<number>(9).fill(0);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += saturate[row * 3 + k] * sepia[k * 3 + col];
      }
      out[row * 3 + col] = sum;
    }
  }
  return out;
}

const COLOR_MATRIX = buildColorMatrix();

/**
 * contrast e brightness sao escalares por canal, entao cabem numa tabela de
 * 256 posicoes em vez de serem recalculados em cada um dos milhoes de pixels.
 */
const TONE_LUT = (() => {
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    const normalized = i / 255;
    const contrasted = CONTRAST * (normalized - 0.5) + 0.5;
    lut[i] = Math.round(
      Math.min(1, Math.max(0, contrasted * BRIGHTNESS)) * 255,
    );
  }
  return lut;
})();

/**
 * Camada de cor, no lugar, sobre um buffer RGBA. Separada do canvas para poder
 * ser conferida contra o resultado nativo do `filter` do navegador — e o que
 * garante que a previa em CSS descreve a foto que vai ser gravada.
 */
export function applyPolaroidColor(data: Uint8ClampedArray): void {
  const [m0, m1, m2, m3, m4, m5, m6, m7, m8] = COLOR_MATRIX;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i] = TONE_LUT[clamp255(m0 * r + m1 * g + m2 * b)];
    data[i + 1] = TONE_LUT[clamp255(m3 * r + m4 * g + m5 * b)];
    data[i + 2] = TONE_LUT[clamp255(m6 * r + m7 * g + m8 * b)];
  }
}

function applyColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const image = ctx.getImageData(0, 0, width, height);
  applyPolaroidColor(image.data);
  ctx.putImageData(image, 0, 0);
}

function clamp255(value: number): number {
  return value < 0 ? 0 : value > 255 ? 255 : Math.round(value);
}

/** Desenha veu e vinheta — as camadas que a previa mostra por cima do video. */
function applyOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.fillStyle = POLAROID_VEIL_CSS;
  ctx.fillRect(0, 0, width, height);

  // `radial-gradient` do CSS usa farthest-corner por padrao: o gradiente
  // termina no canto, nao na borda. Usar max(w,h)/2 deixaria a vinheta gravada
  // visivelmente mais fechada do que a que aparece na previa.
  const radius = Math.hypot(width, height) / 2;
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    radius * VIGNETTE_INNER_STOP,
    width / 2,
    height / 2,
    radius,
  );
  gradient.addColorStop(0, "rgba(44,24,16,0)");
  gradient.addColorStop(1, `rgba(44,24,16,${VIGNETTE_ALPHA})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/** Grava o filtro nos pixels do canvas, no lugar. */
export function bakePolaroid(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  applyColor(ctx, canvas.width, canvas.height);
  applyOverlays(ctx, canvas.width, canvas.height);
}
