import Project from '../model/Project'
import {ExprType} from './Types'
import DataTypes from '../model/types/DataTypes'
import Rule from '../model/types/Rule'
import BaseTypeElement from '../model/types/BaseTypeElement'
import {objectLiteral, quote} from './generatorHelpers'
import Element from '../model/Element'
import {last, without} from 'ramda'
import {print, types} from 'recast'
import {visit} from 'ast-types'
import {functionArgs} from '../runtime/globalFunctions'
import Parser from './Parser'
import {EventActionPropertyDef} from '../model/Types'
import {dataTypeElementTypes} from '../model/elements'

const indent = (codeBlock: string, indent: string) => codeBlock.split('\n').map( line => indent + line).join('\n')
const indentLevel1 = '    '
const indentLevel2 = indentLevel1 + indentLevel1

export function generateTypes(project: Project) {
    return new TypesGenerator(project).output()
}

export default class TypesGenerator {
    private parser
    constructor(private project: Project) {
        const dataTypesContainer = project.dataTypesContainer
        this.parser = new Parser(dataTypesContainer, project)
        this.parser.parseComponent(dataTypesContainer)
    }

    private modelProperties(element: Element) {
        const propertyDefs = element.propertyDefs.filter(def => !def.state )
        const propertyExprs = propertyDefs.map(def => {
            const isEventAction = (def.type as EventActionPropertyDef).type === 'Action'
            const exprType: ExprType = isEventAction ? 'action': 'singleExpression'
            const exprArgNames = isEventAction ? (def.type as EventActionPropertyDef).argumentNames : undefined
            const expr = this.getExpr(element, def.name, exprType, exprArgNames)
            return [def.name, expr]
        })

        return Object.fromEntries(propertyExprs.filter(([, expr]) => !!expr))
    }

    private generateChild(element: BaseTypeElement<any>, indent: string): string {
        return indent + this.generateTypeExpr(element, indent)
    }

    private generateChildren(type: BaseTypeElement<any>, indent: string) {
        const childElements = type.elementArray().filter( el => el.kind !== 'Rule') as BaseTypeElement<any>[]
        return childElements.length ? `[\n${childElements.map( el => this.generateChild(el, indent + indentLevel1) ).join(',\n')}\n${indent}]` : null
    }
    private generateListItemType(type: BaseTypeElement<any>, indent: string) {
        const childElement = type.elementArray().find( el => el.kind !== 'Rule') as BaseTypeElement<any>
        return childElement ? `\n${this.generateChild(childElement, indent + indentLevel1)}\n${indent}` : null
    }

    private generateRules(type: BaseTypeElement<any>, indent: string) {
        const generateRule = (rule: Rule) => {
            const formulaExpr = this.getExpr(rule, 'formula')
            const descriptionExpr = this.getExpr(rule, 'description')
            return `${indent + indentLevel1}new Rule('${rule.name}', \$item => ${formulaExpr}, ${objectLiteral({description: descriptionExpr})})`
        }

        const ruleElements = type.elementArray().filter( el => el.kind === 'Rule') as Rule[]
        return ruleElements.length ? `[\n${ruleElements.map( generateRule ).join(',\n')}\n${indent}]` : null
    }

    private generateTypeExpr(element: BaseTypeElement<any>, indent: string = ''): string {
        const nameArg = quote(element.name)
        const propsArg = objectLiteral(this.modelProperties(element))
        const finalArg =
                element.kind === 'RecordType' ? this.generateChildren(element, indent) :
                element.kind === 'ListType' ? this.generateListItemType(element, indent) : null
        const rulesArg = this.generateRules(element, indent) ?? (finalArg ? '[]' : null)
        const args = [nameArg, propsArg, rulesArg, finalArg].filter(arg => !!arg)
        return `new ${element.kind}(${args.join(', ')})`
    }

