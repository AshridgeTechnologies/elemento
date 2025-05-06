import CloudflareDataStore from "../../src/serverRuntime/CloudflareDataStore.js";

export default {
  async fetch(request, env, ctx) {
    const store = new CloudflareDataStore({collections: 'Widgets', env, bindingName: 'DB'})

    const url = new URL(request.url);
    const pathname = url.pathname

    if (pathname === '/add') {
      const body = await request.text()
      const inputs = JSON.parse(body)
      const {collectionName, id, item} = inputs
      await store.add(collectionName, id, item)
      return Response.json({added: 1})
    }

    if (pathname.startsWith('/getById/')) {
      const inputs = pathname.split('/').slice(-2)
      const [collectionName, id] = inputs
      const item = await store.getById(collectionName, id)
      return Response.json(item)
    }
  }
}
