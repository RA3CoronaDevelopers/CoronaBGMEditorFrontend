import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, IconButton, CircularProgress } from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import { useSnackbar } from 'notistack';
import { Howl } from 'howler';
import { StoreContext } from '../utils/storeContext';
import { ITrack } from '../utils/jsonConfigTypes';

function drawWaveform(buffer: AudioBuffer, canvas: HTMLCanvasElement) {
  const height = canvas.offsetHeight;
  const width = canvas.offsetWidth;
  const wave = buffer.getChannelData(0);
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

export function Player({
  id,
  track,
  audioPlayerRef
}: {
  id: number;
  track: ITrack,
  audioPlayerRef: { [audioName: string]: any }
}) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    setStore,
    data: { musicFilePathMap },
    state: { nowPlayingTrack, nowPlayingProgress, isPlaying },
  } = useContext(StoreContext);
  const [isReady, setReady] = useState(false);
  const waveDOMRef = useRef();

  useEffect(() => {
    if (waveDOMRef.current) {
      (async () => {
        const context: AudioContext = (new (window['AudioContext']
          || window['webkitAudioContext']
          || window['mozAudioContext']
          || window['oAudioContext'])());
        const originBuffer = await (await fetch(musicFilePathMap[track.musicId])).arrayBuffer();
        const buffer = await context.decodeAudioData(originBuffer);
        drawWaveform(buffer, waveDOMRef.current);
        setReady(true);
      })();
    }
  }, []);

  useEffect(() => {
    audioPlayerRef.current[id] = new Howl({
      src: [musicFilePathMap[track.musicId]],
      html5: true,
      format: ['mp3']
    });
  }, []);

  useEffect(() => {
    function loop() {
      if (audioPlayerRef.current[id].playing()) {
        setStore(store => ({
          ...store,
          state: {
            ...store.state,
            nowPlayingProgress: audioPlayerRef.current[id].seek()
          }
        }));
        requestAnimationFrame(loop);
      }
    }
    if (nowPlayingTrack === id && isPlaying && !audioPlayerRef.current[id].playing()) {
      audioPlayerRef.current[id].seek(nowPlayingProgress);
      audioPlayerRef.current[id].play();
      if (!audioPlayerRef.current[id].playing()) {
        enqueueSnackbar('音频尚未准备完成，请稍后再点击播放', { variant: 'warning' });
        setStore(store => ({
          ...store,
          state: {
            ...store.state,
            isPlaying: false
          }
        }));
      } else {
        console.log('Playing track', id, ':', audioPlayerRef.current[id].seek());
        loop();
      }
    }
    if (nowPlayingTrack !== id && audioPlayerRef.current[id].playing() || !isPlaying) {
      audioPlayerRef.current[id].stop();
    }
  }, [isPlaying, nowPlayingTrack]);

  return (
    <div
      className={css`
        width: 100%;
        margin: 8px 0px;
        display: flex;
      `}
    >
      <div
        className={css`
          width: 60px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          user-select: none;
        `}
      >
        <div
          className={css`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <Typography variant='h6'>{`#${id}`}</Typography>
          <IconButton size='small'>
            <Icon path={mdiDotsVertical} size={0.8} />
          </IconButton>
        </div>
        <Typography variant='caption'>{track.name}</Typography>
      </div>
      <div
        className={css`
          width: calc(100% - 60px);
          height: 100%;
        `}
      >
        <div
          className={css`
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          `}
        >
          <div
            className={css`
              height: 100px;
              width: 100%;
              background: rgba(0, 0, 0, 0.2);
              border-radius: 4px;
              position: relative;
            `}
            onClick={() =>
              setStore(store => ({
                ...store,
                state: {
                  ...store.state,
                  nowPlayingTrack: id,
                },
              }))
            }
          >
            <canvas
              className={css`
                position: absolute;
                top: 0px;
                left: 0px;
                height: 100%;
                width: 100%;
                z-index: -1;
              `}
              ref={waveDOMRef}
            />
            <div
              className={css`
                left: 4px;
                top: 4px;
                position: absolute;
                user-select: none;
              `}
            >
              <Typography variant='caption'>{track.musicId}</Typography>
            </div>
            <div
              className={css`
                left: 0px;
                top: 0px;
                position: absolute;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              {!isReady && <CircularProgress size={32} />}
            </div>
          </div>
          <div
            className={css`
              height: 60px;
              width: 100%;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 4px;
              position: relative;
            `}
          >
            {/* 时间轴列表 */}
          </div>
        </div>
      </div>
    </div>
  );
}
