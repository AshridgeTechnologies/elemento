import {Message, Receive} from 'tinybase/synchronizers'

export type Id = string;
export type IdOrNull = Id | null;
export type IdObj<Value> = {[id: string]: Value};

export const EMPTY_STRING = '';
const MESSAGE_SEPARATOR = '\n';
export const UNDEFINED = '\uFFFC';
export const object = Object;

export const isInstanceOf = (
    thing: unknown,
    cls: MapConstructor | SetConstructor | ObjectConstructor,
): boolean => thing instanceof cls;

export const noop = () => {};

export const startTimeout = (callback: () => void, sec: number = 0) =>
    setTimeout(callback, sec * 1000);

export const size = (arrayOrString: string | any[]): number =>
    arrayOrString.length;


export const isUndefined = (thing: unknown): thing is undefined | null =>
    thing == undefined;

export const ifNotUndefined = <Value, Return>(
    value: Value | null | undefined,
    then: (value: Value) => Return,
    otherwise?: () => Return,
): Return | undefined => (isUndefined(value) ? otherwise?.() : then(value));


export const slice = <ArrayOrString extends string | any[]>(
    arrayOrString: ArrayOrString,
    start: number,
    end?: number,
): ArrayOrString => arrayOrString.slice(start, end) as ArrayOrString;

export const arrayForEach = <Value>(
    array: {forEach: (cb: (value: Value, index: number) => void) => void},
    cb: (value: Value, index: number) => void,
): void => array.forEach(cb);

export const arrayMap = <Value, Return>(
    array: Value[],
    cb: (value: Value, index: number, array: Value[]) => Return,
): Return[] => array.map(cb);

export const arrayIsEmpty = (array: unknown[]): boolean => size(array) == 0;

export const ifPayloadValid = (
    payload: string,
    then: (clientId: string, remainder: string) => void,
) => {
    const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
    if (splitAt !== -1) {
        then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
    }
};

export const objValues = <Value>(obj: IdObj<Value>): Value[] =>
    object.values(obj);

export const strMatch = (str: string | undefined, regex: RegExp) =>
    str?.match(regex);

export const jsonString = JSON.stringify;
export const jsonParse = JSON.parse;

export const jsonStringWithMap = (obj: unknown): string =>
    jsonString(obj, (_key, value) =>
        isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
    );

export const jsonStringWithUndefined = (obj: unknown): string =>
    jsonString(obj, (_key, value) => (value === undefined ? UNDEFINED : value));

export const jsonParseWithUndefined = (str: string): any =>
    jsonParse(str, (_key, value) => (value === UNDEFINED ? undefined : value));
export const receivePayload = (payload: string, receive: Receive) =>
    ifPayloadValid(payload, (fromClientId, remainder) =>
        receive(
            fromClientId,
            ...(jsonParseWithUndefined(remainder) as [
                requestId: IdOrNull,
                message: Message,
                body: any,
            ]),
        ),
    );

export const createPayload = (
    toClientId: IdOrNull,
    ...args: [requestId: IdOrNull, message: Message, body: any]
): string =>
    createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));

export const createRawPayload = (clientId: Id, remainder: string): string =>
    clientId + MESSAGE_SEPARATOR + remainder;
