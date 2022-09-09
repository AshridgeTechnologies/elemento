import {BasicDataStore, CollectionName, Criteria, DataStoreObject, Id} from '../runtime/DataStore'
import admin from 'firebase-admin'

import {mapObjIndexed} from 'ramda'
import CollectionConfig, {parseCollections} from '../shared/CollectionConfig'
import App = admin.app.App
import Firestore = admin.firestore.Firestore

const convertValue = (value: any) => typeof value.toDate === 'function' ? value.toDate() : value
const convertDocumentData = (data: any) => mapObjIndexed(convertValue, data)

export interface AppProvider {
    getApp(): App
}

let defaultApp: App

const defaultAppProvider: AppProvider = {
    getApp(): App {
        if (!defaultApp) {
            defaultApp = admin.initializeApp()
        }

        return defaultApp
    }
}
type Properties = {collections: string}
export default class FirestoreDataStore implements BasicDataStore {
    private theDb: Firestore | null = null
    private readonly collections: CollectionConfig[]

    constructor(private props: Properties, private appProvider = defaultAppProvider) {
        this.collections = parseCollections(props.collections ?? '')
    }

    get db(): Firestore {
        if (!this.theDb) {
            this.theDb = admin.firestore(this.appProvider.getApp())
        }
        return this.theDb!
    }

    private getCurrentUser(): any {
        return null //TODO inject auth from request
    }

    private collectionRef(collectionName: CollectionName) {
        const collectionConfig = this.collections.find( coll => coll.name === collectionName)
        if (!collectionConfig) {
            throw new Error(`Collection '${collectionName}' not found`)
        }

        if (collectionConfig.isUserPrivate()) {
            const user = this.getCurrentUser()
            if (!user) {
                throw new Error(`Cannot access user-private collection '${collectionName}' if not logged in`)
            }
            return this.db.collection('users').doc(user.uid).collection(collectionName)
        }

        return this.db.collection(collectionName)
    }

    private docRef(collectionName: CollectionName, id: Id) {
        return this.collectionRef(collectionName).doc(id.toString())
    }

    async getById(collectionName: CollectionName, id: Id) {
        const doc = await this.docRef(collectionName, id).get()
        if (!doc.exists) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }

        return convertDocumentData(doc.data())
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        const itemWithId = {id, ...item}
        await this.docRef(collectionName, id).set(itemWithId)
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const addIdToItem = (item: DataStoreObject, id: Id) => ({id, ...item})
        const itemsWithIds = Object.values(mapObjIndexed( addIdToItem, items))

        const batch = this.db.batch()

        Object.values(itemsWithIds).forEach(item => {
            batch.set(this.docRef(collectionName, item.id), item)
        })
        await batch.commit()
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        await this.docRef(collectionName, id).set(changes, {merge: true})
    }

    async remove(collectionName: CollectionName, id: Id) {
        await this.docRef(collectionName, id).delete()
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        const constraints = Object.entries(criteria)

        const collectionRef = this.collectionRef(collectionName)
        const [firstConstraint, ...otherConstraints] = constraints
        const queryRefBase = firstConstraint ? collectionRef.where(firstConstraint[0], '==', firstConstraint[1]) : collectionRef
        const queryRef = otherConstraints.reduce( (ref, [name, value]) => ref.where(name, '==', value), queryRefBase)
        const snapshot = await queryRef.get()
        return snapshot.docs.map(d => convertDocumentData(d.data()))
    }

}
