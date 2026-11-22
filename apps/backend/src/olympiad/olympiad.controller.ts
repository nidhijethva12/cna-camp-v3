import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientIp, InternalKeyGuard } from '../common/internal.guard.js';
import {
  FormsService,
  type AmbassadorSignupInput,
  type PartnerRequestInput,
  type ReminderInput,
  type SchoolSignupInput,
} from './services/forms.service.js';
import { LinksService } from './services/links.service.js';
import {
  PartnersService,
  type PartnerKind,
} from './services/partners.service.js';
import { PaymentsService } from './services/payments.service.js';
import { SchoolStudentsService } from './services/school-students.service.js';
import {
  RegistrationsService,
  type RegistrationInput,
} from './services/registrations.service.js';

const kindOf = (value: string): PartnerKind => {
  if (value === 'school' || value === 'ambassador') return value;
  throw new NotFoundException();
};

/** The Olympiad API the website's server calls. Every route needs the shared key (InternalKeyGuard). */
@Controller('olympiad')
@UseGuards(InternalKeyGuard)
export class OlympiadController {
  constructor(
    private readonly forms: FormsService,
    private readonly registrations: RegistrationsService,
    private readonly payments: PaymentsService,
    private readonly partners: PartnersService,
    private readonly links: LinksService,
    private readonly schoolStudents: SchoolStudentsService,
  ) {}

  @Post('reminders')
  @HttpCode(200)
  reminder(@Body() body: ReminderInput, @ClientIp() ip?: string) {
    return this.forms.reminder(body, ip);
  }

  @Post('partner-requests')
  @HttpCode(200)
  partnerRequest(@Body() body: PartnerRequestInput, @ClientIp() ip?: string) {
    return this.forms.partnerRequest(body, ip);
  }

  @Post('registrations')
  @HttpCode(200)
  register(@Body() body: RegistrationInput, @ClientIp() ip?: string) {
    return this.registrations.register(body, ip);
  }

  /** The registration receipt (for the PDF) behind a receipt link. */
  @Post('receipts')
  @HttpCode(200)
  async receipt(@Body() body: { token?: unknown }) {
    const receipt = await this.payments.receipt(body.token);
    if (!receipt) throw new NotFoundException();
    return receipt;
  }

  @Post('payments/confirm')
  @HttpCode(200)
  confirmPayment(
    @Body()
    body: {
      orderId?: unknown;
      paymentId?: unknown;
      signature?: unknown;
    },
  ) {
    return this.payments.confirmFromCheckout(body);
  }

  /** An Admin records a fee taken at the CNA office. The website checks the Admin login first. */
  @Post('payments/office')
  @HttpCode(200)
  officePayment(
    @Body()
    body: {
      id?: unknown;
      method?: unknown;
      reference?: unknown;
      by?: unknown;
    },
  ) {
    return this.payments.recordOfficePayment(body);
  }

  /** An Admin changes a fee recorded at the office back to "not paid". */
  @Post('payments/office/undo')
  @HttpCode(200)
  undoOfficePayment(@Body() body: { id?: unknown; by?: unknown }) {
    return this.payments.undoOfficePayment(body);
  }

  @Post('payments/resume')
  @HttpCode(200)
  resumePayment(@Body() body: { token?: unknown }) {
    return this.payments.resume(body.token);
  }

  /** A partner link was opened: counts the open and returns the code to carry into the form. */
  @Post('links/open')
  @HttpCode(200)
  async openLink(@Body() body: { code?: unknown }, @ClientIp() ip?: string) {
    return (
      (await this.partners.openLink(
        typeof body.code === 'string' ? body.code : '',
        ip,
      )) ?? { kind: null, code: null }
    );
  }

  @Post('links/:purpose/preview')
  @HttpCode(200)
  previewLink(
    @Param('purpose') purpose: string,
    @Body() body: { token?: unknown },
  ) {
    if (purpose !== 'unsubscribe' && purpose !== 'consent')
      throw new NotFoundException();
    return this.links.preview(body.token, purpose);
  }

  @Post('links/unsubscribe')
  @HttpCode(200)
  unsubscribe(@Body() body: { token?: unknown }) {
    return this.links.unsubscribe(body.token);
  }

