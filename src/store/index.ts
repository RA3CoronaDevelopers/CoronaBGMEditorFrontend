import {
  createStore,
  MutationTree,
  Store as VuexStore,
  useStore as vuexUseStore,
} from 'vuex'

const state = {
  tracks: new Map<string, Track>(),
  lastActiveTrackId: null as string | null,
}

const declareMutations = <T extends MutationTree<typeof state>>(t: T) => t
const mutations = declareMutations({
  setTracks(state, tracks: Track[]) {
    state.tracks = new Map<string, Track>(tracks.map(t => [t.id, t]))
  },
  updateTrack(state, track: Track) {
    state.tracks.set(track.id, track)
  },
  setActiveTrack(state, trackId: string | null) {
    state.lastActiveTrackId = trackId
  },
})

export const store = createStore({
  state,
  mutations,
  actions: {},
  modules: {},
})

type State = typeof state
type Mutations = typeof mutations
type MutationArgument<K extends keyof Mutations> = Mutations[K] extends (
  u: State,
  v: infer V
) => unknown
  ? V
  : never
interface Store extends VuexStore<State> {
  commit<K extends keyof Mutations>(type: K, payload: MutationArgument<K>): void
}
export const useStore = (): Store => vuexUseStore()
