import React, { useContext, useEffect, useState } from 'react';
import {
  Typography, Button, Popover, Tooltip, Drawer,
  List, ListItem, ListItemText, ListItemIcon, IconButton, TextField
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { css } from '@emotion/css';
import { Scrollbars } from 'react-custom-scrollbars';
import { Icon } from '@mdi/react';
import {
  mdiFolderOutline, mdiFileOutline, mdiChevronRight, mdiArrowUp, mdiServerNetwork, mdiRefresh
} from '@mdi/js';
import { useSnackbar } from 'notistack';
import { StoreContext } from '../utils/storeContext';
import { send } from '../utils/websocketClient';
import { PromptDrawer } from './promptDrawer';

const DEFAULT_XML_NAME = 'Tracks.xml';
const DEFAULT_XML_VALUE = `<?xml version="1.0" encoding="utf-8"?>
<!--
  【轨道配置文件说明】
  【Includes - 引用列表】
  子标签：
  - Include：引用其他文件

  【Include - 引用其他 XML 文件】
  属性：
  - Path：文件路径，可以是相对路径

  【MusicFile - 引用音乐文件】
  属性：
  - MusicId：音乐ID
  - Path：音乐路径，可以是相对路径

  【Track - 定义音乐轨道】
  属性：
  - Id：轨道 ID
  - MusicId: 轨道对应的音乐。多个轨道可以使用同一首音乐
  - Length：轨道时长
  子标签：
  - DefaultCheckPoint：默认检查点，只能有一个
  - CheckPoint：普通检查点，可以有多个
  - StartOffset：起始偏移时间
  - BeatsPerMinutes：节拍器每分钟多少拍
  - BeatsPerBar：节拍器一小节多少拍

  【DefaultCheckPoint - 默认检查点】
  用来在任意时刻决定是否跳转到另一个音乐轨道。
  子标签：
  - Destinations：跳转目标列表

  【CheckPoint - 普通检查点】
  用来在某一个特定时刻决定是否跳转到另一个音乐轨道。
  属性：
  - Time：检查点触发的时间，不应大于轨道时长；在 XML 里，每个检查点应该按照各自的时间先后排列
  子标签：
  - DefaultDestinations：默认跳转列表
  - Destinations：跳转目标列表

  【DefaultDestinations - 默认跳转列表】
  假如定义了默认跳转列表，并且检查点里没有其他符合条件的跳转目标的话，就会按照默认列表执行跳转。
  子标签：
  - JumpTo：跳转目标。假如列表里有多个跳转目标，那么跳转时会随机选择一个

  【Destinations - 跳转列表】
  属性：
  - Condition：此跳转列表应该在哪个条件下触发
  子标签：
  - JumpTo：跳转目标。假如列表里有多个跳转目标，那么跳转时会随机选择一个


  【JumpTo - 跳转目标】
  属性：
  - TargetTrackId：目标轨道 ID。假如 ID 是小写 default 的话，将会跳转到当前设置的默认轨道
  - TargetOffset：跳转到几分几秒
  - FadeOutDelay：当前的轨道还要继续正常播放多长时间，假如是 0，会立即开始淡出
  - FadeOutDuration：当前的轨道正常播放完毕之后，淡出要持续多长时间，假如是 0，会立即停止播放
  - TargetFadeInDelay：目标轨道还要等待多长时间之后才开始播放，假如是 0，会立即开始播放
  - TargetFadeInDuration：目标轨道开始播放之后，要花多长时间淡入
-->
<XmlBgmData xmlns="clr-namespace:CoronaBGMPlayer;assembly=CoronaBGMPlayer">
</XmlBgmData>`;

export function FileSelector({ fileNameRegExp, open, onSelect, onClose }: {
  fileNameRegExp: RegExp, open: boolean,
  onSelect: (path: string) => void, onClose: () => void
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { setStore, state: {
    fileSelectorPath,
    fileSelectorDirContent,
    fileSelectorDiskList
  } } = useContext(StoreContext);
  const [diskSelectorAnchorEl, setDiskSelectorAnchorEl] =
    useState<HTMLButtonElement | undefined>(undefined);
  const [createFileDialogOpen, setCreateFileDialogOpen] = useState(undefined);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(undefined);
  const [createFileDialogValue, setCreateFileDialogValue] = useState(DEFAULT_XML_NAME);
  const [createFolderDialogValue, setCreateFolderDialogValue] = useState('');


  useEffect(() => {
    send('getProcessDir', {}).then(({ path, dirContent }) => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fileSelectorPath: path,
        fileSelectorDirContent: dirContent
      }
    })));
    send('getDiskList', {}).then(({ disks }) => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fileSelectorDiskList: disks
      }
    })));
  }, []);

  return <Drawer anchor='right' open={open} onClose={onClose}>
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
        `}>{'选择文件'}</Typography>
        <div className={css`
          margin-top: 8px;
          display: flex;
          flex-direction: row;
          align-items: center;
        `}>
          <div className={css`
            position: relative;
            margin-right: 8px;
          `}>
            <Tooltip title='选择驱动器'>
              <IconButton
                size='small'
                onClick={e => setDiskSelectorAnchorEl(e.currentTarget)}
              >
                <Icon path={mdiServerNetwork} size={0.8} />
              </IconButton>
            </Tooltip>
            <Popover
              open={!!diskSelectorAnchorEl}
              anchorEl={diskSelectorAnchorEl}
              onClose={() => setDiskSelectorAnchorEl(undefined)}
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
                {fileSelectorDiskList.map(name => <ListItem
                  button
                  onClick={() => (
                    send('getDir', {
                      path: name
                    }).then(({ path, dirContent }) => setStore(store => ({
                      ...store,
                      state: {
                        ...store.state,
                        fileSelectorPath: path,
                        fileSelectorDirContent: dirContent
                      }
                    }))),
                    setDiskSelectorAnchorEl(undefined)
                  )}
                >
                  <ListItemText primary={name} />
                </ListItem>)}
              </List>
              {fileSelectorDiskList.length === 0 && <div className={css`
                margin: 8px;
              `}>
                <Typography variant='body1'>
                  {'请稍等，磁盘信息正在获取'}
                </Typography>
              </div>}
            </Popover>
          </div>
          <div className={css`
            margin-right: 8px;
          `}>
            <Tooltip title='返回上一级'>
              <IconButton
                size='small'
                onClick={() => send('getPreviousDir', {
                  path: fileSelectorPath
                }).then(({ path, dirContent }) => setStore(store => ({
                  ...store,
                  state: {
                    ...store.state,
                    fileSelectorPath: path,
                    fileSelectorDirContent: dirContent
                  }
                })))}
                disabled={/^[A-Z]:[\\\/]$/.test(fileSelectorPath)}
              >
                <Icon path={mdiArrowUp} size={0.8} />
              </IconButton>
            </Tooltip>
          </div>
          <div className={css`
            margin-right: 8px;
          `}>
            <Tooltip title='刷新'>
              <IconButton
                size='small'
                onClick={() => send('getDir', {
                  path: fileSelectorPath
                }).then(({ path, dirContent }) => setStore(store => ({
                  ...store,
                  state: {
                    ...store.state,
                    fileSelectorPath: path,
                    fileSelectorDirContent: dirContent
                  }
                })))}
              >
                <Icon path={mdiRefresh} size={0.8} />
              </IconButton>
            </Tooltip>
          </div>
          {fileSelectorPath.split(/[\\\/]/).filter(n => n.length > 0).map(name =>
            <Typography
              className={css`
                user-select: none;
              `}
              variant='body2'
            >
              {name}
            </Typography>).reduce((arr, button, index) => [
              ...arr,
              ...(index > 0 ? [<div className={css`
                margin: 0px 4px;
              `}>
                <Icon path={mdiChevronRight} size={0.8} />
              </div>] : []),
              button
            ], []).reverse().slice(0, 6).reverse()}
        </div>
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
            {Object.keys(fileSelectorDirContent).map(name => <ListItem
              button
              onClick={() => fileSelectorDirContent[name] === 'dir'
                ? send('getDir', {
                  path: `${fileSelectorPath}\\${name}`,
                  dirName: name
                }).then(({ path, dirContent }) => setStore(store => ({
                  ...store,
                  state: {
                    ...store.state,
                    fileSelectorPath: path,
                    fileSelectorDirContent: dirContent
                  }
                }))) : fileNameRegExp.test(name)  // TODO - 追加上获取文件具体内容的代码
                  ? (onSelect(`${fileSelectorPath}\\${name}`), onClose())
                  : undefined}
            >
              <ListItemIcon>
                <Icon
                  path={fileSelectorDirContent[name] === 'dir'
                    ? mdiFolderOutline
                    : mdiFileOutline}
                  size={1}
                  color={fileNameRegExp.test(name) && fileSelectorDirContent[name] === 'file'
                    ? green[500] : '#fff'}
                />
              </ListItemIcon>
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
        <Button onClick={() => setCreateFileDialogOpen(true)}>{'新建XML模板文件'}</Button>
        <Button onClick={() => setCreateFolderDialogOpen(true)}>{'新建文件夹'}</Button>
        <Button onClick={() => onClose()}>{'取消'}</Button>
      </div>
      {/* 新建文件的命名窗口 */}
      <PromptDrawer
        title='新建XML模板文件'
        open={createFileDialogOpen}
        onConfirm={() => (
          send('createFile', {
            path: fileSelectorPath,
            name: createFileDialogValue,
            initContent: DEFAULT_XML_VALUE
          }).then(({ hasSuccess, reason, dirContent }) => hasSuccess
            ? (setCreateFileDialogOpen(false),
              enqueueSnackbar(`文件创建成功`, { variant: 'success' }),
              setStore(store => ({
                ...store,
                state: {
                  ...store.state,
                  fileSelectorDirContent: dirContent
                }
              })))
            : enqueueSnackbar(`文件创建失败： ${reason}`, { variant: 'error' })),
          setCreateFileDialogValue(DEFAULT_XML_NAME)
        )}
        onClose={() => (
          setCreateFileDialogOpen(false),
          setCreateFileDialogValue(DEFAULT_XML_NAME)
        )}
      >
        <TextField
          label='文件名' variant='filled' fullWidth
          value={createFileDialogValue}
          onChange={e => setCreateFileDialogValue(e.target.value)}
        />
      </PromptDrawer>
      {/* 新建文件夹的命名窗口 */}
      <PromptDrawer
        title='新建文件夹'
        open={createFolderDialogOpen}
        onConfirm={() => (
          send('createFolder', {
            path: fileSelectorPath,
            name: createFolderDialogValue
          }).then(({ hasSuccess, reason, dirContent }) => hasSuccess
            ? (setCreateFolderDialogOpen(false),
              enqueueSnackbar(`文件夹创建成功`, { variant: 'success' }),
              setStore(store => ({
                ...store,
                state: {
                  ...store.state,
                  fileSelectorDirContent: dirContent
                }
              })))
            : enqueueSnackbar(`文件夹创建失败： ${reason}`, { variant: 'error' })),
          setCreateFolderDialogValue(DEFAULT_XML_NAME)
        )}
        onClose={() => (
          setCreateFolderDialogOpen(false),
          setCreateFolderDialogValue('')
        )}
      >
        <TextField
          label='文件夹名' variant='filled' fullWidth
          value={createFolderDialogValue}
          onChange={e => setCreateFolderDialogValue(e.target.value)}
        />
      </PromptDrawer>
    </div>
  </Drawer>;
}