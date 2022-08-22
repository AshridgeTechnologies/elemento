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
import auth from './authentication'

import Observable from 'zen-observable'
import SendObservable from '../SendObservable'
import {mapObjIndexed} from 'ramda'
import {getApp} from './firebaseApp'
import {FirebaseApp} from 'firebase/app'
import CollectionConfig, {parseCollections} from '../../shared/CollectionConfig'

const convertValue = (value: any) => typeof value.toDate === 'function' ? value.toDate() : value
const convertDocumentData = (data: any) => mapObjIndexed(convertValue, data)

type Properties = {collections: string}
export default class FirestoreDataStoreImpl implements DataStore {
    private theDb: Firestore | null = null
    private theApp: FirebaseApp | null = null
    private readonly collections: CollectionConfig[]
    private authObserver: any = null
    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
    }

    get db(): Firestore { return this.theDb! }

    private async init() {
        await auth.init()
        if (!this.theApp) {
            this.theApp = await getApp()
        }
        if (!this.theDb) {
            this.theDb = getFirestore(this.theApp)
        }
    }

    private collectionObservables = new Map<CollectionName, SendObservable<UpdateNotification>>()

    private getCurrentUser() {
        return auth.currentUser()
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
            return collection(this.db, 'users', user.uid, collectionName)
        }

        return collection(this.db, collectionName)
    }

    private docRef(collectionName: CollectionName, id: Id) {
        return doc(this.collectionRef(collectionName), id.toString())
    }

    async getById(collectionName: CollectionName, id: Id) {
        await this.init()
        const docSnap = await getDoc(this.docRef(collectionName, id))
        if (!docSnap.exists()) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }

        return convertDocumentData(docSnap.data())
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        await this.init()
        const itemWithId = {id, ...item}
        await setDoc(this.docRef(collectionName, id), itemWithId);
        this.notify(collectionName, Add, id, item)
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        await this.init()
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
        await this.init()
        await updateDoc(this.docRef(collectionName, id), changes)
        this.notify(collectionName, Update, id, changes)
    }

    async remove(collectionName: CollectionName, id: Id) {
        await this.init()
        await deleteDoc(this.docRef(collectionName, id))
        this.notify(collectionName, Remove, id)
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        await this.init()
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
                auth.init().then( () => this.authObserver = auth.onAuthStateChanged(() => this.notifyAll(InvalidateAll)))
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
