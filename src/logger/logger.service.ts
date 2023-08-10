import { Injectable, LoggerService, Logger, LogLevel } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class MyLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info', // Set the minimum log level
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}] ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(), // Log to console
        new winston.transports.File({
          filename: path.resolve(__dirname, '../../logs/app.log'), // Log to a file
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.log('info', message, { context });
  }

  error(message: string, trace: string, context?: string) {
    this.logger.log('error', message, { context, trace });
  }

  warn(message: string, context?: string) {
    this.logger.log('warn', message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.log('debug', message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.log('verbose', message, { context });
  }

  setLogLevels(levels: LogLevel[]) {
    this.logger.transports.forEach((transport) => {
      if (transport instanceof winston.transports.Console) {
        transport.level = levels.includes('log') ? 'debug' : 'info';
      } else if (transport instanceof winston.transports.File) {
        transport.level = 'info';
      }
    });
  }
}
