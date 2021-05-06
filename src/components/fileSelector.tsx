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
<XmlBgmData xmlns="clr-namespace:CoronaBGMPlayer;assembly=CoronaBGMPlayer">
  <FsmConfig
    Interval="20"
    FightThreshold="120"
    AdvantageThreshold="2.7"
    DisadvantageThreshold="2.5" />
  <UnitWeight
    UnitId="AlliedScoutInfantry"
    Weight="200" />
  <UnitWeight
    UnitId="AlliedAntiInfantryInfantry"
    Weight="200" />
  <UnitWeight
    UnitId="AlliedAntiVehicleInfantry"
    Weight="300" />
  <UnitWeight
    UnitId="AlliedEngineer"
    Weight="500" />
  <UnitWeight
    UnitId="AlliedInfiltrationInfantry"
    Weight="1000" />
  <UnitWeight
    UnitId="AlliedCommandoTech1"
    Weight="2000" />
  <UnitWeight
    UnitId="AlliedMiner"
    Weight="1000" />
  <UnitWeight
    UnitId="AlliedAntiInfantryVehicle"
    Weight="750" />
  <UnitWeight
    UnitId="AlliedAntiAirVehicleTech1"
    Weight="800" />
  <UnitWeight
    UnitId="AlliedAntiVehicleVehicleTech1"
    Weight="950" />
  <UnitWeight
    UnitId="AlliedAntiStructureVehicle"
    Weight="1400" />
  <UnitWeight
    UnitId="AlliedAntiVehicleVehicleTech3"
    Weight="1600" />
  <UnitWeight
    UnitId="AlliedMCV"
    Weight="5000" />
  <UnitWeight
    UnitId="AlliedAntiGroundAircraft"
    Weight="1200" />
  <UnitWeight
    UnitId="AlliedFighterAircraft"
    Weight="1000" />
  <UnitWeight
    UnitId="AlliedSupportAircraft"
    Weight="1600" />
  <UnitWeight
    UnitId="AlliedBomberAircraft"
    Weight="2000" />
  <UnitWeight
    UnitId="AlliedSupersonicBomber"
    Weight="5000" />
  <UnitWeight
    UnitId="AlliedAntiNavalScout"
    Weight="750" />
  <UnitWeight
    UnitId="AlliedAntiAirShip"
    Weight="900" />
  <UnitWeight
    UnitId="AlliedAntiNavyShipTech1"
    Weight="1500" />
  <UnitWeight
    UnitId="AlliedAntiStructureShip"
    Weight="2000" />
  <UnitWeight
    UnitId="AlliedConstructionYard"
    Weight="5000" />
  <UnitWeight
    UnitId="AlliedOutPost"
    Weight="1000" />
  <UnitWeight
    UnitId="AlliedPowerPlant"
    Weight="800" />
  <UnitWeight
    UnitId="AlliedBarracks"
    Weight="500" />
  <UnitWeight
    UnitId="AlliedRefinery"
    Weight="2000" />
  <UnitWeight
    UnitId="AlliedWarFactory"
    Weight="2000" />
  <UnitWeight
    UnitId="AlliedNavalYard"
    Weight="1000" />
  <UnitWeight
    UnitId="AlliedAirfield"
    Weight="1000" />
  <UnitWeight
    UnitId="AlliedTechStructure"
    Weight="750" />
  <UnitWeight
    UnitId="AlliedWallPiece"
    Weight="10" />
  <UnitWeight
    UnitId="AlliedWallSegmentPiece"
    Weight="10" />
  <UnitWeight
    UnitId="AlliedBaseDefense"
    Weight="800" />
  <UnitWeight
    UnitId="AlliedBaseDefenseAdvanced"
    Weight="120" />
  <UnitWeight
    UnitId="AlliedSuperWeapon"
    Weight="1500" />
  <UnitWeight
    UnitId="AlliedSuperWeaponAdvanced"
    Weight="2500" />
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
        `}>
          {'选择文件'}
        </Typography>
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