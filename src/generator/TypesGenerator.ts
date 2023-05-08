import Project from '../model/Project'
import {ExprType} from './Types'
import DataTypes from '../model/types/DataTypes'
import Rule from '../model/types/Rule'
import BaseTypeElement from '../model/types/BaseTypeElement'
import {objectLiteral, quote} from './generatorHelpers'
import Element from '../model/Element'
import {last} from 'ramda'
import {print, types} from 'recast'
import {visit} from 'ast-types'
import {functionArgIndexes} from '../runtime/globalFunctions'
import Parser from './Parser'
import BaseElement from '../model/BaseElement'
import {ComponentType, EventActionPropertyDef} from '../model/Types'

const indent = (codeBlock: string, indent: string) => codeBlock.split('\n').map( line => indent + line).join('\n')
const indentLevel1 = '    '


class DataTypesContainer extends BaseElement<{}> {
    get propertyDefs() { return [] }
    type() { return 'DataTypesContainer' as ComponentType }
}

export default class TypesGenerator {
    private parser
    constructor(private project: Project) {
        const dataTypes = project.findChildElements(DataTypes)
        const dataTypesContainer = new DataTypesContainer('_dt1', 'DataTypes Container', {}, dataTypes)
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
        const imports = `import {types} from 'elemento-runtime'\nconst {ChoiceType, DateType, ListType, NumberType, RecordType, TextType, TrueFalseType, Rule} = types`
        const typeNames = dataTypes.elementArray().map( t => t.codeName )
        const typeElements = dataTypes.elementArray() as BaseTypeElement<any>[]
        const typeDeclarations = typeElements.map( t => `const ${t.codeName} = ${this.generateTypeExpr(t)}` ).join('\n')
        const exportStmt = `export const ${dataTypes.codeName} = {\n${typeNames.map( name => indentLevel1 + name).join(',\n')}\n}`
        return [imports, typeDeclarations, exportStmt].join('\n\n') + '\n'
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
                const node = path.value
                const functionName = node.callee.name
                const argsToTransform = functionArgIndexes[functionName as keyof typeof functionArgIndexes]
                argsToTransform?.forEach(index => {
                    const bodyExpr = node.arguments[index]
                    const b = types.builders
                    node.arguments[index] = b.arrowFunctionExpression([b.identifier('$item')], bodyExpr)
                })
                this.traverse(path)
            }
        })

        if (exprType === 'multilineExpression') {
            addReturnStatement(ast)
        }

        const exprCode = print(ast).code.replace(/;$/, '')
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