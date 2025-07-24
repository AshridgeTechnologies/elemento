import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {AuthStatus, CollectionName, Id as DataStoreId, NullToken} from '../shared/DataStore'
import {PerClientWsServerDurableObject} from './PerClientWsServerDurableObject'
import {User} from '../shared/subjects'
import {jwtDecode} from 'jwt-decode'
import {verifyToken} from './requestHandler'
import {TinyBaseDurableObject, TinyBaseDurableObjectImpl} from './TinyBaseDurableObject'
import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage'

export class TinyBaseAuthSyncDurableObject extends PerClientWsServerDurableObject<any> implements TinyBaseDurableObject {

    private clientUsers = new Map<string, string | undefined>()
    private _store = createMergeableStore()
    private get storage(): DurableObjectStorage { return this.ctx.storage }
    private doImpl = new TinyBaseDurableObjectImpl(this._store)

    createPersister() {
        return createDurableObjectSqlStoragePersister(
            this._store,
            this.storage.sql,
            {
                mode: 'fragmented',
                storagePrefix: 'elemento_',
            }
        )

    }

    onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` path ${pathId}`)
    }

    onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
    }

    protected async authorizeRequest(request: Request, clientId: string): Promise<boolean | ((response: Response) => void)> {
        const protocolHeader = request.headers.get('sec-websocket-protocol') ?? ''
        const [authToken] = protocolHeader.split(/ *, */)
        const user = authToken !== NullToken ? await this.verifyToken(request, authToken) : null
        const authStatus = await this.authorizeUser(user?.id)

        if (authStatus) {
            console.log('Client/User', clientId, user?.id)
            this.clientUsers.set(clientId, user?.id)
            return (response: Response) => response.headers.append('sec-websocket-protocol', authStatus)
        } else {
            console.info('Unauthorized sync connect rejected', user, clientId)
            return false
        }
    }

    async authorizeUser(_userId: string | undefined) : Promise<AuthStatus> {
        return null
    }

    authorizeUpdate(clientId: Id, tableId: Id, rowId: Id, changes: object): boolean {
        const jsonData = changes['json_data' as keyof object] as string
        const unpackedChanges = JSON.parse(jsonData) ?? {}
        const userId = this.clientUsers.get(clientId)
        return this.authorizeData(userId, tableId, rowId, unpackedChanges);
    }

    protected authorizeData(_userId: Id | undefined, _tableId: Id, _rowId: Id, _changes: object): boolean {
        return true
    }

    getJsonData(collectionName: CollectionName, id: DataStoreId): string | null {
        return this.doImpl.getJsonData(collectionName, id)
    }

    getAllJsonData(collectionName: CollectionName): string[] {
        return this.doImpl.getAllJsonData(collectionName)
    }

    setJsonData(collectionName: CollectionName, id: DataStoreId, data: string): void {
        this.doImpl.setJsonData(collectionName, id, data)
    }

    removeJsonData(collectionName: CollectionName, id: DataStoreId) {
        this.doImpl.removeJsonData(collectionName, id)
    }

    test_clear(collectionName: CollectionName) {
        this.doImpl.test_clear(collectionName)
    }

    private async verifyToken(request: Request, token: string): Promise<User | undefined> {

        if (this.env.NO_VERIFY_AUTH_TOKEN === 'true') {
            const jwtPayload: any = jwtDecode(token)
            console.log('jwtPayload', jwtPayload)
            return jwtPayload.properties
        }
        return await verifyToken(request, token)
    }
}
