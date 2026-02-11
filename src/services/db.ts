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
        dbPromise = openDB<LumaDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('tasks')) {
                    const store = db.createObjectStore('tasks', { keyPath: 'id' });
                    store.createIndex('by-date', 'dueDate');
                    // For completed tasks we might want to index isCompleted, 
                    // or just filter in memory as dataset shouldn't be massive.
                    // Boolean indexing in IDB is a bit tricky, often use 0/1. 
                    // But for now, simple scan or memory filter is likely fine for personal task lists.
                }
            },
        });
    }
    return dbPromise;
};
