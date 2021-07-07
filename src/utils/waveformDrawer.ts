export function drawWaveform(wave: Float32Array, canvas: HTMLCanvasElement) {
  const height = canvas.offsetHeight;
  const width = canvas.offsetWidth;
  const step = Math.ceil(wave.length / width);
  let bounds = [];
  for (let i = 0; i < width; ++i) {
    bounds = [...bounds, wave.slice(i * step, i * step + step).reduce(
      (total, v) => ({
        max: v > total.max ? v : total.max,
        min: v < total.min ? v : total.min
      }),
      { max: -1.0, min: 1.0 }
    )];
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const canvasSize = {
    height: (canvas.height = height),
    width: (canvas.width = width)
  };
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#777';
  const maxAmp = canvasSize.height / 2;
  ctx.moveTo(0, maxAmp);
  bounds.forEach((bound, i) => {
    const x = i * 1;
    const y = (1 + bound.min) * maxAmp;
    const width = 1;
    const height = Math.max(1, (bound.max - bound.min) * maxAmp);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width / 2, y + height);
  });
  ctx.stroke();
};