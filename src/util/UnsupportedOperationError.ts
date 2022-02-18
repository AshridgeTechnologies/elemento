export default class UnsupportedOperationError extends Error {
    constructor(message?: string) {
        super('Unsupported value: ' + message);
    }
}