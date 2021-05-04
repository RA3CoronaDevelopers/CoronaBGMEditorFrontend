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
    isPlaying: boolean,
    progress: number,

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
      musicLibrary: [
        // WARN - 下面是用来为临时测试音频播放控件提供音频素材的，具体文件不会上传到 github，且在文件拣取写好后会移除
        { name: 'EastNewSound - asterisk', httpPath: './EastNewSound - asterisk.mp3'},
        { name: 'きりん - ひとしずく.mp3', httpPath: './きりん - ひとしずく.mp3' }
      ],
      trackList: []
    },
    state: {
      fileSelectorPath: '',
      fileSelectorDirContent: {},
      fileSelectorDiskList: [],

      editorSituation: 'Mute',
      nowPlayingTrack: 0,
      isPlaying: false,
      progress: 0,

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
