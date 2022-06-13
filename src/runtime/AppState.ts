export default class AppState {
    constructor(initialData: object | Map<string, any>) {
        const initialEntries = initialData instanceof Map ? initialData.entries() : Object.entries(initialData)
        this.state = new Map(initialEntries)
    }

    private state: Map<string, any>

    select(path: string) {
        return this.state.get(path)
    }

    update(path: string, stateObject: any): AppState {
        const existingStateAtPath = this.select(path)

        if (stateObject === existingStateAtPath) {
            return this
        } else {
            const newState = new Map(this.state.entries())
            newState.set(path, stateObject)
            return new AppState(newState)
        }
    }
}