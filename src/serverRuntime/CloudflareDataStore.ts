import {BasicDataStore, CollectionName, ComplexCriteria, Criteria, DataStoreObject, Id} from '../runtime/DataStore'
import {D1Database, D1PreparedStatement} from "@cloudflare/workers-types/experimental"
import {mapObjIndexed} from 'ramda'
import CollectionConfig, {parseCollections} from '../shared/CollectionConfig'
import {isArray} from 'radash'
import {convertIsoDate, isoDateRegex} from '../util/helpers'
import BigNumber from 'bignumber.js'

const DECIMAL_PREFIX = '#Dec'
const convertToDbValue = (value: any) => value instanceof BigNumber ? DECIMAL_PREFIX + value : value
const convertToDbData = (data: any) => mapObjIndexed(convertToDbValue, data)


const convertFromDbValue = (value: any) => {
    if (typeof value === 'string' && value.match(isoDateRegex)) {
        return convertIsoDate(value)
    }
    if (typeof value === 'string' && value.startsWith(DECIMAL_PREFIX)) {
        return new BigNumber(value.substring(DECIMAL_PREFIX.length))
    }

    return value
}
const convertFromDbData = (data: any) => mapObjIndexed(convertFromDbValue, data)

type Properties = {env: object, bindingName: string, collections: string}

const normalizeCriteria = (criteria: Criteria): ComplexCriteria => {
    return isArray(criteria) ? criteria : Object.entries(criteria).map(([name, value]) => [name, '=', value])
}

function asJsonString(changes: object) {
    return JSON.stringify(convertToDbData(changes))
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
            .first()

        if (!result) {
            if (nullIfNotFound) {
                return null
            } else {
                throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
            }
        }
        const data = result.json_data as string
        return convertFromDbData(JSON.parse(data))
    }

    private async insertStmt(db: D1Database, collectionName: CollectionName) {
        return db.prepare(`INSERT INTO ${collectionName} (id, json_data) VALUES (?, ?)`)
    }

    private bindInsert(stmt: D1PreparedStatement, id: Id, item: DataStoreObject) {
        const itemWithId = {id, ...item}
        const jsonStr = asJsonString(itemWithId)
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
        const jsonChanges = asJsonString(changes)
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
        this.checkCollection(collectionName)
        const db = await this.getDb()
        const constraints = normalizeCriteria(criteria)
        const conditionClauses = constraints.map( constraint => {
            const [name, op] = constraint
            return `json_data ->> '$.${name}' ${op} ?`
        }).join(' AND ')
        const sql = `SELECT json_data FROM ${collectionName} WHERE ${conditionClauses}`
        const bindValues = constraints.map( constraint => constraint[2])
        console.log(sql, '\n', bindValues)
        const results = await db.prepare(sql)
            .bind(...constraints.map( constraint => constraint[2]))
            .all()

        return results.results.map( (res: any) => convertFromDbData(JSON.parse(res.json_data)))
    }

    async test_clear(collectionName: CollectionName) {
        this.checkCollection(collectionName)
        const db = await this.getDb()
        await db.prepare(`DELETE FROM ${collectionName}`).run()
    }

}
