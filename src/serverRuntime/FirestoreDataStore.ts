import {BasicDataStore, CollectionName, ComplexCriteria, Criteria, DataStoreObject, Id, SimpleCriteria} from '../runtime/DataStore'
import admin, {firestore} from 'firebase-admin'

import {mapObjIndexed} from 'ramda'
import CollectionConfig, {parseCollections} from '../shared/CollectionConfig'
import Firestore = admin.firestore.Firestore
import {getApp} from './firebaseApp'
import {isArray} from 'radash'
import WhereFilterOp = firestore.WhereFilterOp

const convertValue = (value: any) => typeof value?.toDate === 'function' ? value.toDate() : value
const convertDocumentData = (data: any) => mapObjIndexed(convertValue, data)

type Properties = {collections: string}

const normalizeCriteria = (criteria: Criteria): ComplexCriteria => {
    return isArray(criteria) ? criteria : Object.entries(criteria).map(([name, value]) => [name, '==', value])
}

export default class FirestoreDataStore implements BasicDataStore {
    private theDb: Firestore | null = null
    private readonly collections: CollectionConfig[]

    constructor(private props: Properties, private appProvider = getApp) {
        this.collections = parseCollections(props.collections ?? '')
    }

    get db(): Firestore {
        if (!this.theDb) {
            this.theDb = admin.firestore(this.appProvider())
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

    async getById(collectionName: CollectionName, id: Id, nullIfNotFound = false) {
        const doc = await this.docRef(collectionName, id).get()
        if (!doc.exists) {
            if (nullIfNotFound) {
                return null
            }
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
        const constraints = normalizeCriteria(criteria)

        const collectionRef = this.collectionRef(collectionName)
        const [firstConstraint, ...otherConstraints] = constraints
        const queryRefBase = firstConstraint ? collectionRef.where(firstConstraint[0], firstConstraint[1] as WhereFilterOp, firstConstraint[2]) : collectionRef
        const queryRef = otherConstraints.reduce( (ref, [name, op, value]) => ref.where(name, op as WhereFilterOp, value), queryRefBase)
        const snapshot = await queryRef.get()
        return snapshot.docs.map(d => convertDocumentData(d.data()))
    }

}
