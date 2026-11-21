const GOLDEN_ANGLE = 137.508;
const LIGHTNESS_STEPS = [50, 42, 58];

export function getColor(index: number): string {
  const hue = (index * GOLDEN_ANGLE) % 360;
  const saturation = 70;
  const lightness =
    LIGHTNESS_STEPS[Math.floor(index / 8) % LIGHTNESS_STEPS.length];

  return `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness}%)`;
}
