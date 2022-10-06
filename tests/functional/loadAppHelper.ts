import {Page as PWPage} from 'playwright-core'
import App from '../../src/model/App'
import {generate} from '../../src/generator/Generator'
import Project from '../../src/model/Project'

export const loadApp = (page: PWPage, appToLoad: App, project: Project) => page.evaluate((appCode: string) => window.setAppCode(appCode), generate(appToLoad, project).code)