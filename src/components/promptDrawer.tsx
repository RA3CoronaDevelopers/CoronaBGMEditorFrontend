import React from 'react';
import { Typography, Button, Drawer } from '@material-ui/core';
import { css } from '@emotion/css';

export function PromptDrawer({ title, confirmTip, open, children, onClose, onConfirm }: {
  title: string, confirmTip?: string, open: boolean, children: any,
  onClose: () => any, onConfirm: () => any
}) {
  return <Drawer anchor='bottom' open={open} onClose={onClose}>
    <div className={css`
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    `}>
      {/* 标题栏 */}
      <div className={css`
        width: calc(100% - 16px);
        margin-left: 16px;
        padding: 8px;
        box-sizing: border-box;
      `}>
        <Typography variant='h5' className={css`
          user-select: none;
        `}>
          {title}
        </Typography>
      </div>
      {/* 内容区域 */}
      <div className={css`
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
      `}>
        {children}
      </div>
      {/* 动作栏 */}
      <div className={css`
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        padding: 8px;
        box-sizing: border-box;
      `}>
        <Button onClick={onConfirm}>
          {confirmTip || '创建'}
        </Button>
        <Button onClick={onClose}>
          {'取消'}
        </Button>
      </div>
    </div>
  </Drawer>;
}