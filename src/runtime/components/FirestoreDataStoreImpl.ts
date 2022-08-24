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
import * as auth from 'firebase/auth'
import Observable from 'zen-observable'
import SendObservable from '../SendObservable'
import {mapObjIndexed} from 'ramda'

import {FirebaseApp, initializeApp} from 'firebase/app'
import firebase from 'firebase/compat'
import DocumentData = firebase.firestore.DocumentData
import Timestamp = firebase.firestore.Timestamp

class FirebaseAppManager {
    private app: FirebaseApp | null = null
    private firebaseConfig: any = {}

    getApp() {
        this.app = this.app ?? initializeApp(this.firebaseConfig, this.firebaseConfig.projectId)
        return this.app
    }

    setConfig(config: any) {
        this.firebaseConfig = config
        this.app = null
    }
}

const appManager = new FirebaseAppManager()

export const getApp = () => {
    return appManager.getApp()
}

export const setConfig = (config: any) => {
    appManager.setConfig(config)
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
    private readonly db: Firestore
    private readonly collections: CollectionConfig[]
    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
        this.db = getFirestore(getApp())
    }

    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    private collectionRef(collectionName: CollectionName) {
        const collectionConfig = this.collections.find( coll => coll.name === collectionName)
        if (!collectionConfig) {
            throw new Error(`Collection '${collectionName}' not found`)
        }

        if (collectionConfig.isUserPrivate()) {
            const user = auth.getAuth(getApp()).currentUser
            if (!user) {
                throw new Error(`Cannot access user-private collection '${collectionName}' if not logged in`)
            }
            return collection(this.db, 'users', user.uid, collectionName)
        }

        return collection(this.db, collectionName)
    }

    private docRef(collectionName: CollectionName, id: Id) {
        return doc(this.collectionRef(collectionName), id.toString())
    }

    async getById(collectionName: CollectionName, id: Id) {
        const docSnap = await getDoc(this.docRef(collectionName, id))
        if (!docSnap.exists()) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }

        return convertDocumentData(docSnap.data())
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        const itemWithId = {id, ...item}
        await setDoc(this.docRef(collectionName, id), itemWithId);
        this.notify(collectionName, Add, id, item)
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const addIdToItem = (item: DataStoreObject, id: Id) => ({id, ...item})
        const itemsWithIds = Object.values(mapObjIndexed( addIdToItem, items))

        const batch = writeBatch(this.db);

        Object.values(itemsWithIds).forEach(item => {
            batch.set(this.docRef(collectionName, item.id), item)
        })
        await batch.commit()
        this.notify(collectionName, MultipleChanges)
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        await updateDoc(this.docRef(collectionName, id), changes)
        this.notify(collectionName, Update, id, changes)
    }

    async remove(collectionName: CollectionName, id: Id) {
        await deleteDoc(this.docRef(collectionName, id))
        this.notify(collectionName, Remove, id)
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        const asConstraint = ([name, value]: [name: string, value: any]) => where(name, '==', value)
        const constraints = Object.entries(criteria).map(asConstraint)
        const q = query(this.collectionRef(collectionName), ...constraints)

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
