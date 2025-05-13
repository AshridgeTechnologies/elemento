import { afterEach, beforeEach, afterAll, beforeAll, describe, expect, it, vi, test } from "vitest"  
import DataTypes from '../../src/model/types/DataTypes'
import TextType from '../../src/model/types/TextType'
import NumberType from '../../src/model/types/NumberType'
import TypesGenerator from '../../src/generator/TypesGenerator'
import Project1 from '../../src/model/Project'
import Project2 from '../../src/model/Project'
import Project3 from '../../src/model/Project'
import Project4 from '../../src/model/Project'
import Project5 from '../../src/model/Project'
import Project6 from '../../src/model/Project'
import Project7 from '../../src/model/Project'
import Project8 from '../../src/model/Project'
import Project9 from '../../src/model/Project'
import Project10 from '../../src/model/Project'
import {ex, trimText} from '../testutil/testHelpers'
import Rule from '../../src/model/types/Rule'
import DateType from '../../src/model/types/DateType'
import TrueFalseType from '../../src/model/types/TrueFalseType'
import RecordType from '../../src/model/types/RecordType'
import ChoiceType from '../../src/model/types/ChoiceType'
import ListType from '../../src/model/types/ListType'

test('has list of all Types class names', () => {
    const name = new TextType('id1', 'Name', {required: true})
    const itemAmount = new NumberType('id2', 'Item Amount', {})
    const theTypes = new DataTypes('dt1', 'My Types', {}, [name, itemAmount])
    const project = Project10.new([theTypes], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const output = generator.output()

    expect(output.typesClassNames).toStrictEqual(['ChoiceType', 'DateType', 'ListType', 'NumberType', 'DecimalType', 'RecordType', 'TextType', 'TrueFalseType', 'Rule'])
})

test('generates types without constraints in a DataTypes', () => {
    const name = new TextType('id1', 'Name', {required: true})
    const itemAmount = new NumberType('id2', 'Item Amount', {})
    const theTypes = new DataTypes('dt1', 'My Types', {}, [name, itemAmount])
    const project = Project9.new([theTypes], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const output = generator.output()

    expect(output.files.length === 1)
    const theTypesFile = output.files[0]
    expect(theTypesFile.name).toBe('MyTypes.js')
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const Name = new TextType('Name', {required: true})
            const ItemAmount = new NumberType('Item Amount', {required: false})
        
            return {
                Name,
                ItemAmount
            }
        })()
    `)
})

test('generates a file for each DataTypes', () => {
    const name = new TextType('id1', 'Name', {required: true})
    const itemAmount = new NumberType('id2', 'Item Amount', {})
    const types1 = new DataTypes('dt1', 'Types 1', {}, [name])
    const types2 = new DataTypes('dt2', 'Types 2', {}, [itemAmount])
    const project = Project8.new([types1, types2], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const output = generator.output()


    expect(output.files.length === 2)
    const [types1File, types2File] = output.files
    expect(types1File.name).toBe('Types1.js')
    expect(types2File.name).toBe('Types2.js')
    expect(types1File.contents).toBe(trimText`
        const Types1 = (() => {
        
            const Name = new TextType('Name', {required: true})
        
            return {
                Name
            }
        })()
    `)

    expect(types2File.contents).toBe(trimText`
        const Types2 = (() => {
        
            const ItemAmount = new NumberType('Item Amount', {required: false})
        
            return {
                ItemAmount
            }
        })()
    `)
})

test('generates TextType with built in and ad-hoc rules', async () => {
    const textType1 = new TextType('id1', 'TextType 1', {
        description: 'The blurb',
        format: 'url',
        minLength: 5,
        maxLength: 20,
    }, [
        new Rule('r1', 'Dot Com', {formula: ex`$item.endsWith(".com")`, description: 'Must end with .com'})
    ])

    const project = Project7.new([new DataTypes('dt1', 'My Types', {}, [textType1])], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const theTypesFile = generator.output().files[0]
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const TextType1 = new TextType('TextType 1', {description: 'The blurb', required: false, minLength: 5, maxLength: 20, format: 'url'}, [
                new Rule('Dot Com', $item => $item.endsWith('.com'), {description: 'Must end with .com'})
            ])
        
            return {
                TextType1
            }
        })()
    `)
})

test('generates NumberType with built in and ad-hoc rules using expressions', () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', format: 'integer', min: 5, max: 20}, [
        new Rule('r1', 'Multiple of Pi', {formula: ex`$item % Math.PI === 0`, description: 'Must be a multiple of Pi'})
    ])

    const project = Project6.new([new DataTypes('dt1', 'My Types', {}, [numberType1])], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const theTypesFile = generator.output().files[0]
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const NumberType1 = new NumberType('NumberType 1', {description: 'The amount', required: false, min: 5, max: 20, format: 'integer'}, [
                new Rule('Multiple of Pi', $item => $item % Math.PI === 0, {description: 'Must be a multiple of Pi'})
            ])
        
            return {
                NumberType1
            }
        })()
    `)
})

test('generates DateType with built in rules', () => {
    const dateType1 = new DateType('id1', 'DateType 1', {description: 'The date', min: ex`new Date('2022-07-06')`, max: ex`new Date('2022-08-09')`}, [
        new Rule('r1', 'Monday-Tuesday', {formula: ex`\$item.getDay() === 1 || \$item.getDay() === 2`, description: 'Must be a Monday or a Tuesday'})
    ])

    const project = Project5.new([new DataTypes('dt1', 'My Types', {}, [dateType1])], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const theTypesFile = generator.output().files[0]
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const DateType1 = new DateType('DateType 1', {description: 'The date', required: false, min: new Date('2022-07-06'), max: new Date('2022-08-09')}, [
                new Rule('Monday-Tuesday', $item => $item.getDay() === 1 || $item.getDay() === 2, {description: 'Must be a Monday or a Tuesday'})
            ])
        
            return {
                DateType1
            }
        })()
    `)
})

