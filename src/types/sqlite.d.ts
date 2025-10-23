// Type definitions for node:sqlite (experimental)
declare module 'node:sqlite' {
  export interface StatementResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  export interface PreparedStatement {
    run(...params: any[]): StatementResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
    finalize(): void;
  }

  export class DatabaseSync {
    constructor(path: string, options?: any);
    prepare(sql: string): PreparedStatement;
    exec(sql: string): void;
    close(): void;
  }
}