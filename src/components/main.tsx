import React, { useState, useContext } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';

import { StoreContext } from '../utils/storeContext';
import { Player } from './player';
import { FileSelector } from './fileSelector';

export function Main() {
  const { setStore, data: {
    trackXmlPath
  } } = useContext(StoreContext);

  return <div className={css`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `}>
    <div className={css`
      max-width: 72em;
      width: calc(100% - 16px);
      height: calc(100% - 16px);
      background: rgba(255, 255, 255, 0.6);
      border-radius: 4px;
      position: relative;
    `}>
      {/* 标题栏 */}
      <div className={css`
        position: absolute;
        left: 16px;
        top: 8px;
      `}>
        <Typography variant='h5' className={css`
          user-select: none;
        `}>{'日冕 BGM 编辑器'}</Typography>
        <div className={css`
          display: flex;
          flex-direction: row;
          align-items: center;
        `}>
          <Typography variant='body2' className={css`
            margin-right: 16px;
            ${trackXmlPath === '' ? 'user-select: none;' : ''}
          `}>
            {trackXmlPath === '' ? `未打开文件，点击右侧以打开配置文件` : trackXmlPath}
          </Typography>
          <IconButton size='small' onClick={() => setStore(store => ({
            ...store,
            state: { ...store.state, fileSelectorOpen: true }
          }))}>
            <Icon path={mdiDotsVertical} size={0.5} />
          </IconButton>
        </div>
      </div>
      {/* 可视化音频区域 */}
      <div className={css`
        position: absolute;
        left: 24px;
        right: 24px;
        bottom: 16px;
      `}>
        <Player />
      </div>
    </div>
    {/* 子窗口 */}
    <FileSelector />
  </div>
}