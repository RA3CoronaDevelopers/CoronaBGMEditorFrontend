import React from 'react';
import { Typography, Button } from '@material-ui/core';
import { css } from '@emotion/css';
import { CSSTransition } from 'react-transition-group';

export function FileSelector({ open, onClose }: {
  open: boolean, onClose: (path?: string) => void
}) {
  return <CSSTransition in={open} timeout={200} unmountOnExit classNames={{
    enter: css`opacity: 0;`,
    enterActive: css`opacity: 1; transition: opacity .2s`,
    exit: css`opacity: 1;`,
    exitActive: css`opacity: 0; transition: opacity .2s;`
  }}>
    <div className={css`
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
    `}>
      <div className={css`
        max-width: 36em;
        max-height: 32em;
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
          `}>{'选择入口 track.xml 文件'}</Typography>
          <Typography variant='body2'>{`C:/`}</Typography>
        </div>
        {/* 动作栏 */}
        <div className={css`
          position: absolute;
          right: 16px;
          bottom: 16px;
        `}>
          <Button onClick={() => onClose()}>{'取消'}</Button>
        </div>
      </div>
    </div>
  </CSSTransition>;
}