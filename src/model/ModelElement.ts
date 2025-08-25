import {JSONSchema} from "@apidevtools/json-schema-ref-parser"
import BaseElement, {propDef} from './BaseElement'
import {CanContain, ComponentType, ElementId, ElementType, eventAction, PropertyDef, PropertyType} from "./Types";
import BaseInputElement from './BaseInputElement'
import {mapValues} from 'radash'
import Element from './Element'
import {elementHasParentTypeOf} from './createElement'
import Ajv2020 from 'ajv/dist/2020'

export type ElementSchema = JSONSchema & Readonly<{
    icon: string,
    kind: string,
    elementType: ComponentType,
    valueType?: PropertyType,
    isLayoutOnly?: boolean,
    initialProperties?: {[k:string]: any},
    canContain?: CanContain
}>

export type PropertySchema = JSONSchema & Readonly<{
    argNames?: string[]
    state?: boolean
}>

type BaseElementConstructor = {
    new (id: ElementId,
         name: string,
         properties: any,
         elements?: ReadonlyArray<Element> | undefined): BaseElement<any>

    is<T extends Element>(element: Element): element is T
}

type BaseInputElementConstructor = {
    new (id: ElementId,
         name: string,
         properties: any,
         elements?: ReadonlyArray<Element> | undefined): BaseInputElement<any>

    is<T extends Element>(element: Element): element is T
}

type ElementConstructor = BaseElementConstructor | BaseInputElementConstructor

const classes = new Map<ElementSchema, ElementConstructor>()
const ajv = new Ajv2020({strictSchema: false, allErrors: true})

const createElementClass = (schema: ElementSchema): ElementConstructor => {
    const {icon, kind, elementType, valueType,
        isLayoutOnly, initialProperties, canContain} = schema

    const props = schema.properties!.properties as JSONSchema
    const ownProps = props.properties as Record<string, PropertySchema>
    const propDefs = Object.entries(ownProps).map(([name, prop]) => {
        const {$ref, type, enum: enumType} = prop

        if (enumType) {
            return propDef(name, enumType as string[])
        }
        switch ($ref ?? type) {
            case '#/definitions/StringOrExpression':
                return propDef(name, 'string')
            case '#/definitions/StringMultilineOrExpression':
                return propDef(name, 'string multiline')
            case '#/definitions/BooleanOrExpression':
                return propDef(name, 'boolean')
            case '#/definitions/Expression':
                return propDef(name, 'expr')
            case '#/definitions/Styles':
                return propDef(name, 'styles')
            case '#/definitions/ActionExpression':
                const {argNames = []} = prop
                return propDef(name, eventAction(...argNames))
            case 'boolean':
                return propDef(name, 'boolean', {fixedOnly: true})
            default:
                throw new Error('Unknown property type: ' + $ref)
        }
    })

    const hasBaseInputProps = props.$ref === '#/definitions/BaseInputProperties'
    // hack to get the function to have the name of the element type
    const elementClass = (hasBaseInputProps ? {
        [kind]: class extends BaseInputElement<any> {
            readonly kind: string = kind
            get iconClass() { return icon }
            get valueType(): PropertyType { return valueType! }

            type(): ComponentType {
                return elementType
            }

            ownPropertyDefs(): PropertyDef[] {
                return propDefs
            }

        }
    } : {
        [kind]: class extends BaseElement<any> {
            readonly kind: string = kind

            get iconClass() {
                return icon
            }

            type(): ComponentType {
                return elementType
            }

            get propertyDefs(): PropertyDef[] {
                return propDefs
            }
        }
    })[kind]

    const propertyProps = mapValues(ownProps, (prop, name) => (
        {
            get: function () {
                return (this as any).properties[name] ?? prop.default
            },
            enumerable: true
        })
    )
    Object.defineProperties(elementClass.prototype, propertyProps)

    if (isLayoutOnly) {
        Object.defineProperty(elementClass.prototype, 'isLayoutOnly',
            {get: function () {return () => true}, enumerable: true})
    }

    if (initialProperties) {
        Object.defineProperty(elementClass, 'initialProperties',
            {get: function () {return initialProperties}, enumerable: true})
    }

    if (canContain === 'elementsWithThisParentType') {
        Object.defineProperty(elementClass.prototype, 'canContain',
            {get: function () {return (elementType: ElementType) => elementHasParentTypeOf(elementType, this)}, enumerable: true})
    }

    Object.defineProperty(elementClass, 'schema',
        {get: function () {return schema}, enumerable: true})
    const validator = ajv.compile(schema)
    Object.defineProperty(elementClass, 'validate',
        {
            value: function (data: object) {
                const valid = validator(data)
                return valid ? null : validator.errors
            }, enumerable: true
        })

    return elementClass
}

const addElementClass = (schema: ElementSchema) => {
    const newClass= createElementClass(schema)
    classes.set(schema, newClass)
    return newClass
}

export const modelElementClass = (schema: ElementSchema): ElementConstructor => {
    return classes.get(schema) ?? addElementClass(schema)
}


