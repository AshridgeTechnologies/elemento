import {JSONSchema} from "@apidevtools/json-schema-ref-parser"
import {propDef} from './BaseElement'
import {ComponentType, ElementId, eventAction, PropertyDef, PropertyType} from "./Types";
import BaseInputElement from './BaseInputElement'
import {mapValues} from 'radash'
import Element from './Element'

export type ElementSchema = JSONSchema & Readonly<{
    icon: string,
    kind: string,
    elementType: ComponentType,
    valueType?: PropertyType
}>

export type PropertySchema = JSONSchema & Readonly<{
    argNames?: string[]
    state?: boolean
}>

type ElementConstructor = {
    new (id: ElementId,
         name: string,
         properties: any,
         elements?: ReadonlyArray<Element> | undefined): BaseInputElement<any>
}

const classes = new Map<ElementSchema, ElementConstructor>()

const createElementClass = (schema: ElementSchema): ElementConstructor => {
    const {icon, kind, elementType, valueType} = schema

    const ownProps = (schema.properties!.properties as JSONSchema).properties as Record<string, PropertySchema>
    const propDefs = Object.entries(ownProps).map(([name, prop]) => {
        const {$ref} = prop
        switch ($ref) {
            case '#/definitions/StringOrExpression':
                return propDef(name, 'string')
            case '#/definitions/BooleanOrExpression':
                return propDef(name, 'boolean')
            case '#/definitions/Expression':
                return propDef(name, 'expr')
            case '#/definitions/ActionExpression':
                const {argNames = []} = prop
                return propDef(name, eventAction(...argNames))
            default:
                throw new Error('Unknown property type: ' + $ref)
        }
    })
    // hack to get the function to have the name of the element type
    const elementClass = {
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
    }[kind]

    const propertyProps = mapValues(ownProps, (_, name) => (
        {
            get: function () {
                return (this as any).properties[name]
            },
            enumerable: true
        })
    )
    Object.defineProperties(elementClass.prototype, propertyProps)

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
