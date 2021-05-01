import React, { createContext, useState } from 'react';

interface IStore {
  data: {
    trackXmlPath: string
  },
  state: {
    fileSelectorOpen: boolean
  }
}

export const StoreContext = createContext({} as IStore & {
  setStore(obj: Partial<IStore>): void
});

export function Store({ children }: any) {
  const [store, setStore] = useState({
    data: {
      trackXmlPath: ''
    },
    state: {
      fileSelectorOpen: false
    }
  } as IStore);
  return <StoreContext.Provider value={{
    ...store,
    setStore: (obj: Partial<IStore>) => setStore({ ...store, ...obj })
  }}>
    {children}
  </StoreContext.Provider>
}
