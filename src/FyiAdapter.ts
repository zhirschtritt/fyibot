import { Database, Statement } from 'sqlite';
import SQL from 'sql-template-strings';
import { Logger } from 'pino';
import { LoggerFactory } from './logger';

export interface fyi {
  eventTimestamp: string,
  userName: string,
  content: string,
}
export class FyiAdapter {
  private log: Logger;
  private db: Promise<Database>

  constructor(db: Promise<Database>, logger: LoggerFactory) {
    this.db = db;
    this.log = logger('FYI Adapter');
  }
  
  public async create(fyi: fyi): Promise<Statement> {
    const db = await this.db;

    return db.run(
      SQL`INSERT INTO fyi (eventTimestamp, userName, content) 
      VALUES (${fyi.eventTimestamp}, ${fyi.userName}, ${fyi.content})`
    )
  }

  public async delete(eventTimestamp: string): Promise<Statement> {
    const db = await this.db;

    return db.run(
      SQL`DELETE FROM fyi WHERE eventTimestamp = ${eventTimestamp}`
    )
  }

  public async find(search: string): Promise<fyi[]> {
    if (!this.validateSearchTerm(search)) {
      this.log.error({search}, 'Invalid search term');

      return Promise.reject('Invalid search term');
    };

    const db = await this.db;

    const results = db.all(
      SQL`SELECT * FROM fyi WHERE fyi = ${search} ORDER BY rank LIMIT 5`
    );

    return results;
  }

  private validateSearchTerm(search: string): boolean {
    if (search.length < 1) return false;
    return true;
  }
}