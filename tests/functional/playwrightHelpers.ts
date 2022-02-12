import {Page as PWPage} from 'playwright-core'
import {App} from '../../src/model/index'

export const loadApp = (page: PWPage, appToLoad: App) => page.evaluate((app: string) => window.setAppFromJSONString(app), JSON.stringify(appToLoad))