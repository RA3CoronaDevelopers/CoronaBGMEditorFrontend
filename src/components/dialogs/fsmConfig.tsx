import React, { useContext } from 'react';
import {
  Typography, Button,
  List, ListItem, ListItemText
} from '@material-ui/core';
import { css } from '@emotion/css';
import { StoreContext } from '../../utils/storeContext';
import { DialogBase } from '../dialogBase';

export function FsmConfig() {
  const { setStore, state: {
    fsmConfigDialogOpen
  } } = useContext(StoreContext);

  return <DialogBase
    open={fsmConfigDialogOpen}
    onClose={() => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fsmConfigDialogOpen: false
      }
    }))}
    header={<>
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
    </>}
    footer={<>
      <Button onClick={() => setStore(store => ({
        ...store,
        state: {
          ...store.state,
          fsmConfigDialogOpen: false
        }
      }))}>{'关闭'}</Button>
    </>}
  >
    <List>
      {[].map(name => <ListItem
        button
        onClick={() => void 0}
      >
        <ListItemText primary={name} />
      </ListItem>)}
    </List>
  </DialogBase>;
}