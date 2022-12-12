import Project from '../model/Project'
import {currentUser} from '../shared/authentication'
import {uploadTextToStorage} from '../shared/storage'

declare global {
    var location: Location
}
const globalExternals = {
    baseUrl: global.location?.origin
}

type Externals = { baseUrl: string }

export default class ProjectPublisher {
    private externals: Externals
    private project: Project
    constructor(initialProject: Project, externals: Externals = globalExternals) {
        this.project = initialProject
        this.externals = externals
    }

    async publish(name: string, code: string) {
        const user = currentUser()
        if(user === null) {
            throw new Error('Must be logged in to publish')
        }

        const publishPath = `apps/${user.uid}/${name}`
        const metadata = {
            contentType: 'text/javascript',
        }
        await uploadTextToStorage(publishPath, code, metadata)

        return this.externals.baseUrl + '/run/' + publishPath
    }
}