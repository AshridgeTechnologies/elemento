import {run} from '../shared/renderInPage'
import GitHubRunner from './GitHubRunner'

const paramsString = window.location.search
const queryParams = new URLSearchParams(paramsString)
const editorId = queryParams.get('editorId')
const projectName = queryParams.get('projectName')
const action = queryParams.get('action')

// @ts-ignore
run(GitHubRunner, {editorId, projectName, action})
