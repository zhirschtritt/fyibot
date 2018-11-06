import { LoggerFactory } from "./logger";
import { Logger } from "pino";
import { FyiAdapter } from "./FyiAdapter";
import { WebClient } from "@slack/client";

export interface SlackReactionEvent {
  type: `reaction_added` | `reaction_removed`,
  user: string,
  reaction: string,
  item_user: string,
  item: {
      type: string, // message, file, file_comment
      channel?: string,
      ts?: string, 
  },
  event_ts: string
}

export class SlackEventHandler {
  private readonly log: Logger;
  private readonly fyiAdapter: FyiAdapter;
  private readonly slack: WebClient;

  constructor(slackClient: WebClient, fyiAdapter: FyiAdapter, logger: LoggerFactory) {
    this.log = logger('SlackEventHandler');
    this.fyiAdapter = fyiAdapter;
    this.slack = slackClient;
  }

  public async reactionAdded(event: SlackReactionEvent): Promise<void> {
    if (!this.isValidReactionType) {
      this.log.debug({event}, 'Invalid reaction event type, must be type message');
      return Promise.reject();
    }

    const {messages: [triggeringMessage]} = await this.getTriggerMessage(event.item.channel, event.event_ts);

    const fyi = {
      eventTimestamp: triggeringMessage.ts,
      userName: triggeringMessage.user,
      content: triggeringMessage.text,
    };

    (this.fyiAdapter.create(fyi))
      .then(() => this.log.info({fyi}, 'New FYI'))
      .catch((err) => this.log.error({err}));

    return Promise.resolve();
  }

  public async reactionRemoved(event: SlackReactionEvent) {
    if (!this.isValidReactionType) {
      this.log.debug({event}, 'Invalid reaction event type, must be type message');
      return Promise.reject();
    }

    const triggeringMessage = await this.getTriggerMessage(event.item.channel, event.event_ts);

    (this.fyiAdapter.delete(triggeringMessage.ts)
      .then(() => this.log.info({triggeringMessage}, 'Removing FYI'))
      .catch((err) => this.log.error({err})));

    return Promise.resolve();
  }

  private isValidReactionType(eventItemType: string) {
    if (eventItemType === 'message') {
      return true;
    }
    return false;
  }

  private async getTriggerMessage(channel: string, event_ts: string): Promise<any> {
    return this.slack.channels.history({
      channel,
      latest: event_ts,
      count: 1,
      inclusive: true,
    });
  }
}