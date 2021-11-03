import Page from '../../src/model/Page'
import App from '../../src/model/App'

test('App has correct properties', ()=> {
    let page1 = new Page('p1', 'Page 1', [])
    let page2 = new Page('p2', 'Page 2', [])
    const app = new App('t1', 'test1', [page1, page2])

    expect(app.id).toBe('t1')
    expect(app.name).toBe('test1')
    expect(app.pages.map( p => p.id )).toStrictEqual(['p1', 'p2'])
})