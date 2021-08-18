import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Typography,
  IconButton,
  Button,
  Popover,
  List,
  ListItem,
  ListItemText,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  InputAdornment,
  Switch,
  Select,
  MenuItem,
  ListItemSecondaryAction,
  Tooltip,
} from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import {
  mdiContentSave,
  mdiDotsVertical,
  mdiFileSettingsOutline,
  mdiPause,
  mdiPlay,
  mdiPlus,
} from '@mdi/js';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSnackbar } from 'notistack';
import { v4 as generate } from 'uuid';

import { IEditorSituation, StoreContext } from '../utils/storeContext';
import { send } from '../utils/remoteConnection';
import { PromptBase } from '../components/promptBase';
import { Player } from './player';
import { FileSelector } from './fileSelector';
import { UnitWeightConfig } from './unitWeightConfig';
import { FsmConfig } from './fsmConfig';
import { useData } from '../models';

export function Main() {
  const {
    sourceJsonPath,
    tracks,
    musicFilePathMap,

    isPlaying,
    editorSituation,
    nowPlayingProgress,
    jsonFileSelectorDialogOpen,
    musicFileSelectorDialogOpen,
    nowPlayingTrack,
    trackBpm,
    trackAllowBeats,
    trackBeatsOffset,
    trackBeatsPerBar,

    jsonSelectMenuAnchorEl,
    setJsonSelectMenuAnchorEl,
    generateNewTrackDialogOpen,
    setGenerateNewTrackDialogOpen,
    generateNewTrackDialogSelected,
    setGenerateNewTrackDialogSelected,
    generateNewTrackDialogTrackName,
    setGenerateNewTrackDialogTrackName,
    enqueueSnackbar,

    audioPlayerRef,
    audioOriginDataRef,
    
    // TODO - 清理所有的 setStore，点击事件完全移交到 model 层处理
    setStore,
  } = useData();

  return (
    <div
      className={css`
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
      `}
    >
      {/* 标题栏 */}
      <div
        className={css`
          position: absolute;
          left: 0px;
          top: 0px;
          width: 100vw;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          box-sizing: border-box;
        `}
      >
        <Typography
          variant='h5'
          className={css`
            user-select: none;
          `}
        >
          {'日冕 BGM 编辑器'}
        </Typography>
        <div
          className={css`
            left: 0px;
            top: 0px;
            width: 100%;
            height: 64px;
            position: absolute;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          `}
        >
          <Typography
            variant='h6'
            className={css`
              user-select: none;
            `}
          >
            {'' +
              `${Math.floor(nowPlayingProgress / 60) < 10 ? '0' : ''}` +
              Math.floor(nowPlayingProgress / 60) +
              ':' +
              `${nowPlayingProgress % 60 < 10 ? '0' : ''}` +
              Math.floor(nowPlayingProgress % 60) +
              '.' +
              Math.floor(
                (nowPlayingProgress - Math.floor(nowPlayingProgress)) * 10
              )}
          </Typography>
          <div
            className={css`
              margin: 8px;
            `}
          >
            <IconButton
              onClick={() =>
                setStore((store) => ({
                  ...store,
                  state: {
                    ...store.state,
                    isPlaying: !store.state.isPlaying,
                  },
                }))
              }
              disabled={sourceJsonPath === ''}
            >
              <Icon path={isPlaying ? mdiPause : mdiPlay} size={1} />
            </IconButton>
          </div>
        </div>
        <div
          className={css`
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-end;
          `}
        >
          <Typography
            variant='caption'
            className={css`
              ${sourceJsonPath === '' ? 'user-select: none;' : ''}
            `}
          >
            {sourceJsonPath === '' ? `未打开文件` : sourceJsonPath}
          </Typography>
          <div
            className={css`
              display: flex;
              flex-direction: row;
            `}
          >
            <Tooltip title='保存文件'>
              <IconButton
                size='small'
                onClick={() =>
                  send('saveXMLFile', {
                    path: sourceJsonPath,
                    tracks,
                    musicFiles: musicFilePathMap,
                  })
                }
                disabled={sourceJsonPath === ''}
              >
                <Icon path={mdiContentSave} size={0.8} color='#fff' />
              </IconButton>
            </Tooltip>
            <div
              className={css`
                width: 8px;
              `}
            />
            <Tooltip title='选择文件'>
              <IconButton
                size='small'
                onClick={(e) => setJsonSelectMenuAnchorEl(e.currentTarget)}
              >
                <Icon path={mdiFileSettingsOutline} size={0.8} color='#fff' />
              </IconButton>
            </Tooltip>
          </div>
          <Popover
            open={!!jsonSelectMenuAnchorEl}
            anchorEl={jsonSelectMenuAnchorEl}
            onClose={() => setJsonSelectMenuAnchorEl(undefined)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <List>
              <ListItem
                button
                onClick={() => (
                  setStore((store) => ({
                    ...store,
                    state: {
                      ...store.state,
                      jsonFileSelectorDialogOpen: true,
                    },
                  })),
                  setJsonSelectMenuAnchorEl(undefined)
                )}
              >
                <ListItemText primary='选择文件...' />
              </ListItem>
              <ListItem
                button
                onClick={() => (
                  navigator.clipboard
                    .readText()
                    .then((text) =>
                      send('readJsonFile', { path: text }).then(
                        ({
                          hasSuccess,
                          reason,
                          musicFiles,
                          tracks,
                          fsmConfig,
                          unitWeight,
                        }) =>
                          hasSuccess
                            ? (setStore((store) => ({
                                ...store,
                                data: {
                                  ...store.data,
                                  sourceJsonPath: text,
                                  musicFilePathMap: musicFiles,
                                  tracks,
                                  fsmConfig,
                                  unitWeight,
                                },
                              })),
                              enqueueSnackbar('获取成功', {
                                variant: 'success',
                              }))
                            : enqueueSnackbar(`获取失败：${reason}`, {
                                variant: 'error',
                              })
                      )
                    )
                    .catch(() =>
                      enqueueSnackbar('无法读取剪贴板', { variant: 'error' })
                    ),
                  setJsonSelectMenuAnchorEl(undefined)
                )}
              >
                <ListItemText primary='从剪贴板中获取路径' />
              </ListItem>
              {/* TODO - 在做好配置文件存储之后，加上历史文件功能 */}
            </List>
          </Popover>
        </div>
      </div>
      {/* 控制面板 */}
      <div
        className={css`
          position: absolute;
          left: 0px;
          top: 64px;
          width: 20vw;
          height: calc(50vh - 64px);
          background: rgba(255, 255, 255, 0.1);
          padding: 8px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
        `}
      >
        <div
          className={css`
            width: 100%;
            height: 100%;
          `}
        >
          <Scrollbars
            className={css`
              width: 100%;
              height: 100%;
            `}
          >
            <div
              className={css`
                padding: 12px;
              `}
            >
              <div
                className={css`
                  width: 100%;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: flex-start;
                `}
              >
                <FormControl fullWidth variant='filled'>
                  <InputLabel>{'当前轨道'}</InputLabel>
                  <Select
                    value={nowPlayingTrack}
                    onChange={(e) =>
                      setStore((store) => ({
                        ...store,
                        state: {
                          ...store.state,
                          nowPlayingTrack: e.target.value as string,
                          nowPlayingProgress: 0,
                        },
                      }))
                    }
                  >
                    {Object.keys(tracks)
                      .sort(
                        (left, right) =>
                          tracks[left].order - tracks[right].order
                      )
                      .map((id, order) => (
                        <MenuItem
                          value={id}
                        >{`${tracks[id].name}(#${order})`}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth variant='filled'>
                  <InputLabel>{'状态'}</InputLabel>
                  <Select
                    value={editorSituation}
                    onChange={(e) =>
                      setStore((store) => ({
                        ...store,
                        state: {
                          ...store.state,
                          editorSituation: e.target.value as IEditorSituation,
                        },
                      }))
                    }
                  >
                    <MenuItem value='Mute'>{'Mute(静音)'}</MenuItem>
                    <MenuItem value='MenuTrack'>{'MenuTrack(主菜单)'}</MenuItem>
                    <MenuItem value='Peace'>{'Peace(和平)'}</MenuItem>
                    <MenuItem value='TinyFight'>
                      {'TinyFight(小规模战斗)'}
                    </MenuItem>
                    <MenuItem value='Fight'>{'Fight(大规模战斗)'}</MenuItem>
                    <MenuItem value='Advantage'>
                      {'Advantage(处于优势)'}
                    </MenuItem>
                    <MenuItem value='Disadvantage'>
                      {'Disadvantage(处于劣势)'}
                    </MenuItem>
                    <MenuItem value='Disaster'>
                      {'Disaster(遭受战术打击)'}
                    </MenuItem>
                    <MenuItem value='PostGameVictory'>
                      {'PostGameVictory(胜利)'}
                    </MenuItem>
                    <MenuItem value='PostGameDefeat'>
                      {'PostGameDefeat(失败)'}
                    </MenuItem>
                  </Select>
                </FormControl>
                <div
                  className={css`
                    margin: 8px 0px;
                  `}
                />
                <TextField
                  fullWidth
                  variant='filled'
                  type='number'
                  label='BPM'
                  value={trackBpm}
                  onChange={(e) =>
                    setStore((store) => ({
                      ...store,
                      state: {
                        ...store.state,
                        trackBpm: +e.target.value,
                      },
                    }))
                  }
                />
                <div
                  className={css`
                    margin-left: 16px;
                  `}
                >
                  <FormControlLabel
                    label='启用节拍器'
                    control={
                      <Switch
                        checked={trackAllowBeats}
                        onChange={(_e, checked) =>
                          setStore((store) => ({
                            ...store,
                            state: {
                              ...store.state,
                              trackAllowBeats: checked,
                            },
                          }))
                        }
                      />
                    }
                  />
                </div>
                <TextField
                  fullWidth
                  variant='filled'
                  type='number'
                  disabled={!trackAllowBeats}
                  label='节拍偏移'
                  value={trackBeatsOffset}
                  onChange={(e) =>
                    setStore((store) => ({
                      ...store,
                      state: {
                        ...store.state,
                        trackBeatsOffset: +e.target.value,
                      },
                    }))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <div
                          className={css`
                            margin-top: 16px;
                          `}
                        >
                          {'ms'}
                        </div>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  variant='filled'
                  type='number'
                  disabled={!trackAllowBeats}
                  label='每节拍数'
                  value={trackBeatsPerBar}
                  onChange={(e) =>
                    setStore((store) => ({
                      ...store,
                      state: {
                        ...store.state,
                        trackBeatsPerBar: +e.target.value,
                      },
                    }))
                  }
                />
                <div
                  className={css`
                    margin: 8px 0px;
                  `}
                />
                <Button
                  fullWidth
                  variant='outlined'
                  onClick={() =>
                    setStore((store) => ({
                      ...store,
                      state: {
                        ...store.state,
                        unitWeightConfigDialogOpen: true,
                      },
                    }))
                  }
                >
                  {'调整单位权值'}
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  onClick={() =>
                    setStore((store) => ({
                      ...store,
                      state: {
                        ...store.state,
                        fsmConfigDialogOpen: true,
                      },
                    }))
                  }
                >
                  {'调整全局权值'}
                </Button>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
      {/* 素材库 */}
      <div
        className={css`
          position: absolute;
          left: 0px;
          top: 50vh;
          width: 20vw;
          height: 50vh;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px;
          box-sizing: border-box;
        `}
      >
        <div
          className={css`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <div
            className={css`
              margin-left: 8px;
              user-select: none;
            `}
          >
            <Typography variant='h6'>{'素材库'}</Typography>
          </div>
          <IconButton
            size='small'
            onClick={() =>
              setStore((store) => ({
                ...store,
                state: {
                  ...store.state,
                  musicFileSelectorDialogOpen: true,
                },
              }))
            }
            disabled={sourceJsonPath === ''}
          >
            <Icon path={mdiPlus} size={0.8} />
          </IconButton>
        </div>
        <div
          className={css`
            width: 100%;
            height: calc(100% - 32px);
            user-select: none;
          `}
        >
          <Scrollbars
            className={css`
              width: 100%;
              height: 100%;
            `}
          >
            <List>
              {Object.keys(musicFilePathMap).map((id) => (
                <ListItem>
                  <ListItemText primary={id} />
                  <ListItemSecondaryAction>
                    <IconButton size='small'>
                      <Icon path={mdiDotsVertical} size={0.8} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Scrollbars>
        </div>
      </div>
      {/* 可视化音频区域 */}
      <div
        className={css`
          position: absolute;
          left: 20vw;
          top: 64px;
          width: 80vw;
          height: calc(100vh - 64px);
          padding: 16px;
          box-sizing: border-box;
        `}
      >
        <Scrollbars
          className={css`
            width: 100%;
            height: 100%;
          `}
        >
          <div
            className={css`
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 16px;
              box-sizing: border-box;
            `}
          >
            {Object.keys(tracks).map((id) => (
              <Player
                track={tracks[id]}
                trackId={id}
                audioPlayerRef={audioPlayerRef}
                audioOriginDataRef={audioOriginDataRef}
              />
            ))}
            <div
              className={css`
                margin: 32px 0px;
              `}
            >
              <Button
                onClick={() => setGenerateNewTrackDialogOpen(true)}
                disabled={sourceJsonPath === ''}
              >
                <Icon path={mdiPlus} size={1} />
                <div
                  className={css`
                    width: 8px;
                  `}
                />
                {'新建轨道'}
              </Button>
            </div>
            {/* 新建轨道的命名窗口 */}
            <PromptBase
              title='新建轨道'
              open={generateNewTrackDialogOpen}
              onConfirm={() => (
                setStore((store) => ({
                  ...store,
                  data: {
                    ...store.data,
                    tracks: {
                      ...store.data.tracks,
                      [generate()]: {
                        name: generateNewTrackDialogTrackName,
                        order: Object.keys(store.data.tracks).length,
                        musicId:
                          Object.keys(musicFilePathMap)[
                            generateNewTrackDialogSelected
                          ],
                        startOffset: 0,
                        length: 0,
                        beatsPerMinutes: 0,
                        beatsPerBar: 0,
                        checkPoints: [],
                        defaultCheckPoints: [],
                      },
                    },
                  },
                })),
                setGenerateNewTrackDialogOpen(false),
                setGenerateNewTrackDialogSelected(0)
              )}
              onClose={() => setGenerateNewTrackDialogOpen(false)}
            >
              <FormControl fullWidth variant='filled'>
                <InputLabel>{'使用的音乐素材'}</InputLabel>
                <Select
                  value={generateNewTrackDialogSelected}
                  onChange={(e) =>
                    setGenerateNewTrackDialogSelected(
                      +(e.target.value as string)
                    )
                  }
                >
                  {Object.keys(musicFilePathMap).map((id, index) => (
                    <MenuItem value={index}>{id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label='轨道名'
                variant='filled'
                fullWidth
                value={generateNewTrackDialogTrackName}
                onChange={(e) =>
                  setGenerateNewTrackDialogTrackName(e.target.value)
                }
              />
            </PromptBase>
          </div>
        </Scrollbars>
      </div>
      {/* 子窗口 */}
      <FileSelector
        fileNameRegExp={/\.json$/}
        open={jsonFileSelectorDialogOpen}
        onSelect={(path) =>
          send('readJsonFile', { path }).then(
            ({
              hasSuccess,
              reason,
              musicFiles,
              tracks,
              fsmConfig,
              unitWeight,
            }) =>
              hasSuccess
                ? (setStore((store) => ({
                    ...store,
                    data: {
                      ...store.data,
                      sourceJsonPath: path,
                      musicFilePathMap: musicFiles,
                      tracks,
                      fsmConfig,
                      unitWeight,
                    },
                  })),
                  enqueueSnackbar('获取成功', { variant: 'success' }))
                : enqueueSnackbar(`获取失败：${reason}`, { variant: 'error' })
          )
        }
        onClose={() =>
          setStore((store) => ({
            ...store,
            state: {
              ...store.state,
              jsonFileSelectorDialogOpen: false,
            },
          }))
        }
      />
      <FileSelector
        fileNameRegExp={/\.mp3$/}
        open={musicFileSelectorDialogOpen}
        onSelect={(path) =>
          send('loadMusicFile', { path }).then(
            ({ hasSuccess, reason, fileName, httpRoutePath }) =>
              hasSuccess
                ? (setStore((store) => ({
                    ...store,
                    data: {
                      ...store.data,
                      musicFilePathMap: {
                        ...store.data.musicFilePathMap,
                        [fileName]: httpRoutePath,
                      },
                    },
                  })),
                  enqueueSnackbar('文件添加成功', { variant: 'success' }))
                : enqueueSnackbar(`文件添加失败：${reason}`, {
                    variant: 'error',
                  })
          )
        }
        onClose={() =>
          setStore((store) => ({
            ...store,
            state: {
              ...store.state,
              musicFileSelectorDialogOpen: false,
            },
          }))
        }
      />
      <UnitWeightConfig />
      <FsmConfig />
    </div>
  );
}
