import React, { useState, useContext } from 'react';
import {
  Typography, IconButton,
  Popover, List, ListItem, ListItemText
} from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiFileSettingsOutline, mdiPlay, mdiPlus } from '@mdi/js';
import { Scrollbars } from 'react-custom-scrollbars';
import { useSnackbar } from 'notistack';

import { StoreContext } from '../utils/storeContext';
import { Panel } from './panel';
import { Player } from './player';
import { FileSelector } from './fileSelector';

export function Main() {
  const { enqueueSnackbar } = useSnackbar();
  const { setStore, data: {
    trackXmlPath
  } } = useContext(StoreContext);
  const [xmlSelectDialogOpen, setXmlSelectDialogOpen] = useState(false);
  const [xmlSelectMenuAnchorEl, setXmlSelectMenuAnchorEl] = useState(undefined);

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
          {'00:00:00.000'}
        </Typography>
        <div className={css`
          margin: 8px;
        `}>
          <IconButton>
            <Icon path={mdiPlay} size={1} />
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
            ${trackXmlPath === '' ? 'user-select: none;' : ''}
          `}>
          {trackXmlPath === '' ? `未打开文件` : trackXmlPath}
        </Typography>
        <IconButton size='small' onClick={e => setXmlSelectMenuAnchorEl(e.currentTarget)}>
          <Icon path={mdiFileSettingsOutline} size={0.5} color='#fff' />
        </IconButton>
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
              text => (setStore(store => ({
                ...store,
                data: {
                  ...store.data,
                  // TODO - 在获取到剪贴板的同时向服务器发起下载指令，这也能同时验证这路径是否可用
                  trackXmlPath: text
                }
              })), enqueueSnackbar('获取成功', { variant: 'success' }))).catch(
                () => enqueueSnackbar('获取失败', { variant: 'error' })
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
      <Panel />
    </div>
    {/* 素材库 */}
    <div className={css`
      position: absolute;
      left: 0px;
      top: 50vh;
      width: 20vw;
      height: 50vh;
      background: rgba(255, 255, 255, 0.2);
      padding: 16px;
      box-sizing: border-box;
    `}>
      <div className={css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      `}>
        <Typography variant='h6'>
          {'素材库'}
        </Typography>
        <IconButton>
          <Icon path={mdiPlus} size={1} />
        </IconButton>
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
        <Player id={1} />
        <Player id={2} />
        <Player id={3} />
        <Player id={4} />
        <Player id={5} />
        <Player id={6} />
      </Scrollbars>
    </div>
    {/* 子窗口 */}
    <FileSelector
      fileNameRegExp={/\.xml$/}
      open={xmlSelectDialogOpen}
      onSelect={path => setStore(store => ({
        ...store,
        data: {
          trackXmlPath: path
        }
      }))}
      onClose={() => setXmlSelectDialogOpen(false)}
    />
  </div >
}