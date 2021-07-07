import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  Typography,
  Button,
  List,
  ListItem,
  TextField,
  FormControl,
  Input,
  InputLabel,
  Paper,
  Grid
} from '@material-ui/core';
import { css } from '@emotion/css';
import { StoreContext } from '../../utils/storeContext';
import { ICheckPoint } from '../../utils/jsonConfigTypes';
import { drawWaveform } from '../../utils/waveformDrawer';
import { DialogBase } from '../dialogBase';

export function CheckPointController({
  open,
  trackId,
  checkPointId,
  audioOriginDataRef,
  onClose
}: {
  open: boolean,
  trackId: number
  checkPointId: number,
  audioOriginDataRef: React.RefObject<{ [trackId: string]: Float32Array }>
  onClose: () => void
}) {
  const {
    setStore,
    data: { tracks }
  } = useContext(StoreContext);
  const [mouseOverPosition, setMouseOverPosition] = useState(undefined as undefined | number);
  const waveRef = useRef(undefined as undefined | HTMLCanvasElement);

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (waveRef.current && audioOriginDataRef.current[trackId]) {
        drawWaveform(audioOriginDataRef.current[trackId], waveRef.current);
        clearInterval(interval);
      }
    }, 1000);
  }, []);

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
      <div
        className={css`
          height: 32px;
          width: calc(100% - 32px);
          margin: 16px;
          border-radius: 4px;
          position: relative;
        `}
      >
        {/* 当前选择位置图层 */}
        <div
          className={css`
            position: absolute;
            top: 0px;
            height: 100%;
            width: 2px;
            background: rgba(102, 204, 255, 0.8);
          `}
          style={{
            left: `${tracks[trackId].checkPoints[checkPointId].time / tracks[trackId].length * 100}%`
          }}
        />
        {/* 鼠标游标轴图层 */}
        <div
          className={css`
            position: absolute;
            top: 0px;
            left: 0px;
            height: 100%;
            width: 100%;
            z-index: 1000;
          `}
          onMouseEnter={e => setMouseOverPosition(e.clientX - waveRef.current.getBoundingClientRect().left)}
          onMouseMove={e => setMouseOverPosition(e.clientX - waveRef.current.getBoundingClientRect().left)}
          onMouseLeave={_e => setMouseOverPosition(undefined)}
          onMouseDown={e => onChange({
            ...checkPoint,
            time: (e.clientX - waveRef.current.getBoundingClientRect().left)
              / waveRef.current.getBoundingClientRect().width
              * tracks[trackId].length
          })}
        >
          {mouseOverPosition && <div
            className={css`
              position: absolute;
              top: 0px;
              height: 100%;
              width: 1px;
              background: rgba(255, 255, 255, 0.8);
              z-index: 999;
            `}
            style={{
              left: mouseOverPosition
            }}
          />}
        </div>
        {/* 波形图 */}
        <canvas
          className={css`
            height: 32px;
            width: 100%;
          `}
          ref={waveRef}
        />
      </div>
      <Paper
        className={css`
          width: calc(100$ - 32px);
          margin: 16px;
          padding: 16px;
        `}
      >
        <TextField
          variant='outlined'
          value={Math.floor(tracks[trackId].checkPoints[checkPointId].time / 60)}
          label='分钟'
          margin='dense'
          size='small'
          onChange={e => /^[12345]?\d$/.test(e.target.value) && onChange({
            ...checkPoint,
            time: tracks[trackId].checkPoints[checkPointId].time
              - Math.floor(tracks[trackId].checkPoints[checkPointId].time / 60) * 60
              + (+e.target.value) * 60
          })}
        />
        <TextField
          variant='outlined'
          value={Math.floor(tracks[trackId].checkPoints[checkPointId].time % 60)}
          label='秒'
          margin='dense'
          size='small'
          onChange={e => /^[12345]?\d$/.test(e.target.value) && onChange({
            ...checkPoint,
            time: tracks[trackId].checkPoints[checkPointId].time
              - Math.floor(tracks[trackId].checkPoints[checkPointId].time % 60)
              + (+e.target.value)
          })}
        />
        <TextField
          variant='outlined'
          value={Math.floor((tracks[trackId].checkPoints[checkPointId].time
            - Math.floor(tracks[trackId].checkPoints[checkPointId].time)) * 10)}
          label='百毫秒'
          margin='dense'
          size='small'
          onChange={e => /^\d$/.test(e.target.value) && onChange({
            ...checkPoint,
            time: tracks[trackId].checkPoints[checkPointId].time
              - (tracks[trackId].checkPoints[checkPointId].time
                - Math.floor(tracks[trackId].checkPoints[checkPointId].time))
              + (+e.target.value) * 0.1
          })}
        />
      </Paper>
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
                        { type: 'fadeOutDelay', label: '渐出延迟时间(s)' },
                        { type: 'targetFadeInDelay', label: '渐入延迟时间(s)' },
                        { type: 'targetOffset', label: '目标轨道位置(s)' },
                        { type: 'fadeOutDuration', label: '渐出持续时间(s)' },
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
