import { useState, useContext, useRef } from "react";
import { useSnackbar } from "notistack";
import { v4 as generate } from "uuid";

import { send } from "../utils/remoteConnection";
import { IEditorSituation, StoreContext } from "../utils/storeContext";

export function useData() {
  const { enqueueSnackbar } = useSnackbar();
  const {
    setStore,
    data: { sourceJsonPath, tracks, musicFilePathMap, fsmConfig, unitWeight },
    state: {
      isPlaying,
      // TODO - 尽快加入各个 Player 对 GainNode 的控制，以做到渐变效果
      editorSituation,
      nowPlayingProgress,
      jsonFileSelectorDialogOpen,
      musicFileSelectorDialogOpen,
      nowPlayingTrack,
      trackBpm,
      trackAllowBeats,
      trackBeatsOffset,
      trackBeatsPerBar,
    },
  } = useContext(StoreContext);
  const [jsonSelectMenuAnchorEl, setJsonSelectMenuAnchorEl] =
    useState(undefined);
  const [generateNewTrackDialogOpen, setGenerateNewTrackDialogOpen] =
    useState(false);
  const [generateNewTrackDialogSelected, setGenerateNewTrackDialogSelected] =
    useState(0);
  const [generateNewTrackDialogTrackName, setGenerateNewTrackDialogTrackName] =
    useState("新轨道");
  const audioPlayerRef = useRef(
    {} as { [audioName: string]: AudioBufferSourceNode }
  );
  const audioOriginDataRef = useRef({} as { [audioName: string]: AudioBuffer });

  return {
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

    onTogglePlayingState() {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          isPlaying: !store.state.isPlaying,
        },
      }));
    },
    onOpenJsonFileDialog() {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          jsonFileSelectorDialogOpen: true,
        },
      }));
      setJsonSelectMenuAnchorEl(undefined);
    },
    onOpenJsonFileFromClipboard() {
      navigator.clipboard
        .readText()
        .then((text) =>
          send("readJsonFile", { path: text }).then(
            ({
              hasSuccess,
              reason,
              musicFiles,
              tracks,
              fsmConfig,
              unitWeight,
            }) =>
              hasSuccess
                ? (setStore((store) => ({
                    ...store,
                    data: {
                      ...store.data,
                      sourceJsonPath: text,
                      musicFilePathMap: musicFiles,
                      tracks,
                      fsmConfig,
                      unitWeight,
                    },
                  })),
                  enqueueSnackbar("获取成功", {
                    variant: "success",
                  }))
                : enqueueSnackbar(`获取失败：${reason}`, {
                    variant: "error",
                  })
          )
        )
        .catch(() => enqueueSnackbar("无法读取剪贴板", { variant: "error" }));
      setJsonSelectMenuAnchorEl(undefined);
    },
    onSaveJsonFile() {
      send("writeJsonFile", {
        path: sourceJsonPath,
        obj: {
          tracks,
          musicFilePathMap,
          fsmConfig,
          unitWeight,
        },
      });
    },
    onChangeTrack(e) {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          nowPlayingTrack: e.target.value as string,
          nowPlayingProgress: 0,
        },
      }));
    },
    onChangeEditorSituation(e) {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          editorSituation: e.target.value as IEditorSituation,
        },
      }));
    },
    onChangeBPM(e) {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          trackBpm: +e.target.value,
        },
      }));
    },
    onChangeTrackBeatsOffset(e) {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          trackBeatsOffset: +e.target.value,
        },
      }));
    },
    onChangeTrackBeatsPerBar(e) {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          trackBeatsPerBar: +e.target.value,
        },
      }));
    },
    onToggleTrackAllowBeats(checked: boolean) {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          trackAllowBeats: checked,
        },
      }));
    },
    onOpenChangeUnitWeightConfigDialog() {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          unitWeightConfigDialogOpen: true,
        },
      }));
    },
    onOpenChangeFsmConfigDialog() {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          fsmConfigDialogOpen: true,
        },
      }));
    },
    onAddNewMaterial() {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          musicFileSelectorDialogOpen: true,
        },
      }));
    },
    onAddNewTrack() {
      setStore((store) => ({
        ...store,
        data: {
          ...store.data,
          tracks: {
            ...store.data.tracks,
            [generate()]: {
              name: generateNewTrackDialogTrackName,
              order: Object.keys(store.data.tracks).length,
              musicId:
                Object.keys(musicFilePathMap)[generateNewTrackDialogSelected],
              startOffset: 0,
              length: 0,
              beatsPerMinutes: 0,
              beatsPerBar: 0,
              checkPoints: [],
              defaultCheckPoints: [],
            },
          },
        },
      }));
      setGenerateNewTrackDialogOpen(false);
      setGenerateNewTrackDialogSelected(0);
    },
    onReadJsonFile(path: string) {
      send("readJsonFile", { path }).then(
        ({ hasSuccess, reason, musicFiles, tracks, fsmConfig, unitWeight }) =>
          hasSuccess
            ? (setStore((store) => ({
                ...store,
                data: {
                  ...store.data,
                  sourceJsonPath: path,
                  musicFilePathMap: musicFiles,
                  tracks,
                  fsmConfig,
                  unitWeight,
                },
              })),
              enqueueSnackbar("获取成功", { variant: "success" }))
            : enqueueSnackbar(`获取失败：${reason}`, { variant: "error" })
      );
    },
    onCloseJsonFileDialog() {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          jsonFileSelectorDialogOpen: false,
        },
      }));
    },
    onReadMaterial(path: string) {
      send("loadMusicFile", { path }).then(
        ({ hasSuccess, reason, fileName, httpRoutePath }) =>
          hasSuccess
            ? (setStore((store) => ({
                ...store,
                data: {
                  ...store.data,
                  musicFilePathMap: {
                    ...store.data.musicFilePathMap,
                    [fileName]: httpRoutePath,
                  },
                },
              })),
              enqueueSnackbar("文件添加成功", { variant: "success" }))
            : enqueueSnackbar(`文件添加失败：${reason}`, {
                variant: "error",
              })
      );
    },
    onCloseMaterialSelectDialog() {
      setStore((store) => ({
        ...store,
        state: {
          ...store.state,
          musicFileSelectorDialogOpen: false,
        },
      }));
    },
  };
}
