import {BasicDataStore, CollectionName, ComplexCriteria, Criteria, DataStoreObject, Id} from '../shared/DataStore'
import {D1Database, D1PreparedStatement} from "@cloudflare/workers-types/experimental"
import CollectionConfig, {parseCollections} from '../shared/CollectionConfig'
import {isArray} from 'radash'
import {convertFromDbData, convertToDbData} from '../shared/convertData'
import {ElementMetadata, ElementSchema} from '../model/ModelElement'
import {Definitions} from '../model/schema'

type Properties = {database: D1Database, collections: string}

const normalizeCriteria = (criteria: Criteria): ComplexCriteria => {
    return isArray(criteria) ? criteria : Object.entries(criteria).map(([name, value]) => [name, '=', value])
}

function asJsonString(changes: object) {
    return JSON.stringify(convertToDbData(changes))
}

export const CloudflareDataStoreSchema: ElementSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Cloudflaredatastore",
    "description": "Description of CloudflareDataStore",
    "type": "object",
    "$ref": "#/definitions/BaseElement",
    "kind": "CloudflareDataStore",
    "icon": "fireplace",
    "elementType": "statefulUI",
    "parentType": "App",
    "properties": {
        "properties": {
            "type": "object",
            "unevaluatedProperties": false,
            "properties": {
                "collections": {
                    "description": "The ",
                    "$ref": "#/definitions/StringMultiline"
                },
                "databaseName": {
                    "description": "The ",
                    "type": "string"
                },
                "databaseId": {
                    "description": "The ",
                    "type": "string"
                }
            }
        }
    },
    "required": [
        "kind",
        "properties"
    ],
    "unevaluatedProperties": false,
    "definitions": Definitions
}

export const CloudflareDataStoreMetadata: ElementMetadata = {
    "stateProps": ['collections', 'databaseName', 'databaseId' ]
}

export default class CloudflareDataStore implements BasicDataStore {
    private db: D1Database
    private readonly collections: CollectionConfig[]

    constructor(private props: Properties) {
        this.collections = parseCollections(props.collections ?? '')
        this.db = props.database
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
        const result: any = await this.runSql(collectionName, () => this.db.prepare(`SELECT json_data FROM ${collectionName} WHERE id = ?`)
            .bind(id)
            .first() )

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

    private insertStmt(collectionName: CollectionName) {
        return this.db.prepare(`INSERT INTO ${collectionName} (id, json_data) VALUES (?, ?)`)
    }

    private bindInsert(stmt: D1PreparedStatement, id: Id, item: DataStoreObject) {
        const itemWithId = {id, ...item}
        const jsonStr = asJsonString(itemWithId)
        return stmt.bind(id, jsonStr)
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        const stmt = this.insertStmt(collectionName)
        await this.runSql(collectionName, () => this.bindInsert(stmt, id, item).run())
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {
        const stmt = this.insertStmt(collectionName)
        const boundStmts = Object.entries(items).map( ([id, item]) => this.bindInsert(stmt, id, item) )
        await this.runSql(collectionName, () => this.db.batch(boundStmts) )
    }

    async update(collectionName: CollectionName, id: Id, changes: object) {
        const jsonChanges = asJsonString(changes)
        await this.runSql(collectionName, () => this.db.prepare(`UPDATE ${collectionName} SET json_data = json_patch(json_data, ?) WHERE id = ?`)
            .bind(jsonChanges, id)
            .run() )
    }

    async remove(collectionName: CollectionName, id: Id) {
        await this.runSql(collectionName, () => this.db.prepare(`DELETE FROM ${collectionName} WHERE id = ?`)
            .bind(id)
            .run() )
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

;(CloudflareDataStore as any).Schema = CloudflareDataStoreSchema
;(CloudflareDataStore as any).Metadata = CloudflareDataStoreMetadata
