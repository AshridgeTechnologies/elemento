import {Page as PWPage} from 'playwright-core'
import {Project, App} from '../../src/model/index'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'

export const loadApp = (page: PWPage, appToLoad: App) => page.evaluate((app: string) => window.setAppFromJSONString(app), JSON.stringify(appToLoad))
export const loadProject = (page: PWPage, projectToLoad: Project) => page.evaluate((project: string) => window.setProjectFromJSONString(project), JSON.stringify(projectToLoad))
export const treeItem = (n: number) => `${treeItemSelector} >> nth=${n}`
export const treeExpand = (n: number) => `${treeExpandControlSelector} >> nth=${n}`
