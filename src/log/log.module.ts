import { DynamicModule, Global, Module, ModuleMetadata, Provider, Type } from '@nestjs/common';
import { LOG_MODULE_OPTIONS, LOG_MODULE_PROVIDER } from './log.constants';
import { createLogProvider, createLogService } from './log.function';
import { LogModuleAsyncOptions, LogModuleFactory, LogModuleOptions } from './log.interface';

/**
 * 로거 모듈을 생성한다.
 */
@Global()
@Module({})
export class LogModule {

    /**
     * 로그서비스를 생성하기 위한 Option을 전달받아, 모듈을 정의하기 위한 Dynamic Module을 반환한다.
     * 
     * @param options 옵션
     * @returns 다이나믹 모듈
     */
    public static forRoot(options: LogModuleOptions): DynamicModule {
        const provider: Provider = createLogProvider(options);

        return {
            module: LogModule,
            providers: [provider],
            exports: [provider]
        };
    }

    /**
     * 로그서비스를 생성하는 Option을 전달받아, Dynamic 모듈을 반환한다.
     * 
     * @param options 옵션
     * @returns 다이나믹 모듈
     */
    public static forRootAsync(options: LogModuleAsyncOptions): DynamicModule {
        const provider: Provider = {
            inject: [LOG_MODULE_OPTIONS],
            provide: LOG_MODULE_PROVIDER,
            useFactory: async (options: LogModuleOptions) => createLogService(options)
        }

        return {
            module: LogModule,
            imports: options.imports,
            providers: [... this.createAsyncProviders(options), provider],
            exports: [provider]
        }
    }

    /**
     * 공급자를 생성한다.
     * 
     * @param options Log서비스 생성 옵션
     * @returns 공급자
     */
    private static createAsyncProviders(options: LogModuleAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }

        const useClass = options.useClass as Type<LogModuleFactory>;

        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: useClass,
                useClass
            }
        ];
    }

    /**
     * 로그서비스를 제공하기 위한 Provider를 생성한다.
     * 
     * @param options LogService를 생성하기 위한 Option
     * @returns 로그서비스를 제공하는 공급자
     */
    private static createAsyncOptionsProvider(options: LogModuleAsyncOptions): Provider {
        if (options.useFactory) { /* useFactory가 설정이 된 경우 */
            return {
                provide: LOG_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }

        /* useFactory가 설정이 안되어 있을 경우, LogService option을 제공하는 Factory를 설정한다. */
        const inject = [(options.useClass || options.useExisting) as Type<LogModuleFactory>];

        return {
            provide: LOG_MODULE_OPTIONS,
            useFactory: async (optionFactory: LogModuleFactory) =>
                await optionFactory.createLogModuleOptions(),
            inject
        }
    }
}