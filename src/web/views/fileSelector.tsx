import React, { useContext, useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Popover,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
} from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { css } from '@emotion/css';
import { Icon } from '@mdi/react';
import {
  mdiFolderOutline,
  mdiFileOutline,
  mdiChevronRight,
  mdiArrowUp,
  mdiServerNetwork,
  mdiRefresh,
} from '@mdi/js';
import { useSnackbar } from 'notistack';
import { StoreContext } from '../utils/storeContext';
import { send } from '../utils/remoteConnection';
import {
  defaultUnitWeight,
  defaultFsmConfig,
} from '../utils/jsonConfigTypes';
import { PromptBase } from '../components/promptBase';
import { DialogBase } from '../components/dialogBase';

const DEFAULT_FILE_NAME = 'tracks.json';
const DEFAULT_FILE_VALUE = JSON.stringify({
  musicFiles: {},
  unitWeight: defaultUnitWeight,
  fsmConfig: defaultFsmConfig,
  tracks: [],
});

export function FileSelector({
  fileNameRegExp,
  open,
  onSelect,
  onClose,
}: {
  fileNameRegExp: RegExp;
  open: boolean;
  onSelect: (path: string) => void;
  onClose: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    setStore,
    state: { fileSelectorPath, fileSelectorDirContent, fileSelectorDiskList },
  } = useContext(StoreContext);
  const [diskSelectorAnchorEl, setDiskSelectorAnchorEl] = useState<
    HTMLButtonElement | undefined
  >(undefined);
  const [createFileDialogOpen, setCreateFileDialogOpen] = useState(undefined);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] =
    useState(undefined);
  const [createFileDialogValue, setCreateFileDialogValue] =
    useState(DEFAULT_FILE_NAME);
  const [createFolderDialogValue, setCreateFolderDialogValue] = useState('');

  useEffect(() => {
    send('getProcessDir', {}).then(({ path, dirContent }) =>
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          fileSelectorPath: path,
          fileSelectorDirContent: dirContent,
        },
      }))
    );
    send('getDiskList', {}).then(({ disks }) =>
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          fileSelectorDiskList: disks,
        },
      }))
    );
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
            {'????????????'}
          </Typography>
          <div
            className={css`
              margin-top: 8px;
              display: flex;
              flex-direction: row;
              align-items: center;
            `}
          >
            <div
              className={css`
                position: relative;
                margin-right: 8px;
              `}
            >
              <Tooltip title='???????????????'>
                <IconButton
                  size='small'
                  onClick={(e) => setDiskSelectorAnchorEl(e.currentTarget)}
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
                  {fileSelectorDiskList.map((name) => (
                    <ListItem
                      button
                      onClick={() => (
                        send('getDir', {
                          path: name,
                        }).then(({ path, dirContent }) =>
                          setStore((store) => ({
                            ...store,
                            state: {
                              ...store.state,
                              fileSelectorPath: path,
                              fileSelectorDirContent: dirContent,
                            },
                          }))
                        ),
                        setDiskSelectorAnchorEl(undefined)
                      )}
                    >
                      <ListItemText primary={name} />
                    </ListItem>
                  ))}
                </List>
                {fileSelectorDiskList.length === 0 && (
                  <div
                    className={css`
                      margin: 8px;
                    `}
                  >
                    <Typography variant='body1'>
                      {'????????????????????????????????????'}
                    </Typography>
                  </div>
                )}
              </Popover>
            </div>
            <div
              className={css`
                margin-right: 8px;
              `}
            >
              <Tooltip title='???????????????'>
                <IconButton
                  size='small'
                  onClick={() =>
                    send('getPreviousDir', {
                      path: fileSelectorPath,
                    }).then(({ path, dirContent }) =>
                      setStore((store) => ({
                        ...store,
                        state: {
                          ...store.state,
                          fileSelectorPath: path,
                          fileSelectorDirContent: dirContent,
                        },
                      }))
                    )
                  }
                  disabled={/^[A-Z]:[\\\/]$/.test(fileSelectorPath)}
                >
                  <Icon path={mdiArrowUp} size={0.8} />
                </IconButton>
              </Tooltip>
            </div>
            <div
              className={css`
                margin-right: 8px;
              `}
            >
              <Tooltip title='??????'>
                <IconButton
                  size='small'
                  onClick={() =>
                    send('getDir', {
                      path: fileSelectorPath,
                    }).then(({ path, dirContent }) =>
                      setStore((store) => ({
                        ...store,
                        state: {
                          ...store.state,
                          fileSelectorPath: path,
                          fileSelectorDirContent: dirContent,
                        },
                      }))
                    )
                  }
                >
                  <Icon path={mdiRefresh} size={0.8} />
                </IconButton>
              </Tooltip>
            </div>
            {fileSelectorPath
              .split(/[\\\/]/)
              .filter((n) => n.length > 0)
              .map((name) => (
                <Typography
                  className={css`
                    user-select: none;
                  `}
                  variant='body2'
                >
                  {name}
                </Typography>
              ))
              .reduce(
                (arr, button, index) => [
                  ...arr,
                  ...(index > 0
                    ? [
                        <div
                          className={css`
                            margin: 0px 4px;
                          `}
                        >
                          <Icon path={mdiChevronRight} size={0.8} />
                        </div>,
                      ]
                    : []),
                  button,
                ],
                []
              )
              .reverse()
              .slice(0, 6)
              .reverse()}
          </div>
        </>
      }
      footer={
        <>
          <Button onClick={() => setCreateFileDialogOpen(true)}>
            {'??????????????????'}
          </Button>
          <Button onClick={() => setCreateFolderDialogOpen(true)}>
            {'???????????????'}
          </Button>
          <Button onClick={onClose}>{'??????'}</Button>
        </>
      }
    >
      <List>
        {Object.keys(fileSelectorDirContent).map((name) => (
          <ListItem
            button
            onClick={() =>
              fileSelectorDirContent[name] === 'dir'
                ? send('getDir', {
                    path: `${fileSelectorPath}\\${name}`,
                    dirName: name,
                  }).then(({ path, dirContent }) =>
                    setStore((store) => ({
                      ...store,
                      state: {
                        ...store.state,
                        fileSelectorPath: path,
                        fileSelectorDirContent: dirContent,
                      },
                    }))
                  )
                : fileNameRegExp.test(name) // TODO - ??????????????????????????????????????????
                ? (onSelect(`${fileSelectorPath}\\${name}`), onClose())
                : undefined
            }
          >
            <ListItemIcon>
              <Icon
                path={
                  fileSelectorDirContent[name] === 'dir'
                    ? mdiFolderOutline
                    : mdiFileOutline
                }
                size={1}
                color={
                  fileNameRegExp.test(name) &&
                  fileSelectorDirContent[name] === 'file'
                    ? green[500]
                    : '#fff'
                }
              />
            </ListItemIcon>
            <ListItemText primary={name} />
          </ListItem>
        ))}
      </List>
      {/* ??????????????????????????? */}
      <PromptBase
        title='??????????????????'
        open={createFileDialogOpen}
        onConfirm={() => (
          send('createFile', {
            path: fileSelectorPath,
            name: createFileDialogValue,
            initContent: DEFAULT_FILE_VALUE,
          }).then(({ hasSuccess, reason, dirContent }) =>
            hasSuccess
              ? (setCreateFileDialogOpen(false),
                enqueueSnackbar(`??????????????????`, { variant: 'success' }),
                setStore((store) => ({
                  ...store,
                  state: {
                    ...store.state,
                    fileSelectorDirContent: dirContent,
                  },
                })))
              : enqueueSnackbar(`????????????????????? ${reason}`, {
                  variant: 'error',
                })
          ),
          setCreateFileDialogValue(DEFAULT_FILE_NAME)
        )}
        onClose={() => (
          setCreateFileDialogOpen(false),
          setCreateFileDialogValue(DEFAULT_FILE_NAME)
        )}
      >
        <TextField
          label='?????????'
          variant='filled'
          fullWidth
          value={createFileDialogValue}
          onChange={(e) => setCreateFileDialogValue(e.target.value)}
        />
      </PromptBase>
      {/* ?????????????????????????????? */}
      <PromptBase
        title='???????????????'
        open={createFolderDialogOpen}
        onConfirm={() => (
          send('createFolder', {
            path: fileSelectorPath,
            name: createFolderDialogValue,
          }).then(({ hasSuccess, reason, dirContent }) =>
            hasSuccess
              ? (setCreateFolderDialogOpen(false),
                enqueueSnackbar(`?????????????????????`, { variant: 'success' }),
                setStore((store) => ({
                  ...store,
                  state: {
                    ...store.state,
                    fileSelectorDirContent: dirContent,
                  },
                })))
              : enqueueSnackbar(`???????????????????????? ${reason}`, {
                  variant: 'error',
                })
          ),
          setCreateFolderDialogValue(DEFAULT_FILE_NAME)
        )}
        onClose={() => (
          setCreateFolderDialogOpen(false), setCreateFolderDialogValue('')
        )}
      >
        <TextField
          label='????????????'
          variant='filled'
          fullWidth
          value={createFolderDialogValue}
          onChange={(e) => setCreateFolderDialogValue(e.target.value)}
        />
      </PromptBase>
    </DialogBase>
  );
}
