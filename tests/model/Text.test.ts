import Text from '../../src/model/Text.js'
import Page from '../../src/model/Page.js'

test('Text has correct properties', ()=> {
    const text1 = new Text('t1', 'Text 1', '"Some text"')

    expect(text1.id).toBe('t1')
    expect(text1.name).toBe('Text 1')
    expect(text1.contentExpr).toBe('"Some text"')
})

test('tests if an object is this type', ()=> {
    const text = new Text('t1', 'Text 1', '"Some text"')
    const page = new Page('p1', 'Page 1', [])

    expect(Text.is(text)).toBe(true)
    expect(Text.is(page)).toBe(false)
})