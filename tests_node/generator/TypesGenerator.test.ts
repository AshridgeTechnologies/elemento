import DataTypes from '../../src/model/types/DataTypes'
import TextType from '../../src/model/types/TextType'
import TypesGenerator from '../../src/generator/TypesGenerator'
import Project1 from '../../src/model/Project'
import Rule from '../../src/model/types/Rule'
import fs from 'fs'
import test from 'node:test'
import {expect} from 'expect'
import NumberType from '../../src/model/types/NumberType'
import DateType from '../../src/model/types/DateType'
import BaseType from '../../src/shared/types/BaseType'
import {ex} from '../../tests/testutil/testHelpers'
import ChoiceType from '../../src/model/types/ChoiceType'
import TrueFalseType from '../../src/model/types/TrueFalseType'
import ListType from '../../src/model/types/ListType'
import RecordType from '../../src/model/types/RecordType'
import BaseTypeElement from '../../src/model/types/BaseTypeElement'

let fileSeq = 0
const nextTempFileName = () => `TypesGenerator.${++fileSeq}.temp.js`

const dataTypesName = 'MyTypes'
async function importCode(code: string) {
    const filename = nextTempFileName()
    const testModulePath = `./tempTestFiles/${filename}`
    const testModuleRelativePath = `../../tempTestFiles/${filename}`
    const testImports = `import {types} from '../devDist/lib/runtime.js'\n`
        + `const {ChoiceType, DateType, ListType, NumberType, RecordType, TextType, TrueFalseType, Rule} = types`
    const testExports = `export {${dataTypesName}}`
    const codeWithLocalImports = testImports + '\n\n' + code + '\n\n' + testExports
    fs.writeFileSync(testModulePath, codeWithLocalImports)
    return await import(testModuleRelativePath)
}

const check = (validator: BaseType<any, any>, item: any) => validator.validate(item)
const errors = (validator: BaseType<any, any>, item: any) => check(validator, item) as string[]

function aProject(type: BaseTypeElement<any>) {
    return Project1.new([new DataTypes('dt1', dataTypesName, {}, [type])], 'The Project', 'p1', {})
}

test('generates TextType with expected validation', async () => {
    const textType1 = new TextType('id1', 'TextType 1', {
        description: 'The blurb',
        format: 'url',
        minLength: 10,
        maxLength: 20,
    }, [
        new Rule('r1', 'Dot Com', {formula: ex`$item.endsWith(".com")`, description: 'Must end with .com'})
    ])

    const generator = new TypesGenerator(aProject(textType1))
    const theTypesFile = generator.output().files[0]
    const theTypes = await importCode(theTypesFile.contents)
    const {TextType1} = theTypes[dataTypesName]

    expect(check(TextType1, "http://xyz.com")).toBe(null)

    expect(errors(TextType1, "xyz.com")).toStrictEqual(["Minimum length 10", "Must be a valid url"])
    expect(errors(TextType1, "x://a.com")).toStrictEqual(["Minimum length 10", "Must be a valid url"])
    expect(errors(TextType1, "http://abcdef.pqrstu.com")).toStrictEqual(["Maximum length 20"])
    expect(errors(TextType1, "http://xyz.fr")).toStrictEqual(["Must end with .com"])
})

test('generates NumberType with expected validation', async () => {
    const numberType1 = new NumberType('id1', 'NumberType 1', {description: 'The amount', format: 'integer', min: 5, max: 20}, [
        new Rule('r1', 'Multiple of 10', {formula: ex`$item % 10 === 0`, description: 'Must be a multiple of 10'})
    ])
    const generator = new TypesGenerator(aProject(numberType1))
    const theTypesFile = generator.output().files[0]
    const theTypes = await importCode(theTypesFile.contents)
    const {NumberType1} = theTypes[dataTypesName]

    expect(check(NumberType1, 10)).toBe(null)

    expect(errors(NumberType1, 3)).toStrictEqual(["Minimum 5", "Must be a multiple of 10"])
    expect(errors(NumberType1, 0)).toStrictEqual(["Minimum 5"])
    expect(errors(NumberType1, 30)).toStrictEqual(["Maximum 20"])
    expect(errors(NumberType1, 11)).toStrictEqual(["Must be a multiple of 10"])
})

