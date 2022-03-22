import App from '../model/App'
import Page from '../model/Page'
import Text from '../model/Text'
import Project from '../model/Project'

export default function welcomeProject() {
    return new Project('project_1', 'Welcome to Elemento', {}, [
        new App('app1', 'Welcome App', {}, [
            new Page('page_1', 'Main Page', {}, [
                new Text('text1_1', 'First Text', {content: {"expr": `"Welcome to Elemento!"`}}),
                new Text("text1_2", 'Second Text', {content: {"expr": '"The future of low code programming"'}}),
            ])
        ])])

}

export function editorInitialProject() {
    return new Project('project_1', 'Welcome to Elemento', {}, [
        new App('app1', 'Welcome to Elemento', {}, [
            new Page('page_1', 'Main Page', {}, [
                new Text('text1_1', 'First Text', {content: {"expr": '"Welcome to Elemento!"'}}),
                new Text("text1_2", 'Second Text', {content: {"expr": '"The future of low code programming"'}}),
                new Text("text1_3", 'Third Text', {content: {"expr": '"Start your program here..."'}}),
            ])
        ])])
}
