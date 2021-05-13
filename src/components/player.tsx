import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, IconButton, CircularProgress } from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';
import WaveSurfer from 'wavesurfer.js';
import WaveSurferCursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.js'
import { StoreContext } from '../utils/storeContext';
import { ITrack } from '../utils/jsonConfigTypes';

export function Player({ id, track, setWaveRef }: {
  id: number, track: ITrack, setWaveRef: (ref: any) => void
}) {
  const { setStore, data: {
    musicFiles
  }, state: {
    nowPlayingTrack, isPlaying
  } } = useContext(StoreContext);
  const [isReady, setReady] = useState(false);
  const waveDOMRef = useRef();
  const waveRef = useRef(undefined as any);   // wavesurfer.js 没有类型提示文件，暂时只能这样

  useEffect(() => {
    waveRef.current = WaveSurfer.create({
      container: waveDOMRef.current,
      waveColor: '#fff',
      progressColor: '#fff',
      cursorColor: '#999',
      cursorWidth: 2,
      height: 100,
      plugins: [
        WaveSurferCursorPlugin.create({
          showTime: true,
          opacity: 1,
          customShowTimeStyle: {
            'background-color': 'rbga(0, 0, 0, 0.2)',
            color: '#333',
            padding: '2px',
            'font-size': '12px'
          }
        })
      ]
    });
    waveRef.current.on('ready', () => setReady(true));
    waveRef.current.on('audioprocess', () => setStore(store => ({
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
    waveRef.current.load(musicFiles[track.musicId]);
    setWaveRef(waveRef.current);
  }, []);
  useEffect(() => {
    if (nowPlayingTrack === id) {
      if (isPlaying) {
        waveRef.current.play();
      } else {
        waveRef.current.pause();
      }
    } else {
      waveRef.current.stop();
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
        {track.id}
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
        <div
          className={css`
            height: 100px;
            width: 100%;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            position: relative;
          `}
          ref={waveDOMRef}
          onClick={() => setStore(store => ({
            ...store,
            state: {
              ...store.state,
              nowPlayingTrack: id
            }
          }))}
        >
          <div className={css`
            left: 4px;
            top: 4px;
            position: absolute;
            user-select: none;
          `}>
            <Typography variant='caption'>
              {musicFiles[track.musicId]}
            </Typography>
          </div>
          <div className={css`
            left: 0px;
            top: 0px;
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          `}>
            {!isReady && <CircularProgress size={32} />}
          </div>
        </div>
        <div className={css`
          height: 60px;
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