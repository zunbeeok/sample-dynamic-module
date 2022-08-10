import { Inject } from "@nestjs/common";
import * as winston from "winston";
import * as winstonDailyRollerFile from "winston-daily-rotate-file"
import * as ErrorStackParser from "error-stack-parser";

import { LOG_MODULE_OPTIONS } from "./log.constants";
import { LoggerOption, LogModuleOptions, NamedLoggerOption } from "./log.interface";

/**
 * 로거 서비스
 */
export class LogService {

    /**
     * 로그레벨 VERBOSE
     */
    public LOG_LEVEL_VERBOSE: number = 0;

    /**
     * 로그레벨 DEBUG
     */
    public LOG_LEVEL_DEBUG: number = 1;

    /**
     * 로그레벨 INFO
     */
    public LOG_LEVEL_INFO: number = 2;

    /**
     * 로그레벨 INFO
     */
    public LOG_LEVEL_WARN: number = 3;

    /**
     * 로그레벨 INFO
     */
    public LOG_LEVEL_ERROR: number = 4;

    /**
     * 로거 Map
     */
    private readonly loggerMap: Map<string, winston.Logger> = new Map<string, winston.Logger>();

    /**
     * 기본로거명
     */
    public readonly defaultLoggerName: string = "";

    /**
     * 생성자
     * 
     * @param logger 로거
     */
    constructor(
        @Inject(LOG_MODULE_OPTIONS) private readonly logOptions: LogModuleOptions
    ) {
        const { combine, timestamp, printf } = winston.format;
        const logFormat = printf(info => {
            return `[${info.timestamp}] - ${info.level}: ${info.message}`;
        });

        this.defaultLoggerName = logOptions.defaultLogger;
        if (!logOptions.namedLoggerOptions) {
            let logger = winston.createLogger({
                format: combine(
                    timestamp({
                        format: logOptions.timeFormat
                    }),
                    logFormat
                )
            });

            logger.add(new winston.transports.Console({
                level: "debug",
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple(),
                    logFormat
                )
            }));

            this.loggerMap.set(this.defaultLoggerName, logger);
        } else {
            let namedLoggerOption: NamedLoggerOption;
            let logOption: LoggerOption;
            for (namedLoggerOption of logOptions.namedLoggerOptions) {
                let logger = winston.createLogger({
                    format: combine(
                        timestamp({
                            format: logOptions.timeFormat
                        }),
                        logFormat
                    )
                });

                if (namedLoggerOption.loggerOptions) {
                    for (logOption of namedLoggerOption.loggerOptions) {
                        if (logOption.type.toUpperCase() == "FILE") {
                            logger.add(new winstonDailyRollerFile({
                                level: logOption.level,
                                datePattern: logOption.datePattern,
                                dirname: logOption.dirname,
                                filename: logOption.filename
                            }));
                        } else if (logOption.type.toUpperCase() == "CONSOLE") {
                            logger.add(new winston.transports.Console({
                                level: logOption.level,
                                format: winston.format.combine(
                                    winston.format.colorize(),
                                    winston.format.simple(),
                                    logFormat
                                )
                            }));
                        }
                    }
                } else {
                    logger.add(new winston.transports.Console({
                        level: logOption.level,
                        format: winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple(),
                            logFormat
                        )
                    }));
                }

                this.loggerMap.set(namedLoggerOption.name, logger);
            }
        }

        if (!this.loggerMap.get(this.defaultLoggerName)) {
            let logger = winston.createLogger({
                format: combine(
                    timestamp({
                        format: logOptions.timeFormat
                    }),
                    logFormat
                )
            });

            logger.add(new winston.transports.Console({
                level: "debug",
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple(),
                    logFormat
                )
            }));

            this.loggerMap.set(this.defaultLoggerName, logger);
        }
    }

    /**
     * 로그를 출력한다.
     * 
     * @param logLevel 로그레벨
     * @param logMeessage 메시지
     */
    public async log(logName: string, logLevel: number, logMeessage: string): Promise<void> {
        const fileLine: string = await this.getCallStack();
        this.writeLog(logName, logLevel, logMeessage, fileLine);
    }

    /**
     * 로그를 출력한다.
     * 
     * @param logName 로거명
     * @param logLevel 로그레벨
     * @param logMeessage 메시지
     */
    private async writeLog(logName: string, logLevel: number, logMeessage: string, fileLine: string): Promise<void> {
        let logger: winston.Logger = this.loggerMap.get(logName);
        let printLoggerName: string = logName;

        if (!logger) {
            logger = this.loggerMap.get(this.defaultLoggerName);
            printLoggerName = this.defaultLoggerName;
        }

        switch (logLevel) {
            case this.LOG_LEVEL_DEBUG:
                logger.debug(`<${printLoggerName}> [${fileLine}] ${logMeessage}`);
                break;
            case this.LOG_LEVEL_INFO:
                logger.info(`<${printLoggerName}> [${fileLine}] ${logMeessage}`);
                break;
            case this.LOG_LEVEL_WARN:
                logger.warn(`<${printLoggerName}> [${fileLine}] ${logMeessage}`);
                break;
            case this.LOG_LEVEL_ERROR:
                logger.error(`<${printLoggerName}> [${fileLine}] ${logMeessage}`);
                break;
            default:
                logger.verbose(`<${printLoggerName}> [${fileLine}] ${logMeessage}`);
                break;
        }
    }

    /**
     * caller의 정보를 출력한다.
     * 
     * @returns caller의 정보
     */
    private async getCallStack(): Promise<string> {
        let stackFrames: StackFrame[] = ErrorStackParser.parse(new Error());
        if (stackFrames.length > 2) {
            let fileName = stackFrames[2].fileName.indexOf("/") > -1 ? stackFrames[2].fileName.split("/").pop() : stackFrames[2].fileName;
            return `${fileName}.${stackFrames[2].functionName}:${stackFrames[2].lineNumber}`;
        } else {
            return "Unknown";
        }
    }
}