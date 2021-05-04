import React, { createContext, useState } from 'react';

export interface ITrack {
  name: string,
  usingMusicId: number,
  checkPoints: {
    progress: number,
    condition: {
      source: string,
      target: string,
      op: '==' | '!=' | '>=' | '<=' | '>' | '<'
    }[],
    targetTrackId: number,
    targetTrackProgress: number
  }[],
  defaultCheckPoints: {
    condition: {
      source: string,
      target: string,
      op: '==' | '!=' | '>=' | '<=' | '>' | '<'
    }[],
    targetTrackId: number,
    targetTrackProgress: number
  }[]
}

interface IStore {
  data: {
    sourceXmlPath: string,
    musicLibrary: {
      name: string,
      httpPath: string
    }[],
    trackList: ITrack[]
  },
  state: {
    fileSelectorPath: string,
    fileSelectorDirContent: { [name: string]: 'dir' | 'file' },
    fileSelectorDiskList: string[],

    editorSituation: string,
    nowPlayingTrack: number,
    trackBpm: number,
    trackAllowBeats: boolean,
    trackBeatsOffset: number,
    trackBeatsPerBar: number,

    unitWeightConfigDialogOpen: boolean
  }
}

export const StoreContext = createContext({} as IStore & {
  setStore(func: (obj: IStore) => IStore): void
});

export function Store({ children }: any) {
  const [store, setStore] = useState({
    data: {
      sourceXmlPath: '',
      musicLibrary: [{
        name: '国风版 两只老虎爱跳舞'
      }, {
        name: '昭和版 两只老虎爱跳舞'
      }, {
        name: '交响乐版 两只老虎爱跳舞'
      }, {
        name: '苏联版 两只老虎爱跳舞'
      }],
      trackList: []
    },
    state: {
      fileSelectorPath: '',
      fileSelectorDirContent: {},
      fileSelectorDiskList: [],

      editorSituation: 'Mute',
      nowPlayingTrack: 0,

      trackBpm: 120,
      trackAllowBeats: false,
      trackBeatsOffset: 0,
      trackBeatsPerBar: 4,

      unitWeightConfigDialogOpen: false
    }
  } as IStore);
  return <StoreContext.Provider value={{
    ...store,
    setStore
  }}>
    {children}
  </StoreContext.Provider>
}
