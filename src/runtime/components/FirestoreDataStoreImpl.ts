import DataStore, {
    Add,
    CollectionName,
    Criteria,
    DataStoreObject,
    Id,
    InvalidateAll,
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
import {onAuthChange, currentUser} from './authentication'

import Observable from 'zen-observable'
import SendObservable from '../../util/SendObservable'
import {mapObjIndexed} from 'ramda'
import {getAppAndSubscribeToChanges, FirebaseApp} from './firebaseApp'
import CollectionConfig, {parseCollections} from '../../shared/CollectionConfig'

const convertValue = (value: any) => typeof value?.toDate === 'function' ? value.toDate() : value
const convertDocumentData = (data: any) => mapObjIndexed(convertValue, data)

type Properties = {collections: string}
export default class FirestoreDataStoreImpl implements DataStore {
    private theDb: Firestore | null = null
    private readonly collections: CollectionConfig[]
    private authObserver: any = null
    private appChangeSubscribed = false

    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
    }

    private handleAppChange = (app: FirebaseApp | null) => {
        this.theDb = app ? getFirestore(app) : null
        this.notifyAll(InvalidateAll)
    }

    get db(): Firestore | null {

        if (!this.appChangeSubscribed) {
            getAppAndSubscribeToChanges(this.handleAppChange)
            this.appChangeSubscribed = true
        }

        return this.theDb
    }

    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    private getCurrentUser() {
        return currentUser()
    }

    private collectionRef(collectionName: CollectionName) {
        if (!this.db) throw new Error(`Not connected to Firestore database`)
        const collectionConfig = this.collections.find( coll => coll.name === collectionName)
        if (!collectionConfig) {
            throw new Error(`Collection '${collectionName}' not found`)
        }

        if (collectionConfig.isUserPrivate()) {
            const user = this.getCurrentUser()
            if (!user) {
                throw new Error(`Cannot access user-private collection '${collectionName}' if not logged in`)
            }
            return collection(this.db, 'users', user.uid, collectionName)
        }

        return collection(this.db, collectionName)
    }

    private docRef(collectionName: CollectionName, id: Id) {
        return doc(this.collectionRef(collectionName), String(id))
    }

    async getById(collectionName: CollectionName, id: Id) {
        if (!this.db) return null
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
        if (!this.db) throw new Error(`Not connected to Firestore database`)
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
        if (!this.db) return []
        if (!this.getCurrentUser()) {
            return []
        }
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
            if (!this.authObserver) {
                this.authObserver = onAuthChange(() => {
                    this.notifyAll(InvalidateAll)
                })
            }
        }
        return observable
    }

    private notify(collection: CollectionName, type: UpdateType, id?: Id, changes?: DataStoreObject ) {
        const observable = this.collectionObservables.get(collection)
        observable?.send({collection, type, id, changes})
    }

    private notifyAll(type: UpdateType) {
        this.collectionObservables.forEach( (observable, collection) => observable.send({collection, type}))
    }
}
