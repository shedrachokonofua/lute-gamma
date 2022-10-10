import { RedisClient } from "@lute/shared";
import { Db } from "mongodb";
import { ProfileInteractor } from "./profile-interactor";
import { SeedLookupInteractor } from "./seeders";

export interface ServerContext {
  mongoDatabase: Db;
  redisClient: RedisClient;
  profileInteractor: ProfileInteractor;
  seedLookupInteractor: SeedLookupInteractor;
}
