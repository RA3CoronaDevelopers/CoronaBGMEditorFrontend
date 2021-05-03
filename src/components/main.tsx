import React, { useState, useContext } from 'react';
import {
  Typography, IconButton,
  Popover, List, ListItem, ListItemText
} from '@material-ui/core';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import { mdiFileSettingsOutline } from '@mdi/js';
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
  `}>
    <div className={css`
      max-width: 72em;
      width: calc(100% - 16px);
      height: calc(100% - 16px);
      background: rgba(255, 255, 255, 0.6);
      border-radius: 4px;
      position: relative;
    `}>
      {/* 标题栏 */}
      <div className={css`
        position: absolute;
        left: 16px;
        top: 8px;
      `}>
        <Typography variant='h5' className={css`
          user-select: none;
        `}>{'日冕 BGM 编辑器'}</Typography>
        <div className={css`
          display: flex;
          flex-direction: row;
          align-items: center;
        `}>
          <div className={css`
            margin-right: 8px;
          `}>
            <IconButton size='small' onClick={e => setXmlSelectMenuAnchorEl(e.currentTarget)}>
              <Icon path={mdiFileSettingsOutline} size={0.5} />
            </IconButton>
          </div>
          <Typography variant='body2' className={css`
            ${trackXmlPath === '' ? 'user-select: none;' : ''}
          `}>
            {trackXmlPath === '' ? `未打开文件，点击左侧按钮以打开配置文件` : trackXmlPath}
          </Typography>
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
        left: 24px;
        right: 24px;
        top: 72px;
      `}>
        <Panel />
      </div>
      {/* 可视化音频区域 */}
      <div className={css`
        position: absolute;
        left: 24px;
        right: 24px;
        bottom: 16px;
      `}>
        <Player />
      </div>
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