    private typeFileContent(dataTypes: DataTypes): string {
        const globals = this.parser.globalFunctionIdentifiers(dataTypes.id)
        const typeNames = dataTypes.elementArray().map( t => t.codeName )
        const typeElements = dataTypes.elementArray() as BaseTypeElement<any>[]

        const functionName = `build_${dataTypes.codeName}`
        const globalsDeclaration = globals.length ? '\n' + indentLevel1 + `const {${globals.join(', ')}} = Elemento.globalFunctions` : ''
        const functionHeader = `const ${dataTypes.codeName} = (() => {${globalsDeclaration}`

        const typeDeclarations = typeElements.map( t => `${indentLevel1}const ${t.codeName} = ${this.generateTypeExpr(t, indentLevel1)}` ).join('\n')
        const functionEnd = `    return {\n${typeNames.map( name => indentLevel2 + name).join(',\n')}\n    }\n})()`
        const dataTypesObject = `const ${dataTypes.codeName} = ${functionName}()`
        return [functionHeader, typeDeclarations, functionEnd].join('\n\n') + '\n'
    }

    output() {
        const dataTypeElements = this.project.findChildElements(DataTypes)
        const generateTypeFile = (dataTypes: DataTypes) => {
            const name = dataTypes.codeName + '.js'
            const contents = this.typeFileContent(dataTypes)
            return {name, contents}
        }
        const files = dataTypeElements.map( generateTypeFile )

        return {
            files,
            errors: this.parser.allErrors(),
            typesClassNames: without(['DataTypes'], Object.keys(dataTypeElementTypes()))
        }
    }
    private getExpr(element: Element, propertyName: string, exprType: ExprType = 'singleExpression', argumentNames?: string[]) {
        function isShorthandProperty(node: any) {
            return node.shorthand
        }

        function addReturnStatement(ast: any) {
            const bodyStatements = ast.program.body as any[]
            const lastStatement = last(bodyStatements)
            const b = types.builders
            ast.program.body[bodyStatements.length - 1] = b.returnStatement(lastStatement.expression)
        }

        const errorMessage = this.parser.propertyError(element.id, propertyName)
        if (errorMessage && !errorMessage.startsWith('Incomplete item')) {
            return `Elemento.codeGenerationError(\`${this.parser.getExpression(element.id, propertyName)}\`, '${errorMessage}')`
        }

        const ast = this.parser.getAst(element.id, propertyName)
        if (ast === undefined) {
            return undefined
        }

        visit(ast, {
            visitAssignmentExpression(path) {
                const node = path.value
                node.type = 'BinaryExpression'
                node.operator = '=='
                this.traverse(path)
            },

            visitProperty(path) {
                const node = path.value
                if (isShorthandProperty(node)) {
                    node.value.name = 'undefined'
                }
                this.traverse(path)
            },

            visitCallExpression(path) {
                const callExpr = path.value
                const b = types.builders
                const functionName = callExpr.callee.name
                const argsCalledAsFunctions = functionArgs[functionName as keyof typeof functionArgs] ?? {}
                Object.entries(argsCalledAsFunctions).forEach( ([index, argNames]) => {
                    const argIdentifiers = argNames.map( name => b.identifier(name))
                    const bodyExpr = callExpr.arguments[index] ?? b.nullLiteral()
                    callExpr.arguments[index] = b.arrowFunctionExpression(argIdentifiers, bodyExpr)
                })
                this.traverse(path)
            }
        })

        if (exprType === 'multilineExpression') {
            addReturnStatement(ast)
        }

        const exprCode = print(ast, {quote: 'single', objectCurlySpacing: false}).code.replace(/;$/, '')
        switch (exprType) {
            case 'singleExpression':
                return exprCode
            case 'action':
                const argList = (argumentNames ?? []).join(', ')
                return `(${argList}) => {${exprCode}}`
            case 'multilineExpression': {
                return `{\n${indent(exprCode, '        ')}\n    }`
            }
        }
    }

}
