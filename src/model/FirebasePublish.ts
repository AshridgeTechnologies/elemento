import {ActionDef, ComponentType, ParentType, PropertyDef, PropertyExpr, PropertyValueType} from './Types'
import BaseElement, {actionDef, propDef} from './BaseElement'
import Element from './Element'
import Project from './Project'
import FirebaseDeploy from '../editor/tools/FirebaseDeploy'

type Properties = { firebaseProject?: string, firebaseConfiguration?: PropertyValueType<object> }

export default class FirebasePublish extends BaseElement<Properties> implements Element {

    static kind = 'FirebasePublish'
    static get iconClass() { return 'local_fire_department' }
    static get parentType() { return 'Project' as ParentType }
    type(): ComponentType { return 'app' }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('firebaseProject'),
            propDef('firebaseConfiguration', 'expr', {multilineExpr: true}),
        ]
    }

    get actionDefs(): ActionDef[] {
        return [
            actionDef('publish')
        ]
    }

    async publish(project: Project) {
        console.log('Publishing project ', project.name, 'to', this.properties.firebaseProject)
        const deployer = new FirebaseDeploy(project, {firebaseProject: this.properties.firebaseProject!})
        try {
            await deployer.deploy()
            console.log('Publish complete')
        } catch (e: any) {
            console.error('Publish failed', e)
        }
    }

    async getConfig() : Promise<object | undefined> {
        const config = this.properties.firebaseConfiguration
        if (!config) {
            return undefined
        }
        return new Function('return ' + (config as PropertyExpr).expr)()
    }
}