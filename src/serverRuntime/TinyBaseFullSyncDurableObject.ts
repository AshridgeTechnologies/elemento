import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'
import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {AuthStatus, CollectionName, Id as DataStoreId, NullToken} from '../shared/DataStore'
import {TinyBaseDurableObject, TinyBaseDurableObjectImpl} from './TinyBaseDurableObject'
import {getClientId} from './tinybaseUtils'
import {User} from '../shared/subjects'
import {jwtDecode} from 'jwt-decode'
import { verifyToken } from './requestHandler'
import {Message} from 'tinybase/synchronizers'

const updateMessageTypes = [Message.ContentDiff.toString()]

export class TinyBaseFullSyncDurableObject extends WsServerDurableObject<any> implements TinyBaseDurableObject {

    protected store = createMergeableStore()
    protected get storage(): DurableObjectStorage { return this.ctx.storage }
    private doImpl = new TinyBaseDurableObjectImpl(this.store)
    private clientAuthStatus = new Map<string, AuthStatus>()

    onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` path ${pathId}`)
    }

    onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved > 0 ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
    }

    onMessage(fromClientId: Id, toClientId: Id, remainder: string) {
        console.info('Server message', 'from', fromClientId, 'to', toClientId, remainder)
    }

    createPersister() {
        return createDurableObjectStoragePersister(this.store, this.storage)
    }

    async fetch(request: Request): Promise<Response> {
        // @ts-ignore
        const response = await super.fetch(request)
        const clientId = getClientId(request)
        if (clientId) {
            const protocolHeader = request.headers.get('sec-websocket-protocol') ?? ''
            const [authToken] = protocolHeader.split(/ *, */)
            const user = authToken !== NullToken ? await this.verifyToken(request, authToken) : null
            const authStatus = await this.authorizeUser(user?.id)
            if (!authStatus) {
                console.info('Unauthorized sync connect rejected', user, clientId)
                return new Response('Unauthorized', {status: 401})
            }

            this.clientAuthStatus.set(clientId, authStatus)

            const finalResponse = new Response(response.body, response)
            finalResponse.headers.append('sec-websocket-protocol', authStatus)
            return finalResponse
        }

        return response
    }

    webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
        const messageType = message.toString().match(/,(\d),/)?.[1]
        if (messageType && updateMessageTypes.includes(messageType)) {
            const fromClientId = this.ctx.getTags(client)[0]
            const authStatus = this.clientAuthStatus.get(fromClientId)
            if (authStatus !== 'readwrite') {
                console.warn('Illegal update from readonly client', fromClientId, message)
                return
            }
        }
        // @ts-ignore
        super.webSocketMessage(client, message)
    }

    webSocketClose(client: WebSocket): void | Promise<void> {
        const [clientId] = this.ctx.getTags(client)
        this.clientAuthStatus.delete(clientId)
        // @ts-ignore
        return super.webSocketClose(client)
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
