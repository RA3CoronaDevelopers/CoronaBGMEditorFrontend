import React from 'react';
import { css } from '@emotion/css';

export function Player() {
  return <div className={css`
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
      height: 96px;
      width: 100%;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 4px;
    `}>
      {/* 时间轴列表 */}
    </div>
  </div>
}