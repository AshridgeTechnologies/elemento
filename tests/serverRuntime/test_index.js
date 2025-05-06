import CloudflareDataStore from "../../src/serverRuntime/CloudflareDataStore.js";

export default {
  async fetch(request, env, ctx) {
    const testSubjects = {
      store: new CloudflareDataStore({collections: 'Widgets', env, bindingName: 'DB'})
    }

    const url = new URL(request.url);
    const pathname = url.pathname
    const [objName, func] = pathname.split('/').slice(1, 3)
    const body = await request.text()
    const args = JSON.parse(body)
    const obj = testSubjects[objName]
    const result = await obj[func].apply(obj, args)
    // console.log('In fetch', objName, func, args)
    return Response.json(result ?? null)

  }
}
