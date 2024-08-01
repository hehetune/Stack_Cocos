import { Color } from "cc";
import { ColorUtil } from "./ColorPicker";
import { getRandomInt } from "./Utils";

export class GameTheme {
  private static H: number = 0;
  private static S: number = 62;
  private static L: number = 62;

  private static maxColor: number = 21;
  private static hStep: number = 20;

  private static themes: Color[] = [];
  private static getThemes(): Color[] {
    if (this.themes.length == 0) {
      this.generateRandom();
    }
    return this.themes;
  }

  public static getTheme(index: number) {
    let highestIndex = Math.floor(this.maxColor / 2);
    index += highestIndex;
    index = Math.min(Math.max(0, index), this.maxColor - 1);

    return this.getThemes()[index];
  }

  private static generateRandom(): void {
    this.H = getRandomInt(1, 360);
    for (let i = 0; i < this.maxColor; i++) {
      this.H = (this.H + this.hStep) % 360;
      let color: Color = ColorUtil.hslToRgb(this.H, this.S, this.L);
      this.themes.push(color);
    }
  }

  public static changeTheme(): void {
    this.themes.shift();
    this.H = (this.H + this.hStep) % 360;
    this.themes.push(ColorUtil.hslToRgb(this.H, this.S, this.L));
  }
}
