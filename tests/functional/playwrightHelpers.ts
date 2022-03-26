import {Page as PWPage} from 'playwright-core'
import {Project, App} from '../../src/model/index'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'
import {generate} from '../../src/generator/Generator'

export const loadApp = (page: PWPage, appToLoad: App) => page.evaluate((appCode: string) => window.setAppCode(appCode), generate(appToLoad).code)
export const loadProject = (page: PWPage, projectToLoad: Project) => page.evaluate((project: string) => window.setProjectFromJSONString(project), JSON.stringify(projectToLoad))
export const treeItem = (n: number) => `${treeItemSelector} >> nth=${n}`
export const treeExpand = (n: number) => `${treeExpandControlSelector} >> nth=${n}`
