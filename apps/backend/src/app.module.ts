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
    }),
    OlympiadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
