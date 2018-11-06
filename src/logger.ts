import pino, {LoggerOptions, Logger} from 'pino';

const loggerOptions: LoggerOptions = process.env.NODE_ENV === 'production' ? {} : {prettyPrint: true};

export interface LoggerFactory {
  (component: string): Logger
}

export function logger(component: string = ''): Logger {
  return pino(Object.assign(loggerOptions, {component}));
}