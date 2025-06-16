import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'
import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {CollectionName, Id as DataStoreId} from '../shared/DataStore'
import {TinyBaseDurableObject, TinyBaseDurableObjectImpl} from './TinyBaseDurableObject'
import {getClientId} from './tinybaseUtils'
import {User} from '../shared/subjects'
import {jwtDecode} from 'jwt-decode'
import { verifyToken } from './requestHandler'

type AuthStatus = 'full' | 'readonly' | null

export class TinyBaseFullSyncDurableObject extends WsServerDurableObject<any> implements TinyBaseDurableObject {

    protected store = createMergeableStore()
    protected get storage(): DurableObjectStorage { return this.ctx.storage }
    private doImpl = new TinyBaseDurableObjectImpl(this.store)

    onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` path ${pathId}`)
    }

    onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
    }

    onMessage(fromClientId: Id, toClientId: Id, remainder: string) {
        super.onMessage(fromClientId, toClientId, remainder);
        console.info('Server message', 'from', fromClientId, 'to', toClientId, remainder)
    }

    createPersister() {
        return createDurableObjectStoragePersister(this.store, this.storage)
        // return createDurableObjectStoragePersister(createMergeableStore(), this.storage)
    }

    async fetch(request: Request): Promise<Response> {
        // @ts-ignore
        const response = await super.fetch(request)
        const clientId = getClientId(request)
        if (clientId) {
            const protocolHeader = request.headers.get('sec-websocket-protocol') ?? ''
            const [authToken, dummyProtocol] = protocolHeader.split(/ *, */)
            const user = authToken ? await this.verifyToken(request, authToken) : null
            const authStatus = await this.authorizeUser(user?.id)
            if (!authStatus) {
                return new Response('Unauthorized', {status: 401})
            }

            if (dummyProtocol) {
                const finalResponse = new Response(response.body, response)
                finalResponse.headers.append('sec-websocket-protocol', dummyProtocol)
                return finalResponse
            }
        }

        return response
    }

    async authorizeUser(_userId: string | undefined) : Promise<AuthStatus> {
        return null
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
