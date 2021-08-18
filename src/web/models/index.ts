import { useState, useContext, useRef } from 'react';
import { useSnackbar } from 'notistack';

import { StoreContext } from '../utils/storeContext';

export function useData() {
  const { enqueueSnackbar } = useSnackbar();
  const {
    setStore,
    data: { sourceJsonPath, tracks, musicFilePathMap },
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
    useState('新轨道');
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
    enqueueSnackbar,

    audioPlayerRef,
    audioOriginDataRef,
    
    // TODO - 清理所有的 setStore，点击事件完全移交到 model 层处理
    setStore,
  };
}
