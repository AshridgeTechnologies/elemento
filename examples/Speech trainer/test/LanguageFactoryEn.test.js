import test from 'node:test'
import {expect} from 'expect'

import factory from '../js/LanguageFactoryEn.js'

const word = (text, tags) => ({LangEn: text, Tags: tags})

test('definite article and noun', () => {
    expect(factory('DefArtNoun', word('dog'))).toBe('the dog')
})


test('definite article and noun', () => {
    expect(factory('SingOrPlural', word('dog', true))).toBe('dogs')
})
