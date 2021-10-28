export type ElementType = "Page" | "Text"

export default interface Element {
    kind: ElementType
    id: string
    name: string

}
