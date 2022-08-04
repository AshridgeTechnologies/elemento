import {Page as PWPage} from 'playwright-core'
import App from '../../src/model/App'
import {generate} from '../../src/generator/Generator'

export const loadApp = (page: PWPage, appToLoad: App) => page.evaluate((appCode: string) => window.setAppCode(appCode), generate(appToLoad).code)