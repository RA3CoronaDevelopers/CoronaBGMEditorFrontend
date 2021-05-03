import React from 'react';
import { Typography } from '@material-ui/core';
import { css } from '@emotion/css';

export function Player({ id }: {
  id: number
}) {
  return <div className={css`
    width: 100%;
    margin: 8px 0px;
    display: flex;
  `}>
    <div className={css`
      width: 48px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
    `}>
      <Typography variant='h6'>
        {`#${id}`}
      </Typography>
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
        `}>
          {/* 游标 */}
        </div>
        <div className={css`
          height: 64px;
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        `}>
          {/* 波形图 */}
        </div>
        <div className={css`
          height: 64px;
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 4px;
        `}>
          {/* 时间轴列表 */}
        </div>
      </div>
    </div>
  </div>
}