import {globalFunctions} from '../../src/runtime/globalFunctions'

const {sum} = globalFunctions

test('sum: adds all arguments or zero if empty', ()=> {
    expect(sum(1,2,3)).toBe(6)
    expect(sum()).toBe(0)
})

test('sum: concatenates string arguments with a leading zero', ()=> {
    // @ts-ignore
    expect(sum("aa", 10, "bb")).toBe("0aa10bb")
})