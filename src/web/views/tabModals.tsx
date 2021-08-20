import React from "react";
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
} from "@material-ui/core";
import { css } from "@emotion/css";
import { Icon } from "@mdi/react";
import {
  mdiContentSave,
  mdiDotsVertical,
  mdiFileSettingsOutline,
  mdiPause,
  mdiPlay,
  mdiPlus,
} from "@mdi/js";
import { Scrollbars } from "react-custom-scrollbars";

import { useData } from "../models/tabModals";

export function TabModels() {
  const {
    sourceJsonPath,
    tracks,
    musicFilePathMap,

    isPlaying,
    editorSituation,
    nowPlayingProgress,
    nowPlayingTrack,
    trackBpm,
    trackAllowBeats,
    trackBeatsOffset,
    trackBeatsPerBar,

    jsonSelectMenuAnchorEl,
    setJsonSelectMenuAnchorEl,

    onTogglePlayingState,
    onOpenJsonFileDialog,
    onOpenJsonFileFromClipboard,
    onSaveJsonFile,
    onChangeTrack,
    onChangeEditorSituation,
    onChangeBPM,
    onChangeTrackBeatsOffset,
    onChangeTrackBeatsPerBar,
    onToggleTrackAllowBeats,
    onOpenChangeUnitWeightConfigDialog,
    onOpenChangeFsmConfigDialog,
    onAddNewMaterial,
  } = useData();

  return (
    <>
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
            variant="h6"
            className={css`
              user-select: none;
            `}
          >
            {"" +
              `${Math.floor(nowPlayingProgress / 60) < 10 ? "0" : ""}` +
              Math.floor(nowPlayingProgress / 60) +
              ":" +
              `${nowPlayingProgress % 60 < 10 ? "0" : ""}` +
              Math.floor(nowPlayingProgress % 60) +
              "." +
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
              onClick={onTogglePlayingState}
              disabled={sourceJsonPath === ""}
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
            variant="caption"
            className={css`
              ${sourceJsonPath === "" ? "user-select: none;" : ""}
            `}
          >
            {sourceJsonPath === "" ? `未打开文件` : sourceJsonPath}
          </Typography>
          <div
            className={css`
              display: flex;
              flex-direction: row;
            `}
          >
            <Tooltip title="保存文件">
              <IconButton
                size="small"
                onClick={onSaveJsonFile}
                disabled={sourceJsonPath === ""}
              >
                <Icon path={mdiContentSave} size={0.8} color="#fff" />
              </IconButton>
            </Tooltip>
            <div
              className={css`
                width: 8px;
              `}
            />
            <Tooltip title="选择文件">
              <IconButton
                size="small"
                onClick={(e) => setJsonSelectMenuAnchorEl(e.currentTarget)}
              >
                <Icon path={mdiFileSettingsOutline} size={0.8} color="#fff" />
              </IconButton>
            </Tooltip>
          </div>
          <Popover
            open={!!jsonSelectMenuAnchorEl}
            anchorEl={jsonSelectMenuAnchorEl}
            onClose={() => setJsonSelectMenuAnchorEl(undefined)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <List>
              <ListItem button onClick={onOpenJsonFileDialog}>
                <ListItemText primary="选择文件..." />
              </ListItem>
              <ListItem button onClick={onOpenJsonFileFromClipboard}>
                <ListItemText primary="从剪贴板中获取路径" />
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
                <FormControl fullWidth variant="filled">
                  <InputLabel>{"当前轨道"}</InputLabel>
                  <Select
                    value={nowPlayingTrack}
                    onChange={(e) => onChangeTrack(e)}
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
                <FormControl fullWidth variant="filled">
                  <InputLabel>{"状态"}</InputLabel>
                  <Select
                    value={editorSituation}
                    onChange={(e) => onChangeEditorSituation(e)}
                  >
                    <MenuItem value="Mute">{"Mute(静音)"}</MenuItem>
                    <MenuItem value="MenuTrack">{"MenuTrack(主菜单)"}</MenuItem>
                    <MenuItem value="Peace">{"Peace(和平)"}</MenuItem>
                    <MenuItem value="TinyFight">
                      {"TinyFight(小规模战斗)"}
                    </MenuItem>
                    <MenuItem value="Fight">{"Fight(大规模战斗)"}</MenuItem>
                    <MenuItem value="Advantage">
                      {"Advantage(处于优势)"}
                    </MenuItem>
                    <MenuItem value="Disadvantage">
                      {"Disadvantage(处于劣势)"}
                    </MenuItem>
                    <MenuItem value="Disaster">
                      {"Disaster(遭受战术打击)"}
                    </MenuItem>
                    <MenuItem value="PostGameVictory">
                      {"PostGameVictory(胜利)"}
                    </MenuItem>
                    <MenuItem value="PostGameDefeat">
                      {"PostGameDefeat(失败)"}
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
                  variant="filled"
                  type="number"
                  label="BPM"
                  value={trackBpm}
                  onChange={(e) => onChangeBPM(e)}
                />
                <div
                  className={css`
                    margin-left: 16px;
                  `}
                >
                  <FormControlLabel
                    label="启用节拍器"
                    control={
                      <Switch
                        checked={trackAllowBeats}
                        onChange={(_e, checked) =>
                          onToggleTrackAllowBeats(checked)
                        }
                      />
                    }
                  />
                </div>
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  disabled={!trackAllowBeats}
                  label="节拍偏移"
                  value={trackBeatsOffset}
                  onChange={(e) => onChangeTrackBeatsOffset(e)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <div
                          className={css`
                            margin-top: 16px;
                          `}
                        >
                          {"ms"}
                        </div>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  disabled={!trackAllowBeats}
                  label="每节拍数"
                  value={trackBeatsPerBar}
                  onChange={(e) => onChangeTrackBeatsPerBar(e)}
                />
                <div
                  className={css`
                    margin: 8px 0px;
                  `}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onOpenChangeUnitWeightConfigDialog}
                >
                  {"调整单位权值"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onOpenChangeFsmConfigDialog}
                >
                  {"调整全局权值"}
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
            <Typography variant="h6">{"素材库"}</Typography>
          </div>
          <IconButton
            size="small"
            onClick={onAddNewMaterial}
            disabled={sourceJsonPath === ""}
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
                    <IconButton size="small">
                      <Icon path={mdiDotsVertical} size={0.8} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Scrollbars>
        </div>
      </div>
    </>
  );
}
