import {DurableObject} from 'cloudflare:workers';
import type {IdAddedOrRemoved} from 'tinybase'
import {createMergeableStore, Id, Ids, MergeableStore, Store, Tables} from 'tinybase'
import type {Persister, Persists} from 'tinybase/persisters'
import type {Receive} from 'tinybase/synchronizers'
import {createCustomSynchronizer, Message} from 'tinybase/synchronizers'
import {
    arrayIsEmpty,
    arrayMap,
    createPayload,
    EMPTY_STRING,
    IdOrNull,
    ifNotUndefined,
    jsonParseWithUndefined,
    noop,
    objValues,
    receivePayload,
    size,
    startTimeout,
    strMatch
} from './tinybaseUtils'

const PATH_REGEX = /\/([^?]*)/;
const SERVER_CLIENT_ID = 'S';

const messageType = (message: Message) => {
    switch(message) {
        case 0: return 'Response'
        case 1: return 'GetContentHashes'
        case 2: return 'ContentHashes'
        case 3: return 'ContentDiff'
        case 4: return 'GetTableDiff'
        case 5: return 'GetRowDiff'
        case 6: return 'GetCellDiff'
        case 7: return 'GetValueDiff'
        default: 'Unknown message'
    }
}

const getPathId = (request: Request): Id =>
    strMatch(new URL(request.url).pathname, PATH_REGEX)?.[1] ?? EMPTY_STRING;

const getClientId = (request: Request): Id | null =>
    request.headers.get('upgrade')?.toLowerCase() == 'websocket'
        ? request.headers.get('sec-websocket-key')
        : null;

const createResponse = (
    status: number,
    webSocket: WebSocket | null = null,
    body: string | null = null,
): Response => new Response(body, {status, webSocket});

const createUpgradeRequiredResponse = (): Response =>
    createResponse(426, null, 'Upgrade required');

const checkPayload = (payload: string): boolean => {
    const [clientId, remainder] = payload.split('\n');
    const [requestId, message, body] = jsonParseWithUndefined(remainder) as [
        requestId: IdOrNull,
        message: Message,
        body: any,
    ]
    const messageName = messageType(message) as string
    console.log('receive', clientId, requestId, messageName, JSON.stringify(body))
    return message !== 3  // do not allow incoming updates
}

class ClientHandler {
    private readonly store
    private readonly synchronizer
    private serverClientSend!: (payload: string) => void;

    constructor(private clientId: Id, private sendWebsocket: WebSocket, private authorize: (tableId: Id, rowId: Id, changes: object) => boolean) {
        this.store = createMergeableStore()
        this.synchronizer = this.createSynchronizer()
        startTimeout(this.synchronizer.startSync)
    }

    sendInitialMessage() {
        this.sendMessage(SERVER_CLIENT_ID, null, 1, EMPTY_STRING)
    }

    private createSynchronizer() {
        return createCustomSynchronizer(
            this.store,
            this.sendMessage,
            (receive: Receive) =>
                (this.serverClientSend = (payload: string) => {
                    if (checkPayload(payload)) {
                        receivePayload(payload, receive)
                    } else {
                        console.warn('Incoming update ignored')
                    }
                }),
            noop,
            1,
        )
    }

    receiveMessage(payload: string) {
        this.serverClientSend(payload)
    }

    updateData(data: Tables) {
        this.store.transaction(() => {
            for (const tableId in data) {
                const table = data[tableId]
                for (const rowId in table) {
                    const row = table[rowId]
                    if (this.authorize(tableId, rowId, row)) {
                        this.store.setRow(tableId, rowId, row)
                    }
                }
            }
        })
    }

    private sendMessage = (toClientId: IdOrNull, requestId: IdOrNull, message: Message, body: any)=> {
        console.log('send', toClientId, typeof toClientId, requestId, messageType(message) as string, JSON.stringify(body))
        if(toClientId !== null && toClientId !== '' && toClientId !== SERVER_CLIENT_ID && toClientId !== this.clientId) {
            console.warn(`sync send mismatch: to Client Id "${toClientId}" expected ${this.clientId}`)
        }
        const payload = createPayload(SERVER_CLIENT_ID, requestId, message, body)
        this.sendWebsocket.send(payload)
    }
}

export class PerClientWsServerDurableObject<Env = unknown>
    extends DurableObject<Env>
    implements DurableObject<Env>
{
    private readonly clientHandlers = new Map<string, ClientHandler>()
    protected store!: MergeableStore

    constructor(ctx: DurableObjectState, env: Env) {
        console.log('PerClientxx constructor')
        super(ctx, env);
        this.ctx.blockConcurrencyWhile(
            async () =>
                await ifNotUndefined(
                    await this.createPersister(),
                    async (persister) => {
                        this.store = persister.getStore()
                        await persister.load();
                        await persister.startAutoSave();
                    },
                ),
        );
    }

    fetch(request: Request): Response {
        const pathId = getPathId(request);
        return ifNotUndefined(
            getClientId(request),
            (clientId) => {
                const [webSocket, client] = objValues(new WebSocketPair());
                if (arrayIsEmpty(this.#getClients())) {
                    this.onPathId(pathId, 1)
                }
                this.ctx.acceptWebSocket(client, [clientId, pathId]);
                this.onClientId(pathId, clientId, 1)
                const clientAuth = (tableId: Id, rowId: Id, changes: object) => this.authorizeUpdate(clientId, tableId, rowId, changes)
                const clientHandler = new ClientHandler(clientId, client, clientAuth)
                this.clientHandlers.set(clientId, clientHandler)
                clientHandler.sendInitialMessage()
                startTimeout(()=> this.loadClientData(clientHandler))
                return createResponse(101, webSocket);
            },
            createUpgradeRequiredResponse,
        ) as Response;
    }

    webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
        ifNotUndefined(this.ctx.getTags(client)[0], (clientId) =>
            this.clientHandlers.get(clientId)?.receiveMessage(message.toString()))
    }

    webSocketClose(client: WebSocket) {
        const [clientId, pathId] = this.ctx.getTags(client);
        this.onClientId(pathId, clientId, -1);
        if (size(this.#getClients()) == 1) {
            this.onPathId(pathId, -1);
        }
    }

    #getClients(tag?: Id) {
        return this.ctx.getWebSockets(tag);
    }

    createPersister():
        | Persister<Persists.MergeableStoreOnly>
        | Promise<Persister<Persists.MergeableStoreOnly>>
        | undefined {
        return undefined;
    }

    authorizeUpdate(clientId: Id, tableId: Id, rowId: Id, changes: object) {
        return true
    }

    getPathId(): Id {
        return this.ctx.getTags(this.#getClients()[0])?.[1];
    }

    getClientIds(): Ids {
        return arrayMap(
            this.#getClients(),
            (client) => this.ctx.getTags(client)[0],
        );
    }

    onPathId(_pathId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

    onClientId(_pathId: Id, _clientId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

    onMessage(_fromClientId: Id, _toClientId: Id, _remainder: string) {}

    private loadClientData(clientHandler: ClientHandler) {
        clientHandler.updateData(this.store.getTables())
        this.store.addRowListener(null, null, (store: Store, tableId: Id, rowId: Id) => {
            const newRow = store.getRow(tableId, rowId)
            return clientHandler.updateData({
                [tableId]: {
                    [rowId]: newRow
                }
            })
        })
    }
}
