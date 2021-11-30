import Element from './Element'
import {ElementId, ElementType} from './Types'
import {camelCase} from 'lodash'

export function equalArrays(a: ReadonlyArray<any>, b:  ReadonlyArray<any>) {
    if (a === b) return true
    if (a.length !== b.length) return false
    for(const x in a) {
        if (a[x] !== b[x]) return false
    }
    return true
}



export default abstract class BaseElement<PropertiesType extends object> {
    constructor(
        public readonly id: ElementId,
        public readonly name: string,
        public readonly properties: PropertiesType,
        public readonly elements: ReadonlyArray<Element> | undefined = undefined,
    ) {
    }

    abstract kind: ElementType

    elementArray() : ReadonlyArray<Element> { return this.elements || [] }

    findElement(id: ElementId): Element | null {
        if (id === this.id) {
            return this as unknown as Element
        }
        for (const p of this.elementArray()) {
            const element = p.findElement(id)
            if (element) return element
        }

        return null
    }

    set(id: ElementId, propertyName: string, value: any): this {
        if (id === this.id) {
            if (propertyName === 'name') {
                return this.create(this.id, value, this.properties, this.elements)
            }
            if (propertyName === 'elements') {
                return this.create(this.id, this.name, this.properties, value)
            }

            const updatedProps = {...this.properties, [propertyName]:value}
            return this.create(this.id, this.name, updatedProps, this.elements)
        }

        const newElements = this.elementArray().map(el => el.set(id, propertyName, value))
        if (!equalArrays(newElements, this.elementArray())) {
            return this.create(this.id, this.name, this.properties, newElements)
        }

        return this
    }

    findMaxId(elementType: ElementType) : number {
        const ownMax = () => {
            if ((this as unknown as Element).kind === elementType && this.id.match(`${elementType.toLowerCase()}_\\d+`)) {
                return parseInt(this.id.split('_')[1])
            }

            return 0
        }
        return Math.max(ownMax(), ...this.elementArray().map( el => el.findMaxId(elementType)))
    }

    get codeName() { return this.name.replace(/ /g, '')}

    protected create(id: ElementId,
                     name: string,
                     properties: PropertiesType,
                     elements: ReadonlyArray<Element> | undefined) {
        const ctor = this.constructor as any
        return new ctor(id, name, properties, elements )
    }
}