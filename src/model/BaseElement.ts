import Element from './Element'
import {CombinedPropertyValue, ComponentType, ElementId, ElementType, InsertPosition, ParentType, PropertyDef, PropertyType} from './Types'
import {elementId, noSpaces} from '../util/helpers'
import {uniq} from 'ramda'

type Class<T> = new (...args: any[]) => T

export type BaseElementProperties = {notes?: string}

export function equalArrays(a: ReadonlyArray<any>, b: ReadonlyArray<any>) {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (const x in a) {
        if (a[x] !== b[x]) return false
    }
    return true
}

type PropOptions = { multilineExpr?: boolean, state?: boolean, fixedOnly?: boolean, readOnly?: boolean }

export function propDef(name: string, type: PropertyType = 'string', options: PropOptions = {}): PropertyDef {
    return {name, type, ...options}
}

export function visualPropertyDefs() {
    return [
        propDef('show', 'boolean'),
        propDef('styles', 'styles')
    ]
}

export default abstract class BaseElement<PropertiesType extends object> {
    readonly id: ElementId
    readonly name: string
    readonly notes: string | undefined
    abstract readonly kind: ElementType
    abstract readonly iconClass: string
    readonly properties: PropertiesType
    readonly elements: ReadonlyArray<Element> | undefined

    constructor(
        id: ElementId,
        name: string,
        properties: PropertiesType & BaseElementProperties,
        elements: ReadonlyArray<Element> | undefined = undefined,
    ) {
        const thisClass = this.constructor as typeof BaseElement
        this.id = id
        this.name = name
        const {notes, ...ownProperties} = properties
        this.notes = notes
        this.properties = {...thisClass.initialProperties, ...ownProperties} as PropertiesType
        this.elements = elements
    }

    abstract type(): ComponentType

    static get initialProperties() {
        return {}
    }

    static is<T extends Element>(element: Element): element is T {
        return element.constructor.name === this.name
    }

    isLayoutOnly() {
        return false
    }

    abstract get propertyDefs(): PropertyDef[]

    get stateProperties(): string[] {
        return []
    }

    elementArray(): ReadonlyArray<Element> {
        return this.elements || []
    }

    propertyValue(name: string): CombinedPropertyValue {
        return this[name as keyof this] as CombinedPropertyValue
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

    findChildElements<T extends Element>(elementType: Class<T> | ElementType): T[] {
        const filterFn = typeof elementType === 'function' ? (el: Element) => el instanceof elementType : (el: Element) => el.kind === elementType
        return this.elementArray().filter(filterFn) as T[]
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
                if (this.isLayoutOnly()) return path
                if (this.pathSegment === '') return path
                return this.pathSegment + '.' + path
            }
        }

