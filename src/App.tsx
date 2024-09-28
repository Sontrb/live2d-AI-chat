import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Application } from "@pixi/app";
// import { Ticker, TickerPlugin } from "@pixi/ticker";
// import { InteractionManager } from "@pixi/interaction";
import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";
import { Ticker } from "pixi.js";
import useScreenSize from "./hook/useScreenSize";
import { ScreenSize } from "./hook/useScreenSize";

// load model
async function loadModel(
  modelName = "./public/assets/haru/haru_greeter_t03.model3.json"
) {
  return await Live2DModel.from(modelName, {
    // register Ticker for model
    ticker: Ticker.shared,
  });
}

// speak
function handleSpeak(audio_link: string, model: Live2DModel) {
  console.log("speak");
  if (model === null || model === undefined) {
    return;
  }
  // const audio_link =
  //   "https://cdn.jsdelivr.net/gh/RaSan147/pixi-live2d-display@v1.0.3/playground/test.mp3"; // 音频链接地址 [可选参数，可以为null或空] [相对或完整url路径] [mp3或wav文件]
  const volume = 1; // 声音大小 [可选参数，可以为null或空][0.0-1.0]
  const expression = 4; // 模型表情 [可选参数，可以为null或空] [index | expression表情名称]
  const resetExpression = true; // 是否在动画结束后将表情expression重置为默认值 [可选参数，可以为null或空] [true | false] [default: true]
  const crossOrigin = "anonymous"; // 使用不同来源的音频 [可选] [default: null]

  model.speak(audio_link, {
    volume: volume,
    expression: expression,
    resetExpression: resetExpression,
    crossOrigin: crossOrigin,
  });

  // 或者如果您想保留某些默认设置
  model.speak(audio_link);
  model.speak(audio_link, { volume: volume });
  model.speak(audio_link, {
    expression: expression,
    resetExpression: resetExpression,
  });
}

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
  model.on("hit", (hitAreas) => {
    if (hitAreas.includes("body")) {
      model.motion("Tap");
    }
  });

  // resize
  const scaleX = newCanvas.width / model.width;
  const scaleY = newCanvas.height / model.height;
  model.scale.set(Math.min(scaleX, scaleY));
  model.x = newCanvas.width / 2 - model.width / 2;

  return () => {
    app.destroy();
    stage.current.removeChild(newCanvas);
  };
}

function App() {
  const [model, setModel] = useState<Live2DModel>();
  const stage = useRef<HTMLElement>(null);

  // console.log('run motion: ',model.motion('Tap')) // play motion
  // console.log('run expression: ',await model.expression(1)) // play expression

  // load model when init
  useEffect(() => {
    (async () => {
      setModel(await loadModel());
    })();
  }, []);

  // when model loaded, put it to stage
  useEffect(() => {
    if (!model) return;
    return loadModelTo(stage, model);
  }, [model]);

  return (
    <>
      <div className="w-screen h-screen" ref={stage} id="canvas"></div>
      {model && (
        <button
          onClick={() =>
            handleSpeak(
              "https://cdn.jsdelivr.net/gh/RaSan147/pixi-live2d-display@v1.0.3/playground/test.mp3",
              model
            )
          }
        >
          speak
        </button>
      )}
    </>
  );
}

export default App;
