import React, { useContext } from 'react';
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  FormControl,
  Input,
  InputLabel,
  Paper,
  Grid
} from '@material-ui/core';
import { css } from '@emotion/css';
import MaskedInput from 'react-text-mask';
import { StoreContext } from '../../utils/storeContext';
import { ICheckPoint } from '../../utils/jsonConfigTypes';
import { DialogBase } from '../dialogBase';

function TimeInput({
  time, onChange
}: {
  time: number,
  onChange: (time: number) => void
}) {
  return <Input
    value={`${[
      time > 3600 ? Math.ceil(time / 3600) : 0,
      time > 60 ? Math.ceil((time - Math.ceil(time / 3600) * 3600) / 60) : 0,
      time > 0 ? Math.ceil((time - Math.ceil(time / 60) * 60)) : 0
    ].map(
      n => n < 10 ? `0${n}` : `${n}`
    ).concat(':')}.${(time) - Math.ceil((time)) * 10}`}
    onChange={e => {
      let match = /^(\d?\d?)\:(\d?\d?)\:(\d?\d?)\.(\d)?$/.exec(e.target.value);
      if (match) {
        let time = 0;
        if (match[1]) {
          time += (+match[1]) * 60 * 60;
        }
        if (match[2]) {
          time += (+match[2]) * 60;
        }
        if (match[3]) {
          time += (+match[3]);
        }
        if (match[4]) {
          time += (+match[4]) * 0.1;
        }
        onChange(time);
      }
    }}
    inputComponent={function ({ inputRef, ...props }) {
      return <MaskedInput
        {...props}
        ref={(ref: any) => inputRef(ref ? ref.inputElement : null)}
        mask={[/[1-9]/, ':', /\d/, /\d/, ':', /\d/, /\d/, '.', /\d/]}
        showMask
        guide
        placeholderChar=' '
        keepCharPositions
      />;
    }}
  />;
}

export function CheckPointController({
  open,
  trackId,
  checkPointId,
  onClose
}: {
  open: boolean,
  trackId: number
  checkPointId: number,
  onClose: () => void
}) {
  const {
    setStore,
    data: { tracks }
  } = useContext(StoreContext);

  const checkPoint = tracks[trackId].checkPoints[checkPointId];
  function onChange(obj: ICheckPoint) {
    setStore(store => ({
      ...store,
      data: {
        ...store.data,
        tracks: [
          ...store.data.tracks.slice(0, trackId),
          {
            ...store.data.tracks[trackId],
            checkPoints: [
              ...store.data.tracks[trackId].checkPoints.slice(0, checkPointId),
              obj,
              ...store.data.tracks[trackId].checkPoints.slice(checkPointId + 1)
            ]
          },
          ...store.data.tracks.slice(trackId + 1)
        ]
      }
    }));
  }

  return (
    <DialogBase
      open={open}
      onClose={onClose}
      header={
        <>
          <Typography
            variant='h5'
            className={css`
              user-select: none;
            `}
          >
            {'检查点'}
          </Typography>
        </>
      }
      footer={
        <>
          <Button
            onClick={onClose}>
            {'关闭'}
          </Button>
        </>
      }
    >
      <FormControl>
        <InputLabel>{'检查时间'}</InputLabel>
        <TimeInput
          time={+checkPoint.time}
          onChange={time => onChange({
            ...checkPoint,
            time
          })}
        />
      </FormControl>
      <List>
        {checkPoint?.destinations && checkPoint?.destinations.map(({ condition, jumpTo }, destinationId) => <ListItem>
          <Paper>
            <TextField
              variant='outlined'
              value={condition}
              margin='dense'
              size='small'
              onChange={e => onChange({
                ...checkPoint,
                destinations: [
                  ...checkPoint.destinations.slice(0, destinationId),
                  {
                    condition: e.target.value,
                    jumpTo: checkPoint.destinations[destinationId].jumpTo
                  },
                  ...checkPoint.destinations.slice(destinationId + 1)
                ]
              })}
              fullWidth
            />
            <Paper>
              <List>
                {jumpTo.map((jumpToData, jumpToId) => <ListItem>
                  <Paper>
                    <Grid container>
                      {[
                        { type: 'targetTrackId', label: '目标轨道' },
                        { type: 'targetOffset', label: '目标轨道位置(s)' },
                        { type: 'fadeOutDelay', label: '渐出延迟时间(s)' },
                        { type: 'fadeOutDuration', label: '渐出持续时间(s)' },
                        { type: 'targetFadeInDelay', label: '渐入延迟时间(s)' },
                        { type: 'targetFadeInDuration', label: '渐入持续时间(s)' }
                      ].map(({ type, label }) => <Grid item xs={4}>
                        <TextField
                          variant='outlined'
                          value={jumpToData[type]}
                          label={label}
                          margin='dense'
                          size='small'
                          onChange={e => onChange({
                            ...checkPoint,
                            destinations: [
                              ...checkPoint.destinations.slice(0, destinationId),
                              {
                                condition: checkPoint.destinations[destinationId].condition,
                                jumpTo: [
                                  ...checkPoint.destinations[destinationId].jumpTo.slice(0, jumpToId),
                                  {
                                    ...checkPoint.destinations[destinationId].jumpTo[jumpToId],
                                    [type]: e.target.value
                                  },
                                  ...checkPoint.destinations[destinationId].jumpTo.slice(jumpToId + 1)
                                ]
                              },
                              ...checkPoint.destinations.slice(destinationId + 1)
                            ]
                          })}
                          fullWidth
                        />
                      </Grid>)}
                    </Grid>
                  </Paper>
                </ListItem>)}
              </List>
            </Paper>
          </Paper>
        </ListItem>)}
      </List>
    </DialogBase>
  );
}
