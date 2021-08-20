import React, { createContext, useState, useContext } from 'react';
import { ITrack, IFsmConfig, IUnitWeight } from './jsonConfigTypes';

export type IEditorSituation =
  | 'Mute'
  | 'MenuTrack'
  | 'Peace'
  | 'TinyFight'
  | 'Fight'
  | 'Advantage'
  | 'Disadvantage'
  | 'Disaster'
  | 'PostGameVictory'
  | 'PostGameDefeat';

interface IStateContextInterop<
  T extends {
    [key: string]: any;
  } = {
    [key: string]: any;
  }
> {
  [key: string]: any;
  (prevObj: {
    [model: string]: {
      [id: string]: T;
    };
  }): void;
}

interface IDataContextInterop {
  [anything: string]: any;
}

// StateContext 是分别对每一份模块的每一个实例分开存储的状态数据，DataContext 则是全局数据
// 前者适合用作储存具体界面元素的实例化状态（例如窗口），而后者则适合用作储存与界面逻辑控制关系不大的全局数据（例如应用配置）
export const StateContextInterop: React.Context<IStateContextInterop> =
  createContext(undefined);
export const DataContextInterop: React.Context<IDataContextInterop> =
  createContext(undefined);
// GlobalStateContext 是为支持 StateContext 的跨模块通信功能而设计的辅助上下文，用于存储所有模块实例的数据
// 事实上，StateContext 本身不存储任何内容，实际运行时 StateContext 的数据是从 GlobalStateContext 调取的
const GlobalStateContextInterop = createContext(undefined);

interface IStateContextProps<T> {
  model?: string;
  id?: string;
  defaultProps: T;
  children: React.ReactElement<T>;
}

// 用于为 StateContext 提供数据的全局上下文，应当放在所有组件的最外层
// 如果在已经嵌套了 GlobalStateContext 的组件树内部再次嵌套，相当于在内部新开辟一个全新的状态数据存储空间，内外的数据不互通
export function GlobalStateContextProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [state, setStateInterop] = useState({});

  return (
    <GlobalStateContextInterop.Provider value={[state, setStateInterop]}>
      {children}
    </GlobalStateContextInterop.Provider>
  );
}

// 在使用 StateContext 之前，务必在最外围以 GlobalStateContext 进行包裹
// 子级的 StateContext 依赖于最外围 GlobalStateContext 提供的数据，本质上是用于进驻文件夹
export function StateContextProvider<T>({
  model,
  id,
  defaultProps,
  children,
}: IStateContextProps<T>) {
  const [globalState, setGlobalState] = useContext(GlobalStateContextInterop);
  if (typeof globalState[model] === 'undefined') {
    setGlobalState({
      [model]: {
        [id]: defaultProps,
      },
    });
  } else if (typeof globalState[model][id] === 'undefined') {
    setGlobalState({
      [model]: {
        ...globalState[model],
        [id]: defaultProps,
      },
    });
  }

  return (
    <StateContextInterop.Provider
      value={
        new Proxy(
          (globalState[model] && globalState[model][id]) || defaultProps,
          {
            get(target, key, _receiver) {
              return target[key];
            },
            set(_target, _key, _value, _receiver) {
              // React 的 props 不应该也不能被直接修改，否则无法经过 React 的界面更新层，造成内外数据不同步
              // 这里会直接拦截下来，然后抛错
              return false;
            },
            apply(_target, _thisArg, [obj]) {
              setGlobalState({
                ...globalState,
                [model]: {
                  ...globalState[model],
                  [id]: {
                    ...globalState[model][id],
                    ...obj,
                  },
                },
              });
            },
          }
        )
      }
    >
      {children}
    </StateContextInterop.Provider>
  );
}

// 用于为 DataContext 提供数据的全局上下文，应当放在所有组件的最外层
export function DataContextProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [state, setStateInterop] = useState({});

  return (
    <DataContextInterop.Provider
      value={
        new Proxy(state, {
          get(target, key, _receiver) {
            return target[key];
          },
          set(_target, _key, _value, _receiver) {
            // React 的 props 不应该也不能被直接修改，否则无法经过 React 的界面更新层，造成内外数据不同步
            // 这里会直接拦截下来，然后抛错
            return false;
          },
          apply(_target, _thisArg, [obj]) {
            setStateInterop({
              ...state,
              ...obj,
            });
          },
        })
      }
    >
      {children}
    </DataContextInterop.Provider>
  );
}

// TODO - 以下内容将合并到上面的新上下文

interface IStore {
  data: {
    sourceJsonPath: string;
    musicFilePathMap: {
      [id: string]: string;
    };
    tracks: { [key: string]: ITrack };
    fsmConfig: IFsmConfig;
    unitWeight: IUnitWeight;
  };
  state: {
    fileSelectorPath: string;
    fileSelectorDirContent: { [name: string]: 'dir' | 'file' };
    fileSelectorDiskList: string[];

    editorSituation: IEditorSituation;
    nowPlayingTrack: string;
    nowPlayingProgress: number;
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
      musicFilePathMap: {},
      tracks: {},
      fsmConfig: {},
      unitWeight: {},
    },
    state: {
      fileSelectorPath: '',
      fileSelectorDirContent: {},
      fileSelectorDiskList: [],

      editorSituation: 'Mute',
      nowPlayingTrack: '',
      nowPlayingProgress: 0,
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
