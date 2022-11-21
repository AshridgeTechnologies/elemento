import {Page as PWPage} from 'playwright-core'
import {Page} from '@playwright/test'

const treeItemSelector = '.rc-tree-list .rc-tree-node-content-wrapper'
const treeExpandControlSelector = '.rc-tree-switcher'

export const ex = ([s]: TemplateStringsArray) => ({expr: s})
export const loadProject = (page: PWPage, projectToLoad: any) => page.evaluate((project: string) => window.setProject(project), JSON.stringify(projectToLoad))
export const treeItem = (n: number) => `${treeItemSelector} >> nth=${n}`
export const treeItemText = (text: string) => `${treeItemSelector}:has-text("${text}")`
export const treeExpand = (n: number) => `${treeExpandControlSelector} >> nth=${n}`
export const pageFunctions = (page: Page) => {
    const functions = ['goto', 'click', 'fill', 'press', 'locator', 'waitForSelector', 'textContent'] as Array<keyof Page>
    return Object.fromEntries(functions.map(f => [f, (page[f] as any).bind(page)]))
}

export const wait = (time = 1000) => new Promise( resolve => setTimeout( resolve, time ))

export const waitUntil = <T>(fn: () => T, time = 1000, wait = 10000): Promise<T> => {
    const startTime = new Date().getTime();
    try {
        const result = fn()
        if (result) {
            return Promise.resolve(result)
        } else {
            return new Promise((resolve, reject) => {
                const timer = setInterval(() => {
                    try {
                        const result = fn()
                        if (result) {
                            clearInterval(timer);
                            resolve(result);
                        } else if (new Date().getTime() - startTime > wait) {
                            clearInterval(timer);
                            reject(new Error('Max wait reached'));
                        }
                    } catch (e) {
                        clearInterval(timer);
                        reject(e);
                    }
                }, time);
            });
        }
    } catch (e) {
        return Promise.reject(e);
    }
}

