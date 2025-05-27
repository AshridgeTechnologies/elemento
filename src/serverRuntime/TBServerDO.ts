import {DurableObject} from 'cloudflare:workers';
import type {Id, Ids} from 'tinybase'
import type {Persister, Persists} from 'tinybase/persisters'
import type {IdAddedOrRemoved} from 'tinybase'
import type {Receive} from 'tinybase/synchronizers'
import {Message} from 'tinybase/synchronizers'
import {arrayForEach, arrayIsEmpty, arrayMap, IdOrNull, jsonParseWithUndefined} from './tinybaseUtils'
import {objValues} from './tinybaseUtils'
import {ifNotUndefined, noop, size, startTimeout} from './tinybaseUtils'
import {EMPTY_STRING, strMatch} from './tinybaseUtils'
import {
    createPayload,
    createRawPayload,
    ifPayloadValid,
    receivePayload,
} from './tinybaseUtils'
import {createCustomSynchronizer} from 'tinybase/synchronizers'

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

export class TBServerDO<Env = unknown>
    extends DurableObject<Env>
    implements DurableObject<Env>
{
    // @ts-expect-error See blockConcurrencyWhile
    #serverClientSend: (payload: string) => void;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.ctx.blockConcurrencyWhile(
            async () =>
                await ifNotUndefined(
                    await this.createPersister(),
                    async (persister) => {
                        const synchronizer = createCustomSynchronizer(
                            persister.getStore(),
                            (toClientId, requestId, message, body) => {
                                // trace
                                const messageName = messageType(message) as string
                                console.log('send', toClientId, requestId, messageName, JSON.stringify(body))
                                // console.log(JSON.stringify(body))
                                this.#handleMessage(
                                    SERVER_CLIENT_ID,
                                    createPayload(toClientId, requestId, message, body),
                                )
                            },
                            (receive: Receive) =>
                                (this.#serverClientSend = (payload: string) => {
                                    const [clientId, remainder] = payload.split('\n');
                                    const [requestId, message, body] = jsonParseWithUndefined(remainder) as [
                                        requestId: IdOrNull,
                                        message: Message,
                                        body: any,
                                    ]
                                    (jsonParseWithUndefined(remainder) as [
                                        requestId: IdOrNull,
                                        message: Message,
                                        body: any,
                                    ])
                                    const messageName = messageType(message) as string
                                    console.log('receive', clientId, requestId, messageName, JSON.stringify(body))
                                    receivePayload(payload, receive)
                                }),
                            noop,
                            1,
                        );
                        await persister.load();
                        await persister.startAutoSave();
                        // startSync needs other events to arrive, so execute after block.
                        startTimeout(synchronizer.startSync);
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
                    this.onPathId(pathId, 1);
                }
                this.ctx.acceptWebSocket(client, [clientId, pathId]);
                this.onClientId(pathId, clientId, 1);
                client.send(createPayload(SERVER_CLIENT_ID, null, 1, EMPTY_STRING));
                return createResponse(101, webSocket);
            },
            createUpgradeRequiredResponse,
        ) as Response;
    }

    webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
        ifNotUndefined(this.ctx.getTags(client)[0], (clientId) =>
            this.#handleMessage(clientId, message.toString(), client),
        );
    }

    webSocketClose(client: WebSocket) {
        const [clientId, pathId] = this.ctx.getTags(client);
        this.onClientId(pathId, clientId, -1);
        if (size(this.#getClients()) == 1) {
            this.onPathId(pathId, -1);
        }
    }

    // --

    #handleMessage(fromClientId: Id, message: string, fromClient?: WebSocket) {
        ifPayloadValid(message.toString(), (toClientId, remainder) => {
            const forwardedPayload = createRawPayload(fromClientId, remainder);
            this.onMessage(fromClientId, toClientId, remainder);
            if (toClientId == EMPTY_STRING) {
                if (fromClientId != SERVER_CLIENT_ID) {
                    this.#serverClientSend?.(forwardedPayload);
                }
                arrayForEach(this.#getClients(), (otherClient) => {
                    if (otherClient != fromClient) {
                        otherClient.send(forwardedPayload);
                    }
                });
            } else if (toClientId == SERVER_CLIENT_ID) {
                this.#serverClientSend?.(forwardedPayload);
            } else if (toClientId != fromClientId) {
                this.#getClients(toClientId)[0]?.send(forwardedPayload);
            }
        });
    }

    #getClients(tag?: Id) {
        return this.ctx.getWebSockets(tag);
    }

    // --

    createPersister():
        | Persister<Persists.MergeableStoreOnly>
        | Promise<Persister<Persists.MergeableStoreOnly>>
        | undefined {
        return undefined;
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
}
