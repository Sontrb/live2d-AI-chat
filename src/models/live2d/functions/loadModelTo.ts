import { RefObject } from "react";
import { Application } from "@pixi/app";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";
import { ICanvas } from "pixi.js";

let app: Application<ICanvas> | null = null;
let canvas: HTMLCanvasElement | null = null;

// load model to canvas
export function loadModelTo(stage: RefObject<HTMLElement>, model: Live2DModel) {
  if (!model || !stage.current) {
    console.log("no model or no stage");
    return;
  }
  canvas = document.createElement("canvas");
  stage.current.appendChild(canvas);
  app = new Application({
    view: canvas,
    width: stage.current.clientWidth,
    height: stage.current.clientHeight,
  });
  if (app.renderer?.view?.style?.touchAction) {
    app.renderer.view.style.touchAction = "auto";
  }
  app.stage.addChild(model);

  model.interactive = false; // disable mouse interaction

  // interaction
  // model.on("hit", (hitAreas) => {
  //   if (hitAreas.includes("body")) {
  //     model.motion("Tap");
  //   }
  // });

  // resize
  const scaleX = canvas.width / model.width;
  const scaleY = canvas.height / model.height;
  model.scale.set(Math.min(scaleX, scaleY) * 2);
  model.x = canvas.width / 2 - model.width / 2;
  model.y = canvas.height; // model is under the stage first

  return () => {
    if (app) app.destroy();
    if (stage.current && canvas) stage.current.removeChild(canvas);
  };
}

export function modelShowsUp(model: Live2DModel) {
  if (canvas) {
    // Assuming the initial y position of the model is model.y, and the target y position is 0, with an interval of 10ms
    const startY = model.y; // Starting position
    const endY = 0; // Target position
    const duration = 1000; // Total duration in milliseconds
    const startTime = Date.now(); // Record the start time
    const interval = setInterval(() => {
      // The difference between the current time and the start time
      const elapsedTime = Date.now() - startTime;
      // Calculate the progress percentage, using an ease-in-out easing function
      let progress = elapsedTime / duration;
      // Easing function, accelerates first and then decelerates
      if (progress > 1) progress = 1;
      const easeProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress); // ease-in-out formula
      // Update the y position
      model.y = startY - (startY - endY) * easeProgress;
      // If the target position is reached, clear the interval
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 10);
  }
}

export function getApp(): Application<ICanvas> | null {
  return app;
}
