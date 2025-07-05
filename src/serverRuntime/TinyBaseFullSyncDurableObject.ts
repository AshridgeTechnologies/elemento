import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'
import {Message} from 'tinybase/synchronizers'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {AuthStatus, CollectionName, Id as DataStoreId, NullToken} from '../shared/DataStore'
import {TinyBaseDurableObject, TinyBaseDurableObjectImpl} from './TinyBaseDurableObject'
import {getClientId} from './tinybaseUtils'
import {User} from '../shared/subjects'
import {jwtDecode} from 'jwt-decode'
import {verifyToken} from './requestHandler'
import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage'

const updateMessageTypes = [Message.ContentDiff.toString()]

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
        console.info('Server message', 'from', fromClientId, 'to', toClientId, remainder)
    }

    createPersister() {
        return createDurableObjectSqlStoragePersister(
            this.store,
            this.storage.sql,
            {
                mode: 'fragmented',
                storagePrefix: 'elemento_',
            }
        )
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
            console.log('authStatus', authStatus, 'client id', clientId, 'user', user)
            if (!authStatus) {
                console.info('Unauthorized sync connect rejected', user, clientId)
                return new Response('Unauthorized', {status: 401})
            }

            response.headers.append('sec-websocket-protocol', authStatus)
            this.getClientSocket(clientId)?.serializeAttachment({authStatus})
        }

        return response
    }

    webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
        const messageType = message.toString().match(/,(\d),/)?.[1]
        if (messageType && updateMessageTypes.includes(messageType)) {
            const fromClientId = this.ctx.getTags(client)[0]
            const {authStatus} = client.deserializeAttachment()

            if (authStatus !== 'readwrite') {
                console.warn('Illegal update from a readonly client', fromClientId, `status: '${authStatus}'`, message)
                return
            }
        }
        // @ts-ignore
        super.webSocketMessage(client, message)
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

    private getClientSocket(tag: Id) {
        return this.ctx.getWebSockets(tag)[0]
    }
}
