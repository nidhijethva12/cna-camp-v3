import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { districtCode } from '../rules.js';
import { MODELS } from '../schemas.js';

const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** Running numbers behind Reg. IDs and partner codes. */
@Injectable()
export class CountersService {
  constructor(
    @InjectModel(MODELS.counter)
    private readonly counters: Model<{ key: string; value: number }>,
  ) {}

  /**
   * Next number for `key`, starting after `offset`. A single atomic $inc in MongoDB, so two people
   * submitting in the same instant can never get the same number.
   */
  async next(key: string, offset = 0) {
    const doc = await this.counters
      .findOneAndUpdate(
        { key },
        { $inc: { value: 1 } },
        { upsert: true, new: true },
      )
      .lean<{ value: number }>();
    return offset + (doc?.value ?? 1);
  }

  /** REM-501, REM-502 … */
  reminderId = async () => `REM-${await this.next('reminder', 500)}`;

  /** AO2-0-000123, AO2-A-000124 … one running number across groups, never reused. */
  registrationId = async (group: string) =>
    `AO2-${group}-${pad(await this.next('registration'), 6)}`;

  /** CNA-AMB-0001 … */
  ambassadorCode = async () =>
    `CNA-AMB-${pad(await this.next('ambassador'), 4)}`;

  /** SCH-RJK-001 … numbered per district. */
  schoolCode = async (district: string) => {
    const code = districtCode(district);
    return `SCH-${code}-${pad(await this.next(`school:${code}`), 3)}`;
  };
}
