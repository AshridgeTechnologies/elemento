import Project from '../model/Project'
import {generate} from './Generator'
import App from '../model/App'

export interface ProjectLoader {
    getProject(): Promise<Project>
}

export interface FileWriter {
    writeFile(filepath: string, contents: Uint8Array | string): Promise<void>
}

export default class ProjectBuilder {
    constructor(private props: {projectLoader: ProjectLoader, fileWriter: FileWriter}) {}

    async build() {
        const project = await this.props.projectLoader.getProject()
        const apps = project.findChildElements(App)
        await Promise.all(apps.map( async (app, index) => this.buildClientFiles(app, project, index) ))
    }

    private async buildClientFiles(app: App, project: Project, appIndex: number) {
        const {fileWriter} = this.props
        const {code, html} = generate(app, project)
        const appName = app.codeName + '.js'
        const htmlRunnerFileName = appIndex === 0 ? 'index.html' : app.codeName + '.html'
        await Promise.all([fileWriter.writeFile(appName, code), fileWriter.writeFile(htmlRunnerFileName, html)])
    }
}