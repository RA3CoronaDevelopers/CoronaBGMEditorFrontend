import React, { useContext } from 'react';
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
} from '@material-ui/core';
import { css } from '@emotion/css';
import { StoreContext } from '../utils/storeContext';
import { DialogBase } from '../components/dialogBase';

export function FsmConfig() {
  const {
    setStore,
    data: { fsmConfig },
    state: { fsmConfigDialogOpen },
  } = useContext(StoreContext);

  return (
    <DialogBase
      open={fsmConfigDialogOpen}
      onClose={() =>
        setStore((store) => ({
          ...store,
          state: {
            ...store.state,
            fsmConfigDialogOpen: false,
          },
        }))
      }
      header={
        <>
          <Typography
            variant='h5'
            className={css`
              user-select: none;
            `}
          >
            {'全局权值调整'}
          </Typography>
          <Typography
            variant='caption'
            className={css`
              user-select: none;
            `}
          >
            {
              '全局权值是 BGM 播放器判断是否切换对局状态的依据，一般情况下无需更改'
            }
          </Typography>
        </>
      }
      footer={
        <>
          <Button
            onClick={() =>
              setStore((store) => ({
                ...store,
                state: {
                  ...store.state,
                  fsmConfigDialogOpen: false,
                },
              }))
            }
          >
            {'关闭'}
          </Button>
        </>
      }
    >
      <List>
        {[
          'interval',
          'fightThreshold',
          'advantageThreshold',
          'disadvantageThreshold',
        ].map((name) => (
          <ListItem>
            <ListItemText primary={name} />
            <ListItemSecondaryAction>
              <TextField
                variant='outlined'
                value={fsmConfig[name] || ''}
                margin='dense'
                size='small'
                onChange={(e) =>
                  /^\d*$/.test(e.target.value) &&
                  setStore((store) => ({
                    ...store,
                    data: {
                      ...store.data,
                      unitWeight: {
                        ...store.data.unitWeight,
                        [name]: e.target.value,
                      },
                    },
                  }))
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </DialogBase>
  );
}
