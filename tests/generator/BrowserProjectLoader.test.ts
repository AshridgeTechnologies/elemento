import BrowserProjectLoader from '../../src/generator/BrowserProjectLoader'
import Project1 from '../../src/model/Project'

test('holds Project returned by function', () => {
    const project = Project1.new([], 'Project 1', 'p1', {})
    const loader = new BrowserProjectLoader(() => project)
    expect(loader.getProject()).toBe(project)
})