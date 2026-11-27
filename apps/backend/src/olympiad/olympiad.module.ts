import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpeditionModule } from '../expedition/expedition.module.js';
import { OlympiadController } from './olympiad.controller.js';
import {
  AmbassadorSchema,
  COLLECTIONS,
  CounterSchema,
  GlobalSchema,
  MODELS,
  PartnerRequestSchema,
  PaymentSchema,
  PersonSchema,
  ReferralClickSchema,
  SchoolSchema,
} from './schemas.js';
import { AmbassadorEnrolService } from './services/ambassador-enrol.service.js';
import { CountersService } from './services/counters.service.js';
import { FormsService } from './services/forms.service.js';
import { LinksService } from './services/links.service.js';
import { MessagingService } from './services/messaging.service.js';
import { NotifyService } from './services/notify.service.js';
import { PartnersService } from './services/partners.service.js';
import { PaymentsService } from './services/payments.service.js';
import { RegistrationsService } from './services/registrations.service.js';
import { SchoolStudentsService } from './services/school-students.service.js';
import { SettingsService } from './services/settings.service.js';
import { WebhooksController } from './webhooks.controller.js';

@Module({
  imports: [
    // The Razorpay and WhatsApp webhooks are shared with the expedition registration.
    ExpeditionModule,
    MongooseModule.forFeature([
      {
        name: MODELS.person,
        schema: PersonSchema,
        collection: COLLECTIONS.people,
      },
      {
        name: MODELS.partnerRequest,
        schema: PartnerRequestSchema,
        collection: COLLECTIONS.partnerRequests,
      },
      {
        name: MODELS.ambassador,
        schema: AmbassadorSchema,
        collection: COLLECTIONS.ambassadors,
      },
      {
        name: MODELS.school,
        schema: SchoolSchema,
        collection: COLLECTIONS.schools,
      },
      {
        name: MODELS.payment,
        schema: PaymentSchema,
        collection: COLLECTIONS.payments,
      },
      {
        name: MODELS.counter,
        schema: CounterSchema,
        collection: COLLECTIONS.counters,
      },
      {
        name: MODELS.referralClick,
        schema: ReferralClickSchema,
        collection: COLLECTIONS.referralClicks,
      },
      {
        name: MODELS.global,
        schema: GlobalSchema,
        collection: COLLECTIONS.globals,
      },
    ]),
  ],
  controllers: [OlympiadController, WebhooksController],
  providers: [
    AmbassadorEnrolService,
    CountersService,
    FormsService,
    LinksService,
    MessagingService,
    NotifyService,
    PartnersService,
    PaymentsService,
    RegistrationsService,
    SchoolStudentsService,
    SettingsService,
  ],
})
export class OlympiadModule {}
