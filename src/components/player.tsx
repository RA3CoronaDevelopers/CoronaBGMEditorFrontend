import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, IconButton, CircularProgress } from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import { useSnackbar } from 'notistack';
import { StoreContext } from '../utils/storeContext';
import { ITrack } from '../utils/jsonConfigTypes';
import { drawWaveform } from '../utils/waveformDrawer';
import { CheckPointController } from './dialogs/checkPointController';

export function Player({
  trackId,
  track,
  audioPlayerRef,
  audioOriginDataRef,
}: {
  trackId: number;
  track: ITrack;
  audioPlayerRef: React.RefObject<{
    [audioName: string]: AudioBufferSourceNode;
  }>;
  audioOriginDataRef: React.RefObject<{ [audioName: string]: AudioBuffer }>;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    setStore,
    data: { musicFilePathMap },
    state: { nowPlayingTrack, nowPlayingProgress, isPlaying },
  } = useContext(StoreContext);
  const [isReady, setReady] = useState(false);
  const [mouseOverPosition, setMouseOverPosition] = useState(
    undefined as undefined | number
  );
  const [checkPointControllerOpen, setCheckPointControllerOpen] = useState(-1);
  const radiusEffectRef = useRef(undefined as undefined | HTMLDivElement);
  const waveRef = useRef(undefined as undefined | HTMLCanvasElement);
  const audioContextRef = useRef(
    new (window['AudioContext'] ||
      window['webkitAudioContext'] ||
      window['mozAudioContext'] ||
      window['oAudioContext'])()
  );
  const viewAnimationFrameRefreshFlagRef = useRef(false);

  useEffect(() => {
    if (waveRef.current) {
      (async () => {
        const context: AudioContext = audioContextRef.current;
        const originBuffer = await (
          await fetch(musicFilePathMap[track.musicId])
        ).arrayBuffer();
        const buffer = (audioOriginDataRef.current[trackId] =
          await context.decodeAudioData(originBuffer));

        track.length = buffer.getChannelData(0).length / buffer.sampleRate;
        drawWaveform(
          audioOriginDataRef.current[trackId].getChannelData(0),
          waveRef.current
        );
        setReady(true);
      })();
    }
  }, []);

  useEffect(() => {
    function loop() {
      if (viewAnimationFrameRefreshFlagRef.current) {
        // TODO - 这里有严重的卡顿问题，我正在考虑让播放进度控制与 React 的内部事件循环完全脱钩，直接靠 DOM 覆写更新
        setStore((store) => ({
          ...store,
          state: {
            ...store.state,
            nowPlayingProgress: 0,
          },
        }));
        console.log('Playing track', trackId);
        requestAnimationFrame(loop);
      }
    }
    if (nowPlayingTrack === trackId && isPlaying) {
      if (!audioOriginDataRef.current[trackId]) {
        enqueueSnackbar('音频尚未准备完成，请稍后再点击播放', {
          variant: 'warning',
        });
        setStore((store) => ({
          ...store,
          state: {
            ...store.state,
            isPlaying: false,
          },
        }));
      } else {
        // 在使用 AudioBufferSourceNode 时，每次重新尝试播放都需要完全重新新建一次该对象
        // 这是刻意为之的，因为在 H5 标准的设计中，这本就是一种“阅后即焚”的对象
        // 所幸，由于 PCM 波形数据是可以被引用的，创建这种对象的代价不是很大，不会造成太大的性能负担
        const context: AudioContext = audioContextRef.current;
        const player = (audioPlayerRef.current[trackId] =
          context.createBufferSource());
        player.buffer = audioOriginDataRef.current[trackId];
        player.connect(context.destination);
        player.start(nowPlayingProgress);

        viewAnimationFrameRefreshFlagRef.current = true;
        loop();
      }
    }
    if (nowPlayingTrack !== trackId || !isPlaying) {
      viewAnimationFrameRefreshFlagRef.current = false;
      audioPlayerRef.current[trackId]?.stop();
    }
  }, [isPlaying, nowPlayingTrack]);

  useEffect(() => {
    const offset = audioOriginDataRef.current[nowPlayingTrack]
      ? 100 -
        (audioOriginDataRef.current[nowPlayingTrack][
          Math.ceil(
            (nowPlayingProgress / track.length) *
              audioOriginDataRef.current[nowPlayingTrack].length
          )
        ] +
          1) *
          0.5 *
          30
      : 100;
    if (radiusEffectRef.current) {
      radiusEffectRef.current.style.background = `radial-gradient(transparent ${
        isPlaying ? offset : 100
      }%, rgba(102, 204, 255, 0.4) 100%)`;
    }
  }, [nowPlayingProgress, isPlaying]);

  return (
    <div
      className={css`
        width: 100%;
        margin: 8px 0px;
        display: flex;
      `}
    >
      {/* 音频播放径向渐变特效 */}
      <div
        className={css`
          position: fixed;
          z-index: 10000;
          top: 0px;
          left: 0px;
          height: 100%;
          width: 100%;
          pointer-events: none;
        `}
        ref={radiusEffectRef}
      />
      {/* 播放器画布 */}
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
          <Typography variant='h6'>{`#${trackId}`}</Typography>
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
          >
            {/* 时间轴对齐图层 */}
            {track.checkPoints.map(({ time }) => (
              <div
                className={css`
                  position: absolute;
                  top: 0px;
                  height: 100%;
                  width: 1px;
                  background: rgba(255, 255, 255, 0.4);
                `}
                style={{
                  left: `${Math.min((time / track.length) * 100, 100)}%`,
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
                  left: `${(nowPlayingProgress / track.length) * 100}%`,
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
                setStore((store) => ({
                  ...store,
                  state: {
                    ...store.state,
                    nowPlayingTrack: trackId,
                    nowPlayingProgress:
                      ((e.clientX -
                        waveRef.current.getBoundingClientRect().left) /
                        waveRef.current.getBoundingClientRect().width) *
                      track.length,
                  },
                }))
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
                position: absolute;
                top: 0px;
                left: 0px;
                height: 100%;
                width: 100%;
                z-index: -1;
              `}
              ref={waveRef}
            />
            {/* 加载圈 */}
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
              position: relative;
              height: 60px;
              width: 100%;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 4px;
            `}
          >
            {/* 时间轴控制窗口 */}
            {track.checkPoints?.map((_checkPoint, checkPointId) => (
              <CheckPointController
                open={checkPointControllerOpen === checkPointId}
                trackId={trackId}
                checkPointId={checkPointId}
                audioOriginDataRef={audioOriginDataRef}
                onClose={() => setCheckPointControllerOpen(-1)}
              />
            ))}
            {/* 时间轴列表 */}
            {track.checkPoints?.map(
              ({ time, destinations, defaultDestinations }, checkPointId) => (
                <div
                  className={css`
                    position: absolute;
                    top: 0px;
                    height: 100%;
                    width: 60px;
                    overflow: hidden;
                    box-sizing: border-box;
                    padding: 2px;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    transition: background 0.2s;
                    &:hover {
                      background: rgba(255, 255, 255, 0.4);
                    }
                    &:active {
                      background: rgba(255, 255, 255, 0.8);
                    }
                  `}
                  style={{
                    left: `min(${
                      (time / track.length) * 100
                    }%, calc(100% - 60px))`,
                  }}
                  onClick={() => setCheckPointControllerOpen(checkPointId)}
                >
                  {destinations?.map(({ condition }) => (
                    <div
                      className={css`
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: flex-start;
                        color: #fff;
                        font-size: 10px;
                        user-select: none;
                      `}
                    >
                      {condition}
                    </div>
                  ))}
                  {defaultDestinations?.map(() => (
                    <div
                      className={css`
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: flex-start;
                        color: #fff;
                        font-size: 10px;
                        user-select: none;
                      `}
                    >
                      {'(默认跳转)'}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
