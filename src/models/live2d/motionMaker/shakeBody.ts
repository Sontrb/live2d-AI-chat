import { parameterFromTo } from "./common";

export function twoPointMove() {
  let out = parameterFromTo("ParamAngleZ", 0, -6, 2);
  console.log(out);
  return out;
}
