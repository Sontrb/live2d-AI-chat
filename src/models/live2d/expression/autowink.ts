import { Live2DModel } from "pixi-live2d-display-lipsyncpatch";

export default function autoWink(model: Live2DModel | null) {
  let winkTimer: ReturnType<typeof setTimeout>;
  async function wink() {
    if (model === null) return;
    if (model.internalModel.motionManager.playing) {
      // console.log("motion playing, do not wink");
      return;
    }
    model.expression("Wink").catch((e) => {
      console.error(e);
    });
    await wait(100);
    model.expression("Wink-2").catch((e) => {
      console.error(e);
    });
    winkTimer = setTimeout(wink, generateNormalRandom(5, 1.94) * 1000);
  }

  winkTimer = setTimeout(wink, generateNormalRandom(5, 1.94) * 1000); // 平均5秒后眨眼，标准偏差为1.94秒，99%概率在0-10秒内眨眼

  return () => {
    clearTimeout(winkTimer);
  };
}

function generateNormalRandom(mean: number, stdDev: number) {
  let u, v, s;
  do {
    u = Math.random() * 2 - 1;
    v = Math.random() * 2 - 1;
    s = u * u + v * v;
  } while (s >= 1);

  const multiplier = Math.sqrt((-2 * Math.log(s)) / s);
  return mean + stdDev * u * multiplier;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
