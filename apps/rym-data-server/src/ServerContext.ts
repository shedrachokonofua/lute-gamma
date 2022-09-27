import { MongoClient, Db } from "mongodb";

export interface ServerContext {
  port: number;
  mongoClient: MongoClient;
  mongoDatabase: Db;
}
