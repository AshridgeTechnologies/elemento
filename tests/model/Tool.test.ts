import {expect, test} from "vitest"
import Text from '../../src/model/Text'
import Page from '../../src/model/Page'
import Tool from '../../src/model/Tool'
import AppBar from '../../src/model/AppBar'
import Collection from '../../src/model/Collection'
import {asJSON, ex} from '../testutil/testHelpers'
import TextInput from '../../src/model/TextInput'
import {loadJSON} from '../../src/model/loadJSON'
import {ElementType} from '../../src/model/Types'

test('Tool has correct properties', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    const tool = new Tool('t1', 'test1', {author: 'Herself', maxWidth: 200}, [page1, page2])

    expect(tool.id).toBe('t1')
    expect(tool.name).toBe('test1')
    expect(tool.author).toBe('Herself')
    expect(tool.maxWidth).toBe(200)
    expect(tool.pages.map( p => p.id )).toStrictEqual(['p1', 'p2'])
})

test('Tool has default properties', ()=> {
    const tool = new Tool('t1', 'test1', {}, [])

    expect(tool.id).toBe('t1')
    expect(tool.name).toBe('test1')
    expect(tool.author).toBe(undefined)
    expect(tool.maxWidth).toBe(undefined)
    expect(tool.pages).toStrictEqual([])
})

test('can distinguish different types of element', () => {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    let appBar = new AppBar('ab2', 'AppBar 1', {}, [])
    let collection = new Collection('coll1', 'Collection 1', {},)
    const tool = new Tool('t1', 'test1', {author: 'Herself', maxWidth: 200}, [page1, page2, appBar, collection])
    expect(tool.pages.map( p => p.id )).toStrictEqual(['p1', 'p2'])
    expect(tool.otherComponents.map( p => p.id )).toStrictEqual(['ab2', 'coll1'])
    expect(tool.topChildren.map( p => p.id )).toStrictEqual(['ab2'])
    expect(tool.bottomChildren.map( p => p.id )).toStrictEqual(['coll1'])

})

test('can find tool itself by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    const tool = new Tool('a1', 'test1', {}, [page1])

    expect(tool.findElement('a1')).toBe(tool)
})

test('can find page by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    const tool = new Tool('t1', 'test1', {}, [page1, page2])

    expect(tool.findElement('p2')).toBe(page2)
})

let testTool = function () {
    const text1 = new Text('t1', 'Text 1', {content: ex``})
    const text2 = new Text('t2', 'Text 3', {content: ex``})
    let page1 = new Page('p1', 'Page 1', {}, [
        text1, text2,
    ])
    const text3 = new Text('t3', 'Text 1', {content: ex``})
    const text4 = new Text('t4', 'Text 4', {content: ex``})
    const text5 = new Text('t5', 'Text 3', {content: ex``})
    let page2 = new Page('p2', 'Page 2', {}, [
        text3, text4, text5
    ])
    const tool = new Tool('tool1', 'Tool 1', {}, [page1, page2])
    return {text4, text5, tool}
}
test('can find element on a page by id', ()=> {
    const {text4, tool} = testTool()
    expect(tool.findElement('t4')).toBe(text4)
})

test('can find path of tool itself by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    const tool = new Tool('a1', 'Tool 1', {}, [page1])

    expect(tool.findElementPath('a1')).toBe('Tool1')
})

test('can find path of page by id', ()=> {
    let page1 = new Page('p1', 'Page 1', {}, [])
    let page2 = new Page('p2', 'Page 2', {}, [])
    const tool = new Tool('t1', 'Tool 1', {}, [page1, page2])

    expect(tool.findElementPath('p2')).toBe('Tool1.Page2')
})

test('can find path of element on a page by id', ()=> {
    const {text4, tool} = testTool()
    expect(tool.findElementPath(text4.id)).toBe('Tool1.Page2.Text4')
})

test('can find element by path', () => {
    const {text4, tool} = testTool()
    expect(tool.findElementByPath('Tool1.Page2.Text4')).toBe(text4)
})

test('can find element by path where two elements have the same name', () => {
    const {text5, tool} = testTool()
    expect(tool.findElementByPath('Tool1.Page2.Text3')).toBe(text5)
})

test('finds max id for element type', ()=> {
    const text1 = new Text('text_1', 'Text 1', {content: ex`"Some text"`})
    const text2 = new Text('text_2', 'Text 2', {content: ex`"Some text"`})
    const page1 = new Page('page_1', 'Page 1', {}, [text1, text2])
    const text3 = new Text('text_7', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('TEXT_8', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('page_2', 'Page 2', {}, [text3, text4])
    const tool = new Tool('tool', 'Tool 1', {}, [page1, page2])
    expect(tool.findMaxId('Text')).toBe(7)
    expect(tool.findMaxId('Page')).toBe(2)
    expect(tool.findMaxId('TextInput')).toBe(0)

})

test.each(['Page', 'MemoryDataStore', 'FileDataStore', 'Collection', 'AppBar', 'Function', 'FunctionImport'])('can contain %s not other types', (elementType) => {
    const tool = new Tool('id1', 'Tool 1', {}, [])
    expect(tool.canContain(elementType as ElementType)).toBe(true)
    expect(tool.canContain('Text')).toBe(false)
    expect(tool.canContain('Tool')).toBe(false)
    expect(tool.canContain('Project')).toBe(false)
})

test('converts to JSON', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const text4 = new Text('t4', 'Text 4', {content: ex`"Some text 4"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, text4])

    const tool = new Tool('a1', 'Tool 1', {author: `Jo`}, [page1, page2])

    expect(asJSON(tool)).toStrictEqual({
        kind: 'Tool',
        id: 'a1',
        name: 'Tool 1',
        properties: tool.properties,
        elements: [asJSON(page1), asJSON(page2)]
    })

})

test('converts from plain object', ()=> {
    const text1 = new Text('t1', 'Text 1', {content: ex`"Some text"`})
    const page1 = new Page('p1', 'Page 1', {}, [text1])
    const text3 = new Text('t3', 'Text 3', {content: ex`"Some text 3"`})
    const textInput4 = new TextInput('t4', 'Text 4', {initialValue: ex`"Some text"`})
    const page2 = new Page('p2', 'Page 2', {}, [text3, textInput4])

    const tool = new Tool('a1', 'Tool 1', {author: `Jo`}, [page1, page2])
    const newTool = loadJSON(asJSON(tool))
    expect(newTool).toStrictEqual<Tool>(tool)
})
