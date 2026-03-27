const MIN_RATING = 1;
const MAX_RATING = 99;

const HEIGHT_MIN_CM = 160;
const HEIGHT_MAX_CM = 220;

const WEIGHT_MIN_KG = 50;
const WEIGHT_MAX_KG = 150;

export function mapSizeToCm(size: number): number {
  return Math.round(
    HEIGHT_MIN_CM + ((size - MIN_RATING) * (HEIGHT_MAX_CM - HEIGHT_MIN_CM)) / (MAX_RATING - MIN_RATING),
  );
}

export function mapWeightToKg(weight: number): number {
  return Math.round(
    WEIGHT_MIN_KG + ((weight - MIN_RATING) * (WEIGHT_MAX_KG - WEIGHT_MIN_KG)) / (MAX_RATING - MIN_RATING),
  );
}

export function formatSize(size: number): string {
  return `${mapSizeToCm(size)} cm`;
}

export function formatWeight(weight: number): string {
  return `${mapWeightToKg(weight)} kg`;
}
