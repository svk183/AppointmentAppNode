import { MongoClient } from 'mongodb';
import { Constants } from '../constants';

let db: any;

async function connectToDB() {
    let mongoClient: MongoClient;
 
    try {
        mongoClient = new MongoClient(Constants.DB_URL);
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB!');
        
        db = mongoClient.db('akpCollectorate');
    } catch (error) {
        console.error('Connection to MongoDB failed!', error);
        process.exit();
    } finally {
        // await mongoClient.close();
    }
}

function getCollectionRef(collectionName: string) {
    return db.collection(collectionName);
}

async function findMutli(collectionName: string, query: any) {
    return db.collection(collectionName).find(query).toArray();
}

async function findOne(collectionName: string, query: any) {
    return db.collection(collectionName).findOne(query);
}

async function insertOne(collectionName: string, data: any) {
    await db.collection(collectionName).insertOne(data);
}

async function insertMulti(collectionName: string, data: any[]) {
    await db.collection(collectionName).insertMany(data);
}

async function updateOne(collectionName: string, query: any, updatedFields: any, upsert: boolean) {
    await db.collection(collectionName).updateOne(
        query,
        { $set: updatedFields },
        { upsert }
    );
}

async function updateMulti(collectionName: string, query: any, updatedFields: any, upsert: boolean) {
    await db.collection(collectionName).updateMany(
        query,
        { $set: updatedFields },
        { upsert }
    );
}

async function deleteOne(collectionName: string, query: any) {
    await db.collection(collectionName).deleteOne(query);
}

async function deleteMany(collectionName: string, query: any) {
    await db.collection(collectionName).deleteMany(query);
}
 
export const dbOperations = {
    connectToDB,
    getCollectionRef,
    findOne,
    findMutli,
    insertOne,
    insertMulti,
    updateOne,
    updateMulti,
    deleteOne,
    deleteMany
}