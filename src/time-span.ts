const millisecondsMultiplier = 10000
const secondsMultiplier = millisecondsMultiplier * 1000
const minutesMultiplier = secondsMultiplier * 60

// similiar to .NET TimeSpan
export class TimeSpan {
  public ticks = 0

  constructor(ticks: number) {
    this.ticks = +ticks
  }

  public get totalMilliseconds() {
    return this.ticks / millisecondsMultiplier
  }
  public set totalMilliseconds(value) {
    this.ticks = value * millisecondsMultiplier
  }

  public get totalSeconds() {
    return this.ticks / secondsMultiplier
  }
  public set totalSeconds(value) {
    this.ticks = value * secondsMultiplier
  }

  public get totalMinutes() {
    return this.ticks / minutesMultiplier
  }
  public set totalMinutes(value) {
    this.ticks = value * minutesMultiplier
  }

  public get milliseconds() {
    return this.splitted.msPart / millisecondsMultiplier
  }
  public set milliseconds(value) {
    this.splitted = { ...this.splitted, msPart: value * millisecondsMultiplier }
  }

  public get seconds() {
    return this.splitted.sPart / secondsMultiplier
  }
  public set seconds(value) {
    this.splitted = { ...this.splitted, sPart: value * secondsMultiplier }
  }

  public get minutes() {
    return this.splitted.sOther / minutesMultiplier
  }
  public set minutes(value) {
    this.splitted = { ...this.splitted, sOther: value * minutesMultiplier }
  }

  private get splitted() {
    const msPart = this.ticks % secondsMultiplier
    const msOther = this.ticks - msPart
    const sPart = msOther % minutesMultiplier
    const sOther = msOther - sPart
    return { msPart, sPart, sOther } as const
  }
  private set splitted({ msPart, sPart, sOther }) {
    this.ticks = msPart + sPart + sOther
  }

  public toString() {
    const { msPart, sPart, sOther } = this.splitted
    const minutes = `${sOther / minutesMultiplier}`
    const seconds = `${sPart / secondsMultiplier}`
    const [milliseconds, belowMilliseconds] = `${msPart / millisecondsMultiplier}`.split('.')
    const result = minutes.padStart(2, '0')
      + ':'
      + seconds.padStart(2, '0')
      + '.'
      + milliseconds.padStart(3, '0')
      + (belowMilliseconds ?? '')
    return result.replace(/\.?0*$/, '')
  }

  public static parse(string: string) {
    const splitted = `${string}`.split(':')
    if (splitted.length !== 2) {
      throw new Error(`Unexpecteed timespan string: ${string}`)
    }
    const [minutes, seconds] = splitted.map(x => parseFloat(x))
    return new TimeSpan(minutes * minutesMultiplier + seconds * secondsMultiplier)
  }

}
