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
  const waveRef = useRef(undefined as undefined | HTMLCanvasElement);
  const audioContextRef = useRef(
    new (window['AudioContext'] ||
      window['webkitAudioContext'] ||
      window['mozAudioContext'] ||
      window['oAudioContext'])() as AudioContext
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
    function loop(offsetTime: number) {
      // offsetTime 是为 AudioContext 不按照音频本身时长记录进度而设定的补充参数
      // AudioContext.currentTime 追踪的是硬件播放时长，只增不减，在第一次之后的播放不会清零，而是继续记录数值

      if (viewAnimationFrameRefreshFlagRef.current) {
        setStore((store) => ({
          ...store,
          state: {
            ...store.state,
            nowPlayingProgress:
              audioContextRef.current.currentTime + offsetTime,
          },
        }));
        console.log(
          'Playing track',
          trackId,
          ', time:',
          audioContextRef.current.currentTime + offsetTime
        );
        // 为了降低更新频率、不阻塞渲染层，所以这里的循环是采用 requestAnimationFrame + setTimeout 双重延迟实现的
        setTimeout(() => {
          requestAnimationFrame(() => loop(offsetTime));
        }, 50);
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
        const player = (audioPlayerRef.current[trackId] =
          audioContextRef.current.createBufferSource());
        player.buffer = audioOriginDataRef.current[trackId];
        // TODO - 除了第一个轨道以外，其余轨道均无法播放，需要修复
        //        从 MDN 文档针对 AudioDestinationNode 的介绍中，推测原因可能是全局最多只准许一个输入节点
        player.connect(audioContextRef.current.destination);
        player.onended = () => {
          setStore((store) => ({
            ...store,
            state: {
              ...store.state,
              isPlaying: false,
            },
          }));
        };
        player.start(0, nowPlayingProgress);

        // 通过 React.Ref，让以远超 React 内部事件循环频率的 requestAnimationFrame 能够及时响应外围操作
        viewAnimationFrameRefreshFlagRef.current = true;
        loop(nowPlayingProgress - audioContextRef.current.currentTime);
      }
    }
    if (nowPlayingTrack !== trackId || !isPlaying) {
      viewAnimationFrameRefreshFlagRef.current = false;
      audioPlayerRef.current[trackId]?.stop();
      audioPlayerRef.current[trackId]?.disconnect();
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
                setStore((store) =>
                  ({
                    ...store,
                    state: {
                      ...store.state,
                      // 任意跳转时会强制暂停，其实是刻意设计成这样的，方便精确定位时间轴、防止还没来得及暂停时间轴就跑了
                      // 后续如果大部分人赞成保持原播放状态（即正在播放时，跳转完成后就恢复播放状态），可以再补充控制逻辑
                      isPlaying: false,
                      nowPlayingTrack: trackId,
                      nowPlayingProgress:
                        ((e.clientX -
                          waveRef.current.getBoundingClientRect().left) /
                          waveRef.current.getBoundingClientRect().width) *
                        track.length,
                    },
                  })
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
