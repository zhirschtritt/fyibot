import pino, {LoggerOptions, Logger} from 'pino';

const loggerOptions: LoggerOptions = process.env.NODE_ENV === 'production' ? {} : {prettyPrint: true};

export default function (name: string = ''): Logger {
  return pino(Object.assign(loggerOptions, {name}));
}