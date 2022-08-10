import { Provider } from "@nestjs/common";
import { LOG_MODULE_PROVIDER } from "./log.constants";
import { LogModuleOptions } from "./log.interface"
import { LogService } from "./log.service"

/**
 * 로그서비스를 생성하는 핵심 함수
 */
export function createLogService(options: LogModuleOptions): LogService {
    return new LogService(options);
}

/**
 * 모듈에 사용되는 서비스 제공자를 구성하는 함수
 * 이 함수가 호출되는 시점에 LogService가 생성된다.
 * 
 * - nestjs의 모듈을 제공하는 공급자(Provider)를 반환한다.
 * - 공급자는 해당 모듈이 제공한는 서비스의 식별자와 실제값으로 구성한다.
 */
export function createLogProvider(options: LogModuleOptions): Provider {
    return {
        provide: LOG_MODULE_PROVIDER,
        useValue: createLogService(options)
    };
}