  @Post('links/consent')
  @HttpCode(200)
  consent(@Body() body: { token?: unknown }, @ClientIp() ip?: string) {
    return this.links.giveParentConsent(body.token, ip);
  }

  /** The School Partner and Ambassador sign-up pages. */
  @Post('partners/:kind/signup')
  @HttpCode(200)
  signup(
    @Param('kind') kind: string,
    @Body() body: SchoolSignupInput & AmbassadorSignupInput,
    @ClientIp() ip?: string,
  ) {
    return kindOf(kind) === 'school'
      ? this.forms.schoolSignup(body, ip)
      : this.forms.ambassadorSignup(body, ip);
  }

  /** "Forgot your password?" on a dashboard login: emails a fresh link if the email is known. */
  @Post('partners/:kind/password-reset')
  @HttpCode(200)
  passwordReset(
    @Param('kind') kind: string,
    @Body() body: { email?: unknown },
  ) {
    return this.partners.requestPasswordReset(kindOf(kind), body);
  }

  /** The "choose your password" page: who the link is for, before the form. */
  @Post('partners/password/preview')
  @HttpCode(200)
  passwordPreview(@Body() body: { token?: unknown }) {
    return this.partners.passwordPreview(body.token);
  }

  @Post('partners/password')
  @HttpCode(200)
  setPassword(@Body() body: { token?: unknown; password?: unknown }) {
    return this.partners.setPassword(body);
  }

  @Post('partners/:kind/login')
  @HttpCode(200)
  login(
    @Param('kind') kind: string,
    @Body() body: { email?: unknown; password?: unknown },
  ) {
    return this.partners.login(kindOf(kind), body);
  }

  /** School dashboard: students from the school's Excel sheet. */
  @Post('partners/school/students')
  @HttpCode(200)
  async importStudents(
    @Body() body: { rows?: unknown; declared?: unknown },
    @Headers('x-session') session?: string,
  ) {
    const result = await this.schoolStudents.importSheet(session, body);
    if (!result) throw new UnauthorizedException();
    return result;
  }

  /** School dashboard: one uploaded document (photo, Aadhaar card, bonafide) for one student. */
  @Post('partners/school/students/document')
  @HttpCode(200)
  async studentDocument(
    @Body() body: { id?: unknown; kind?: unknown; file?: unknown },
    @Headers('x-session') session?: string,
  ) {
    const result = await this.schoolStudents.attachDocument(session, body);
    if (!result) throw new UnauthorizedException();
    return result;
  }

  /** School dashboard: take an unconfirmed student off the sheet. */
  @Post('partners/school/students/remove')
  @HttpCode(200)
  async removeStudent(
    @Body() body: { id?: unknown },
    @Headers('x-session') session?: string,
  ) {
    const result = await this.schoolStudents.remove(session, body);
    if (!result) throw new UnauthorizedException();
    return result;
  }

  /** School dashboard: one payment for every student the school still owes for. */
  @Post('partners/school/pay')
  @HttpCode(200)
  async schoolPay(@Headers('x-session') session?: string) {
    const result = await this.partners.schoolPay(session);
    if (!result) throw new UnauthorizedException();
    return result;
  }

  /** The registration form, pre-filled from a school's invitation link. */
  @Post('partners/school/invite-preview')
  @HttpCode(200)
  invitePreview(@Body() body: { token?: unknown }) {
    return this.partners.invitePreview(body.token);
  }

  /** Dashboard data for the session token the website keeps in an httpOnly cookie. */
  @Get('partners/:kind/me')
  async me(
    @Param('kind') kind: string,
    @Headers('x-session') session?: string,
  ) {
    const data =
      kindOf(kind) === 'school'
        ? await this.partners.schoolDashboard(session)
        : await this.partners.ambassadorDashboard(session);
    if (!data) throw new UnauthorizedException();
    return data;
  }

  /** Admin hook: the next code for a partner being approved. */
  @Post('partners/:kind/code')
  @HttpCode(200)
  async code(@Param('kind') kind: string, @Body() body: { district?: string }) {
    return { code: await this.partners.nextCode(kindOf(kind), body.district) };
  }

  /** Admin hook: send the welcome message after an approval. */
  @Post('partners/approved')
  @HttpCode(200)
  async approved(@Body() body: Record<string, unknown>) {
    await this.partners.approved(body);
    return { ok: true };
  }
}
