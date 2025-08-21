import {JSONSchema} from "@apidevtools/json-schema-ref-parser"
import BaseElement, {propDef} from './BaseElement'
import {ComponentType, ElementId, ElementType, eventAction, PropertyDef, PropertyType} from "./Types";
import BaseInputElement from './BaseInputElement'
import {mapValues} from 'radash'
import Element from './Element'
import {JSONSchema7Definition} from 'json-schema'
import {elementHasParentTypeOf} from './createElement'

export type ElementSchema = JSONSchema & Readonly<{
    icon: string,
    kind: string,
    elementType: ComponentType,
    valueType?: PropertyType,
    isLayoutOnly?: boolean,
    initialProperties?: {[k:string]: any},
    canContainElementsWithThisParentType: boolean
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

const createElementClass = (schema: ElementSchema): ElementConstructor => {
    const {icon, kind, elementType, valueType,
        isLayoutOnly, initialProperties, canContainElementsWithThisParentType} = schema

    const props = schema.properties!.properties as JSONSchema
    const ownProps = props.properties as Record<string, PropertySchema>
    const propDefs = Object.entries(ownProps).map(([name, prop]) => {
        const {$ref, type} = prop
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
    const baseClass = hasBaseInputProps ? BaseInputElement<any> : BaseElement<any>
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

    const propertyProps = mapValues(ownProps, (_, name) => (
        {
            get: function () {
                return (this as any).properties[name]
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

    if (canContainElementsWithThisParentType) {
        Object.defineProperty(elementClass.prototype, 'canContain',
            {get: function () {return (elementType: ElementType) => elementHasParentTypeOf(elementType, this)}, enumerable: true})
    }

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


export const Definitions: {[k: string]: JSONSchema7Definition } = {
    "BaseElement": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
            "id": {
                "description": "The unique identifier of this element",
                "type": "string"
            },
            "name": {
                "description": "The name of this element",
                "type": "string"
            },
            "kind": {
                "description": "The type of this element eg TextInput",
                "type": "string"
            },
            "notes": {
                "description": "Additional information about this element for use by the developer",
                "type": "string"
            }
        },
        "required": ["id", "name", "kind"]
    },
    "BaseInputProperties": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
            "label": {
                "description": "The label shown for the input box. The name is used if not specified.",
                "$ref": "#/definitions/StringOrExpression"
            },
            "dataType": {
                "description": "A Data Type for this input box",
                "$ref": "#/definitions/Expression"
            },
            "readOnly": {
                "description": "If true, the initial value shown cannot be changed by the user",
                "$ref": "#/definitions/BooleanOrExpression"
            },
            "show": {
                "description": "Whether this element is displayed",
                "$ref": "#/definitions/BooleanOrExpression"
            },
            "styles": {
                "description": "The specific CSS styles applied to this element",
                "$ref": "#/definitions/Styles"
            },
            "initialValue": {
                "description": "The initial value shown in the input box.",
                "$ref": "#/definitions/StringOrNumberOrExpression"
            }

        },
        "required": []
    },
    // "TextInput": ,
    "Expression": {
        "description": "A formula used to calculate a value",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "expr": {
                "description": "The formula",
                "type": "string"
            }
        }
    },
    "ActionExpression": {
        "description": "A formula used to perform an action",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "expr": {
                "description": "The formula",
                "type": "string"
            }
        }
    },
    "StringOrExpression": {
        "anyOf": [
            {
                "type": "string"
            },
            {
                "$ref": "#/definitions/Expression"
            }
        ]
    },
    "StringMultilineOrExpression": {
        "$ref": "#/definitions/StringOrExpression"
    },
    "StringOrNumberOrExpression": {
        "anyOf": [
            {
                "type": "string"
            },
            {
                "type": "number"
            },
            {
                "$ref": "#/definitions/Expression"
            }
        ]
    },
    "BooleanOrExpression": {
        "anyOf": [
            {
                "type": "boolean"
            },
            {
                "$ref": "#/definitions/Expression"
            }
        ]
    },
    "Styles": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "backgroundColor": {
                "$ref": "#/definitions/StringOrExpression"

            },
            "width": {
                "$ref": "#/definitions/StringOrNumberOrExpression"
            },
        }
    }
}
