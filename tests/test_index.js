import CloudflareDataStore from "../src/serverRuntime/CloudflareDataStore.ts"
import BigNumber from "bignumber.js"
import {handleDurableObjectRequest} from "../src/serverRuntime/cloudflareWorker.js"
import TinyBaseDataStore from "../src/serverRuntime/TinyBaseDataStore.js"
import {TinyBaseAuthSyncDurableObject} from "../src/serverRuntime/TinyBaseAuthSyncDurableObject.ts"
export {TinyBaseFullSyncDurableObject} from "../src/serverRuntime/TinyBaseFullSyncDurableObject.ts"

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

export class TinyBaseDurableObject_A extends TinyBaseAuthSyncDurableObject {
  authorizeUpdateData(userId, tableId, rowId, changes) {
    return changes.userId === undefined || changes.userId === userId
  }
}

export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url)
    const pathname = url.pathname
    if (pathname.startsWith('/do/')) {
      return handleDurableObjectRequest(request, env)
    }

    const testObject = (dbTypeName, dbName) => {
      switch(dbTypeName) {
        case 'store': return new CloudflareDataStore({collections: 'Widgets', database: env.DB})
        default: return new TinyBaseDataStore({databaseName: dbName, collections: 'Widgets', durableObject: env[dbTypeName]})
      }
    }

    if (pathname.startsWith('/call/')) {
      const [dbTypeName, dbName, func] = pathname.split('/').slice(2, 5)
      const body = await request.text()
      const args = JSON.parse(body, bigDecReviver)
      const obj = testObject(dbTypeName, dbName)
      if (!obj) {
        return Response.json({error:`Object not found: ${dbTypeName}`}, {status: 500})
      }
      const data = await obj[func].apply(obj, args)
      const types = typesOf(data)
      const result = {data, types}
      // console.log('In fetch', objName, func, args)
      return Response.json(result ?? null)
    }


  }
}
