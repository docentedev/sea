import { DatabaseSync } from 'node:sqlite';
import { DB_SCHEMA } from './schema.js';

export class DatabaseMigration {
    constructor(private db: DatabaseSync) { }

    /**
     * Migrate database to support nullable user_id in files and folders tables
     * This changes foreign key constraints from NOT NULL to nullable with ON DELETE SET NULL
     */
    async migrateToNullableUserId(): Promise<void> {
        console.log('🔄 Starting database migration for nullable user_id...');

        try {
            // Check if migration is needed by looking at table schema
            const tableInfo = this.db.prepare("PRAGMA table_info(files)").all() as Array<{ name: string; notnull: number }>;
            const userIdColumn = tableInfo.find(col => col.name === 'user_id');

            if (userIdColumn && userIdColumn.notnull === 0) {
                console.log('✅ Database already migrated (user_id is nullable)');
                return;
            }

            console.log('📋 Migration needed. Backing up data...');

            // Backup existing data
            const files = this.db.prepare("SELECT * FROM files").all() as Array<Record<string, unknown>>;
            const folders = this.db.prepare("SELECT * FROM folders").all() as Array<Record<string, unknown>>;

            console.log(`📦 Backed up ${files.length} files and ${folders.length} folders`);

            // Drop existing tables
            console.log('🗑️ Dropping existing tables...');
            this.db.exec('DROP TABLE IF EXISTS files');
            this.db.exec('DROP TABLE IF EXISTS folders');

            // Recreate tables with new schema
            console.log('🏗️ Recreating tables with nullable user_id...');
            this.db.exec(DB_SCHEMA.FILES_TABLE);
            this.db.exec(DB_SCHEMA.FILES_TRIGGER);
            this.db.exec(DB_SCHEMA.FOLDERS_TABLE);
            this.db.exec(DB_SCHEMA.FOLDERS_TRIGGER);

            // Restore data
            console.log('🔄 Restoring data...');

            // Restore files
            const insertFile = this.db.prepare(`
        INSERT INTO files (id, filename, original_filename, path, size, mime_type, user_id, folder_path, virtual_folder_path, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

            for (const file of files) {
                insertFile.run(
                    file.id,
                    file.filename,
                    file.original_filename,
                    file.path,
                    file.size,
                    file.mime_type,
                    file.user_id,
                    file.folder_path,
                    file.virtual_folder_path,
                    file.created_at,
                    file.updated_at
                );
            }

            // Restore folders
            const insertFolder = this.db.prepare(`
        INSERT INTO folders (id, name, path, parent_path, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

            for (const folder of folders) {
                insertFolder.run(
                    folder.id,
                    folder.name,
                    folder.path,
                    folder.parent_path,
                    folder.user_id,
                    folder.created_at,
                    folder.updated_at
                );
            }

            console.log('✅ Migration completed successfully!');
            console.log(`📊 Restored ${files.length} files and ${folders.length} folders`);

        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }
}