test('generates DateType with expected validation', async () => {
    const dateType = new DateType('id1', 'DateType 1', {description: 'The date', min: ex`new Date('2022-07-04')`, max: ex`new Date('2022-08-09')`}, [
        new Rule('r1', 'Monday-Tuesday', {formula: ex`\$item.getDay() === 1 || \$item.getDay() === 2`, description: 'Must be a Monday or a Tuesday'})
    ])

    const generator = new TypesGenerator(aProject(dateType))
    const theTypesFile = generator.output().files[0]
    const theTypes = await importCode(theTypesFile.contents)
    const {DateType1} = theTypes[dataTypesName]

    const date1 = new Date('2022-07-04')
    const tooEarly = new Date('2022-07-03')

    expect(check(DateType1, date1)).toBe(null)

    expect(errors(DateType1, tooEarly)).toStrictEqual(["Earliest 04 Jul 2022", "Must be a Monday or a Tuesday"])
})

function placeRecordType() {
    const text1 = new TextType('tt1', 'Name', {description: 'What it\'s called', required: true}, [
        new Rule('r2', 'No hyphens', {description: 'Must not contain hyphens', formula: ex`!\$item.includes('-')`})
    ])
    const text2 = new TextType('tt2', 'Location', {description: 'Where it is', maxLength: 10})
    const choice1 = new ChoiceType('ct1', 'Type', {description: 'The kind of location', values: ['House', 'Mountain', 'Village']})
    const number1 = new NumberType('nt1', 'Price', {description: 'The entry cost', max: 50})
    const bool1 = new TrueFalseType('bt1', 'Visited', {description: 'Have we been there?'})
    const list1 = new ListType('lt1', 'Dates Visited', {description: 'When we went there',}, [
        new DateType('dt1', 'Date of visit', {})
    ])
    const rule1 = new Rule('r1', 'Name-Location', {description: 'Name must be different to Location', formula: ex`\$item.Name !== \$item.Location`})
    return new RecordType('rec1', 'Place', {
        description: 'A place to visit',
        required: true
    }, [text1, text2, choice1, number1, bool1, list1, rule1])
}

test('generates RecordType with expected validation', async () => {
    const generator = new TypesGenerator(aProject(placeRecordType()))
    const theTypesFile = generator.output().files[0]
    const theTypes = await importCode(theTypesFile.contents)
    const {MyTypes: {Place}} = theTypes

    const validRecord = {
        Name: 'Mont Blanc'
    }

    expect(check(Place, validRecord)).toBe(null)

    const dodgyRecord = {
        Name: 'Mont-Blanc',
        Price: 60,
        Location: 'Mont-Blanc',
        Type: 'High peak'
    }
    expect(errors(Place, dodgyRecord)).toStrictEqual({
        _self: ['Name must be different to Location'],
        Name: ['Must not contain hyphens'],
        Price: ['Maximum 50'],
        Type: ['One of: House, Mountain, Village']
    })
})

test('generates ListType with expected validation', async () => {
    const placeRecord = placeRecordType()
    const placeList = new ListType('lt1', 'Place List', {description: 'A place to visit', required: true}, [placeRecord])

    const generator = new TypesGenerator(aProject(placeList))
    const theTypesFile = generator.output().files[0]
    const theTypes = await importCode(theTypesFile.contents)
    const {PlaceList} = theTypes[dataTypesName]

    const validRecord = {
        Name: 'Mont Blanc',
        Visited: true,
        DatesVisited: [
            new Date('2020-02-15'),
            new Date('2022-05-19'),
        ]
    }

    const dodgyRecord = {
        Name: 'Mont-Blanc',
        Price: 60,
        Location: 'Mont-Blanc',
        Type: 'High peak',
    }
    const allValid = [validRecord, validRecord]
    expect(check(PlaceList, allValid)).toBe(null)

    const oneWithErrors = [validRecord, dodgyRecord]
    expect(errors(PlaceList, oneWithErrors)).toStrictEqual({
        1: {
            _self: ['Name must be different to Location'],
            Name: ['Must not contain hyphens'],
            Price: ['Maximum 50'],
            Type: ['One of: House, Mountain, Village'],
            DatesVisited: {_self: ['Required']}
        }
    })
})

