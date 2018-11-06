import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {createEventAdapter} from '@slack/events-api';
import {WebClient} from '@slack/client';

import {FyiAdapter} from './FyiAdapter';
import db from './db';
import {logger} from './logger';
import { SlackEventHandler } from './SlackEventHandler';

const app = express();
const log = logger('server');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const jsonParser = bodyParser.json()

const PORT = process.env.PORT || 3333 
const SLACK_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_TOKEN = process.env.SLACK_TOKEN;

// initialize modules
const fyiAdapter = new FyiAdapter(db, logger);
const slackEvents = createEventAdapter(SLACK_SECRET);
const slackEventHanlder = new SlackEventHandler(new WebClient(SLACK_TOKEN), fyiAdapter, logger);

app.use('/slack/events', slackEvents.expressMiddleware());

slackEvents.on('reaction_added', (event) => {
  log.info({event}, `New event! Reaction ADDED`);
  slackEventHanlder.reactionAdded(event);
});

slackEvents.on('reaction_removed', (event) => {
  log.info({event}, `New event! Reaction REMOVED`);
  slackEventHanlder.reactionRemoved(event);
});

slackEvents.on('error', log.error);

app.post('/how', urlencodedParser, jsonParser, async (req: Request, res: Response) => {
  log.info(req.body, 'New POST to /how');
  
  const how = await fyiAdapter.find(req.body.text);
  
  res.send(JSON.stringify([how])); 
  // TODO: implement fyiResponseFactory
  // TODO: format response to make super freakin pretty with 'time since published' and nicely formatted fyi responses
})

app.listen(PORT, () => {
  log.info(`App is running at http://localhost:${PORT}`,
  );
});
        // app.post('/fyi', (req: Request, res: Response) => {
        //   log.info(req.body, 'New POST to /fyi');
          
        //   fyi.create({
        //     eventTimestamp: new Date().toUTCString(),
        //     userName: req.body.user_name,
        //     content: req.body.text
        //   }).catch((err) => log.error({err}));
        
        //   res.send('OK');
        // })