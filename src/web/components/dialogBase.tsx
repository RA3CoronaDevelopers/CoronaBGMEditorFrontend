import React, { useContext } from 'react';
import { Drawer } from '@material-ui/core';
import { css } from '@emotion/css';
import { Scrollbars } from 'react-custom-scrollbars';
import { StoreContext } from '../utils/storeContext';

export function DialogBase({
  open,
  onClose,
  header,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  header?: any;
  children?: any;
  footer?: any;
}) {
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <div
        className={css`
          width: 60vw;
          height: 100vh;
        `}
      >
        <div
          className={css`
            position: absolute;
            left: 16px;
            top: 16px;
          `}
        >
          {header}
        </div>
        <div
          className={css`
            position: absolute;
            left: 16px;
            right: 16px;
            top: 80px;
            bottom: 64px;
          `}
        >
          <Scrollbars
            className={css`
              width: 100%;
              height: 100%;
            `}
          >
            {children}
          </Scrollbars>
        </div>
        <div
          className={css`
            position: absolute;
            right: 16px;
            bottom: 16px;
          `}
        >
          {footer}
        </div>
      </div>
    </Drawer>
  );
}
