import Element from './Element'
import {ComponentType, ElementId, ElementType, InsertPosition} from './Types'
import UnsupportedOperationError from '../util/UnsupportedOperationError'

export function equalArrays(a: ReadonlyArray<any>, b: ReadonlyArray<any>) {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (const x in a) {
        if (a[x] !== b[x]) return false
    }
    return true
}

export default abstract class BaseElement<PropertiesType extends object> {
    abstract kind: ElementType
    abstract componentType: ComponentType

    constructor(
        public readonly id: ElementId,
        public readonly name: string,
        public readonly properties: PropertiesType,
        public readonly elements: ReadonlyArray<Element> | undefined = undefined,
    ) {
    }

    elementArray(): ReadonlyArray<Element> {
        return this.elements || []
    }

    findElement(id: ElementId): Element | null {
        if (id === this.id) {
            return this as unknown as Element
        }
        for (const el of this.elementArray()) {
            const element = el.findElement(id)
            if (element) return element
        }

        return null
    }

    findParent(id: ElementId): Element | null {
        for (const el of this.elementArray()) {
            if (el.id === id) return this
        }
        for (const el of this.elementArray()) {
            const element = el.findParent(id)
            if (element) return element
        }

        return null
    }


    findElementPath(id: ElementId): string | null {
        if (id === this.id) {
            return this.pathSegment
        }

        for (const el of this.elementArray()) {
            const path = el.findElementPath(id)
            if (path) {
                return this.pathSegment !== '' ? this.pathSegment + '.' + path : path
            }
        }

        return null
    }

    findElementByPath(path: string): Element | null {
        const [firstElementName, ...remainingPathSegments] = path.split('.')
        if (this.pathSegment === '') {
            for (const el of this.elementArray()) {
                const element = el.findElementByPath(path)
                if (element) return element
            }
        }
        if (firstElementName === this.pathSegment && remainingPathSegments.length === 0) {
            return this as unknown as Element
        }
        for (const el of this.elementArray()) {
            const element = el.findElementByPath(remainingPathSegments.join('.'))
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

            const updatedProps = {...this.properties, [propertyName]: value}
            return this.create(this.id, this.name, updatedProps, this.elements)
        }

        const newElements = this.elementArray().map(el => el.set(id, propertyName, value))
        if (!equalArrays(newElements, this.elementArray())) {
            return this.create(this.id, this.name, this.properties, newElements)
        }

        return this
    }

    delete(itemId: ElementId): this {
        const itemIsInOurElements = !!this.elementArray().find(el => el.id === itemId)
        const newElements = itemIsInOurElements
            ? this.elementArray().filter(el => el.id !== itemId)
            : this.elementArray().map(el => el.delete(itemId))

        if (!equalArrays(newElements, this.elementArray())) {
            return this.create(this.id, this.name, this.properties, newElements)
        }

        return this
    }

    findMaxId(elementType: ElementType): number {
        const ownMax = () => {
            if ((this as unknown as Element).kind === elementType && this.id.match(`${elementType.toLowerCase()}_\\d+`)) {
                return parseInt(this.id.split('_')[1])
            }

            return 0
        }
        return Math.max(ownMax(), ...this.elementArray().map(el => el.findMaxId(elementType)))
    }

    get codeName() {
        const noSpaceName = this.name.replace(/ /g, '')
        return noSpaceName === this.constructor.name ? `${noSpaceName}_${this.id}` : noSpaceName
    }

    get pathSegment() {
        return this.codeName
    }

    protected create(id: ElementId,
                     name: string,
                     properties: PropertiesType,
                     elements: ReadonlyArray<Element> | undefined) {
        const ctor = this.constructor as any
        return new ctor(id, name, properties, elements)
    }

    doInsert(insertPosition: InsertPosition, selectedItemId: ElementId, elementType: ElementType, optNewIdSeq?: number): [this, (Element | null)] {
        const newIdSeq = optNewIdSeq ?? this.findMaxId(elementType) + 1

        const insertIndexInThisElement = () => {
            if (this.canContain(elementType)) {
                if ((insertPosition === 'before' || insertPosition === 'after')) {
                    const selectedItemIndex = this.elementArray().findIndex(it => it.id === selectedItemId)
                    if (selectedItemIndex >= 0) {
                        const insertOffset = insertPosition === 'before' ? 0 : 1
                        return selectedItemIndex + insertOffset
                    }
                }

                if (insertPosition === 'inside') {
                    if (selectedItemId === this.id) {
                        return this.elementArray().length
                    }
                }
            }

            return null
        }

        const insertIndex = insertIndexInThisElement()
        if (insertIndex !== null) {
            const newElements = [...this.elementArray()]
            const newElement = this.createElement(elementType, newIdSeq)
            newElements.splice(insertIndex, 0, newElement)
            return [this.create(this.id, this.name, this.properties, newElements), newElement]
        }

        const insertResults = this.elementArray().map(p => p.doInsert(insertPosition, selectedItemId, elementType, newIdSeq))
        const newChildElements = insertResults.map(r => r[0])
        const newElement = insertResults.map(r => r[1]).find(el => el) as Element

        if (!equalArrays(newChildElements, this.elementArray())) {
            return [this.create(this.id, this.name, this.properties, newChildElements), newElement]
        }

        return [this, null]
    }

    createElement(elementType: ElementType, newIdSeq: number): Element {
        throw new UnsupportedOperationError()
    }

    canContain(elementType: ElementType) {
        return false
    }
}