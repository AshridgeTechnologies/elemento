import {run} from '../appsShared/renderInPage'
import EditorRunner from './EditorRunner'
import {registerServiceWorker} from './serviceWorker'

// registerServiceWorker('/sw.js', '/studio', 'Studio').then( ()=> run(EditorRunner))
run(EditorRunner)
