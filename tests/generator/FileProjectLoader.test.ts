import FileProjectLoader from '../../src/generator/FileProjectLoader'
import Project from '../../src/model/Project'
import os from 'os'
import fs from 'fs'
import {projectFileName} from '../../src/shared/constants'

test('gets Project loaded from directory', () => {
    const projectName = 'Project ' + Date.now()
    const project = new Project('p1', projectName, {}, [])
    const tempDir = os.tmpdir()
    const localName = 'FileProjectLoader.test'
    const localDirPath = `${tempDir}/${localName}`
    fs.mkdirSync(localDirPath, {recursive: true})
    fs.writeFileSync(`${localDirPath}/${projectFileName}`, JSON.stringify(project, null, 2), 'utf8')

    const loader = new FileProjectLoader(localDirPath)
    expect(loader.getProject()).toHaveProperty('name', projectName)
})