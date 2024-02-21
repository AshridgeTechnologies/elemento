export default class UndoRedoStack<T> {
    private states: T[]
    private currentIndex

    constructor(private readonly onChange: (val: T) => void, initialState?: T, private readonly numberOfStates = 100) {
        this.states = initialState ? [initialState] : []
        this.currentIndex = 0
    }

    current() {
        return this.states[this.currentIndex]
    }

    set(newState: T) {
        this.states = [newState]
        this.currentIndex = 0
        this.onChange(this.current())
    }

    update(newState: T) {
        const startIndex = this.currentIndex === this.numberOfStates - 1 ? 1 : 0
        const endIndex = this.currentIndex + 1
        this.states = this.states.slice(startIndex, endIndex).concat(newState)
        this.currentIndex = this.states.length - 1
        this.onChange(this.current())
    }

    clear() {
        this.states = []
        this.currentIndex = 0
        this.onChange(this.current())
    }

    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--
            this.onChange(this.current())
        }
    }

    redo() {
        if (this.currentIndex < this.states.length - 1) {
            this.currentIndex++
            this.onChange(this.current())
        }
    }
}
