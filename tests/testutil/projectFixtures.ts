import App from '../../src/model/App'
import Page from '../../src/model/Page'
import {newBlock, newText, newTextInput} from '../testutil/modelHelpers'
import Button from '../../src/model/Button'
import Project from '../../src/model/Project'
import {ex} from './testHelpers'
import NumberInput from '../../src/model/NumberInput'
import File from '../../src/model/File'
import FileFolder from '../../src/model/FileFolder'

export function projectFixture1() {

    const page1 = new Page('page_1', 'Main Page', {}, [
        newText('text_1', 'First Text', {content: ex`"The first bit of text"`}),
        newText('text_2', 'Second Text', {content: ex`"The second bit of text"`}),
        newBlock('layout_1', 'A Layout', {}, [
            new NumberInput('numberInput_15', 'Nested Text', {}),
        ])
    ])
    const page2 = new Page('page_2', 'Other Page', {}, [
        newText('text_3', 'Some Text', {content: ex`"Some text here"`}),
        newText('text_4', 'More Text', {content: ex`"...and more text"`}),
    ])
    const app = new App('app1', 'App One', {}, [
        page1,
        page2
    ])
    return Project.new([app], 'Project One', 'project_1', {})
}

export function projectFixture2() {

    const page1 = new Page('page_1', 'Main Page', {}, [
        newText('text_1', 'First Text', {content: ex`"Page One"`}),
        newTextInput('textInput_1', 'First Text Input', {initialValue: ex`"A text value"`, label: ex`'A' + 'label'`}),
        new Button('button_1', 'Button 1', {content: 'Go to Page 2', action: ex`ShowPage(OtherPage)`}),
    ])
    const page2 = new Page('page_2', 'Other Page', {}, [
        newText('text_3', 'Some Text', {content: ex`"Page Two"`}),
        newTextInput('textInput_2', 'Another Text Input', {initialValue: ex`"Type the text"`, label: ex`'B' + 'label'`}),
        new Button('button_2', 'Button 2', {content: 'Back to Page 1', action: ex`ShowPage(MainPage)`}),
    ])
    const app = new App('app1', 'App One', {}, [
        page1,
        page2
    ])
    const file1 = new File('file_1', 'Image 1.jpg', {})
    const folder = new FileFolder('_FILES', 'Files', {}, [file1])
    return Project.new([app, folder], 'Project One', 'project_1', {})
}
export function welcomeProject() {
    return Project.new([
        new App('app1', 'Welcome App', {}, [
            new Page('page_1', 'Main Page', {}, [
                newText('text1_1', 'First Text', {content: {'expr': '"Welcome to Elemento!"'}}),
                newText('text1_2', 'Second Text', {content: {'expr': '"The future of low code programming"'}}),
            ])
        ])], 'Welcome to Elemento', 'project_1', {})

}
