import { Color } from "cc";

export class ColorUtil {
  // Helper function to convert HSL to RGBA
  public static hslToRgb(h: number, s: number, l: number): Color {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const aFactor = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - aFactor * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);

    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));

    return new Color(r, g, b);
  }
}
