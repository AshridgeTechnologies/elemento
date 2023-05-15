function LanguageFactoryFr(args) {
    const personTypes = ['1s', '2s', '3s', '1p', '2p', '3p']
    function hasTag(word, tag) { return word.Tags.split(/ +/).includes(tag) }
    function isMasculine(word) { return hasTag(word, 'masc') }
    function isFeminine(word) { return hasTag(word, 'fem') }
    function startsWithVowel(word) { return word.toLowerCase().match(/^[aeiouyh]/) }
    function getPersonIndex(person) { return personTypes.findIndex(p => p === person) }
    function getEnding(person, endingsString) {return getPersonForm(person, endingsString)}
    function getPersonForm(person, forms) { return forms.split(',')[getPersonIndex(person)] || '??' }

    const commands = {

        DefArt(word, plural, withSpace = false) {
            const noun = word.LangFr
            const spacing = withSpace ? ' ' : ''
            if (plural) return 'les' + spacing
            if (startsWithVowel(noun)) return 'l\''  //no spacing
            if (hasTag(word, 'masc')) return 'le' + spacing
            return 'la' + spacing
        },

        SingOrPlural(word, plural) {
            const noun = word.LangFr
            if (plural) {
                return noun + 's'  //simple start
            } else {
                return noun
            }
        },

        DefArtNoun(word, plural) {
            let noun = this.SingOrPlural(word, plural)
            const article = this.DefArt(word, plural, true)
            return `${article}${noun}`
        },

        Present(word, person) {
            const infinitive = word.LangFr
            if (infinitive.endsWith('er')) {
                const stem = infinitive.replace(/er$/, '')
                const ending = getEnding(person, 'e,es,e,ons,ez,ent')
                return stem + ending
            }
            if (infinitive === 'voir') {
                const stem = infinitive.replace(/ir$/, '')
                const ending = getEnding(person, 'is,is,it,yons,yez,ient')
                return stem + ending
            }
            if (infinitive === 'venir') {
                return getPersonForm(person, 'viens,viens,vient,venons,venez,viennent')
            }
        },

        Future(word, person) {
            const infinitive = word.LangFr
            let stem
            if (infinitive.endsWith('er')) {
                stem = infinitive
            }
            if (infinitive === 'voir') {
                stem = 'verr'
            }
            if (infinitive === 'venir') {
                stem = 'viendr'
            }
            const ending = getEnding(person, 'ai,as,a,ons,ez,ont')
            return stem + ending
        },

        SubjectPronoun(personType) { return getPersonForm(personType, 'je,tu,elle,nous,vous,ils')},
        ObjectPronoun(word, plural) { return plural ? 'les' : this.isMasculine(word) ? 'le' : 'la' },

        ADefArtNoun(word, withSpace = false) {
            const noun = word.LangFr
            const spacing = withSpace && !this.startsWithVowel(noun) ? ' ' : ''
            const article = this.startsWithVowel(noun) ? 'à l\'' : hasTag(word, 'masc') ? 'au' : 'à la'
            return article + spacing + noun
        },


        Join(word1, word2) {
            if (word1.endsWith('que') && this.startsWithVowel(word2)) {
                return word1.slice(0, -1) + '\'' + word2
            }

            return word1 + ' ' + word2
        }
    }

    const [commandName, ...commandArgs] = args
    const command = commands[commandName]
    return command ? commands[commandName](...commandArgs) : `[??? ${args.map(JSON.stringify).join(' ')}]`
}