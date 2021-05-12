import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Typography, IconButton, Button,
  Popover, List, ListItem, ListItemText, TextField,
  FormControl, InputLabel, Select, MenuItem, ListItemSecondaryAction, Tooltip
} from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiContentSave, mdiDotsVertical, mdiFileSettingsOutline, mdiPause, mdiPlay, mdiPlus } from '@mdi/js';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSnackbar } from 'notistack';

import { StoreContext } from '../utils/storeContext';
import { send } from '../utils/websocketClient';
import { PromptDrawer } from './promptDrawer';
import { Panel } from './panel';
import { Player } from './player';
import { FileSelector } from './fileSelector';
import { UnitWeightConfig } from './unitWeightConfig';
import { FsmConfig } from './fsmConfig';

export function Main() {
  const { enqueueSnackbar } = useSnackbar();
  const { setStore, data: {
    sourceXmlPath,
    tracks,
    musicFiles
  }, state: {
    isPlaying, progress
  } } = useContext(StoreContext);
  const [xmlSelectDialogOpen, setXmlSelectDialogOpen] = useState(false);
  const [xmlSelectMenuAnchorEl, setXmlSelectMenuAnchorEl] = useState(undefined);
  const [generateNewTrackDialogOpen, setGenerateNewTrackDialogOpen] = useState(false);
  const [generateNewTrackDialogSelected, setGenerateNewTrackDialogSelected] = useState(0);
  const [generateNewTrackDialogTrackName, setGenerateNewTrackDialogTrackName] = useState('新轨道');
  const [progressDiff, setProgressDiff] = useState(0);
  const progressCache = useRef(progress);
  const privateProgressInterval = useRef(undefined as (NodeJS.Timeout | undefined));

  useEffect(() => {
    if (isPlaying) {
      setProgressDiff(progress);
      const begin = (new Date()).getTime();
      privateProgressInterval.current = setInterval(() => {
        setProgressDiff((new Date()).getTime() - begin + progressCache.current * 1000);
      }, 100);
    } else {
      clearInterval(privateProgressInterval.current);
    }
  }, [isPlaying]);
  useEffect(() => {
    progressCache.current = progress;
  }, [progress]);

  return <div className={css`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  `}>
    {/* 标题栏 */}
    <div className={css`
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
    `}>
      <Typography variant='h5' className={css`
        user-select: none;
      `}>
        {'日冕 BGM 编辑器'}
      </Typography>
      <div className={css`
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      `}>
        <Typography variant='h6' className={css`
          user-select: none;
        `}>
          {isPlaying
            ? (progressDiff / 1000 / 60 < 10 ? '0' : '') +
            `${Math.floor(progressDiff / 1000 / 60)}` +
            ':' +
            (progressDiff / 1000 % 60 < 10 ? '0' : '') +
            `${Math.floor(progressDiff / 1000 % 60)}`
            : (progress / 60 < 10 ? '0' : '') + `${Math.floor(progress / 60)}` +
            ':' +
            (progress % 60 < 10 ? '0' : '') + `${Math.floor(progress % 60)}`}
        </Typography>
        <div className={css`
          margin: 8px;
        `}>
          <IconButton onClick={() => setStore(store => ({
            ...store,
            state: {
              ...store.state,
              isPlaying: !store.state.isPlaying
            }
          }))}>
            <Icon path={isPlaying ? mdiPause : mdiPlay} size={1} />
          </IconButton>
        </div>
      </div>
      <div className={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
      `}>
        <Typography variant='caption' className={css`
            ${sourceXmlPath === '' ? 'user-select: none;' : ''}
          `}>
          {sourceXmlPath === '' ? `未打开文件` : sourceXmlPath}
        </Typography>
        <div className={css`
          display: flex;
          flex-direction: row;
        `}>
          <Tooltip title='保存文件'>
            <IconButton size='small' onClick={() => send('saveXMLFile', {
              path: sourceXmlPath,
              tracks,
              musicFiles
            })}>
              <Icon path={mdiContentSave} size={0.8} color='#fff' />
            </IconButton>
          </Tooltip>
          <Tooltip title='选择文件'>
            <IconButton size='small' onClick={e => setXmlSelectMenuAnchorEl(e.currentTarget)}>
              <Icon path={mdiFileSettingsOutline} size={0.8} color='#fff' />
            </IconButton>
          </Tooltip>
        </div>
        <Popover
          open={!!xmlSelectMenuAnchorEl}
          anchorEl={xmlSelectMenuAnchorEl}
          onClose={() => setXmlSelectMenuAnchorEl(undefined)}
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
            <ListItem button onClick={() => (
              setXmlSelectDialogOpen(true),
              setXmlSelectMenuAnchorEl(undefined)
            )}>
              <ListItemText primary='选择文件...' />
            </ListItem>
            <ListItem button onClick={() => (navigator.clipboard.readText().then(
              text => send('readFile', { path: text }).then(({
                hasSuccess, reason,
                musicFiles, tracks, fsmConfig, unitWeight
              }) => (
                hasSuccess
                  ? (setStore(store => ({
                    ...store,
                    data: {
                      ...store.data,
                      sourceXmlPath: text,
                      musicFiles, tracks, fsmConfig, unitWeight
                    }
                  })), enqueueSnackbar('获取成功', { variant: 'success' }))
                  : enqueueSnackbar(`获取失败：${reason}`, { variant: 'error' })
              ))).catch(
                () => enqueueSnackbar('无法读取剪贴板', { variant: 'error' })
              ), setXmlSelectMenuAnchorEl(undefined))}>
              <ListItemText primary='从剪贴板中获取路径' />
            </ListItem>
            {/* TODO - 在做好配置文件存储之后，加上历史文件功能 */}
          </List>
        </Popover>
      </div>
    </div>
    {/* 控制面板 */}
    <div className={css`
      position: absolute;
      left: 0px;
      top: 64px;
      width: 20vw;
      height: calc(50vh - 64px);
      background: rgba(255, 255, 255, 0.1);
      padding: 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    `}>
      <div className={css`
        width: 100%;
        height: 100%;
      `}>
        <Scrollbars className={css`
          width: 100%;
          height: 100%;
        `}>
          <Panel />
        </Scrollbars>
      </div>
    </div>
    {/* 素材库 */}
    <div className={css`
      position: absolute;
      left: 0px;
      top: 50vh;
      width: 20vw;
      height: 50vh;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px;
      box-sizing: border-box;
    `}>
      <div className={css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      `}>
        <div className={css`
          margin-left: 8px;
          user-select: none;
        `}>
          <Typography variant='h6'>
            {'素材库'}
          </Typography>
        </div>
        <IconButton size='small'>
          <Icon path={mdiPlus} size={0.8} />
        </IconButton>
      </div>
      <div className={css`
        width: 100%;
        height: calc(100% - 32px);
        user-select: none;
      `}>
        <Scrollbars className={css`
          width: 100%;
          height: 100%;
        `}>
          <List>
            {Object.keys(musicFiles).map(id => <ListItem>
              <ListItemText primary={id} />
              <ListItemSecondaryAction>
                <IconButton size='small'>
                  <Icon path={mdiDotsVertical} size={0.8} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>)}
          </List>
        </Scrollbars>
      </div>
    </div>
    {/* 可视化音频区域 */}
    <div className={css`
      position: absolute;
      left: 20vw;
      top: 64px;
      width: 80vw;
      height: calc(100vh - 64px);
      padding: 16px;
      box-sizing: border-box;
    `}>
      <Scrollbars className={css`
        width: 100%;
        height: 100%;
      `}>
        <div className={css`
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}>
          {tracks.map((track, index) => <Player track={track} id={index} />)}
          <Button onClick={() => setGenerateNewTrackDialogOpen(true)}>
            <Icon path={mdiPlus} size={1} />
            {'新建轨道'}
          </Button>
          {/* 新建轨道的命名窗口 */}
          <PromptDrawer
            title='新建轨道'
            open={generateNewTrackDialogOpen}
            onConfirm={() => (
              setStore(store => ({
                ...store,
                data: {
                  ...store.data,
                  tracks: [...store.data.tracks, {
                    id: generateNewTrackDialogTrackName,
                    musicId: `${generateNewTrackDialogSelected}`,
                    startOffset: 0,
                    length: 0,
                    beatsPerMinutes: 0,
                    beatsPerBar: 0,
                    checkPoints: [],
                    defaultCheckPoints: []
                  }]
                }
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
                onChange={e => setGenerateNewTrackDialogSelected(
                  +(e.target.value as string)
                )}
              >
                {Object.keys(musicFiles).map((id, index) => <MenuItem value={index}>
                  {id}
                </MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label='轨道名' variant='filled' fullWidth
              value={generateNewTrackDialogTrackName}
              onChange={e => setGenerateNewTrackDialogTrackName(e.target.value)}
            />
          </PromptDrawer>
        </div>
      </Scrollbars>
    </div>
    {/* 子窗口 */}
    <FileSelector
      fileNameRegExp={/\.json$/}
      open={xmlSelectDialogOpen}
      onSelect={path => send('readFile', { path }).then(({
        hasSuccess, reason,
        musicFiles, tracks, fsmConfig, unitWeight
      }) => (
        hasSuccess
          ? (setStore(store => ({
            ...store,
            data: {
              ...store.data,
              sourceXmlPath: path,
              musicFiles, tracks, fsmConfig, unitWeight
            }
          })), enqueueSnackbar('获取成功', { variant: 'success' }))
          : enqueueSnackbar(`获取失败：${reason}`, { variant: 'error' })
      ))}
      onClose={() => setXmlSelectDialogOpen(false)}
    />
    <UnitWeightConfig />
    <FsmConfig />
  </div >
}