import { FileName, PageType } from "./file-name";
import { ulid, decodeTime } from "ulid";

export class FileMetadata {
  private constructor(
    public readonly id: string,
    private readonly fileName: FileName,
    public readonly lastSavedAt: Date
  ) {}

  static create(name: string): FileMetadata {
    const now = new Date();
    return new FileMetadata(ulid(now.getTime()), new FileName(name), now);
  }

  static fromPersistence(
    id: string,
    name: string,
    lastSavedAt: Date
  ): FileMetadata {
    return new FileMetadata(id, new FileName(name), new Date(lastSavedAt));
  }

  get createdAt(): Date {
    return new Date(decodeTime(this.id));
  }

  get name(): string {
    return this.fileName.value;
  }

  get pageType(): PageType {
    return this.fileName.pageType;
  }

  get isMhtml(): boolean {
    return this.fileName.isMhtml;
  }
}
