import { Controller, Get, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config.js';
import { OlympiadModule } from './olympiad/olympiad.module.js';

@Controller()
class HealthController {
  @Get()
  health() {
    return { ok: true };
  }
}

@Module({
  imports: [
    MongooseModule.forRoot(config.database.url, {
      dbName: config.database.name,
      // The website's Payload admin owns the indexes of the collections both apps share.
      autoIndex: false,
      // Fail fast with the driver's error instead of hanging a serverless start-up.
      retryAttempts: 1,
      serverSelectionTimeoutMS: 5000,
      onConnectionCreate: (connection) => {
        connection.on('connected', () =>
          console.log('[startup] database connected'),
        );
        connection.on('error', (err: Error) =>
          console.error('[startup] database error:', err.message),
        );
      },
    }),
    OlympiadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
