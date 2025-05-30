import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'
import {CollectionName, Id as DataStoreId} from '../runtime/DataStore'
import {PerClientWsServerDurableObject} from './PerClientWsServerDurableObject'

const getClientId = (request: Request): Id | null =>
    request.headers.get('upgrade')?.toLowerCase() == 'websocket'
        ? request.headers.get('sec-websocket-key')
        : null;

export class TinyBaseDurableObject extends PerClientWsServerDurableObject {

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

    fetch(request: Request): Response {
        const response = super.fetch(request)
        const clientId = getClientId(request)
        if (clientId) {
            const protocolHeader = request.headers.get('sec-websocket-protocol') ?? ''
            const [authToken, dummyProtocol] = protocolHeader.split(/ *, */)
            if (!authToken.startsWith('authtoken.')) {
                return new Response('Unauthorized', {status: 401})
            }

            const [_, userId] = authToken.split('.')
            console.log('Client/User', clientId, userId)
            this.clientUsers.set(clientId, userId)

            const finalResponse = new Response(response.body, response)
            finalResponse.headers.append('sec-websocket-protocol', dummyProtocol)
            return finalResponse
        }

        return response
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
}
