import React, { useContext } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiDotsHorizontal } from '@mdi/js';
import { StoreContext, ITrack } from '../utils/storeContext';

export function Player({ id, track }: {
  id: number, track: ITrack
}) {
  const { data: {
    musicLibrary
  } } = useContext(StoreContext);

  return <div className={css`
    width: 100%;
    margin: 8px 0px;
    display: flex;
  `}>
    <div className={css`
      width: 48px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      user-select: none;
    `}>
      <Typography variant='h6'>
        {`#${id}`}
      </Typography>
      <Typography variant='caption'>
        {track.name}
      </Typography>
      <IconButton size='small'>
        <Icon path={mdiDotsHorizontal} size={0.8} />
      </IconButton>
    </div>
    <div className={css`
      width: calc(100% - 48px);
      height: 100%;
    `}>
      <div className={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `}>
        <div className={css`
          height: 8px;
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 4px;
          position: relative;
        `}>
          {/* 游标 */}
        </div>
        <div className={css`
          height: 64px;
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          position: relative;
        `}>
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
          {/* 波形图 */}
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