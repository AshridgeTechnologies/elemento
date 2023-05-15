function LanguageFactoryEn(args) {

    const personTypes = ['1s', '2s', '3s', '1p', '2p', '3p']
    function hasTag(word, tag) { return word.Tags.split(/ +/).includes(tag) }
    function isMasculine(word) { return hasTag(word, 'person') && hasTag(word, 'masc') }
    function isFeminine(word) { return hasTag(word, 'person') && hasTag(word, 'fem') }
    function startsWithVowel(word) { return word.toLowerCase().match(/^[aeiouyh]/) }
    function getPersonIndex(person) { return personTypes.findIndex(p => p === person) }
    function getEnding(person, endingsString) {return getPersonForm(person, endingsString)}
    function getPersonForm(person, forms) { return forms.split(',')[getPersonIndex(person)] || '??' }

    const commands = {
        SingOrPlural(word, plural) {
            const noun = word.LangEn
            if (plural) {
                return noun + 's'  //simple start
            } else {
                return noun
            }
        },

        DefArtNoun(word, plural) {
            const noun = this.SingOrPlural(word, plural)
            return `the ${noun}`
        },

        Present(word, person) {
            const infinitive = word.LangEn
            const stem = infinitive
            if (person === '3s') {
                if (stem.match(/(sh|ch|s|x|z)$/)) {
                    return stem + 'es'
                }
                if (stem.match(/y$/) && !stem.match.match(/[aeiou]y$/)) {
                    return stem.substring(0, stem.length - 1) + 'ies'
                }

                return stem + 's'
            }
            return stem
        },

        Future(word, person) {
            const infinitive = word.LangEn
            const stem = infinitive
            return 'will' + ' ' + stem
        },

        SubjectPronoun(personType) {
            return getPersonForm(personType, 'I,you,she,we,you[pl],they')
        },
        ObjectPronoun(word, plural) {
            return plural ? 'them' : this.isMasculine(word) ? 'him' : this.isFeminine(word) ? 'her' : 'it'
        }
    }

    const [commandName, ...commandArgs] = args
    const command = commands[commandName]
    return command ? commands[commandName](...commandArgs) : `[??? ${args}.join(' ')]`
}