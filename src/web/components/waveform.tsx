import React, { useState, useRef, useEffect, useContext } from "react";
import { css } from "@emotion/css";
import { StoreContext } from "../utils/storeContext";

function drawWaveform(wave: Float32Array, canvas: HTMLCanvasElement) {
  const height = canvas.offsetHeight;
  const width = canvas.offsetWidth;
  const step = Math.ceil(wave.length / width);
  let bounds = [];
  for (let i = 0; i < width; ++i) {
    bounds = [
      ...bounds,
      wave.slice(i * step, i * step + step).reduce(
        (total, v) => ({
          max: v > total.max ? v : total.max,
          min: v < total.min ? v : total.min,
        }),
        { max: -1.0, min: 1.0 }
      ),
    ];
  }

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const canvasSize = {
    height: (canvas.height = height),
    width: (canvas.width = width),
  };
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#777";
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
}

export function Waveform({
  audioOriginDataRef,
  trackId,
  selectedPoints,
  onClick,
}: {
  audioOriginDataRef: React.RefObject<{ [trackId: string]: AudioBuffer }>;
  trackId: string;
  selectedPoints: number[];
  onClick: (newPos: number) => void;
}) {
  const {
    state: { nowPlayingProgress, nowPlayingTrack },
    data: { tracks },
  } = useContext(StoreContext);
  const [mouseOverPosition, setMouseOverPosition] = useState(
    undefined as undefined | number
  );
  const waveRef = useRef(undefined as undefined | HTMLCanvasElement);

  useEffect(() => {
    const interval = setInterval(() => {
      if (waveRef.current && audioOriginDataRef.current[trackId]) {
        drawWaveform(
          audioOriginDataRef.current[trackId].getChannelData(0),
          waveRef.current
        );
        clearInterval(interval);
      }
    }, 1000);
  }, []);

  return (
    <div
      className={css`
        height: calc(100% - 32px);
        width: calc(100% - 32px);
        margin: 16px;
        border-radius: 4px;
        position: relative;
      `}
    >
      {/* 当前选择位置图层 */}
      {selectedPoints.map((pos) => (
        <div
          className={css`
            position: absolute;
            top: 0px;
            height: 100%;
            width: 2px;
            background: rgba(102, 204, 255, 0.8);
          `}
          style={{
            left: `${pos * 100}%`,
          }}
        />
      ))}
      {/* 播放状态轴对齐图层 */}
      {nowPlayingTrack === trackId && (
        <div
          className={css`
            position: absolute;
            top: 0px;
            height: 100%;
            width: 2px;
            background: rgba(102, 204, 255, 0.8);
          `}
          style={{
            left: `${(nowPlayingProgress / tracks[trackId].length) * 100}%`,
          }}
        />
      )}
      {/* 鼠标游标轴图层 */}
      <div
        className={css`
          position: absolute;
          top: 0px;
          left: 0px;
          height: 100%;
          width: 100%;
          z-index: 1000;
        `}
        onMouseEnter={(e) =>
          setMouseOverPosition(
            e.clientX - waveRef.current.getBoundingClientRect().left
          )
        }
        onMouseMove={(e) =>
          setMouseOverPosition(
            e.clientX - waveRef.current.getBoundingClientRect().left
          )
        }
        onMouseLeave={(_e) => setMouseOverPosition(undefined)}
        onMouseDown={(e) =>
          onClick(
            (e.clientX - waveRef.current.getBoundingClientRect().left) /
              waveRef.current.getBoundingClientRect().width
          )
        }
      >
        {mouseOverPosition && (
          <div
            className={css`
              position: absolute;
              top: 0px;
              height: 100%;
              width: 1px;
              background: rgba(255, 255, 255, 0.8);
              z-index: 999;
            `}
            style={{
              left: mouseOverPosition,
            }}
          />
        )}
      </div>
      {/* 波形图 */}
      <canvas
        className={css`
          height: 100%;
          width: 100%;
        `}
        ref={waveRef}
      />
    </div>
  );
}
