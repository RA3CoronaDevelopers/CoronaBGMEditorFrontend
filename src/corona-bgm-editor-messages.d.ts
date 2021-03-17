// 这是一个自动生成的文件，不要手动编辑

interface Track {
  id: string
  musicId: string
  checkPoints: CheckPoint[]
  defaultCheckPoint: CheckPoint
  startOffset: unknown /* NOT IMPLEMENTED System.TimeSpan */
  length: unknown /* NOT IMPLEMENTED System.TimeSpan */
  beatsPerMinutes: number
  beatsPerBar: number
}

interface CheckPoint {
  time: unknown /* NOT IMPLEMENTED System.TimeSpan */
  destinations: [string, JumpTo[]][]
  defaultDestinations: JumpTo[]
}

interface JumpTo {
  targetTrackId: string
  targetOffset: unknown /* NOT IMPLEMENTED System.TimeSpan */
  fadeOutDelay: unknown /* NOT IMPLEMENTED System.TimeSpan */
  fadeOutDuration: unknown /* NOT IMPLEMENTED System.TimeSpan */
  targetFadeInDelay: unknown /* NOT IMPLEMENTED System.TimeSpan */
  targetFadeInDuration: unknown /* NOT IMPLEMENTED System.TimeSpan */
}

// 输入类型
interface InputMessage {
  method: string
}

interface Play extends InputMessage {
  method: 'Play'
}

interface Stop extends InputMessage {
  method: 'Stop'
}

interface EditTrack extends InputMessage {
  method: 'EditTrack'
  track: Track
}

interface RemoveTrack extends InputMessage {
  method: 'RemoveTrack'
  trackId: string
}

interface SetMusic extends InputMessage {
  method: 'SetMusic'
  musicId: string
  musicPath: string
}

interface RemoveMusic extends InputMessage {
  method: 'RemoveMusic'
  musicId: string
}

interface LoadXml extends InputMessage {
  method: 'LoadXml'
  path: string
}

interface SaveXml extends InputMessage {
  method: 'SaveXml'
  path: string
}

interface OpenFileDialog extends InputMessage {
  method: 'OpenFileDialog'
  // id: string
  title: string
  filters: string
}

interface SaveFileDialog extends InputMessage {
  method: 'SaveFileDialog'
  // id: string
  title: string
  filters: string
}


// 输出类型
interface OutputMessage {
  type: string
}

interface FileDialogResult extends OutputMessage {
  type: 'FileDialogResult'
  id: string
  path: string
}

interface AllTracks extends OutputMessage {
  type: 'AllTracks'
  tracks: Track[]
}

interface AllMusics extends OutputMessage {
  type: 'AllMusics'
  musics: [string, string][]
}

interface CurrentMusicStatus extends OutputMessage {
  type: 'CurrentMusicStatus'
  playing: boolean
  trackId: string
  position: unknown /* NOT IMPLEMENTED System.TimeSpan */
}

interface CurrentFSMStatus extends OutputMessage {
  type: 'CurrentFSMStatus'
  state: string
  playerIndex: number
}

