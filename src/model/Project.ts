import {ComponentType, ElementId, ElementType, InsertPosition, PropertyDef, PropertyValue} from './Types'
import BaseElement, {newIdTransformer, propDef} from './BaseElement'
import Element from './Element'
import File from './File'
import {createElement} from './createElement'
import {toArray} from '../util/helpers'
import {parentTypeOf} from './elements'
import FileFolder from './FileFolder'
import {AppElementAction, ConfirmAction} from '../editor/Types'
import Page from './Page'
import DataTypes from './types/DataTypes'
import App from './App'
import Text from './Text'
import ToolFolder from './ToolFolder'
import {fork} from 'radash'
import {intersection} from 'ramda'

type Properties = { author?: PropertyValue }

export const FILES_ID = '_FILES'
export const TOOLS_ID = '_TOOLS'

class DataTypesContainer extends BaseElement<{}> {
    get propertyDefs() { return [] }
    type() { return 'DataTypesContainer' as ComponentType }
}

export default class Project extends BaseElement<Properties> implements Element {

    private constructor(id: ElementId,
                name: string,
                properties: Properties,
                elements: ReadonlyArray<Element>  = [],
    ) {
        const [toolFolders, otherElements] = fork(elements, el => el.kind === 'ToolFolder')
        if (!toolFolders.length) toolFolders.push(Project.newToolFolder())
        super(id, name, properties, [...otherElements, ...toolFolders])
    }
    static kind = 'Project'
    static new(elements: ReadonlyArray<Element> = [], id: ElementId = 'project_1',
               name = 'New Project',
               properties: Properties = {}) {
        return new Project(id, name, properties, [...elements])
    }

    private static newToolFolder() {
        return new ToolFolder(TOOLS_ID, 'Tools', {})
    }

    static get iconClass() { return 'web' }
    static get parentType() { return null }
    type(): ComponentType { return 'app' }

    get dataTypes() {return this.findChildElements(DataTypes)}
    get dataTypesContainer() {
        return new DataTypesContainer('_dt1', 'DataTypes Container', {}, this.dataTypes)
    }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('author'),
        ]
    }

    get pathSegment() {
        return ''
    }

    actionsAvailable(targetItemIds: ElementId[]): AppElementAction[] {

        const actionsForElement = (element: Element) => {
            const isSingle = targetItemIds.length === 1
            const pasteActions = isSingle ? ['pasteAfter', 'pasteBefore', 'pasteInside'] : []
            const standardActionsAvailable = [
                'insert',
                new ConfirmAction('delete'),
                'copy', 'cut', ...pasteActions, 'duplicate'] as AppElementAction[]
            const specialActionsAvailable = {
                ToolFolder: ['insert', 'pasteInside'],
                FileFolder: ['upload'],
                File: [new ConfirmAction('delete')],
                Tool: ['show', ...standardActionsAvailable],
            }
            return (specialActionsAvailable[element.kind as keyof object] ?? standardActionsAvailable)
        }

        const elements = targetItemIds.map( id => this.findElement(id)) as Element[]
        const elementActionSets = elements.map( actionsForElement ) as AppElementAction[][]
        const commonActions = elementActionSets.length ? elementActionSets.reduce( (acc, value) => intersection(acc, value)) : []
        const nonItemSpecificActions = ['undo', 'redo'] as AppElementAction[]
        return commonActions.concat(nonItemSpecificActions)
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
        const parentType = parentTypeOf(elementType)
        const canAdd = !['FileFolder', 'ToolFolder'].includes(elementType)
        return canAdd && (parentType === this.kind || ['DataTypes'].includes(elementType))
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

export function editorEmptyProject() {
    return Project.new([new App('app_1', 'New App', {}, [
        new Page('page_1', 'Main Page', {}, [
            new Text('text_1', 'Title', {content: 'The New App', fontSize: 24})
        ])
    ])])
}