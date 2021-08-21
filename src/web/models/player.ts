import React, { useContext, useState, useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import { StoreContext } from "../utils/storeContext";
import { ITrack } from "../utils/jsonConfigTypes";

export interface IProps {
  trackId: string;
  track: ITrack;
  audioPlayerRef: React.RefObject<{
    [audioName: string]: AudioBufferSourceNode;
  }>;
  audioOriginDataRef: React.RefObject<{ [audioName: string]: AudioBuffer }>;
}

export function useData({
  trackId,
  track,
  audioPlayerRef,
  audioOriginDataRef,
}: IProps) {
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
  const audioContextRef = useRef(
    new (window["AudioContext"] ||
      window["webkitAudioContext"] ||
      window["mozAudioContext"] ||
      window["oAudioContext"])() as AudioContext
  );
  const viewAnimationFrameRefreshFlagRef = useRef(false);

  useEffect(() => {
    (async () => {
      const context: AudioContext = audioContextRef.current;
      const originBuffer = await (
        await fetch(musicFilePathMap[track.musicId])
      ).arrayBuffer();
      const buffer = (audioOriginDataRef.current[trackId] =
        await context.decodeAudioData(originBuffer));

      track.length = buffer.getChannelData(0).length / buffer.sampleRate;
      setReady(true);
    })();
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
          "Playing track",
          trackId,
          ", time:",
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
        enqueueSnackbar("音频尚未准备完成，请稍后再点击播放", {
          variant: "warning",
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

  return {
    nowPlayingTrack,
    nowPlayingProgress,
    trackId,
    track,

    isReady,
    mouseOverPosition,
    setMouseOverPosition,
    checkPointControllerOpen,
    setCheckPointControllerOpen,

    audioOriginDataRef,

    onMouseDown(pos: number) {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          // 任意跳转时会强制暂停，其实是刻意设计成这样的，方便精确定位时间轴、防止还没来得及暂停时间轴就跑了
          // 后续如果大部分人赞成保持原播放状态（即正在播放时，跳转完成后就恢复播放状态），可以再补充控制逻辑
          isPlaying: false,
          nowPlayingTrack: trackId,
          nowPlayingProgress: pos * store.data.tracks[trackId].length * pos,
        },
      }));
    },
  };
}
