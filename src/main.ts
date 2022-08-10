import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as stack from "callsite"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(23000);
}
bootstrap();
