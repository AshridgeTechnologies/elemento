import CloudflareDataStore from "../../src/serverRuntime/CloudflareDataStore.js";
import BigNumber from "bignumber.js";

const typesOf = (obj) => {
  const typeName = (value) => {
    if (value === undefined) return 'undefined'
    if (value === null) return 'null'
    const basicType = typeof value
    return basicType === 'object' ? value.constructor.name : basicType
  }

  if (obj === undefined) return 'undefined'
  if (obj === null) return 'null'
  const typeEntries = Object.entries(obj).map(([key, value]) => [key, typeName(value)])
  return Object.fromEntries(typeEntries)
}

const DECIMAL_PREFIX = '#Dec'
const bigDecReviver = (key, value) => {
  if (typeof value === 'string' && value.startsWith(DECIMAL_PREFIX)) {
    return new BigNumber(value.substring(DECIMAL_PREFIX.length))
  }
  return value
}


export default {
  async fetch(request, env, ctx) {
    const testSubjects = {
      store: new CloudflareDataStore({collections: 'Widgets', env, bindingName: 'DB'})
    }

    const url = new URL(request.url);
    const pathname = url.pathname
    const [objName, func] = pathname.split('/').slice(1, 3)
    const body = await request.text()
    const args = JSON.parse(body, bigDecReviver)
    const obj = testSubjects[objName]
    const data = await obj[func].apply(obj, args)
    const types = typesOf(data)
    const result = {data, types}
    // console.log('In fetch', objName, func, args)
    return Response.json(result ?? null)

  }
}
