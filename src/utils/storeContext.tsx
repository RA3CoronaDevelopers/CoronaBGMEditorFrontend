import React, { createContext, useState } from 'react';

interface IStore {
  data: {
    trackXmlPath: string
  },
  state: {
    fileSelectorOpen: boolean,
    fileSelectorPath: string,
    fileSelectorDirContent: { [name: string]: 'dir' | 'file' }
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
      fileSelectorOpen: false,
      fileSelectorPath: '',
      fileSelectorDirContent: {}
    }
  } as IStore);
  return <StoreContext.Provider value={{
    ...store,
    setStore
  }}>
    {children}
  </StoreContext.Provider>
}
