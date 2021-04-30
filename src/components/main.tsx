import React, { useState } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiDotsVertical } from '@mdi/js';

import { Player } from './player';
import { FileSelector } from './fileSelector';

export function Main() {
  const [openSelectFileDialog, setOpenSelectFileDialog] = useState(false);

  const [basicTrackXmlPath, setBasicTrackXmlPath] = useState('');

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
            ${basicTrackXmlPath === '' ? 'user-select: none;' : ''}
          `}>
            {basicTrackXmlPath === '' ? `未打开文件` : basicTrackXmlPath}
          </Typography>
          <IconButton size='small' onClick={() => setOpenSelectFileDialog(true)}>
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
    <FileSelector open={openSelectFileDialog} onClose={(path?: string) => (
      setOpenSelectFileDialog(false),
      setBasicTrackXmlPath(path || basicTrackXmlPath)
    )} />
  </div>
}