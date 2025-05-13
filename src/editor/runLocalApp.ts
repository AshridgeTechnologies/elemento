import {run} from '../appsShared/renderInPage'
import AppMain from '../runner/AppMain'
import AppChooser from './AppChooser'
import {registerServiceWorker} from './serviceWorker'
import {RunArea} from './Types'


export type RunAppFn = (area: RunArea, projectName: string, appName: string, dirHandle: FileSystemDirectoryHandle) => void




