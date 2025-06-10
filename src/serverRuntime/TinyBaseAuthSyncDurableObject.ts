import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {CollectionName, Id as DataStoreId} from '../shared/DataStore'
import {PerClientWsServerDurableObject} from './PerClientWsServerDurableObject'
import {User} from '../shared/subjects'
import {jwtDecode} from 'jwt-decode'
import {verifyToken} from './requestHandler'
import {TinyBaseDurableObject, TinyBaseDurableObjectImpl} from './TinyBaseDurableObject'
import {getClientId} from './tinybaseUtils'

export class TinyBaseAuthSyncDurableObject extends PerClientWsServerDurableObject<any> implements TinyBaseDurableObject {

    private clientUsers = new Map<string, string>()
    private _store = createMergeableStore()
    private get storage(): DurableObjectStorage { return this.ctx.storage }
    private doImpl = new TinyBaseDurableObjectImpl(this._store, this.storage)

    createPersister() {
        return createDurableObjectStoragePersister(this._store, this.storage)
    }

    onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` path ${pathId}`)
    }

    onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
    }

    async fetch(request: Request): Promise<Response> {
        const response = await super.fetch(request)
        const clientId = getClientId(request)
        if (clientId) {
            const protocolHeader = request.headers.get('sec-websocket-protocol') ?? ''
            const [authToken, dummyProtocol] = protocolHeader.split(/ *, */)
            const user = await this.verifyToken(request, authToken)
            if (!user) {
                return new Response('Unauthorized', {status: 401})
            }

            console.log('Client/User', clientId, user.id)
            this.clientUsers.set(clientId, user.id)

            const finalResponse = new Response(response.body, response)
            finalResponse.headers.append('sec-websocket-protocol', dummyProtocol)
            return finalResponse
        }

        return response
    }

    authorizeUpdate(clientId: Id, tableId: Id, rowId: Id, changes: object): boolean {
        const jsonData = changes['json_data' as keyof object] as string
        const unpackedChanges = JSON.parse(jsonData) ?? {}
        const userId = this.clientUsers.get(clientId)
        return this.authorizeUpdateData(userId, tableId, rowId, unpackedChanges);
    }

    protected authorizeUpdateData(userId: Id | undefined, tableId: Id, rowId: Id, changes: object): boolean {
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
