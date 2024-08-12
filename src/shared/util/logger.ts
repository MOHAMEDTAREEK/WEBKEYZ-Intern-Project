import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

/**
 * Creates a logger instance with specified configurations.
 * @returns {Logger} The configured logger instance.
 */

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level}]: ${message}`;
});

const logger = createLogger({
  level: "debug",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new transports.Console({
      format: combine(
        colorize({
          all: true,
        }),
        logFormat
      ),
    }),
    new DailyRotateFile({
      filename: "logs/%DATE%-all.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        logFormat
      ),
    }),
    new DailyRotateFile({
      filename: "logs/%DATE%-error.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        logFormat
      ),
    }),
  ],
});

export default logger;
