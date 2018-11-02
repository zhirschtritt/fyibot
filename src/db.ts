import sqlite from 'sqlite';

const dbLocaton = `./storage/db.${process.env.NODE_ENV || 'develop'}.sqlite`;

export default Promise.resolve()
  .then(() => sqlite.open(dbLocaton, { promise: Promise }))
  .then((db) => db.migrate({}));