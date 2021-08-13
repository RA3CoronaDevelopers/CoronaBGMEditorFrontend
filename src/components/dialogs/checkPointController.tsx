import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Grid,
  GridSize,
  Divider,
} from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiClose, mdiPlus } from '@mdi/js';
import { StoreContext } from '../../utils/storeContext';
import { ICheckPoint } from '../../utils/jsonConfigTypes';
import { drawWaveform } from '../../utils/waveformDrawer';
import { DialogBase } from '../dialogBase';

export function CheckPointController({
  open,
  trackId,
  checkPointId,
  audioOriginDataRef,
  onClose,
}: {
  open: boolean;
  trackId: number;
  checkPointId: number;
  audioOriginDataRef: React.RefObject<{ [trackId: string]: AudioBuffer }>;
  onClose: () => void;
}) {
  const {
    setStore,
    data: { tracks },
  } = useContext(StoreContext);
  const [mouseOverPosition, setMouseOverPosition] = useState(
    undefined as undefined | number
  );
  const waveRef = useRef(undefined as undefined | HTMLCanvasElement);

  const checkPoint = tracks[trackId].checkPoints[checkPointId];
  function onChange(obj: ICheckPoint) {
    setStore((store) => ({
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
              ...store.data.tracks[trackId].checkPoints.slice(checkPointId + 1),
            ],
          },
          ...store.data.tracks.slice(trackId + 1),
        ],
      },
    }));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (waveRef.current && audioOriginDataRef.current[trackId]) {
        drawWaveform(
          audioOriginDataRef.current[trackId].getChannelData(0),
          waveRef.current
        );
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
          <Button onClick={onClose}>{'关闭'}</Button>
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
            left: `${
              (tracks[trackId].checkPoints[checkPointId].time /
                tracks[trackId].length) *
              100
            }%`,
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
          onMouseEnter={(e) =>
            setMouseOverPosition(
              e.clientX - waveRef.current.getBoundingClientRect().left
            )
          }
          onMouseMove={(e) =>
            setMouseOverPosition(
              e.clientX - waveRef.current.getBoundingClientRect().left
            )
          }
          onMouseLeave={(_e) => setMouseOverPosition(undefined)}
          onMouseDown={(e) =>
            onChange({
              ...checkPoint,
              time:
                ((e.clientX - waveRef.current.getBoundingClientRect().left) /
                  waveRef.current.getBoundingClientRect().width) *
                tracks[trackId].length,
            })
          }
        >
          {mouseOverPosition && (
            <div
              className={css`
                position: absolute;
                top: 0px;
                height: 100%;
                width: 1px;
                background: rgba(255, 255, 255, 0.8);
                z-index: 999;
              `}
              style={{
                left: mouseOverPosition,
              }}
            />
          )}
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
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <TextField
              variant='outlined'
              value={Math.floor(
                tracks[trackId].checkPoints[checkPointId].time / 60
              )}
              label='分钟'
              margin='dense'
              size='small'
              onChange={(e) =>
                /^[12345]?\d$/.test(e.target.value) &&
                onChange({
                  ...checkPoint,
                  time:
                    tracks[trackId].checkPoints[checkPointId].time -
                    Math.floor(
                      tracks[trackId].checkPoints[checkPointId].time / 60
                    ) *
                      60 +
                    +e.target.value * 60,
                })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              variant='outlined'
              value={Math.floor(
                tracks[trackId].checkPoints[checkPointId].time % 60
              )}
              label='秒'
              margin='dense'
              size='small'
              onChange={(e) =>
                /^[12345]?\d$/.test(e.target.value) &&
                onChange({
                  ...checkPoint,
                  time:
                    tracks[trackId].checkPoints[checkPointId].time -
                    Math.floor(
                      tracks[trackId].checkPoints[checkPointId].time % 60
                    ) +
                    +e.target.value,
                })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              variant='outlined'
              value={Math.floor(
                (tracks[trackId].checkPoints[checkPointId].time -
                  Math.floor(tracks[trackId].checkPoints[checkPointId].time)) *
                  10
              )}
              label='百毫秒'
              margin='dense'
              size='small'
              onChange={(e) =>
                /^\d$/.test(e.target.value) &&
                onChange({
                  ...checkPoint,
                  time:
                    tracks[trackId].checkPoints[checkPointId].time -
                    (tracks[trackId].checkPoints[checkPointId].time -
                      Math.floor(
                        tracks[trackId].checkPoints[checkPointId].time
                      )) +
                    +e.target.value * 0.1,
                })
              }
              fullWidth
            />
          </Grid>
          <Grid item />
        </Grid>
      </Paper>
      <List>
        {checkPoint?.destinations &&
          checkPoint?.destinations.map(
            ({ condition, jumpTo }, destinationId) => (
              <ListItem>
                <Paper>
                  <List>
                    <div
                      className={css`
                        margin: 0px 16px;
                      `}
                    >
                      <TextField
                        variant='outlined'
                        value={condition}
                        onChange={(e) =>
                          onChange({
                            ...checkPoint,
                            destinations: [
                              ...checkPoint.destinations.slice(
                                0,
                                destinationId
                              ),
                              {
                                condition: e.target.value,
                                jumpTo:
                                  checkPoint.destinations[destinationId].jumpTo,
                              },
                              ...checkPoint.destinations.slice(
                                destinationId + 1
                              ),
                            ],
                          })
                        }
                        fullWidth
                      />
                    </div>
                    {jumpTo.map((jumpToData, jumpToId) => (
                      <ListItem>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Divider />
                          </Grid>
                          <Grid item xs={11}>
                            <Grid container spacing={1}>
                              <Grid item xs={8}>
                                <FormControl variant='outlined' fullWidth>
                                  <InputLabel>目标轨道</InputLabel>
                                  <Select
                                    value={jumpToData.targetTrackId}
                                    onChange={(e) =>
                                      onChange({
                                        ...checkPoint,
                                        destinations: [
                                          ...checkPoint.destinations.slice(
                                            0,
                                            destinationId
                                          ),
                                          {
                                            condition:
                                              checkPoint.destinations[
                                                destinationId
                                              ].condition,
                                            jumpTo: [
                                              ...checkPoint.destinations[
                                                destinationId
                                              ].jumpTo.slice(0, jumpToId),
                                              {
                                                ...checkPoint.destinations[
                                                  destinationId
                                                ].jumpTo[jumpToId],
                                                targetTrackId: e.target
                                                  .value as string,
                                              },
                                              ...checkPoint.destinations[
                                                destinationId
                                              ].jumpTo.slice(jumpToId + 1),
                                            ],
                                          },
                                          ...checkPoint.destinations.slice(
                                            destinationId + 1
                                          ),
                                        ],
                                      })
                                    }
                                    label='目标轨道'
                                  >
                                    {tracks.map(({ name }) => (
                                      <MenuItem value={name}>{name}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              {[
                                {
                                  type: 'targetOffset',
                                  label: '目标轨道位置(s)',
                                  xs: 4,
                                },
                                {
                                  type: 'fadeOutDelay',
                                  label: '渐出延迟时间(s)',
                                  xs: 3,
                                },
                                {
                                  type: 'fadeOutDuration',
                                  label: '渐出持续时间(s)',
                                  xs: 3,
                                },
                                {
                                  type: 'targetFadeInDelay',
                                  label: '渐入延迟时间(s)',
                                  xs: 3,
                                },
                                {
                                  type: 'targetFadeInDuration',
                                  label: '渐入持续时间(s)',
                                  xs: 3,
                                },
                              ].map(({ type, label, xs }) => (
                                <Grid item xs={xs as GridSize}>
                                  <TextField
                                    variant='outlined'
                                    value={jumpToData[type]}
                                    label={label}
                                    type='number'
                                    onChange={(e) =>
                                      onChange({
                                        ...checkPoint,
                                        destinations: [
                                          ...checkPoint.destinations.slice(
                                            0,
                                            destinationId
                                          ),
                                          {
                                            condition:
                                              checkPoint.destinations[
                                                destinationId
                                              ].condition,
                                            jumpTo: [
                                              ...checkPoint.destinations[
                                                destinationId
                                              ].jumpTo.slice(0, jumpToId),
                                              {
                                                ...checkPoint.destinations[
                                                  destinationId
                                                ].jumpTo[jumpToId],
                                                [type]: e.target.value,
                                              },
                                              ...checkPoint.destinations[
                                                destinationId
                                              ].jumpTo.slice(jumpToId + 1),
                                            ],
                                          },
                                          ...checkPoint.destinations.slice(
                                            destinationId + 1
                                          ),
                                        ],
                                      })
                                    }
                                    fullWidth
                                  />
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>
                          <Grid item xs={1}>
                            <div
                              className={css`
                                width: 100%;
                                height: 100%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                              `}
                            >
                              <IconButton
                                size='small'
                                onClick={() =>
                                  onChange({
                                    ...checkPoint,
                                    destinations:
                                      checkPoint.destinations[destinationId]
                                        .jumpTo.length > 1
                                        ? [
                                            ...checkPoint.destinations.slice(
                                              0,
                                              destinationId
                                            ),
                                            {
                                              condition:
                                                checkPoint.destinations[
                                                  destinationId
                                                ].condition,
                                              jumpTo: [
                                                ...checkPoint.destinations[
                                                  destinationId
                                                ].jumpTo.slice(0, jumpToId),
                                                ...checkPoint.destinations[
                                                  destinationId
                                                ].jumpTo.slice(jumpToId + 1),
                                              ],
                                            },
                                            ...checkPoint.destinations.slice(
                                              destinationId + 1
                                            ),
                                          ]
                                        : [
                                            ...checkPoint.destinations.slice(
                                              0,
                                              destinationId
                                            ),
                                            ...checkPoint.destinations.slice(
                                              destinationId + 1
                                            ),
                                          ],
                                  })
                                }
                              >
                                <Icon path={mdiClose} size={1} color='#fff' />
                              </IconButton>
                            </div>
                          </Grid>
                        </Grid>
                      </ListItem>
                    ))}
                    <div
                      className={css`
                        width: 100%;
                        display: flex;
                        justify-content: center;
                      `}
                    >
                      <Button
                        onClick={() =>
                          onChange({
                            ...checkPoint,
                            destinations: [
                              ...checkPoint.destinations.slice(
                                0,
                                destinationId
                              ),
                              {
                                ...checkPoint.destinations[destinationId],
                                jumpTo: [
                                  ...checkPoint.destinations[destinationId]
                                    .jumpTo,
                                  {
                                    targetTrackId: tracks[0].name,
                                    targetOffset: 0,
                                    fadeOutDelay: 0,
                                    fadeOutDuration: 0,
                                    targetFadeInDelay: 0,
                                    targetFadeInDuration: 0,
                                  },
                                ],
                              },
                              ...checkPoint.destinations.slice(
                                destinationId + 1
                              ),
                            ],
                          })
                        }
                      >
                        <Icon path={mdiPlus} size={1} />
                        <div
                          className={css`
                            width: 8px;
                          `}
                        />
                        {'新建跳转目标'}
                      </Button>
                    </div>
                  </List>
                </Paper>
              </ListItem>
            )
          )}
        <ListItem>
          <div
            className={css`
              width: 100%;
              display: flex;
              justify-content: center;
            `}
          >
            <Button
              onClick={() =>
                onChange({
                  ...checkPoint,
                  destinations: [
                    ...checkPoint.destinations,
                    {
                      condition: '',
                      jumpTo: [
                        {
                          targetTrackId: tracks[0].name,
                          targetOffset: 0,
                          fadeOutDelay: 0,
                          fadeOutDuration: 0,
                          targetFadeInDelay: 0,
                          targetFadeInDuration: 0,
                        },
                      ],
                    },
                  ],
                })
              }
            >
              <Icon path={mdiPlus} size={1} />
              <div
                className={css`
                  width: 8px;
                `}
              />
              {'新建检查点'}
            </Button>
          </div>
        </ListItem>
      </List>
    </DialogBase>
  );
}
