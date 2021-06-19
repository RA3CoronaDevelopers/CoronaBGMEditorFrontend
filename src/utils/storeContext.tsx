import React, { createContext, useState } from 'react';
import { ITrack, IFsmConfig, IUnitWeight } from './jsonConfigTypes';

interface IStore {
  data: {
    sourceJsonPath: string;
    musicFiles: {
      [id: string]: string;
    };
    tracks: ITrack[];
    fsmConfig: IFsmConfig;
    unitWeight: IUnitWeight;
  };
  state: {
    fileSelectorPath: string;
    fileSelectorDirContent: { [name: string]: 'dir' | 'file' };
    fileSelectorDiskList: string[];

    editorSituation: string;
    nowPlayingTrack: number;
    isPlaying: boolean;

    trackBpm: number;
    trackAllowBeats: boolean;
    trackBeatsOffset: number;
    trackBeatsPerBar: number;

    jsonFileSelectorDialogOpen: boolean;
    musicFileSelectorDialogOpen: boolean;
    unitWeightConfigDialogOpen: boolean;
    fsmConfigDialogOpen: boolean;
  };
}

export const StoreContext = createContext(
  {} as IStore & {
    setStore(func: (obj: IStore) => IStore): void;
  }
);

export function Store({ children }: any) {
  const [store, setStore] = useState({
    data: {
      sourceJsonPath: '',
      musicFiles: {},
      tracks: [],
      fsmConfig: {},
      unitWeight: {},
    },
    state: {
      fileSelectorPath: '',
      fileSelectorDirContent: {},
      fileSelectorDiskList: [],

      editorSituation: 'Mute',
      nowPlayingTrack: 0,
      isPlaying: false,

      trackBpm: 120,
      trackAllowBeats: false,
      trackBeatsOffset: 0,
      trackBeatsPerBar: 4,

      jsonFileSelectorDialogOpen: false,
      musicFileSelectorDialogOpen: false,
      unitWeightConfigDialogOpen: false,
      fsmConfigDialogOpen: false,
    },
  } as IStore);
  return (
    <StoreContext.Provider
      value={{
        ...store,
        setStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
