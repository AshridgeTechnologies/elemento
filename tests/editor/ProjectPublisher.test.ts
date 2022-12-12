import ProjectPublisher from '../../src/editor/ProjectPublisher'
import {currentUser} from '../../src/shared/authentication'
import {uploadTextToStorage} from '../../src/shared/storage'
import {projectFixture1} from '../testutil/projectFixtures'

const project = projectFixture1()
const baseUrl = 'http://some.site'

jest.mock('../../src/shared/authentication')
jest.mock('../../src/shared/storage')

test('publish when logged in', async () => {
    const publisher = new ProjectPublisher(project, {baseUrl})
    const userId = 'xxx123'
    const name = 'MyFirstApp'
    const code = 'doIt() { return "Done it" }';
    (currentUser as jest.MockedFunction<any>).mockReturnValue({uid: userId});
    (uploadTextToStorage as jest.MockedFunction<any>).mockResolvedValueOnce({})

    const runUrl = await publisher.publish(name, code)
    expect(runUrl).toBe(`${baseUrl}/run/apps/${userId}/${name}`);
    expect(uploadTextToStorage).toHaveBeenCalledWith(`apps/${userId}/${name}`, code, {contentType: 'text/javascript',})
})

test('exception if try to publish when not logged in', async () => {
    const publisher = new ProjectPublisher(project, {
        baseUrl
    });
    (currentUser as jest.MockedFunction<any>).mockReturnValue(null);
    let exception: any
    try {
        await publisher.publish('x', 'x')
    } catch (e) {
        exception = e
    }
    expect(exception.message).toBe('Must be logged in to publish')
})