        return null
    }

    findElementByPath(path: string): Element | null {
        const [firstElementName, ...remainingPathSegments] = path.split('.')
        if (firstElementName === this.pathSegment && remainingPathSegments.length === 0) {
            return this as unknown as Element
        }

        const findInElements = (path: string) => {
            for (const el of this.elementArray()) {
                const element = el.findElementByPath(path)
                if (element) return element
            }

            return null
        }

        if (this.pathSegment === '' || this.isLayoutOnly()) {
            return findInElements(path)
        }

        if (firstElementName === this.pathSegment) {
            return findInElements(remainingPathSegments.join('.'))
        }

        return null
    }

    findElementsBy(selectorFn: (el: Element) => boolean) : Element[] {
        const fromSelf = selectorFn(this) ? [this as Element] : [] as Element[]
        const fromChildren = this.elementArray().map( childEl => childEl.findElementsBy(selectorFn))
        return [fromSelf, ...fromChildren].flat()
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

    static get parentType(): ParentType | ParentType[] {
        return 'any'
    }

    get codeName() {
        const noSpaceName = noSpaces(this.name)
        return noSpaceName === this.constructor.name ? `${noSpaceName}_${this.id}` : noSpaceName
    }

    get pathSegment() {
        return this.codeName
    }

    create(id: ElementId,
           name: string,
           properties: PropertiesType,
           elements: ReadonlyArray<Element> | undefined) {
        const ctor = this.constructor as any
        return new ctor(id, name, properties, elements)
    }

    doInsert(insertPosition: InsertPosition, targetItemId: ElementId, elements: Element[]): this {
        const insertIndexInThisElement = () => {
            if ((insertPosition === 'before' || insertPosition === 'after')) {
                const selectedItemIndex = this.elementArray().findIndex(it => it.id === targetItemId)
                if (selectedItemIndex >= 0) {
                    const insertOffset = insertPosition === 'before' ? 0 : 1
                    return selectedItemIndex + insertOffset
                }
            }

            if (insertPosition === 'inside') {
                if (targetItemId === this.id) {
                    return this.elementArray().length
                }
            }

            return null
        }

        const checkLegal = () => {
            const illegalInserts = elements.filter(el => !this.canContain(el.kind))
            if (illegalInserts.length) {
                const illegalElementTypes = uniq(illegalInserts.map(el => el.kind)).join(', ')
                throw new Error(`Cannot insert elements of types ${illegalElementTypes} inside ${this.kind}`)
            }
        }

        const insertIndex = insertIndexInThisElement()
        if (insertIndex !== null) {
            checkLegal()
            const newElements = [...this.elementArray()]
            newElements.splice(insertIndex, 0, ...elements)
            return this.create(this.id, this.name, this.properties, newElements)
        }

        const newChildElements = this.elementArray().map(p => p.doInsert(insertPosition, targetItemId, elements))

        if (!equalArrays(newChildElements, this.elementArray())) {
            return this.create(this.id, this.name, this.properties, newChildElements)
        }

        return this
    }

    canContain(elementType: ElementType) {
        return false
    }

    transform(transformFn: (element: BaseElement<PropertiesType>, transformedChildElements: BaseElement<PropertiesType>[] | undefined) => Element): this {
        const newChildElements = this.elements && this.elementArray().map(el => (el as this).transform(transformFn))
        return transformFn(this as BaseElement<PropertiesType>, newChildElements) as this
    }

    doMove(insertPosition: InsertPosition, targetItemId: ElementId, movedElements: Element[]): this {
        // - If drop node can contain all the elements, and insertPosition is 'inside', insert at start
        // - If parent of drop node can contain all the elements, and insertPosition is 'after', insert after the element
        // - If neither can contain all the elements, do not allow the drop
        const insertIndexInThisElement = () => {
            const canContainAll = (container: Element, movedElements: Element[]) => movedElements.every(el => container.canContain(el.kind))

            if (insertPosition === 'inside' && this.id === targetItemId && canContainAll(this, movedElements)) {
                return 0
            }

            if (insertPosition === 'after') {
                const selectedItemIndex = this.elementArray().findIndex(it => it.id === targetItemId)
                if (selectedItemIndex >= 0 && canContainAll(this, movedElements)) {
                    return selectedItemIndex + 1
                }
            }

            return null
        }

        const insertIndex = insertIndexInThisElement()
        if (insertIndex !== null) {
            const newElements = [...this.elementArray()]
            newElements.splice(insertIndex, 0, ...movedElements)
            return this.create(this.id, this.name, this.properties, newElements)
        }

        const newChildElements = this.elementArray().map(p => p.doMove(insertPosition, targetItemId, movedElements))

        if (!equalArrays(newChildElements, this.elementArray())) {
            return this.create(this.id, this.name, this.properties, newChildElements)
        }

        return this
    }
}

export const newIdTransformer = (existingElement: Element) => {
    const maxIds = {}
    const nextId = (kind: ElementType) => {
        const newId = (maxIds[kind as keyof object] ?? existingElement.findMaxId(kind)) + 1
        // @ts-ignore
        maxIds[kind as keyof object] = newId
        return newId
    }
    return (element: BaseElement<any>, transformedChildElements: BaseElement<any>[] | undefined): Element => {
        const id = elementId(element.kind, nextId(element.kind))
        return element.create(id, element.name, element.properties, transformedChildElements)
    }
}

