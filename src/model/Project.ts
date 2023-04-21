import {ComponentType, ElementId, ElementType, InsertPosition, PropertyDef, PropertyValue} from './Types'
import BaseElement, {newIdTransformer, propDef} from './BaseElement'
import Element from './Element'
import File from './File'
import {createElement} from './createElement'
import {toArray} from '../util/helpers'
import {elementOfType} from './elements'
import FileFolder from './FileFolder'
import {AppElementAction, ConfirmAction, InsertAction} from '../editor/Types'

type Properties = { author?: PropertyValue }

export const FILES_ID = '_FILES'

export default class Project extends BaseElement<Properties> implements Element {

    static kind = 'Project'
    static get iconClass() { return 'web' }
    static get parentType() { return null }
    type(): ComponentType { return 'app' }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('author'),
        ]
    }

    get pathSegment() {
        return ''
    }

    actionsAvailable(targetItemId: ElementId) {
        const element = this.findElement(targetItemId)!
        const standardActionsAvailable = [
            new InsertAction('before'),
            new InsertAction('after'),
            new InsertAction('inside'),
            new ConfirmAction('delete'),
            'copy', 'cut', 'pasteAfter', 'pasteBefore', 'pasteInside', 'duplicate'] as AppElementAction[]
        const fileFolderActions = ['upload'] as AppElementAction[]
        const fileActions = ['delete'] as AppElementAction[]
        switch(element.kind) {
            case 'FileFolder': return fileFolderActions
            case 'File': return fileActions
            default: return standardActionsAvailable
        }
    }

    canInsert(insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType): boolean {
        if (insertPosition === 'inside') {
            return Boolean(this.findElement(targetItemId)?.canContain(elementType))
        }
        return Boolean(this.findParent(targetItemId)?.canContain(elementType))
    }

    insertNew(insertPosition: InsertPosition, targetItemId: ElementId, elementType: ElementType, properties: object): [Project, Element] {
        const newElement = this.newElement(elementType, properties)
        return [this.doInsert(insertPosition, targetItemId, [newElement]), newElement]
    }

    insert(insertPosition: InsertPosition, targetItemId: ElementId, element: Element | Element[]): [Project, Element[]] {
        const transformer = newIdTransformer(this)
        const insertedElements = toArray(element).map(el => el.transform(transformer))

        return [this.doInsert(insertPosition, targetItemId, insertedElements), insertedElements]
    }

    move(insertPosition: InsertPosition, targetElementId: ElementId, movedElementIds: ElementId[]) {
        const movedElements = movedElementIds.map(id => this.findElement(id)).filter( el => !!el) as Element[]
        const thisWithoutElements = movedElementIds.reduce((prev: Project, id)=> prev.delete(id), this)
        const newProject = thisWithoutElements.doMove(insertPosition, targetElementId, movedElements)
        const moveSucceeded = newProject !== thisWithoutElements
        return moveSucceeded ? newProject : this
    }

    canContain(elementType: ElementType) {
        const parentType = elementOfType(elementType).parentType
        return parentType === this.kind || ['DataTypes'].includes(elementType)
    }

    withFiles(fileNames: string[] = []) {
        let fileIdSeq = this.findMaxId('File') + 1
        const newId = () => `file_${fileIdSeq++}`

        const files = fileNames.map( name => new File(newId(), name, {}))
        const fileFolder = new FileFolder(FILES_ID, 'Files', {}, files)
        const elementsWithFiles = [...this.elementArray(), fileFolder]
        return new Project(this.id, this.name, this.properties, elementsWithFiles)
    }

    withoutFiles() {
        const elementsExcludingFiles = this.elementArray().filter( el => el.id !== FILES_ID)
        return new Project(this.id, this.name, this.properties, elementsExcludingFiles)
    }

    private newElement(elementType: ElementType, properties: object) {
        const newIdSeq = this.findMaxId(elementType) + 1
        return createElement(elementType, newIdSeq, properties)
    }
}