import { getApp } from "./loadModelTo";
import * as PIXI from "pixi.js";

export function addOrChangeSubtitle(text: string, duration: number = 10) {
  const app = getApp();
  if (!app || !app.stage) return;
  const showText = text.replace(/[\n\t]/g, " ");
  let subtitleTextObj: PIXI.Text | null = null;

  // create a text style
  const style = new PIXI.TextStyle({
    fontFamily: "Times New Roman",
    fontSize: 36,
    fontWeight: "bold", // 设置为粗体
    fill: 0xf28fb1, // 浅粉色
    stroke: 0xc25283, // 深粉色
    strokeThickness: 2, // 边框宽度
    align: "center",
    wordWrap: true,
    wordWrapWidth: app.view.width - 150,
    lineHeight: 48,
  });

  // create a text object
  subtitleTextObj = new PIXI.Text(showText, style);

  // set the text position
  subtitleTextObj.x = (app.view.width - subtitleTextObj.width) / 2;
  subtitleTextObj.y = ((app.view.height - subtitleTextObj.height) / 4) * 3;

  // add the text to the stage
  app.stage.addChild(subtitleTextObj);

  const timeout = setTimeout(() => {
    if (app) app.stage.removeChild(subtitleTextObj);
  }, duration * 1000); // hard code, 10 second

  return () => {
    clearTimeout(timeout);
    if (app && app.stage) app.stage.removeChild(subtitleTextObj);
  };
}
