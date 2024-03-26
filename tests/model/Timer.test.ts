import Timer from '../../src/model/Timer'
import Page from '../../src/model/Page'
import {loadJSON} from '../../src/model/loadJSON'
import {asJSON, ex} from '../testutil/testHelpers'

test('Timer has correct properties with default values', ()=> {
    const timer1 = new Timer('id1', 'Timer 1', {})

    expect(timer1.id).toBe('id1')
    expect(timer1.name).toBe('Timer 1')
    expect(timer1.period).toBe(undefined)
    expect(timer1.interval).toBe(undefined)
    expect(timer1.intervalAction).toBe(undefined)
    expect(timer1.endAction).toBe(undefined)
    expect(timer1.show).toBe(true)
    expect(timer1.styles).toBe(undefined)
    expect(timer1.label).toBe(undefined)
})

test('Timer has correct properties with specified values', ()=> {
    const timer1 = new Timer('id1', 'Timer 1', {interval: ex`2`, intervalAction: ex`Log('At ' + $timer.Elapsed)`, period: ex`10`, endAction: ex`Log('Finished ' + $timer.IntervalCount)`,
        show: true, styles: {width: 300}, label: 'My Timer'})

    expect(timer1.id).toBe('id1')
    expect(timer1.name).toBe('Timer 1')
    expect(timer1.period).toStrictEqual(ex`10`)
    expect(timer1.interval).toStrictEqual(ex`2`)
    expect(timer1.intervalAction).toStrictEqual(ex`Log('At ' + $timer.Elapsed)`)
    expect(timer1.endAction).toStrictEqual(ex`Log('Finished ' + $timer.IntervalCount)`)
    expect(timer1.show).toBe(true)
    expect(timer1.styles).toStrictEqual({width: 300})
    expect(timer1.label).toBe('My Timer')
})

test('tests if an object is this type', ()=> {
    const timer = new Timer('id1', 'Timer 1', {interval: ex`2`})
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Timer.is(timer)).toBe(true)
    expect(Timer.is(page)).toBe(false)
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const timer = new Timer('id1', 'Timer 1', {period: ex`2`})
    const updatedTimer = timer.set('id2', 'name', ex`Timer 1A`)
    expect(updatedTimer).toStrictEqual(timer)
})

test('has correct property names', () => {
    expect(new Timer('id1', 'Timer 1', {}).propertyDefs.map( ({name}) => name )).toStrictEqual(['period', 'interval', 'intervalAction', 'endAction', 'label', 'show', 'styles'])
})

test('converts to JSON without optional properties', ()=> {
    const timer = new Timer('id1', 'Timer 1', {})
    expect(asJSON(timer)).toStrictEqual({
        kind: 'Timer',
        id: 'id1',
        name: 'Timer 1',
        properties: timer.properties
    })
})

test('converts to JSON with optional properties', ()=> {
    const timer = new Timer('id1', 'Timer 1', {interval: ex`2`, intervalAction: ex`Log('At ' + $timer.Elapsed)`, period: ex`10`, endAction: ex`Log('Finished ' + $timer.IntervalCount)`,
        show: true, styles: {width: 300}, label: 'My Timer'})

    expect(asJSON(timer)).toStrictEqual({
        kind: 'Timer',
        id: 'id1',
        name: 'Timer 1',
        properties: timer.properties
    })
})

test('converts from plain object', ()=> {
    const timer = new Timer('id1', 'Timer 1', {interval: ex`2`, show: ex`false && true`, styles: {width: ex`3+4`}, label: 'A Timer'})
    const plainObj = asJSON(timer)
    const newTimer = loadJSON(plainObj)
    expect(newTimer).toStrictEqual<Timer>(timer)
})
