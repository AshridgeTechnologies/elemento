import Element from './Element'
import {ElementType} from './Types'

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
        public readonly id: string,
        public readonly name: string,
        public readonly properties: PropertiesType,
        public readonly elements: ReadonlyArray<Element> | undefined = undefined,
    ) {
    }

    elementArray() : ReadonlyArray<Element> { return this.elements || [] }

    findElement(id: string): Element | null {
        if (id === this.id) {
            return this as unknown as Element
        }
        for (const p of this.elementArray()) {
            const element = p.findElement(id)
            if (element) return element
        }

        return null
    }

    set(id: string, propertyName: string, value: any): this {
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

    protected create(id: string,
                     name: string,
                     properties: PropertiesType,
                     elements: ReadonlyArray<Element> | undefined) {
        const ctor = this.constructor as any
        return new ctor(id, name, properties, elements )
    }
}