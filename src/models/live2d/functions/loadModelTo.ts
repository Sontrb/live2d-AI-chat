import { MutableRefObject } from "react";
import { Application } from "@pixi/app";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";

// load model to canvas
function loadModelTo(stage: MutableRefObject<HTMLElement>, model: Live2DModel) {
  if (!model || !stage.current) {
    console.log("no model or no stage");
    return;
  }
  const newCanvas = document.createElement("canvas");
  stage.current.appendChild(newCanvas);
  const app = new Application({
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
  model.scale.set(Math.min(scaleX, scaleY)*2);
  model.x = newCanvas.width / 2 - model.width / 2;

  return () => {
    app.destroy();
    stage.current.removeChild(newCanvas);
  };
}

export default loadModelTo;
