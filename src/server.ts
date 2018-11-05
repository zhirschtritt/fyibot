import express, {Request, Response} from 'express';
import {createEventAdapter} from '@slack/events-api';

import {FyiAdapter} from './FyiAdapter';
import db from './db';
import loggerFactory from './logger';

const log = loggerFactory('server');

const PORT = process.env.PORT || 3333 
const SLACK_SECRET = process.env.SLACK_SIGNING_SECRET;

const app = express();

// initialize adapters
const fyi = new FyiAdapter(db, loggerFactory('FyiAdapter'));
const slackEvents = createEventAdapter(SLACK_SECRET);

app.use('/slack/events', slackEvents.expressMiddleware());

slackEvents.on('reaction_added', (event) => {
  log.info({event}, `New event! Reaction ADDED`);
});

slackEvents.on('reaction_removed', (event) => {
  log.info({event}, `New event! Reaction REMOVED`);
});

slackEvents.on('error', log.error);

app.post('/fyi', (req: Request, res: Response) => {
  log.info(req.body, 'New POST to /fyi');
  
  fyi.create({
    eventTimestamp: new Date().toUTCString(),
    userName: req.body.user_name,
    content: req.body.text
  }).catch((err) => log.error({err}));

  res.send('OK');
})

app.post('/how', async (req: Request, res: Response) => {
  log.info(req.body, 'New POST to /how');

  const how = await fyi.find(req.body.text);

  res.send(JSON.stringify([how]));
})

app.listen(PORT, () => {
  log.info(`App is running at http://localhost:${PORT}`,
  );
});