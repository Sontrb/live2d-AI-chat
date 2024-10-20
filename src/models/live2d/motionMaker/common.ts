export function parameterFromTo(
  parameterId: string,
  from: number,
  to: number,
  duration: number
) {
  return {
    Version: 3,
    Meta: {
      Duration: 3.983,
      Fps: 60.0,
      Loop: true,
      AreBeziersRestricted: true,
      CurveCount: 1,
      TotalSegmentCount: 21,
      TotalPointCount: 52,
      UserDataCount: 0,
      TotalUserDataSize: 0,
    },
    Curves: [
      {
        Target: "Parameter",
        Id: "ParamAngleZ",
        Segments: [
          0, 0, 1, 0.156, 0, 0.311, 4, 0.467, 4, 1, 0.522, 4, 0.578, 4.161,
          0.633, 3.274, 1, 0.744, 1.501, 0.856, -5.723, 0.967, -6, 1, 1.111,
          -6.36, 1.256, -6.319, 1.4, -6.319, 1, 1.617, -6.319, 1.833, -6.192,
          2.05, -4.961, 1, 2.539, -2.182, 3.028, 0, 3.517, 0, 0, 3.983, 0,
        ],
      },
    ],
  };
}

/*
{
    Version: 3,
    Meta: {
      Duration: duration,
      Fps: 60.0,
      Loop: false,
      AreBeziersRestricted: true,
      CurveCount: 1, // count
      TotalSegmentCount: 21,
      TotalPointCount: 52,
      UserDataCount: 0,
      TotalUserDataSize: 0,
    },
    Curves: [
      {
        Target: "Parameter",
        Id: parameterId,
        Segments: bezierCurve(from, to, 47),
      },
    ],
  }

  [
          0, 0, 1, 0.156, 0, 0.311, 4, 0.467, 4, 1, 0.522, 4, 0.578, 4.161,
          0.633, 3.274, 1, 0.744, 1.501, 0.856, -5.723, 0.967, -6, 1, 1.111,
          -6.36, 1.256, -6.319, 1.4, -6.319, 1, 1.617, -6.319, 1.833, -6.192,
          2.05, -4.961, 1, 2.539, -2.182, 3.028, 0, 3.517, 0, 0, 3.983, 0,
        ]
*/

export function bezierCurve(
  start: number,
  end: number,
  time: number,
  controlPoint: number | null = null
) {
  // 如果没有指定控制点，则取起点和终点中点
  if (!controlPoint) {
    controlPoint = (start + end) / 2;
  }

  const result = [];
  for (let i = 0; i < time; i++) {
    const t = i / time;
    const value =
      Math.pow(1 - t, 2) * start +
      2 * t * (1 - t) * controlPoint +
      Math.pow(t, 2) * end;
    result.push(value.toFixed(3));
  }
  return result;
}
