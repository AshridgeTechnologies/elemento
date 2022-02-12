import {globalFunctions} from '../../src/runtime/globalFunctions'

const {Sum, Log} = globalFunctions

test('Sum: adds all arguments or zero if empty', ()=> {
    expect(Sum(1,2,3)).toBe(6)
    expect(Sum()).toBe(0)
})

test('Sum: concatenates string arguments with a leading zero', ()=> {
    // @ts-ignore
    expect(Sum("aa", 10, "bb")).toBe("0aa10bb")
})

test('Log: writes to console', () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => {})
    try {
        Log('This is what I did', 'today')
        expect(log).toBeCalledWith('This is what I did', 'today')

    } finally {
        log.mockReset();
    }
})