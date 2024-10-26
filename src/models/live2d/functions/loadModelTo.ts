import { RefObject } from "react";
import { Application } from "@pixi/app";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";
import { ICanvas } from "pixi.js";
import * as PIXI from "pixi.js";

let app: Application<ICanvas> | null = null;

// load model to canvas
export default function loadModelTo(
  stage: RefObject<HTMLElement>,
  model: Live2DModel
) {
  if (!model || !stage.current) {
    console.log("no model or no stage");
    return;
  }
  const newCanvas = document.createElement("canvas");
  stage.current.appendChild(newCanvas);
  app = new Application({
    view: newCanvas,
    width: stage.current.clientWidth,
    height: stage.current.clientHeight,
  });
  app.stage.addChild(model);

  model.interactive = false; // disable mouse interaction

  // interaction
  // model.on("hit", (hitAreas) => {
  //   if (hitAreas.includes("body")) {
  //     model.motion("Tap");
  //   }
  // });

  // resize
  const scaleX = newCanvas.width / model.width;
  const scaleY = newCanvas.height / model.height;
  model.scale.set(Math.min(scaleX, scaleY) * 2);
  model.x = newCanvas.width / 2 - model.width / 2;

  return () => {
    if (app) app.destroy();
    if (stage.current) stage.current.removeChild(newCanvas);
  };
}

export function getApp(): Application<ICanvas> | null {
  return app;
}

export function addOrChangeSubtileOfApp(text: string) {
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
  }, 10 * 1000); // hard code, 10 second

  return () => {
    clearTimeout(timeout);
    if (app && app.stage) app.stage.removeChild(subtitleTextObj);
  };
}
