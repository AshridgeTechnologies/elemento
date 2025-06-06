import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {CollectionName, Id as DataStoreId} from '../shared/DataStore'
import {PerClientWsServerDurableObject} from './PerClientWsServerDurableObject'
import {subjects, User} from '../shared/subjects'
import {createClient} from '@openauthjs/openauth/client'
import {jwtDecode} from 'jwt-decode'

const getClientId = (request: Request): Id | null =>
    request.headers.get('upgrade')?.toLowerCase() == 'websocket'
        ? request.headers.get('sec-websocket-key')
        : null;

export class TinyBaseDurableObject extends PerClientWsServerDurableObject<any> {

    private clientUsers = new Map<string, string>()

    onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved ? 'Added' : 'Removed') + ` path ${pathId}`)
    }

    onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
    }

    createPersister() {
        return createDurableObjectStoragePersister(createMergeableStore(), this.ctx.storage)
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
        return this.store.getCell(collectionName, id.toString(), 'json_data') as string ?? null
    }

    getAllJsonData(collectionName: CollectionName): string[] {
        return Object.values(this.store.getTable(collectionName)).map( row => row.json_data as string)
    }

    setJsonData(collectionName: CollectionName, id: DataStoreId, data: string): void {
        this.store.setCell(collectionName, id.toString(), 'json_data', data)
    }

    removeJsonData(collectionName: CollectionName, id: DataStoreId) {
        this.store.delRow(collectionName, id.toString())
    }

    test_clear(collectionName: CollectionName) {
        this.store.delTable(collectionName)
    }

    private async verifyToken(request: Request, token: string): Promise<User | undefined> {

        if (this.env.NO_VERIFY_AUTH_TOKEN === 'true') {
            const jwtPayload: any = jwtDecode(token)
            console.log('jwtPayload', jwtPayload)
            return jwtPayload.properties
        }

        const requestOrigin = new URL(request.url).origin
        const authClient = createClient({
            clientID: "elemento-app",
            issuer: requestOrigin,
        })
        try {
            const verifyResult = await authClient.verify(subjects, token)
            console.log('verifyResult', verifyResult)
            return verifyResult.err ? undefined : verifyResult.subject.properties
        } catch (e) {
            console.error('verify error', e)
            return undefined
        }
    }
}
