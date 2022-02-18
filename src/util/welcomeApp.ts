import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'

export default function welcomeApp() {
    return new App('app1', 'Welcome to Elemento', {}, [
        new Page('page_1','Main Page', {}, [
            new Text('text1_1', 'First Text', {content: {"expr": `"Welcome to Elemento!"`}}),
            new Text("text1_2", 'Second Text', {content: {"expr": '"The future of low code programming"'}}),
        ])
    ])

}

export function editorInitialApp() {
    return new App('app1', 'Welcome to Elemento', {}, [
        new Page('page_1','Main Page', {}, [
            new Text('text1_1', 'First Text', {content: {"expr": '"Welcome to Elemento!"'}}),
            new Text("text1_2", 'Second Text', {content: {"expr": '"The future of low code programming"'}}),
            new Text("text1_3", 'Third Text', {content: {"expr": '"Start your program here..."'}}),
        ])
    ])
}