import {run} from '../shared/renderInPage'
import EditorRunner from './EditorRunner'
import {registerServiceWorker} from '../shared/serviceWorker'

registerServiceWorker('/sw.js', '/studio', 'Studio').then( ()=> run(EditorRunner))
