import React, { useContext, useEffect, useRef } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import WaveSurfer from 'wavesurfer.js';
import WaveSurferCursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js'
import { StoreContext, ITrack } from '../utils/storeContext';

export function Player({ id, track }: {
  id: number, track: ITrack
}) {
  const { setStore, data: {
    musicLibrary
  }, state: {
    nowPlayingTrack, isPlaying, progress
  } } = useContext(StoreContext);
  const waveDOMRef = useRef();
  const waveRef = useRef(undefined as any);   // wavesurfer.js 没有类型提示文件，暂时只能这样

  useEffect(() => {
    waveRef.current = WaveSurfer.create({
      container: waveDOMRef.current,
      waveColor: '#fff',
      progressColor: '#999',
      plugins: [
        WaveSurferCursorPlugin.create({
          showTime: true,
          opacity: 1,
          customShowTimeStyle: {
            'background-color': '#000',
            color: '#fff',
            padding: '2px',
            'font-size': '12px'
          }
        })
      ]
    });
    waveRef.current.load(musicLibrary[track.usingMusicId].httpPath);
    waveRef.current.on('seek', () => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        progress: waveRef.current.getCurrentTime(),
        nowPlayingTrack: id
      }
    })));
    waveRef.current.on('finish', () => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        progress: 0,
        isPlaying: false
      }
    })));
  }, []);
  useEffect(() => {
    if (nowPlayingTrack === id && isPlaying) {
      waveRef.current.play(progress);
    } else if (waveRef.current.isPlaying()) {
      waveRef.current.pause();
      if (nowPlayingTrack === id) {
        setStore(store => ({
          ...store,
          state: {
            ...store.state,
            progress: waveRef.current.getCurrentTime()
          }
        }))
      }
    }
  }, [nowPlayingTrack, isPlaying]);

  return <div className={css`
    width: 100%;
    margin: 8px 0px;
    display: flex;
  `}>
    <div className={css`
      width: 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      user-select: none;
    `}>
      <div className={css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      `}>
        <Typography variant='h6'>
          {`#${id}`}
        </Typography>
        <IconButton size='small'>
          <Icon path={mdiDotsVertical} size={0.8} />
        </IconButton>
      </div>
      <Typography variant='caption'>
        {track.name}
      </Typography>
    </div>
    <div className={css`
      width: calc(100% - 60px);
      height: 100%;
    `}>
      <div className={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `}>
        <div className={css`
          height: 128px;
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          position: relative;
        `} ref={waveDOMRef} >
          <div className={css`
            left: 4px;
            top: 4px;
            position: absolute;
            user-select: none;
          `}>
            <Typography variant='caption'>
              {musicLibrary[track.usingMusicId].name}
            </Typography>
          </div>
        </div>
        <div className={css`
          height: 64px;
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 4px;
          position: relative;
        `}>
          {/* 时间轴列表 */}
        </div>
      </div>
    </div>
  </div>
}