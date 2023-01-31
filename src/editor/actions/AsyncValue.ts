export default class AsyncValue<T> {
    private _value: T | null = null
    private notifyFn?: (value: T) => void
    private promise?: Promise<void>

    get value() { return this._value }

    init(getValueFn: () => Promise<T>, notifyFn: (value: T) => void) {
        if (!this.promise) {
            this.promise = getValueFn().then(value => {
                this._value = value
                this.notifyFn?.(value)
            })
        }
        this.notifyFn = notifyFn
    }
}