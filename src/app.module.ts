import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Bull from 'bull';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { TransformableInfo } from 'logform';
import { SampleConsumer } from './app.consumer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogModule } from './log/log.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
      , envFilePath: [".env.production", "./env.staging"]
    }),

    LogModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeFormat: "YYYY-MM-DD HH:mm:ss.SSS",
        defaultLogger: "default",
        namedLoggerOptions: [
          {
            name: "default",
            loggerOptions: [
              {
                type: "Console",
                level: "debug"
              }
            ]
          },
          {
            name: "test",
            loggerOptions: [
              {
                type: "File",
                level: "info",
                datePattern: "YYYY-MM-DD",
                dirname: "logs",
                filename: "test_info.log"
              },
              {
                type: "File",
                level: "error",
                datePattern: "YYYY-MM-DD",
                dirname: "logs",
                filename: "test_error.log"
              },
              {
                type: "Console",
                level: "debug"
              }
            ]
          },
          {
            name: "sample",
            loggerOptions: [
              {
                type: "File",
                level: "info",
                datePattern: "YYYY-MM-DD",
                dirname: "logs",
                filename: "sample_info.log"
              },
              {
                type: "File",
                level: "error",
                datePattern: "YYYY-MM-DD",
                dirname: "logs",
                filename: "sample_error.log"
              },
              {
                type: "Console",
                level: "debug"
              }
            ]
          }
        ],
        loggerOptions: [
          {
            type: "Console",
            level: "debug"
          },
        ]
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
