import {ActionDef, ComponentType, ParentType, PropertyDef} from './Types'
import BaseElement, {actionDef, propDef} from './BaseElement'
import Element from './Element'
import LocalFireDepartment from '@mui/icons-material/LocalFireDepartment'
import Project from './Project'
import FirebaseDeploy from '../editor/tools/FirebaseDeploy'

type Properties = { firebaseProject: string }

export default class FirebasePublish extends BaseElement<Properties> implements Element {

    static kind = 'FirebasePublish'
    static get iconClass() { return LocalFireDepartment }
    static get parentType() { return 'Project' as ParentType }
    type(): ComponentType { return 'app' }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('firebaseProject'),
        ]
    }

    get actionDefs(): ActionDef[] {
        return [
            actionDef('publish')
        ]
    }

    async publish(project: Project) {
        console.log('Publishing project ', project.name, 'to', this.properties.firebaseProject)
        const deployer = new FirebaseDeploy(project, {firebaseProject: this.properties.firebaseProject})
        try {
            await deployer.deploy()
            console.log('Publish complete')
        } catch (e: any) {
            console.error(e.message)
        }
    }

}