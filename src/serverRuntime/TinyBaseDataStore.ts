import {BasicDataStore, CollectionName, ComplexCriteria, Criteria, DataStoreObject, Id} from '../runtime/DataStore'
import {D1PreparedStatement, DurableObjectNamespace, DurableObjectStub} from "@cloudflare/workers-types/experimental"
import CollectionConfig, {parseCollections} from '../shared/CollectionConfig'
import {isArray} from 'radash'
import {addIdToItem, convertFromDbData, convertToDbData} from '../shared/convertData'
import {TinyBaseDurableObject} from './TinyBaseDurableObject'
import {mergeDeepRight} from 'ramda'

type Properties = {collections: string, durableObject: DurableObjectNamespace, databaseName: string}

const normalizeCriteria = (criteria: Criteria): ComplexCriteria => {
    return isArray(criteria) ? criteria : Object.entries(criteria).map(([name, value]) => [name, '=', value])
}

function asJsonString(changes: object) {
    return JSON.stringify(convertToDbData(changes))
}

export default class TinyBaseDataStore implements BasicDataStore {
    private readonly collections: CollectionConfig[]
    private readonly durableObjectStub: DurableObjectStub<TinyBaseDurableObject>

    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
        const id = props.durableObject.idFromName(props.databaseName);
        this.durableObjectStub = props.durableObject.get(id) as DurableObjectStub<TinyBaseDurableObject>
    }

    private async runSql(collectionName: CollectionName, sqlFn: () => Promise<any>) {
        if (!this.collections.some( coll => coll.name === collectionName)) {
            throw new Error(`Collection '${collectionName}' not found`)
        }
        try {
            return await sqlFn()
        } catch (e: any) {
            if (e.cause.message.startsWith('no such table: ' + collectionName)) {
                const tableDdl = `CREATE TABLE IF NOT EXISTS "${collectionName}" ( "id" VARCHAR(256) PRIMARY KEY, "json_data" VARCHAR );`
                await this.db.exec(tableDdl)
                console.info('Created table', collectionName)
                return await sqlFn()
            }
            throw e
        }
    }



    async getById(collectionName: CollectionName, id: Id, nullIfNotFound = false) {
        const data: string | null = await this.durableObjectStub.getJsonData(collectionName, id)

        if (!data) {
            if (nullIfNotFound) {
                return null
            } else {
                throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
            }
        }
        return convertFromDbData(JSON.parse(data))
    }

    private insertStmt(collectionName: CollectionName) {
        return this.db.prepare(`INSERT INTO ${collectionName} (id, json_data) VALUES (?, ?)`)
    }

    private bindInsert(stmt: D1PreparedStatement, id: Id, item: DataStoreObject) {
        const itemWithId = {id, ...item}
        const jsonStr = asJsonString(itemWithId)
        return stmt.bind(id, jsonStr)
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        const dbItem = convertToDbData(addIdToItem(item, id))
        await this.durableObjectStub.setJsonData(collectionName, id, JSON.stringify(dbItem))
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const addPromises = Object.entries(items).map(([id, item]) => this.add(collectionName, id, item))
        await Promise.all(addPromises)
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        const existingItem = await this.getById(collectionName, id) as object
        const updatedItem = mergeDeepRight(existingItem, changes)
        const dbItem = convertToDbData(updatedItem)
        await this.durableObjectStub.setJsonData(collectionName, id, JSON.stringify(dbItem))
    }

    async remove(collectionName: CollectionName, id: Id) {
        await this.durableObjectStub.removeJsonData(collectionName, id)
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        const constraints = normalizeCriteria(criteria)
        const conditionClauses = constraints.map( constraint => {
            const [name, op] = constraint
            return `json_data ->> '$.${name}' ${op} ?`
        }).join(' AND ')
        const sql = `SELECT json_data FROM ${collectionName} WHERE ${conditionClauses}`
        const results = await this.runSql(collectionName, () => this.db.prepare(sql)
            .bind(...constraints.map( constraint => constraint[2]))
            .all())

        return results.results.map( (res: any) => convertFromDbData(JSON.parse(res.json_data)))
    }

    async test_clear(collectionName: CollectionName) {
        await this.runSql(collectionName, () => this.db.prepare(`DELETE FROM ${collectionName}`).run())
    }
}
