import {run} from '../appsShared/renderInPage'
import AppMain from '../runner/AppMain'
import AppChooser from './AppChooser'
import {registerServiceWorker} from './serviceWorker'
import {RunArea} from './Types'


export type RunAppFn = (area: RunArea, projectName: string, appName: string, dirHandle: FileSystemDirectoryHandle) => void
const runApp: RunAppFn = (area: RunArea, projectName: string, appName: string, dirHandle: FileSystemDirectoryHandle) => {
    console.log('runApp', area, projectName, appName)
    const urlPath = `/run/local/${area}/${projectName}/${appName}`
    if (area === 'disk') {
        navigator.serviceWorker.controller!.postMessage({type: 'dir', dirHandle})
    }
    window.location.assign(window.location.origin + urlPath)
}

const runAppFromUrl = () => {
    const urlPathname = window.location.pathname
    if (urlPathname.match(/\/run\/?$/)) {
        run(AppChooser, {runAppFn: runApp})
    } else {
        run(AppMain, {windowUrlPath: urlPathname})
    }
}

export function runLocalApp() {
    registerServiceWorker('/runnerSw.js', '/run', 'Runner').then( runAppFromUrl )
}
