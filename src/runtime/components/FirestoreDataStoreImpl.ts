import DataStore, {
    Add,
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    MultipleChanges,
    Remove,
    Update,
    UpdateNotification,
    UpdateType
} from '../DataStore'
import {
    collection,
    deleteDoc,
    doc,
    Firestore,
    getDoc,
    getDocs,
    getFirestore,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore'
import Observable from 'zen-observable'
import SendObservable from '../SendObservable'
import {mapObjIndexed} from 'ramda'

import {FirebaseApp, initializeApp} from 'firebase/app'
import firebase from 'firebase/compat'
import DocumentData = firebase.firestore.DocumentData
import Timestamp = firebase.firestore.Timestamp

let firebaseConfig = {}

let app: FirebaseApp | null
export const getApp = () => {
    app = app ?? initializeApp(firebaseConfig)
    return app
}

export const setConfig = (config: any) => {
    firebaseConfig = config
    app = null
}

const convertValue = (value: any) => value instanceof Timestamp ? value.toDate() : value
const convertDocumentData = (data: DocumentData) => mapObjIndexed(convertValue, data)

class CollectionConfig {
    constructor(public name: string, public roles: string[]) {}
    isUserPrivate() { return this.roles.includes('user-private')}
}

const parseLine = (line: string) => {
    const [name, roleList = ''] = line.trim().split(/ *: */)
    const roles = roleList.trim().split(/ *, */)
    return new CollectionConfig(name, roles)
}
const parseCollections = (config: string) => {
    const lines = config.split(/\n+/)
    return lines.map(parseLine)
}

type Properties = {collections: string}
export default class FirestoreDataStoreImpl implements DataStore {
    private db: Firestore
    private collections: CollectionConfig[]
    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
        this.db = getFirestore(getApp())
    }

    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    async getById(collectionName: CollectionName, id: Id) {
        const collectionConfig = this.collections.find( coll => coll.name === collectionName)
        if (!collectionConfig) {
            throw new Error(`Collection '${collectionName}' not found`)
        }

        const docRef = doc(this.db, collectionName, id.toString());
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }

        return convertDocumentData(docSnap.data())
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        const itemWithId = {id, ...item}
        const collRef = collection(this.db, collectionName);

        await setDoc(doc(collRef, id.toString()), itemWithId);
        this.notify(collectionName, Add, id, item)
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const addIdToItem = (item: DataStoreObject, id: Id) => ({id, ...item})
        const itemsWithIds = Object.values(mapObjIndexed( addIdToItem, items))

        const batch = writeBatch(this.db);

        Object.values(itemsWithIds).forEach(item => {
            const ref = doc(this.db, collectionName, item.id.toString())
            batch.set(ref, item)
        })
        await batch.commit()
        this.notify(collectionName, MultipleChanges)
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        const docRef = doc(this.db, collectionName, id.toString())
        await updateDoc(docRef, changes)
        this.notify(collectionName, Update, id, changes)
    }

    async remove(collection: CollectionName, id: Id) {
        const docRef = doc(this.db, collection, id.toString())
        await deleteDoc(docRef)
        this.notify(collection, Remove, id)
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        const collRef = collection(this.db, collectionName)

        const asConstraint = ([name, value]: [name: string, value: any]) => where(name, '==', value)
        const constraints = Object.entries(criteria).map(asConstraint)
        const q = query(collRef, ...constraints)

        return (await getDocs(q)).docs.map(d => convertDocumentData(d.data()))
    }

    observable(collection: CollectionName): Observable<UpdateNotification> {
        let observable = this.collectionObservables.get(collection)
        if (!observable) {
            observable = new SendObservable()
            this.collectionObservables.set(collection, observable)
        }
        return observable
    }

    private notify(collection: CollectionName, type: UpdateType, id?: Id, changes?: DataStoreObject ) {
        const observable = this.collectionObservables.get(collection)
        observable?.send({collection, type, id, changes})
    }
}
