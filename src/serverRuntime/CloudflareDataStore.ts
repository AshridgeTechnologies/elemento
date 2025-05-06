import {BasicDataStore, CollectionName, ComplexCriteria, Criteria, DataStoreObject, Id, SimpleCriteria} from '../runtime/DataStore'
import {D1Database} from "@cloudflare/workers-types/experimental"
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

    async getDb(): Promise<D1Database>  {
        if (!this.initialised) {
            await this.initialise()
            this.initialised = true
        }
        return this.theDb
    }

    async getById(collectionName: CollectionName, id: Id, nullIfNotFound = false) {
        const db = await this.getDb()
        const result: any = await db.prepare(`SELECT json_data FROM ${collectionName} WHERE id = ?`)
            .bind(id)
            .first();

        if (!result) {
            throw new Error(`Object with id '${id}' not found in collection '${collectionName}'`)
        }
        const data = result.json_data as string
        return convertDocumentData(JSON.parse(data))
    }

    async add(collectionName: CollectionName, id: Id, item: DataStoreObject) {
        const db = await this.getDb()
        const itemWithId = {id, ...item}
        const jsonStr = JSON.stringify(itemWithId)
        await db.prepare(`INSERT INTO ${collectionName} (id, json_data) VALUES (?, ?)`)
            .bind(id, jsonStr)
            .run()
    }

    async addAll(collectionName: CollectionName, items: { [p: Id]: DataStoreObject }): Promise<void> {

    }

    async update(collectionName: CollectionName, id: Id, changes: object) {

    }

    async remove(collectionName: CollectionName, id: Id) {

    }


    async query(collectionName: CollectionName, criteria: Criteria): Promise<Array<DataStoreObject>> {
        return []
    }

}
