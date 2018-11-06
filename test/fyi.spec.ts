import Chance from 'chance';
import sqlite from 'sqlite';
import {Statement, Database} from 'sqlite';
import {assert} from 'chai';
import {FyiAdapter} from '../src/FyiAdapter';
import {logger} from '../src/logger';

const chance = new Chance();

async function createFyis(fyi: FyiAdapter, contents: string[], timestamp?: string): Promise<Statement[]> {
  const fyis = contents.map(async (content): Promise<Statement> => {
    return fyi.create({
      eventTimestamp: timestamp || new Date().toUTCString(), 
      userName: chance.name(), 
      content
    })
  });

  return Promise.all(fyis);
}

function createDb(): Promise<Database> {
  // return in-memory sqlite db
  return Promise.resolve()
    .then(() => sqlite.open(':memory:', { promise: Promise }))
    .then(db => db.migrate({ force: 'last' }));
}

describe('FyiAdapter', () => {
  let db: Promise<Database>;
  let fyi: FyiAdapter;

  const fyisSampleContent = [
    'something generate',
    'something generate otherthing',
    'something generator',
    'something generation',
  ]

  beforeEach(async () => {
    db = createDb();
    fyi = new FyiAdapter(db, logger);
  });
  
  it('should find relevent FYIs using exact qouted phrase', async function() {
    await createFyis(fyi, fyisSampleContent);
    const results = await fyi.find('"something generate otherthing"');

    assert.isOk(results);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].content, fyisSampleContent[1], 'using phrase operator');
  });

  it('should find relevent FYIs when using special sql operators (OR NOT)', async function() {
    await createFyis(fyi, fyisSampleContent);
    const results = await fyi.find('generate OR generator NOT generation');
    const foundFyis = results.map((fyi) => fyi.content)

    assert.isOk(results);
    assert.strictEqual(results.length, 3);
    assert.includeDeepMembers(foundFyis, fyisSampleContent.slice(0,3), 'using OR');
    assert.notDeepInclude(foundFyis, fyisSampleContent[3], 'using NOT');
  });

  it('should find relevent FYIs when using token prefix queries (*)', async function() {
    await createFyis(fyi, fyisSampleContent);
    const results = await fyi.find('generat*');
    const foundFyis = results.map((fyi) => fyi.content)

    assert.isOk(results);
    assert.strictEqual(results.length, 4);
    assert.includeDeepMembers(foundFyis, fyisSampleContent);
  });

  it('should delete specified FYI indicated by eventTimestamp', async function() {
    await createFyis(fyi, fyisSampleContent);
    await createFyis(fyi, ['something should delete this'], '1234567');
    
    const deleteThisFyi = await fyi.find('"something should delete this"');
    assert.isOk(deleteThisFyi[0]);

    await fyi.delete('1234567');
    
    const allFyis = await fyi.find('something');
    assert.isNotEmpty(allFyis);
    assert.strictEqual(allFyis.length, 4);
    assert.notDeepInclude(allFyis.map(f => f.eventTimestamp), ['1234567']);
  });
});