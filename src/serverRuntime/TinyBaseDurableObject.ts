import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object'
import {createMergeableStore, Id, IdAddedOrRemoved} from 'tinybase'
import {createDurableObjectStoragePersister} from 'tinybase/persisters/persister-durable-object-storage'

export class TinyBaseDurableObject extends WsServerDurableObject {
    onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved ? 'Added' : 'Removed') + ` path ${pathId}`)
    }

    onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved) {
        console.info((addedOrRemoved ? 'Added' : 'Removed') + ` client ${clientId} on path ${pathId}`)
    }

    createPersister() {
        return createDurableObjectStoragePersister(createMergeableStore(), this.ctx.storage)
    }
}
