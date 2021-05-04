import React, { useContext } from 'react';
import {
  Typography, Button, Drawer,
  List, ListItem, ListItemText
} from '@material-ui/core';
import { css } from '@emotion/css';
import { Scrollbars } from 'react-custom-scrollbars';
import { StoreContext } from '../utils/storeContext';

export function FsmConfig() {
  const { setStore, state: {
    fsmConfigDialogOpen
  } } = useContext(StoreContext);

  return <Drawer
    anchor='right'
    open={fsmConfigDialogOpen}
    onClose={() => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fsmConfigDialogOpen: false
      }
    }))}
  >
    <div className={css`
      width: 60vw;
      height: 100vh;
    `}>
      <div className={css`
        position: absolute;
        left: 16px;
        top: 16px;
      `}>
        <Typography variant='h5' className={css`
          user-select: none;
        `}>
          {'全局权值调整'}
        </Typography>
        <Typography variant='caption' className={css`
          user-select: none;
        `}>
          {'全局权值是 BGM 播放器判断是否切换对局状态的依据，一般情况下无需更改'}
        </Typography>
      </div>
      <div className={css`
        position: absolute;
        left: 16px;
        right: 16px;
        top: 80px;
        bottom: 64px;
      `}>
        <Scrollbars className={css`
          width: 100%;
          height: 100%;
        `}>
          <List>
            {[].map(name => <ListItem
              button
              onClick={() => void 0}
            >
              <ListItemText primary={name} />
            </ListItem>)}
          </List>
        </Scrollbars>
      </div>
      {/* 动作栏 */}
      <div className={css`
        position: absolute;
        right: 16px;
        bottom: 16px;
      `}>
        <Button onClick={() => setStore(store => ({
          ...store,
          state: {
            ...store.state,
            fsmConfigDialogOpen: false
          }
        }))}>{'关闭'}</Button>
      </div>
    </div>
  </Drawer>;
}