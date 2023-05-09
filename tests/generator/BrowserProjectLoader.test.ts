import BrowserProjectLoader from '../../src/generator/BrowserProjectLoader'
import Project from '../../src/model/Project'

test('holds Project returned by function', () => {
    const project = new Project('p1', 'Project 1', {}, [])
    const loader = new BrowserProjectLoader(() => project)
    expect(loader.getProject()).toBe(project)
})