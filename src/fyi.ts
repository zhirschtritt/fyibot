import { Database, Statement } from 'sqlite';
import SQL from 'sql-template-strings';

export default class Fyi {
  constructor(private db: Promise<Database>) {
    this.db = db;
  }
  
  public async create(userName: string, content: string): Promise<Statement> {
    const db = await this.db;

    return await db.run(
      SQL`INSERT INTO fyi (timestamp, userName, content) 
      VALUES (${new Date().toISOString()}, ${userName}, ${content})`
    )
  }

  public async find(search: string) {
    if (!this.validateSearchTerm(search)) {
      console.log({search}, 'Invalid search term');
    };

    const db = await this.db;

    const results = await db.all(
      SQL`SELECT * FROM fyi WHERE fyi = ${search} ORDER BY rank LIMIT 5`
    );

    return results;
  }

  private validateSearchTerm(search: string): boolean {
    if (search.length > 0) return true;
    return false;
  }
}