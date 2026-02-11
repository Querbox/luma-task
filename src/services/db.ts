import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Task } from '../types';

interface LumaDB extends DBSchema {
    tasks: {
        key: string;
        value: Task;
        indexes: {
            'by-date': number;
            'by-completion': number; // 0 (false) or 1 (true)
        };
    };
}

const DB_NAME = 'luma-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LumaDB>>;

export const getDB = () => {
    if (!dbPromise) {
        // Request persistent storage
        if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then(persistent => {
                if (persistent) {
                    console.log('Storage will not be cleared except by explicit user action');
                } else {
                    console.log('Storage may be cleared under storage pressure');
                }
            });
        }

        dbPromise = openDB<LumaDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('tasks')) {
                    const store = db.createObjectStore('tasks', { keyPath: 'id' });
                    store.createIndex('by-date', 'dueDate');
                }
            },
        });
    }
    return dbPromise;
};
