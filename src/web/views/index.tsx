import React, { useState, useContext, useEffect, useRef } from "react";
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

import { IEditorSituation, StoreContext } from "../utils/storeContext";
import { PromptBase } from "../components/promptBase";
import { Player } from "./player";
import { FileSelector } from "./fileSelector";
import { UnitWeightConfig } from "./unitWeightConfig";
import { FsmConfig } from "./fsmConfig";
import { useData } from "../models";

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

    audioPlayerRef,
    audioOriginDataRef,

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
    onAddNewTrack,
    onReadJsonFile,
    onCloseJsonFileDialog,
    onReadMaterial,
    onCloseMaterialSelectDialog,
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
      {/* ????????? */}
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
          variant="h5"
          className={css`
            user-select: none;
          `}
        >
          {"?????? BGM ?????????"}
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
            {sourceJsonPath === "" ? `???????????????` : sourceJsonPath}
          </Typography>
          <div
            className={css`
              display: flex;
              flex-direction: row;
            `}
          >
            <Tooltip title="????????????">
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
            <Tooltip title="????????????">
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
                <ListItemText primary="????????????..." />
              </ListItem>
              <ListItem button onClick={onOpenJsonFileFromClipboard}>
                <ListItemText primary="???????????????????????????" />
              </ListItem>
              {/* TODO - ???????????????????????????????????????????????????????????? */}
            </List>
          </Popover>
        </div>
      </div>
      {/* ???????????? */}
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
                  <InputLabel>{"????????????"}</InputLabel>
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
                  <InputLabel>{"??????"}</InputLabel>
                  <Select
                    value={editorSituation}
                    onChange={(e) => onChangeEditorSituation(e)}
                  >
                    <MenuItem value="Mute">{"Mute(??????)"}</MenuItem>
                    <MenuItem value="MenuTrack">{"MenuTrack(?????????)"}</MenuItem>
                    <MenuItem value="Peace">{"Peace(??????)"}</MenuItem>
                    <MenuItem value="TinyFight">
                      {"TinyFight(???????????????)"}
                    </MenuItem>
                    <MenuItem value="Fight">{"Fight(???????????????)"}</MenuItem>
                    <MenuItem value="Advantage">
                      {"Advantage(????????????)"}
                    </MenuItem>
                    <MenuItem value="Disadvantage">
                      {"Disadvantage(????????????)"}
                    </MenuItem>
                    <MenuItem value="Disaster">
                      {"Disaster(??????????????????)"}
                    </MenuItem>
                    <MenuItem value="PostGameVictory">
                      {"PostGameVictory(??????)"}
                    </MenuItem>
                    <MenuItem value="PostGameDefeat">
                      {"PostGameDefeat(??????)"}
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
                    label="???????????????"
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
                  label="????????????"
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
                  label="????????????"
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
                  {"??????????????????"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onOpenChangeFsmConfigDialog}
                >
                  {"??????????????????"}
                </Button>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
      {/* ????????? */}
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
            <Typography variant="h6">{"?????????"}</Typography>
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
      {/* ????????????????????? */}
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
                disabled={sourceJsonPath === ""}
              >
                <Icon path={mdiPlus} size={1} />
                <div
                  className={css`
                    width: 8px;
                  `}
                />
                {"????????????"}
              </Button>
            </div>
            {/* ??????????????????????????? */}
            <PromptBase
              title="????????????"
              open={generateNewTrackDialogOpen}
              onConfirm={() => onAddNewTrack}
              onClose={() => setGenerateNewTrackDialogOpen(false)}
            >
              <FormControl fullWidth variant="filled">
                <InputLabel>{"?????????????????????"}</InputLabel>
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
                label="?????????"
                variant="filled"
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
      {/* ????????? */}
      <FileSelector
        fileNameRegExp={/\.json$/}
        open={jsonFileSelectorDialogOpen}
        onSelect={(path) => onReadJsonFile(path)}
        onClose={onCloseJsonFileDialog}
      />
      <FileSelector
        fileNameRegExp={/\.mp3$/}
        open={musicFileSelectorDialogOpen}
        onSelect={(path) => onReadMaterial(path)}
        onClose={onCloseMaterialSelectDialog}
      />
      <UnitWeightConfig />
      <FsmConfig />
    </div>
  );
}
