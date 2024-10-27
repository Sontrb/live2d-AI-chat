import { RefObject } from "react";
import { Application } from "@pixi/app";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";
import { ICanvas } from "pixi.js";

let app: Application<ICanvas> | null = null;

// load model to canvas
export function loadModelTo(stage: RefObject<HTMLElement>, model: Live2DModel) {
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
