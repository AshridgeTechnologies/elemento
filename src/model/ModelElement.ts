import {JSONSchema} from "@apidevtools/json-schema-ref-parser"
import BaseElement, {propDef} from './BaseElement'
import {CanContain, ComponentType, ElementId, ElementType, eventAction, EventActionPropertyDef, PropertyDef, PropertyType} from "./Types";
import BaseInputElement from './BaseInputElement'
import {capitalize, isArray, mapValues} from 'radash'
import Element from './Element'
import {elementHasParentTypeOf} from './createElement'
import Ajv2020 from 'ajv/dist/2020'
import {Definitions} from './schema'

export type ElementSchema = JSONSchema & Readonly<{
    icon: string,
    kind: string,
    elementType: ComponentType,
    valueType?: PropertyType,
    isLayoutOnly?: boolean,
    initialProperties?: {[k:string]: any},
    canContain?: CanContain,
    parentType?: ElementType | ElementType[],
    unevaluatedProperties?: boolean
}>

export type PropertySchema = JSONSchema & Readonly<{
    argNames?: string[]
}>

export type ElementMetadata = {
    stateProps?: string[]
}

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
const generatedSchemas = new Map<ElementConstructor, ElementSchema>()
const ajv = new Ajv2020({strictSchema: false, allErrors: true})

