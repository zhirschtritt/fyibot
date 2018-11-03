import Chance from 'chance';
import sqlite from 'sqlite';
import { Statement, Database } from 'sqlite';
import {assert} from 'chai';
import Fyi from '../src/Fyi';

const chance = new Chance();

async function fyiGenerator(fyi: Fyi, contents: string[]): Promise<Statement[]> {
  const fyis = contents.map(async (content): Promise<Statement> => {
    return fyi.create(chance.name(), content)
  });

  return Promise.all(fyis);
}

function createDb(): Promise<Database> {
  return Promise.resolve()
    .then(() => sqlite.open(':memory:', { promise: Promise }))
    .then(db => db.migrate({ force: 'last' }));
}

describe('Fyi', () => {
  let db: Promise<Database>;

  before(async () => {
    db = createDb();
  });
  
  it('should find relevent FYIs', async function() {
    const fyi = new Fyi(db);
    const content = [
      'something generate',
      'something generator',
      'something something',
    ]

    await fyiGenerator(fyi, content);
    const results = await fyi.find('generate');

    assert.isOk(results);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].content, content[0]);
  });
});