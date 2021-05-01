import React, { createContext, useState } from 'react';

interface IStore {
  data: {
    trackXmlPath: string
  },
  state: {
    fileSelectorPath: string,
    fileSelectorDirContent: { [name: string]: 'dir' | 'file' },
    fileSelectorDiskList: string[],

    editorSituation: string
  }
}

export const StoreContext = createContext({} as IStore & {
  setStore(func: (obj: IStore) => IStore): void
});

export function Store({ children }: any) {
  const [store, setStore] = useState({
    data: {
      trackXmlPath: ''
    },
    state: {
      fileSelectorPath: '',
      fileSelectorDirContent: {},
      fileSelectorDiskList: [],

      editorSituation: 'Mute'
    }
  } as IStore);
  return <StoreContext.Provider value={{
    ...store,
    setStore
  }}>
    {children}
  </StoreContext.Provider>
}
