import Text from '../../src/model/Text.js'
import Page from '../../src/model/Page.js'

test('Page has correct properties', ()=> {
    let text1 = new Text('t1', 'Text 1', '"Some text"')
    let text2 = new Text('t2', 'Text 2', '"More text"')
    const page = new Page('p1', 'Page 1', [text1, text2])

    expect(page.id).toBe('p1')
    expect(page.name).toBe('Page 1')
    expect(page.elements.map( el => el.id )).toStrictEqual(['t1', 't2'])
})