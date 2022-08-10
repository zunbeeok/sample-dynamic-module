import { ModuleMetadata, Type } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * 로그 모듈의 실제 Option
 */
export interface LogModuleOptions {
    timeFormat: string,
    defaultLogger: string, /* 기본 로거 */
    namedLoggerOptions?: NamedLoggerOption[]
}

/**
 * 로거명과 로거옵션을 가지고 있는 구조체
 */
export interface NamedLoggerOption {
    name: string,
    loggerOptions?: LoggerOption[]
}

/**
 * 로거의 옵션
 */
export interface LoggerOption {
    type: string,
    level: string,
    datePattern?: string,
    dirname?: string,
    filename?: string,
}

/**
 * 로그 모듈 Factory
 * 
 * - createLogModuleOptions 함수를 이용하여 옵션을 생성해 준다.
 * - 옵션은 async와 sync를 함께 지원하는 구조로 구성한다.
 */
export interface LogModuleFactory {
    createLogModuleOptions: () =>
        | Promise<LogModuleOptions>
        | LogModuleOptions;
}

/**
 * 로그 모듈 imports
 * 
 * - LogModuleFactory는 createLogModuleOptions 함수를 구현하여 모듈에 사용되는 Option을 제공한다.
 * - useClass는 별도의 Classe를 이용하여 모듈을 제공한다.
 * - useExisting은 이미 생성된 Class를 이용하여 모듈을 제공한다.
 * - useFactory는 다양한 변수를 인자로 받아 LogModuleOption을 생성한다.
 */
export interface LogModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
    inject?: any[];
    useClass?: Type<LogModuleFactory>;
    useExisting?: Type<LogModuleFactory>;
    useFactory?: (...args: any[]) => Promise<LogModuleOptions> | LogModuleOptions;
}