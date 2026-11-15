import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { config } from './config.js';

async function bootstrap() {
  console.log('[startup] config loaded, creating the app');
  // rawBody: the Razorpay and WhatsApp webhooks verify signatures on the exact bytes they sent.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: '100kb' });
  await app.listen(config.port);
  console.log('[startup] app ready');
}
await bootstrap();
