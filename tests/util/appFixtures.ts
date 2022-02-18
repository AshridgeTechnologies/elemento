import App from '../../src/model/App'
import Page from '../../src/model/Page'
import Text from '../../src/model/Text'
import TextInput from '../../src/model/TextInput'
import {ex} from '../../src/util/helpers'

export function appFixture1() {

    return new App('app1', 'App One', {}, [
        new Page('page_1', 'Main Page', {}, [
            new Text('text_1', 'First Text', {content: ex`"The first bit of text"`}),
            new Text('text_2', 'Second Text', {content: ex`"The second bit of text"`}),
        ]),
        new Page('page2', 'Other Page', {}, [
            new Text('text_3', 'Some Text', {content: ex`"Some text here"`}),
            new Text('text_4', 'More Text', {content: ex`"...and more text"`}),
        ])
    ])
}

export function appFixture2() {

    return new App('app1', 'App One', {}, [
        new Page('page_1', 'Main Page', {}, [
            new Text('text_1', 'First Text', {content: ex`"The first bit of text"`}),
            new TextInput('textInput_1', 'First Text Input', {initialValue: ex`"A text value"`, maxLength: ex`30`}),
        ]),
        new Page('page2', 'Other Page', {}, [
            new Text('text_3', 'Some Text', {content: ex`"Some text here"`}),
            new TextInput('textInput_2', 'Another Text Input', {initialValue: ex`"Type the text"`, maxLength: ex`50`}),
        ])
    ])
}