test('generates RecordType with all types', () => {
    const text1 = new TextType('tt1', 'Name', {description: 'What it\'s called', required: true}, [
        new Rule('r2', 'No hyphens', {description: 'Must not contain hyphens', formula: ex`!\$item.contains('-')`})
    ])
    const text2 = new TextType('tt2', 'Location', {description: 'Where it is', maxLength: 10})
    const choice1 = new ChoiceType('ct1', 'Type', {description: 'The kind of location', values: ['House', 'Mountain', 'Village']})
    const number1 = new NumberType('nt1', 'Price', {description: 'The entry cost', max: 50})
    const bool1 = new TrueFalseType('bt1', 'Visited', {description: 'Have we been there?'})
    const list1 = new ListType('lt1', 'Dates Visited', {description: 'When we went there', }, [
        new DateType('dt1', 'Date of visit', {})
    ])
    const rule1 = new Rule('r1', 'Name-Location', {description: 'Name must be different to Location', formula: ex`\$item.Name !== \$item.Location`})
    const placeRecord = new RecordType('rec1', 'Place', {description: 'A place to visit', required: true}, [text1, text2, choice1, number1, bool1, list1, rule1])
    const project = Project4.new([new DataTypes('dt1', 'My Types', {}, [placeRecord])], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const theTypesFile = generator.output().files[0]
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const Place = new RecordType('Place', {description: 'A place to visit', required: true}, [
                new Rule('Name-Location', $item => $item.Name !== $item.Location, {description: 'Name must be different to Location'})
            ], [
                new TextType('Name', {description: 'What it\\'s called', required: true}, [
                    new Rule('No hyphens', $item => !$item.contains('-'), {description: 'Must not contain hyphens'})
                ]),
                new TextType('Location', {description: 'Where it is', required: false, maxLength: 10}),
                new ChoiceType('Type', {description: 'The kind of location', required: false, values: ['House', 'Mountain', 'Village'], valueNames: []}),
                new NumberType('Price', {description: 'The entry cost', required: false, max: 50}),
                new TrueFalseType('Visited', {description: 'Have we been there?', required: false}),
                new ListType('Dates Visited', {description: 'When we went there', required: false}, [], 
                    new DateType('Date of visit', {required: false})
                )
            ])
        
            return {
                Place
            }
        })()
    `)
})

test('finds errors in expressions for type object properties', () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', format: 'integer', max: ex`XX * 10`}, )

    const project = Project3.new([new DataTypes('dt1', 'My Types', {}, [numberType1])], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const output = generator.output()
    const theTypesFile = output.files[0]

    expect(output.errors).toStrictEqual({
        id1: {max: 'Unknown names: XX'}
    })
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const NumberType1 = new NumberType('NumberType 1', {description: 'The amount', required: false, max: Elemento.codeGenerationError(\`XX * 10\`, 'Unknown names: XX'), format: 'integer'})
        
            return {
                NumberType1
            }
        })()
    `)
})

test('finds parsing errors in expressions for type object properties', () => {
    const dateType1 = new DateType('id1', 'Date 1', {description: 'The start', max: ex`Fri Apr 21 2023`}, )

    const project = Project2.new([new DataTypes('dt1', 'My Types', {}, [dateType1])], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const output = generator.output()
    const theTypesFile = output.files[0]

    expect(output.errors).toStrictEqual({
        id1: {max: 'Error: Unexpected character(s) (Line 1 Position 4)'}
    })
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const Date1 = new DateType('Date 1', {description: 'The start', required: false, max: Elemento.codeGenerationError(\`Fri Apr 21 2023\`, 'Error: Unexpected character(s) (Line 1 Position 4)')})
        
            return {
                Date1
            }
        })()
    `)
})

test('finds errors in expressions for rule formulas and descriptions', () => {
    const textType1 = new TextType('id1', 'TextType 1', {description: 'The blurb',}, [
        new Rule('r1', 'Dot Com', {formula: ex`$item.endsWith(XX)`, description: ex`'Must end with ' + YY()`})
    ])

    const project = Project1.new([new DataTypes('dt1', 'My Types', {}, [textType1])], 'The Project', 'p1', {})

    const generator = new TypesGenerator(project)
    const output = generator.output()
    const theTypesFile = output.files[0]

    expect(output.errors).toStrictEqual({
        r1: {
            description: 'Unknown names: YY',
            formula: 'Unknown names: XX',
        }
    })
    expect(theTypesFile.contents).toBe(trimText`
        const MyTypes = (() => {
        
            const TextType1 = new TextType('TextType 1', {description: 'The blurb', required: false}, [
                new Rule('Dot Com', $item => Elemento.codeGenerationError(\`$item.endsWith(XX)\`, 'Unknown names: XX'), {description: Elemento.codeGenerationError(\`'Must end with ' + YY()\`, 'Unknown names: YY')})
            ])
        
            return {
                TextType1
            }
        })()
    `)
})
