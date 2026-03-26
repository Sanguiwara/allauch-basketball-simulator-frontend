import {formatSize, formatWeight, mapSizeToCm, mapWeightToKg} from './player-metrics';

describe('player-metrics utils', () => {
  it('maps size rating to centimeters', () => {
    expect(mapSizeToCm(1)).toBe(160);
    expect(mapSizeToCm(50)).toBe(190);
    expect(mapSizeToCm(99)).toBe(220);
  });

  it('maps weight rating to kilograms', () => {
    expect(mapWeightToKg(1)).toBe(50);
    expect(mapWeightToKg(50)).toBe(100);
    expect(mapWeightToKg(99)).toBe(150);
  });

  it('formats size and weight with units', () => {
    expect(formatSize(1)).toBe('160 cm');
    expect(formatWeight(99)).toBe('150 kg');
  });
});
