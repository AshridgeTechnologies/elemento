import BrowserProjectLoader from '../../src/generator/BrowserProjectLoader'
import Project from '../../src/model/Project'

test('holds Project returned by function', async () => {
    const project = new Project('p1', 'Project 1', {}, [])
    const loader = new BrowserProjectLoader(() => project)
    await expect(loader.getProject()).resolves.toBe(project)
})