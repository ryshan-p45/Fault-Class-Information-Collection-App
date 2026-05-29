import { IStorage } from './types';

let _storage: IStorage | undefined;

export function getStorage(): IStorage {
  if (!_storage) {
    const type = process.env.STORAGE_TYPE || 'postgres';
    if (type === 'json') {
      const { CsvStorage } = require('./csv');
      _storage = new CsvStorage() as IStorage;
    } else {
      const { PostgresStorage } = require('./postgres');
      _storage = new PostgresStorage() as IStorage;
    }
  }
  return _storage!;
}

export type { IStorage } from './types';
