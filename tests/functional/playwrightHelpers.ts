import {Page as PWPage} from 'playwright-core'
import {Project} from '../../src/model/index'
import {treeExpandControlSelector, treeItemSelector} from '../editor/Selectors'
import {Page} from '@playwright/test'

export const loadProject = (page: PWPage, projectToLoad: Project) => page.evaluate((project: string) => window.setProject(project), JSON.stringify(projectToLoad))
export const treeItem = (n: number) => `${treeItemSelector} >> nth=${n}`
export const treeItemText = (text: string) => `${treeItemSelector}:has-text("${text}")`
export const treeExpand = (n: number) => `${treeExpandControlSelector} >> nth=${n}`
export const pageFunctions = (page: Page) => {
    const functions = ['goto', 'click', 'fill', 'press', 'locator', 'waitForSelector', 'textContent'] as Array<keyof Page>
    return Object.fromEntries(functions.map(f => [f, (page[f] as any).bind(page)]))
}