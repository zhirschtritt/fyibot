import db from './db';
import Fyi from './fyi';

const fyi = new Fyi(db);

async function test(): Promise<void> {
    await Promise.all([
      fyi.create('zach', 'this'),
      fyi.create('zach', 'also this'),
      fyi.create('zach', 'also that'),
    ]).catch(err => console.error('first err', err));
  
    const results = await fyi.find('this').catch(err => console.error(err));

    console.log(results);    
}

test();

