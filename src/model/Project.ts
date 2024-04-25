import {ComponentType, ElementId, ElementType, InsertPosition, PropertyDef, PropertyValue} from './Types'
import BaseElement, {newIdTransformer, propDef, visualPropertyDefs} from './BaseElement'
import Element from './Element'
import File from './File'
import {createNewElement} from './createElement'
import {toArray} from '../util/helpers'
import {elementTypeNames, parentTypeOf} from './elements'
import FileFolder from './FileFolder'
import {AppElementAction, ConfirmAction} from '../editor/Types'
import Page from './Page'
import DataTypes from './types/DataTypes'
import App from './App'
import Text from './Text'
import ToolFolder from './ToolFolder'
import {intersection} from 'ramda'
import ServerApp from './ServerApp'
import ComponentDef from './ComponentDef'
import ComponentFolder from './ComponentFolder'
import ComponentInstance from './ComponentInstance'

type Properties = { author?: PropertyValue }

export const FILES_ID = '_FILES'
export const TOOLS_ID = '_TOOLS'
export const COMPONENTS_ID = '_COMPONENTS'

class DataTypesContainer extends BaseElement<{}> {
    readonly kind = 'DataTypesContainer' as ElementType
    readonly iconClass = 'an_icon'
    get propertyDefs() { return [] }
    type() { return 'DataTypesContainer' as ComponentType }
}

export default class Project extends BaseElement<Properties> implements Element {

    private constructor(id: ElementId,
                name: string,
                properties: Properties,
                elements: ReadonlyArray<Element>  = [],
    ) {
        const allElements = [...elements]
        const hasTools = elements.some( el => el.kind === 'ToolFolder')
        if (!hasTools) allElements.push(Project.newToolFolder())
        const hasComponents = elements.some( el => el.kind === 'ComponentFolder')
        if (!hasComponents) allElements.push(Project.newComponentFolder())
        super(id, name, properties, allElements)
    }
    readonly kind = 'Project'
    static new(elements: ReadonlyArray<Element> = [],
               name = 'New Project',
               id: ElementId = 'project_1',
               properties: Properties = {}) {
        return new Project(id, name, properties, [...elements])
    }

    private static newToolFolder() {
        return new ToolFolder(TOOLS_ID, 'Tools', {})
    }

    private static newComponentFolder() {
        return new ComponentFolder(COMPONENTS_ID, 'Components', {})
    }

    get iconClass() { return 'web' }
    static get parentType() { return null }
    type(): ComponentType { return 'app' }

    get dataTypes() {return this.findChildElements(DataTypes)}
    get componentsFolder() { return this.findElement(COMPONENTS_ID) as ComponentFolder }
    get userDefinedComponents() { return (this.componentsFolder?.findElementsBy( el => el.kind === 'Component') ?? []) as ComponentDef[] }
    get userDefinedComponentCodeNames() { return this.userDefinedComponents.map( el => el.codeName ) as ElementType[] }
    get dataTypesContainer() {
        return new DataTypesContainer('_dt1', 'DataTypes Container', {}, this.dataTypes)
    }
    get hasServerApps() {return this.findChildElements(ServerApp).length > 0 }

    get propertyDefs(): PropertyDef[] {
        return [
            propDef('author'),
        ]
    }

    get pathSegment() {
        return ''
    }

    propertyDefsOf(element: Element): PropertyDef[] {
        if (element instanceof ComponentInstance) {
            const componentDef = this.userDefinedComponents.find( comp => comp.codeName === element.kind)
            if (!componentDef) throw new Error('Component Def ' + element.kind + ' not found')
            const propDefs = componentDef.inputs.map( name => propDef(name, 'string|number'))
            return [...propDefs, ...visualPropertyDefs()]
        }

        return element.propertyDefs
    }

    actionsAvailable(targetItemIds: ElementId[]): AppElementAction[] {

        const actionsForElement = (element: Element) => {
            const isSingle = targetItemIds.length === 1
            const pasteActions = isSingle ? ['pasteAfter', 'pasteBefore', 'pasteInside'] : []
            const standardActionsAvailable = [
                'insert',
                new ConfirmAction('delete'),
                'copy', 'cut', ...pasteActions, 'duplicate'] as AppElementAction[]

            const componentActions = () => {
                const componentIsInUse = this.findElementsBy( el => el instanceof ComponentInstance && el.kind === element.codeName).length > 0
                return componentIsInUse ? standardActionsAvailable.filter(action => !(action instanceof ConfirmAction)) : standardActionsAvailable
            }
            const specialActionsAvailable = {
                ToolFolder: ['insert', 'pasteInside'],
                ComponentFolder: ['insert', 'pasteInside'],
                Component: componentActions(),
                FileFolder: ['upload'],
                File: [new ConfirmAction('delete')],
                Tool: ['show', ...standardActionsAvailable],
                ToolImport: ['show', ...standardActionsAvailable],
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

    insertMenuItems(insertPosition: InsertPosition, targetItemId: ElementId): ElementType[] {
        const allElementTypes = [...elementTypeNames(), ...this.userDefinedComponentCodeNames]
        return allElementTypes.filter(type => this.canInsert(insertPosition, targetItemId, type))
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
        return createNewElement(elementType, newIdSeq, properties)
    }

    findAncestorOfType(id: ElementId, kind: ElementType) {
        return this.findElementsBy(el => el.kind === kind && el.findElement(id) !== null)[0]
    }

    findClosestElementByCodeName(id: ElementId, name: string) {
        const containingPage = this.findAncestorOfType(id, 'Page')
        const elementInPage = containingPage?.findElementsBy(el => el.codeName === name)?.[0]
        if (elementInPage) {
            return elementInPage
        }
        const containingApp = this.findAncestorOfType(id, 'App') as App
        return containingApp.findElementsBy(el => el.codeName === name && !this.findAncestorOfType(el.id, 'Page'))[0]
    }
}

export function editorEmptyProject(name = 'New Project') {
    return Project.new([new App('app_1', 'Main App', {}, [
        new Page('page_1', 'Main Page', {}, [
            new Text('text_1', 'Title', {content: `${name} App`, styles: {fontSize: 24}})
        ])
    ])], name)
}
