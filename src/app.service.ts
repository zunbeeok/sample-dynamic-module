import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from "bull";
import { LOG_MODULE_PROVIDER } from './log/log.constants';
import { LogService } from './log/log.service';

@Injectable()
export class AppService {

  /**
   * 생성자
   * 
   * @param redisService 레디스 서비스
   */
  constructor(
    @Inject(LOG_MODULE_PROVIDER) private readonly logger: LogService
  ) { }

  /**
   * 기본 처리
   * 
   * @returns 
   */
  async getHello() {

    try {
      this.logger.log(this.logger.defaultLoggerName, this.logger.LOG_LEVEL_DEBUG, "Hello World");
      this.logger.log(this.logger.defaultLoggerName, this.logger.LOG_LEVEL_INFO, "Hello World");
      this.logger.log("test", this.logger.LOG_LEVEL_INFO, "TEST Hello World");
      this.logger.log("test", this.logger.LOG_LEVEL_ERROR, "TEST Hello World");
      this.logger.log("test", this.logger.LOG_LEVEL_DEBUG, "TEST Hello World");
      this.logger.log(this.logger.defaultLoggerName, this.logger.LOG_LEVEL_INFO, "Hello World");
      this.logger.log("sample", this.logger.LOG_LEVEL_DEBUG, "TEST Hello World");
      this.logger.log("sample", this.logger.LOG_LEVEL_ERROR, "TEST Hello World");
    } catch (e) {
      console.error(e);
    }
  }
}
