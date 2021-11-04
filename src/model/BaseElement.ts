import Element, {ElementType} from './Element'

export function equalArrays(a: ReadonlyArray<any>, b:  ReadonlyArray<any>) {
    if (a === b) return true
    if (a.length !== b.length) return false
    for(const x in a) {
        if (a[x] !== b[x]) return false
    }
    return true
}

export default abstract class BaseElement implements Element{
    constructor(
        public readonly id: string,
        public readonly name: string,
    ) {
    }

    protected getElements() : ReadonlyArray<Element> { return [] }

    findElement(id: string): Element | null {
        if (id === this.id) {
            return this
        }
        for (const p of this.getElements()) {
            const element = p.findElement(id)
            if (element) return element
        }

        return null
    }

    abstract set(id: string, propertyName: string, value: any): Element
    kind: ElementType = '__base'
}