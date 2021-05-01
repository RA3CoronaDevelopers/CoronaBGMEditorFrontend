import React, { useContext, useEffect } from 'react';
import {
  Typography, Button,
  List, ListItem, ListItemText, ListItemIcon, IconButton
} from '@material-ui/core';
import { css } from '@emotion/css';
import { CSSTransition } from 'react-transition-group';
import { Scrollbars } from 'react-custom-scrollbars';
import { Icon } from '@mdi/react';
import { mdiFolderOutline, mdiFileOutline, mdiChevronRight, mdiArrowUp } from '@mdi/js';
import { StoreContext } from '../utils/storeContext';
import { send, receive } from '../utils/websocketClient';

export function FileSelector() {
  const { setStore, state: {
    fileSelectorOpen,
    fileSelectorPath,
    fileSelectorDirContent
  } } = useContext(StoreContext);

  useEffect(() => {
    receive('setFileSelectorDir', ({ path, dirContent }) => setStore(store => ({
      ...store,
      state: {
        ...store.state,
        fileSelectorPath: path,
        fileSelectorDirContent: dirContent
      }
    })));
    send({ type: 'getProcessDir' });
  }, []);

  return <CSSTransition in={fileSelectorOpen} timeout={200} unmountOnExit classNames={{
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
          `}>{'选择入口 track.xml 文件'}</Typography>
          <div className={css`
            margin-top: 8px;
            display: flex;
            flex-direction: row;
            align-items: center;
          `}>
            <div className={css`
              margin-right: 8px;
            `}>
              <IconButton
                size='small'
                onClick={() => send({
                  type: 'getPreviousLevelDir',
                  path: fileSelectorPath
                })}
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
              ], [])}
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
                    type: 'getNextLevelDir',
                    path: fileSelectorPath,
                    dirName: name
                  }) : void 0}
              >
                <ListItemIcon>
                  <Icon
                    path={fileSelectorDirContent[name] === 'dir'
                      ? mdiFolderOutline
                      : mdiFileOutline}
                    size={1}
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
          <Button onClick={() => (
            setStore(store => ({
              ...store, state: {
                ...store.state, fileSelectorOpen: false
              }
            }))
          )}>{'在该位置写入模板XML'}</Button>
          <Button onClick={() => (
            setStore(store => ({
              ...store, state: {
                ...store.state, fileSelectorOpen: false
              }
            }))
          )}>{'新建文件夹'}</Button>
          <Button onClick={() => (
            setStore(store => ({
              ...store, state: {
                ...store.state, fileSelectorOpen: false
              }
            }))
          )}>{'取消'}</Button>
        </div>
      </div>
    </div>
  </CSSTransition>;
}