const createElementClass = (schema: ElementSchema, metadata: ElementMetadata | undefined): ElementConstructor => {
    const {icon, kind, elementType, valueType,
        isLayoutOnly, initialProperties, canContain, parentType} = schema

    const props = schema.properties!.properties as JSONSchema
    const ownProps = props.properties as Record<string, PropertySchema>
    const propDefs = Object.entries(ownProps).map(([name, prop]) => {
        const {$ref, type, enum: enumType} = prop

        const def = (() => {
            if (enumType) {
                return propDef(name, enumType as string[])
            }
            const typeOrRef = $ref ?? type
            switch ($ref) {
                case '#/definitions/StringOrExpression':
                    return propDef(name, 'string')
                case '#/definitions/NumberOrExpression':
                    return propDef(name, 'number')
                case '#/definitions/StringOrNumberOrExpression':
                    return propDef(name, 'string|number')
                case '#/definitions/StringMultilineOrExpression':
                    return propDef(name, 'string multiline')
                case '#/definitions/StringMultiline':
                    return propDef(name, 'string multiline', {fixedOnly: true})
                case '#/definitions/StringList':
                    return propDef(name, 'string list', {fixedOnly: true})
                case '#/definitions/StringListOrExpression':
                    return propDef(name, 'string list')
                case '#/definitions/StringListOrStringOrExpression':
                    return propDef(name, 'string list')
                case '#/definitions/BooleanOrExpression':
                    return propDef(name, 'boolean')
                case '#/definitions/DateOrExpression':
                    return propDef(name, 'date')
                case '#/definitions/Date':
                    return propDef(name, 'date', {fixedOnly: true})
                case '#/definitions/Expression':
                    return propDef(name, 'expr')
                case '#/definitions/MultilineExpression':
                    return propDef(name, 'expr', {multilineExpr: true})
                case '#/definitions/Styles':
                    return propDef(name, 'styles')
                case '#/definitions/ActionExpression':
                    const {argNames = []} = prop
                    return propDef(name, eventAction(...argNames))
            }
            switch (type) {
                case 'boolean':
                case 'string':
                case 'number':
                    return propDef(name, type, {fixedOnly: true})
            }

            throw new Error('Unknown property type: ' + typeOrRef)

        })()
        if (metadata?.stateProps?.includes(name)) {
            def.state = true
        }
        return def

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

    const defaultValue = (val: any, el: BaseElement<any>) => {
        if (typeof val === 'string' && val.startsWith('=')) {
            const propName = val.substring(1)
            return el[propName as keyof BaseElement<any>]
        }
        return val
    }
    const propertyProps = mapValues(ownProps, (prop, name) => (
        {
            get: function () {
                const this_ = this as any
                return this_.properties[name] ?? defaultValue(prop.default, this_)
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
    } else if (isArray(canContain)) {
        Object.defineProperty(elementClass.prototype, 'canContain',
            {get: function () {return (elementType: ElementType) => canContain.includes(elementType)}, enumerable: true})
    }

    if (parentType) {
        Object.defineProperty(elementClass, 'parentType',
            {get: function () {return parentType}, enumerable: true})
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

const addElementClass = (schema: ElementSchema, metadata: ElementMetadata | undefined) => {
    const newClass= createElementClass(schema, metadata)
    classes.set(schema, newClass)
    return newClass
}

const addSchema = (elementClass: ElementConstructor) => {
    const newSchema = generateSchema(elementClass)
    generatedSchemas.set(elementClass, newSchema)
    return newSchema
}

export const modelElementClass = (schemaOrClass: ElementSchema | Function, metadata?: ElementMetadata): ElementConstructor => {
    let theSchema: ElementSchema, theMetadata: ElementMetadata | undefined
    if (typeof schemaOrClass === 'function') {
        theSchema = (schemaOrClass as any).Schema
        theMetadata = (schemaOrClass as any).Metadata
    } else {
        theSchema = schemaOrClass
        theMetadata = metadata
    }
    return classes.get(theSchema) ?? addElementClass(theSchema, theMetadata)
}


export function generateSchema(elementClass: { new(id: string, name: string, props: object): BaseElement<any> }): ElementSchema {
    const model = new elementClass('id1', 'Name 1', {})

    const properties = Object.fromEntries(model.propertyDefs.map(def => {
            const {type} = def
            const typeProps = () => {
                if (isArray(def.type)) {
                    return {enum: def.type}
                }
                if (def.fixedOnly) {
                    switch (type) {
                        case 'boolean':
                        case 'string':
                        case 'number':
                            return {type}
                        case 'string|number':
                            return {$ref: '#/definitions/StringOrNumber'}
                        case 'string multiline':
                            return {$ref: '#/definitions/StringMultiline'}
                        case 'string list':
                            return {$ref: '#/definitions/StringList'}
                        case 'date':
                            return {$ref: '#/definitions/Date'}
                    }
                } else {
                    const actionDef = type as EventActionPropertyDef
                    if (actionDef.type === 'Action') {
                        return {$ref: '#/definitions/ActionExpression', argNames: actionDef.argumentNames ?? []}
                    }

                    switch (type) {
                        case 'boolean':
                            return {$ref: '#/definitions/BooleanOrExpression'}
                        case 'string':
                            return {$ref: '#/definitions/StringOrExpression'}
                        case 'number':
                            return {$ref: '#/definitions/NumberOrExpression'}
                        case 'string|number':
                            return {$ref: '#/definitions/StringOrNumberOrExpression'}
                        case 'string multiline':
                            return {$ref: '#/definitions/StringMultilineOrExpression'}
                        case 'string list':
                            return {$ref: '#/definitions/StringListOrExpression'}
                        case 'date':
                            return {$ref: '#/definitions/DateOrExpression'}
                        case 'styles':
                            return {$ref: '#/definitions/Styles'}
                        case 'expr':
                            return {$ref: '#/definitions/Expression'}


                    }
                }

                throw new Error(`Unknown type ${type}`)
            }

            return [def.name, {description: "The ", ...typeProps()}]
        }
    ))

    const canContain = Object.hasOwn(model.constructor.prototype, 'canContain') ? 'elementsWithThisParentType' : undefined
    const parentType: string = Object.hasOwn(model.constructor, 'parentType') ? (model.constructor as any).parentType : undefined
    const elementsDef = {
        "type": "array",
        "items": {
            "$ref": "#/definitions/BaseElement"
        }
    }

    const schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": capitalize(model.kind),
        "description": "Description of " + model.kind,
        "type": "object",
        "$ref": "#/definitions/BaseElement",
        "kind": model.kind,
        "icon": model.iconClass,
        "elementType": model.type(),
        "isLayoutOnly": model.isLayoutOnly() ? true : undefined,
        canContain,
        ...(parentType ? {parentType: parentType} : {}),
        "properties": {
            "properties": {
                "type": "object",
                // @ts-ignore
                "unevaluatedProperties": false,
                properties
            },

            ...(canContain ? {"elements": elementsDef} : {})
        },
        "required": ["kind", "properties"],
        "unevaluatedProperties": false,

        "definitions": Definitions
    }

    return schema as ElementSchema
}

export function cachedGeneratedSchema(elementClass: ElementConstructor) {
    return generatedSchemas.get(elementClass) ?? addSchema(elementClass)
}

export function modelElementClassFromGeneratedSchema(elementClass: ElementConstructor) {
    return modelElementClass(cachedGeneratedSchema(elementClass))
}
