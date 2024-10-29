import { Ticker } from "@pixi/ticker";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";

// load model
export default async function loadModel(
  modelName = "./assets/IceGIrl/icegirl.model3.json"
) {
  return await Live2DModel.from(modelName, {
    // register Ticker for model
    ticker: Ticker.shared,
  });
}