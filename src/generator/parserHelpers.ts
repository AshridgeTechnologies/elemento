import * as acorn from 'acorn'
import {parse} from 'recast'
import Element from '../model/Element'
import {ExprType, IdentifierCollector} from './Types'
import {EventActionPropertyDef, PropertyValue} from '../model/Types'
import {last, without} from 'ramda'
import {isExpr} from '../util/helpers'
import FunctionDef from '../model/FunctionDef'
import {visit} from 'ast-types'

export function parseExpr(expr: string) {

    function parseAcorn(source: string, options?: any) {
        const comments: any[] = []
        const tokens: any[] = []
        const ast = acorn.parse(source, {
            allowHashBang: false,
            allowImportExportEverywhere: false,
            allowReturnOutsideFunction: true,
            allowAwaitOutsideFunction: true,
            ecmaVersion: 11,  //2020
            sourceType: "module",
            locations: true,
            onComment: comments,
            onToken: tokens,
        })

        const astAsAny = (ast as any)
        if (!astAsAny.comments) {
            astAsAny.comments = comments
        }

        if (!astAsAny.tokens) {
            astAsAny.tokens = tokens
        }

        return ast
    }

    const exprToParse = expr.trim().startsWith('{') ? `(${expr})` : expr
    return parse(exprToParse, {parser: {parse: parseAcorn}})
}

export function parseExprAndIdentifiers(propertyValue: PropertyValue | undefined, identifiers: IdentifierCollector,
                                        isKnown: (name: string) => boolean, exprType: ExprType = 'singleExpression', onError: (err: string) => void, isJavaScript: boolean): void {

    if (propertyValue === undefined) {
        return undefined
    }

    const checkIsExpression = (ast: any) => {
        const bodyStatements = ast.program.body as any[]
        if (exprType === 'singleExpression') {
            if (bodyStatements.length !== 1) {
                throw new Error('Must be a single expression')
            }
            const mainStatement = bodyStatements[0]
            if (mainStatement.type !== 'ExpressionStatement') {
                throw new Error('Invalid expression')
            }
        }

        if (exprType === 'multilineExpression') {
            const lastStatement = last(bodyStatements)
            if (lastStatement?.type !== 'ExpressionStatement') {
                throw new Error('Invalid expression')
            }
        }
    }

    const checkErrors = (ast: any) => {
        if (ast.program.errors?.length) {
            throw new Error(ast.program.errors[0].description)
        }
    }

    const isShorthandProperty = (node: any) => node.shorthand

    if (isExpr(propertyValue)) {
        const {expr} = propertyValue
        if (!expr) {
            return undefined
        }
        try {
            const ast = parseExpr(expr)

            if (!isJavaScript) {
                checkIsExpression(ast)
            }
            checkErrors(ast)
            const thisIdentifiers = new Set<string>()
            const variableIdentifiers = new Set<string>()
            visit(ast, {
                visitVariableDeclarator(path) {
                    const node = path.value
                    variableIdentifiers.add(node.id.name)
                    this.traverse(path)
                },
                visitIdentifier(path) {
                    const node = path.value
                    const parentNode = path.parentPath.value
                    const isPropertyIdentifier = parentNode.type === 'MemberExpression' && parentNode.property === node
                    const isPropertyKey = parentNode.type === 'Property' && parentNode.key === node
                    const isVariableDeclaration = parentNode.type === 'VariableDeclarator' && parentNode.id === node
                    if (!isPropertyIdentifier && !isPropertyKey && !isVariableDeclaration) {
                        thisIdentifiers.add(node.name)
                    }
                    this.traverse(path)
                },
                visitProperty(path) {
                    const node = path.value
                    if (isShorthandProperty(node)) {
                        node.value.name = 'undefined'
                        const errorMessage = `Incomplete item: ${node.key.name}`
                        onError(errorMessage)
                    }
                    this.traverse(path)
                },

            })

            const identifierNames = Array.from(thisIdentifiers.values())
            const isLocal = (id: string) => variableIdentifiers.has(id)
            const unknownIdentifiers = identifierNames.filter(id => !isKnown(id) && !isLocal(id))
            if (unknownIdentifiers.length && !isJavaScript) {
                const errorMessage = `Unknown names: ${unknownIdentifiers.join(', ')}`
                onError(errorMessage)
            }

            const externalIdentifiers = without(Array.from(variableIdentifiers), identifierNames)
            externalIdentifiers.forEach(name => identifiers.add(name))
        } catch (e: any) {
            const humanizedMessage = e.message.replace(/\((\d+):(\d+)\)$/, (_: any, lineNo: string, charIndex: string) => `(Line ${lineNo} Position ${charIndex})`)
                .replace(/\btoken\b/, 'character(s)')
                .replace(/'return' outside of function/, 'return not allowed here')
            const errorMessage = `Error: ${humanizedMessage}`
            onError(errorMessage)
        }
    }
}
