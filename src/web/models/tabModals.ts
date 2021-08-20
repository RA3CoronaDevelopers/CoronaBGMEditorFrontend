import { useState, useContext } from "react";
import { useSnackbar } from "notistack";

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

  return {
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
    generateNewTrackDialogOpen,
    setGenerateNewTrackDialogOpen,
    generateNewTrackDialogSelected,
    setGenerateNewTrackDialogSelected,
    generateNewTrackDialogTrackName,
    setGenerateNewTrackDialogTrackName,

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
  };
}
