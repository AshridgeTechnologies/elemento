export type ElementType = 'App' | 'Page' | 'Text' | 'TextInput' | '__base'

export default interface Element {
    kind: ElementType
    id: string
    name: string
    findElement(id: string) : Element | null
    set(id: string, propertyName: string, value: any): Element
}
