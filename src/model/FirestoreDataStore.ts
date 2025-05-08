import {ComponentType, ParentType, PropertyDef} from './Types'
import Element from './Element'
import BaseElement, {propDef} from './BaseElement'
import {parseCollections} from '../shared/CollectionConfig'

type Properties = {
    readonly collections?: string,
}

function generateSecurityRules(collections: string) {
    const collectionConfigs = parseCollections(collections)
    const rules = collectionConfigs.map( coll => {
        if (coll.isUserPrivate()) {
            return `
    match /users/{userId}/${coll.name}/{record} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }`
        } else {
            return `
    match /${coll.name}/{record} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }`
        }
    })

    const ruleText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
${rules.join('\n')} 
  }       
}`

    return ruleText
}

export default class FirestoreDataStore extends BaseElement<Properties> implements Element {

    readonly kind = 'FirestoreDataStore'
    get iconClass() { return 'fireplace' }
    static get parentType() { return 'App' as ParentType }
    type(): ComponentType { return 'statefulUI' }

    get collections() {return this.properties.collections}

    get securityRules() { return generateSecurityRules(this.properties.collections ?? '')}

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('collections', 'string multiline', {state: true, fixedOnly: true}),
            propDef('securityRules', 'string multiline', {readOnly: true}),
        ]
    }
}

