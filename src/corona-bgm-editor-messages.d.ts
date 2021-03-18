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
  value: unknown /* NOT IMPLEMENTED System.TimeSpan */
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

interface TracksMessage extends OutputMessage {
  type: 'Tracks'
  value: Track[]
}

interface MusicsMessage extends OutputMessage {
  type: 'Musics'
  value: [string, string][]
}

interface PlayingMessage extends OutputMessage {
  type: 'Playing'
  value: boolean
}

interface CurrentPositionMessage extends OutputMessage {
  type: 'CurrentPosition'
  value: unknown /* NOT IMPLEMENTED System.TimeSpan */
}

interface CurrentTrackIdMessage extends OutputMessage {
  type: 'CurrentTrackId'
  value: string
}

interface StateMessage extends OutputMessage {
  type: 'State'
  value: string
}

interface CurrentPlayerIndexMessage extends OutputMessage {
  type: 'CurrentPlayerIndex'
  value: number
}

