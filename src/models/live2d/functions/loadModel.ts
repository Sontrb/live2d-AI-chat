import { Ticker } from "@pixi/ticker";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";

// load model
async function loadModel(
  // modelName = "./public/assets/haru/haru_greeter_t03.model3.json"
  modelName = "/public/assets/IceGIrl/IceGirl-all.model3.json"
) {
  return await Live2DModel.from(modelName, {
    // register Ticker for model
    ticker: Ticker.shared,
  });
}

export default loadModel;