import {Page as PWPage} from 'playwright-core'
import {App, Project} from '../../src/model/index'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'
import {generate} from '../../src/generator/Generator'
import {Page} from '@playwright/test'

export const loadApp = (page: PWPage, appToLoad: App) => page.evaluate((appCode: string) => window.setAppCode(appCode), generate(appToLoad).code)
export const loadProject = (page: PWPage, projectToLoad: Project) => page.evaluate((project: string) => window.setProjectFromJSONString(project), JSON.stringify(projectToLoad))
export const treeItem = (n: number) => `${treeItemSelector} >> nth=${n}`
export const treeExpand = (n: number) => `${treeExpandControlSelector} >> nth=${n}`
export const pageFunctions = (page: Page) => {
    const functions = ['goto', 'click', 'fill', 'press', 'locator', 'waitForSelector', 'textContent'] as Array<keyof Page>
    return Object.fromEntries(functions.map(f => [f, (page[f] as any).bind(page)]))
}