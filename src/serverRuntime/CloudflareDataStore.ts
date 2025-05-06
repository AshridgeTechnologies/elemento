import {BasicDataStore, CollectionName, ComplexCriteria, Criteria, DataStoreObject, Id} from '../runtime/DataStore'
import {D1Database, D1PreparedStatement} from "@cloudflare/workers-types/experimental"
import {mapObjIndexed} from 'ramda'
import CollectionConfig, {parseCollections} from '../shared/CollectionConfig'
import {isArray} from 'radash'


const convertValue = (value: any) => typeof value?.toDate === 'function' ? value.toDate() : value
const convertDocumentData = (data: any) => mapObjIndexed(convertValue, data)

type Properties = {env: object, bindingName: string, collections: string}

const normalizeCriteria = (criteria: Criteria): ComplexCriteria => {
    return isArray(criteria) ? criteria : Object.entries(criteria).map(([name, value]) => [name, '==', value])
}

export default class CloudflareDataStore implements BasicDataStore {
    private theDb: D1Database
    private readonly collections: CollectionConfig[]
    private initialised = false

    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
        this.theDb = props.env[props.bindingName as keyof object]
    }

    private async initialise() {
        const tableDdl = this.collections.map( coll => `CREATE TABLE IF NOT EXISTS "${coll.name}" ( "id" VARCHAR(256) PRIMARY KEY, "json_data" VARCHAR );`)
            .join('\n')
        await this.theDb.exec(tableDdl)
    }

    private async getDb(): Promise<D1Database>  {
        if (!this.initialised) {
            await this.initialise()
            this.initialised = true
        }
        return this.theDb
    }

    private checkCollection(collectionName: CollectionName) {
        if (!this.collections.some( coll => coll.name === collectionName)) {
            throw new Error(`Collection '${collectionName}' not found`)
        }
    }

    async getById(collectionName: CollectionName, id: Id, nullIfNotFound = false) {
        this.checkCollection(collectionName)
        const db = await this.getDb()
        const result: any = await db.prepare(`SELECT json_data FROM ${collectionName} WHERE id = ?`)
            .bind(id)
            .first();

        if (!result) {
            if (nullIfNotFound) {
                return null
            } else {
                throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
            }
        }
        const data = result.json_data as string
        return convertDocumentData(JSON.parse(data))
    }

    private async insertStmt(db: D1Database, collectionName: CollectionName) {
        return db.prepare(`INSERT INTO ${collectionName} (id, json_data) VALUES (?, ?)`)
    }

    private bindInsert(stmt: D1PreparedStatement, id: Id, item: DataStoreObject) {
        const itemWithId = {id, ...item}
        const jsonStr = JSON.stringify(itemWithId)
        return stmt.bind(id, jsonStr)
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        this.checkCollection(collectionName)
        const db = await this.getDb()
        const stmt = await this.insertStmt(db, collectionName)
        await this.bindInsert(stmt, id, item).run()
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        this.checkCollection(collectionName)
        const db = await this.getDb()
        const stmt = await this.insertStmt(db, collectionName)
        const boundStmts = Object.entries(items).map( ([id, item]) => this.bindInsert(stmt, id, item) )
        await db.batch(boundStmts)
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        this.checkCollection(collectionName)
        const db = await this.getDb()
        const jsonChanges = JSON.stringify(changes)
        await db.prepare(`UPDATE ${collectionName} SET json_data = json_patch(json_data, ?) WHERE id = ?`)
            .bind(jsonChanges, id)
            .run()
    }

    async remove(collectionName: CollectionName, id: Id) {
        this.checkCollection(collectionName)
        const db = await this.getDb()
        await db.prepare(`DELETE FROM ${collectionName} WHERE id = ?`)
            .bind(id)
            .run()
    }

    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        return []
    }

}
