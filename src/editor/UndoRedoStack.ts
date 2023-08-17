export default class UndoRedoStack<T> {
    private states: T[]
    private currentIndex = 0

    constructor(initialState: T, readonly numberOfStates = 100) {
        this.states = [initialState]
    }

    current() {
        return this.states[this.currentIndex]
    }

    update(newState: T) {
        const startIndex = this.currentIndex === this.numberOfStates - 1 ? 1 : 0
        const endIndex = this.currentIndex + 1
        this.states = this.states.slice(startIndex, endIndex).concat(newState)
        this.currentIndex = this.states.length - 1
    }

    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--
        }
    }

    redo() {
        if (this.currentIndex < this.states.length - 1) {
            this.currentIndex++
        }
    }
}