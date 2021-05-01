import React, { useContext, useEffect, useState } from 'react';
import {
  Typography, Button, Popover,
  List, ListItem, ListItemText, ListItemIcon, IconButton
} from '@material-ui/core';
import { css } from '@emotion/css';
import { CSSTransition } from 'react-transition-group';
import { Scrollbars } from 'react-custom-scrollbars';
import { Icon } from '@mdi/react';
import {
  mdiFolderOutline, mdiFileOutline, mdiChevronRight, mdiArrowUp, mdiServerNetwork
} from '@mdi/js';
import { StoreContext } from '../utils/storeContext';
import { send, receive } from '../utils/websocketClient';

export function FileSelector({ fileNameRegExp, open, onSelect, onClose }: {
  fileNameRegExp: RegExp, open: boolean,
  onSelect: (path: string) => void, onClose: () => void
}) {
  const { setStore, state: {
    fileSelectorPath,
    fileSelectorDirContent,
    fileSelectorDiskList
  } } = useContext(StoreContext);
  const [diskSelectorAnchorEl, setDiskSelectorAnchorEl] =
    useState<HTMLButtonElement | undefined>(undefined);

  useEffect(() => {
    receive('setFileSelectorDir', ({ path, dirContent }) => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fileSelectorPath: path,
        fileSelectorDirContent: dirContent
      }
    })));
    receive('setTrackXmlPath', ({ path }) => setStore(store => ({
      data: {
        ...store.data,
        trackXmlPath: path
      },
      state: {
        ...store.state,
        fileSelectorOpen: false
      }
    })));
    receive('setDiskList', ({ disks }) => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fileSelectorDiskList: disks
      }
    })));
    send({ type: 'getProcessDir' });
    send({ type: 'getDiskList' });
  }, []);

  return <CSSTransition in={open} timeout={200} unmountOnExit classNames={{
    enter: css`opacity: 0;`,
    enterActive: css`opacity: 1; transition: opacity .2s`,
    exit: css`opacity: 1;`,
    exitActive: css`opacity: 0; transition: opacity .2s;`
  }}>
    <div className={css`
      position: fixed;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
    `}>
      <div className={css`
        max-width: 36em;
        max-height: 32em;
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
              <IconButton
                size='small'
                onClick={e => setDiskSelectorAnchorEl(e.currentTarget)}
              >
                <Icon path={mdiServerNetwork} size={0.8} />
              </IconButton>
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
                      send({
                        type: 'getDir',
                        path: name
                      }),
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
              <IconButton
                size='small'
                onClick={() => send({
                  type: 'getPreviousDir',
                  path: fileSelectorPath
                })}
                disabled={/^[A-Z]:[\\\/]$/.test(fileSelectorPath)}
              >
                <Icon path={mdiArrowUp} size={0.8} />
              </IconButton>
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
                  <Icon path={mdiChevronRight} size={0.5} />
                </div>] : []),
                button
              ], []).reverse().slice(0, 6).reverse()}
          </div>
        </div>
        {/* 文件列表 */}
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
                  ? send({
                    type: 'getDir',
                    path: `${fileSelectorPath}\\${name}`,
                    dirName: name
                  }) : fileNameRegExp.test(name)
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
                      ? '#399' : '#000'}
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
          <Button onClick={() => onClose()} disabled>{'在该位置写入模板XML'}</Button>
          <Button onClick={() => onClose()} disabled>{'新建文件夹'}</Button>
          <Button onClick={() => onClose()}>{'取消'}</Button>
        </div>
      </div>
    </div>
  </CSSTransition>;
}