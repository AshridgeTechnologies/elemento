import {expect, test} from "vitest"
import Text from '../../src/model/Text'
import Block from '../../src/model/Block'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
import Page from '../../src/model/Page'

test('Block has correct defaults', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const block = new Block('blk1', 'Block the First', {}, [text1, text2])

    expect(block.id).toBe('blk1')
    expect(block.name).toBe('Block the First')
    expect(block.codeName).toBe('BlocktheFirst')
    expect(block.layout).toBe('vertical')
    expect(block.dropAction).toBe(undefined)
    expect(block.show).toBe(undefined)
    expect(block.styles).toBe(undefined)
    expect(block.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
    expect(block.type()).toBe('statefulUI')
})

test('Block has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    let dropAction = ex`Log('drop')`
    const block = new Block('blk1', 'Block the First', {show: true, layout: 'horizontal wrapped', dropAction, styles: {width: 500, backgroundColor: 'blue'}}, [text1, text2])

    expect(block.id).toBe('blk1')
    expect(block.name).toBe('Block the First')
    expect(block.codeName).toBe('BlocktheFirst')
    expect(block.layout).toBe('horizontal wrapped')
    expect(block.dropAction).toStrictEqual(dropAction)
    expect(block.show).toBe(true)
    expect(block.styles).toStrictEqual({width: 500, backgroundColor: 'blue'})
    expect(block.elementArray().map( el => el.id )).toStrictEqual(['t1', 't2'])
})

test('tests if an object is this type', ()=> {
    const block = new Block('l1', 'Block 1', {}, [])
    const page = new Page('p1', 'Page 1', {}, [])

    expect(Block.is(block)).toBe(true)
    expect(Block.is(page)).toBe(false)
})

test('has correct property defs', () => {
    const block = new Block('l1', 'Block 1', {}, [])
    expect(block.propertyDefs.map( d => d.name)).toStrictEqual(['layout', 'dropAction', 'show', 'styles'])
})

test('creates an updated object with a property set to a new value', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"Some text"`})
    const block = new Block('blk1', 'Block 1', {show: true}, [text1])
    const updatedBlock1 = block.set('blk1', 'name', 'Block 1A')
    expect(updatedBlock1.name).toBe('Block 1A')
    expect(updatedBlock1.elements).toBe(block.elements)
    expect(updatedBlock1.show).toBe(true)
    expect(block.name).toBe('Block 1')

    const updatedBlock2 = updatedBlock1.set('blk1', 'elements', [text1, text2])
    expect(updatedBlock2.name).toBe('Block 1A')
    expect(updatedBlock2.elements).toStrictEqual([text1, text2])
    expect(updatedBlock1.name).toBe('Block 1A')
    expect(updatedBlock1.elements).toStrictEqual([text1])
})

test('ignores the set and returns itself if the id does not match', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const block1 = new Block('blk1', 'Block 1', {}, [text1])
    const updatedBlock = block1.set('x1', 'name', 'Block 1A')
    expect(updatedBlock).toBe(block1)
})

test('can contain correct types', () => {
    const block = new Block('blk1', 'Block 1', {}, [])
    expect(block.canContain('Project')).toBe(false)
    expect(block.canContain('App')).toBe(false)
    expect(block.canContain('Page')).toBe(false)
    expect(block.canContain('Block')).toBe(true)
    expect(block.canContain('MemoryDataStore')).toBe(false)
    expect(block.canContain('FileDataStore')).toBe(false)
    expect(block.canContain('Text')).toBe(true)
    expect(block.canContain('Button')).toBe(true)
    expect(block.canContain('DataTypes')).toBe(false)
    expect(block.canContain('TrueFalseType')).toBe(false)})


test('finds itself and children in a page', () => {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const innerBlock = new Block('blk2', 'Block 2', {}, [text2])
    const block = new Block('blk1', 'Block 1', {}, [text1, innerBlock])
    const page = new Page('p1', 'Page 1', {}, [block])

    expect(page.findElementByPath('Page1.Block1')).toBe(block)
    expect(page.findElementByPath('Page1.Text1')).toBe(text1)
    expect(page.findElementByPath('Page1.Text2')).toBe(text2)
})

test('converts to JSON', ()=> {
    let text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let text2 = new Text('t2', 'Text 2', {content: ex`"More text"`})
    const block = new Block('blk1', 'Block 1', {layout: 'positioned', styles: {width: '50%', backgroundColor: 'green'}}, [text1, text2])

    expect(asJSON(block)).toStrictEqual({
        kind: 'Block',
        id: 'blk1',
        name: 'Block 1',
        properties: block.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })

    const block2 = new Block('blk1', 'Block 2', {show: true}, [text1, text2])

    expect(asJSON(block2)).toStrictEqual({
        kind: 'Block',
        id: 'blk1',
        name: 'Block 2',
        properties: block2.properties,
        elements: [asJSON(text1), asJSON(text2)]
    })
})

test('converts from plain object with correct types for elements', ()=> {
    let text = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    let textInput = new TextInput('t2', 'Text Input 2', {initialValue: ex`"Input text"`, styles: {width: ex`7`}})
    const block = new Block('blk1', 'Block 1', {show: ex`false`}, [text, textInput])
    const newBlock = loadJSON(asJSON(block))
    expect(newBlock).toStrictEqual<Block>(block)
    const block2 = new Block('blk1', 'Block 2', {show: true}, [text, textInput])
    const newBlock2 = loadJSON(asJSON(block2))
    expect(newBlock2).toStrictEqual<Block>(block2)
})
