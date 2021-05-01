import React, { createContext, useState } from 'react';

interface IStore {
  trackXmlPath: string
}

export const StoreContext = createContext({} as IStore & {
  setStore(obj: { [key: string]: any }): void
});

export function Store({ children }: any) {
  const [store, setStore] = useState({
    trackXmlPath: ''
  } as IStore);
  return <StoreContext.Provider value={{
    ...store,
    setStore: (obj: { [key: string]: any }) => setStore({ ...store, ...obj })
  }}>
    {children}
  </StoreContext.Provider>
}
