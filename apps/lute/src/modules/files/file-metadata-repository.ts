import { FileMetadata } from "@lute/domain";
import { RedisClient } from "../../lib";

export class FileMetadataRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private static getKey = (id: string) => `file-metadata:${id}`;

  private static getNameIndexKey = (name: string) =>
    `file-metadata:name:${name}`;

  public async findById(id: string): Promise<FileMetadata | null> {
    const key = FileMetadataRepository.getKey(id);
    const record = await this.redisClient.hGetAll(key);
    return record
      ? FileMetadata.fromPersistence(
          id,
          record.name,
          new Date(record.lastSavedAt)
        )
      : null;
  }

  public async findByName(name: string): Promise<FileMetadata | null> {
    const id = await this.redisClient.get(
      FileMetadataRepository.getNameIndexKey(name)
    );
    return id ? this.findById(id) : null;
  }

  private async create(name: string): Promise<FileMetadata> {
    if (await this.findByName(name)) {
      throw new Error(`File with name ${name} already exists`);
    }

    const fileMetadata = FileMetadata.create(name);
    const key = FileMetadataRepository.getKey(fileMetadata.id);

    const transaction = this.redisClient.multi();
    transaction.hSet(key, "name", fileMetadata.name);
    transaction.hSet(
      key,
      "lastSavedAt",
      fileMetadata.lastSavedAt.toISOString()
    );
    transaction.set(
      FileMetadataRepository.getNameIndexKey(fileMetadata.name),
      fileMetadata.id
    );
    await transaction.exec();

    return fileMetadata;
  }

  public async upsert(name: string): Promise<FileMetadata> {
    const file = await this.findByName(name);

    if (!file) {
      return this.create(name);
    }

    const lastSavedAt = new Date();

    this.redisClient.hSet(
      FileMetadataRepository.getKey(file.id),
      "lastSavedAt",
      lastSavedAt.toISOString()
    );

    return FileMetadata.fromPersistence(file.id, file.name, lastSavedAt);
  }

  public async delete(name: string): Promise<void> {
    const file = await this.findByName(name);
    if (!file) {
      return;
    }

    const transaction = this.redisClient.multi();
    transaction.del(FileMetadataRepository.getKey(file.id));
    transaction.del(FileMetadataRepository.getNameIndexKey(file.name));
    await transaction.exec();
  }
}
