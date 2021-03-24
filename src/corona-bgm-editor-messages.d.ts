// 这是一个自动生成的文件，不要手动编辑

interface TimeSpan { ticks: number }

interface Track {
  id: string
  musicId: string
  checkPoints: CheckPoint[]
  defaultCheckPoint: CheckPoint | null
  startOffset: TimeSpan
  length: TimeSpan
  beatsPerMinutes: number
  beatsPerBar: number
}

interface CheckPoint {
  time: TimeSpan
  destinations: [string, JumpTo[]][]
  defaultDestinations: JumpTo[]
}

interface JumpTo {
  targetTrackId: string
  targetOffset: TimeSpan
  fadeOutDelay: TimeSpan
  fadeOutDuration: TimeSpan
  targetFadeInDelay: TimeSpan
  targetFadeInDuration: TimeSpan
}

// 输入类型

interface GetProperty {
  requestedProperty: 'Tracks'|'Musics'|'Playing'|'CurrentPosition'|'CurrentTrackId'|'State'|'CurrentPlayerIndex'
}

interface SetTracksProperty {
  propertyToBeSet: 'Tracks'
  value: Track[]
}

interface SetMusicsProperty {
  propertyToBeSet: 'Musics'
  value: [string, string][]
}

interface SetPlayingProperty {
  propertyToBeSet: 'Playing'
  value: boolean
}

interface SetCurrentPositionProperty {
  propertyToBeSet: 'CurrentPosition'
  value: TimeSpan
}

interface SetCurrentTrackIdProperty {
  propertyToBeSet: 'CurrentTrackId'
  value: string
}

interface SetStateProperty {
  propertyToBeSet: 'State'
  value: string
}

interface SetCurrentPlayerIndexProperty {
  propertyToBeSet: 'CurrentPlayerIndex'
  value: number
}

interface LoadXml {
  method: 'LoadXml'
  path: string
}

interface SaveXml {
  method: 'SaveXml'
  path: string
}

interface OpenFileDialog {
  method: 'OpenFileDialog'
  // id: string
  title: string
  filters: string
}

interface SaveFileDialog {
  method: 'SaveFileDialog'
  // id: string
  title: string
  filters: string
}

type InputMessage = GetProperty | SetTracksProperty | SetMusicsProperty | SetPlayingProperty | SetCurrentPositionProperty | SetCurrentTrackIdProperty | SetStateProperty | SetCurrentPlayerIndexProperty | LoadXml | SaveXml | OpenFileDialog | SaveFileDialog// 输出类型
interface FileDialogResult {
  type: 'FileDialogResult'
  id: string
  path: string | null
}

interface TracksMessage {
  type: 'Tracks'
  value: Track[]
}

interface MusicsMessage {
  type: 'Musics'
  value: [string, string][]
}

interface PlayingMessage {
  type: 'Playing'
  value: boolean
}

interface CurrentPositionMessage {
  type: 'CurrentPosition'
  value: TimeSpan
}

interface CurrentTrackIdMessage {
  type: 'CurrentTrackId'
  value: string
}

interface StateMessage {
  type: 'State'
  value: string
}

interface CurrentPlayerIndexMessage {
  type: 'CurrentPlayerIndex'
  value: number
}

type OutputMessage = FileDialogResult | TracksMessage | MusicsMessage | PlayingMessage | CurrentPositionMessage | CurrentTrackIdMessage | StateMessage | CurrentPlayerIndexMessage