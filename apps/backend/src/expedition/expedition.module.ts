import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingService } from '../olympiad/services/messaging.service.js';
import { ExpeditionController } from './expedition.controller.js';
import {
  EXPEDITION_COLLECTIONS,
  EXPEDITION_MODELS,
  ExpeditionCounterSchema,
  ExpeditionGlobalSchema,
  ExpeditionSchema,
} from './expedition.schema.js';
import { ExpeditionService } from './expedition.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EXPEDITION_MODELS.registration,
        schema: ExpeditionSchema,
        collection: EXPEDITION_COLLECTIONS.registrations,
      },
      {
        name: EXPEDITION_MODELS.counter,
        schema: ExpeditionCounterSchema,
        collection: EXPEDITION_COLLECTIONS.counters,
      },
      {
        name: EXPEDITION_MODELS.global,
        schema: ExpeditionGlobalSchema,
        collection: EXPEDITION_COLLECTIONS.globals,
      },
    ]),
  ],
  controllers: [ExpeditionController],
  providers: [ExpeditionService, MessagingService],
  exports: [ExpeditionService],
})
export class ExpeditionModule {}
