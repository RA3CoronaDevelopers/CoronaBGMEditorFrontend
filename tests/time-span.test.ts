import { TimeSpan } from "@/time-span"

test('timespan arithmetic', () => {
    expect(TimeSpan.parse('12:34.56').seconds).toBe(34)
    expect(TimeSpan.parse('12:34.78').milliseconds).toBe(780)

    const t = TimeSpan.parse('0:0')
    t.seconds += 61
    expect(t.seconds).toBe(1)
    expect(t.minutes).toBe(1)
    expect(t.milliseconds).toBe(0)
    expect(t.totalSeconds).toBe(61)
    t.seconds += 61.3
    expect(t.milliseconds).toBe(300)
    expect(t.seconds).toBe(2)
    expect(t.minutes).toBe(2)
    expect(t.totalSeconds).toBeCloseTo(122.3)
    expect(t.totalMinutes).toBeCloseTo(2 + 2.3 / 60)
    t.seconds += 120
    expect(t.seconds).toBe(2)
})

test('timespan string', () => {
    const t = TimeSpan.parse('0:0')
    t.seconds += 61
    expect(`${t}`).toBe(`01:01`)
    t.seconds += 61.3
    expect(`${t}`).toBe(`02:02.3`)
    t.milliseconds += 0.1
    expect(`${t}`).toBe(`02:02.3001`)
    t.seconds += 120
    expect(`${t}`).toBe(`04:02.3001`)
})