import {
  ageOn,
  classesFor,
  DEFAULT_FEES,
  feeFor,
  groupFor,
  groupZeroSchool,
  isAadhaar,
  isBirthDate,
  isPlainText,
  istToday,
  needsSchoolProof,
  picksQuizSlot,
  withSchool,
} from './rules.js';

const today = new Date(2026, 10, 15);
const group = (who: string, dob: string) => {
  const result = groupFor(who, dob, today);
  return result && 'group' in result ? result.group : null;
};

describe('age on the day the form is filled', () => {
  it('counts whole years, turning a year older on the birthday', () => {
    expect(ageOn('2013-11-15', today)).toBe(13);
    expect(ageOn('2013-11-16', today)).toBe(12);
  });

  it('refuses students under 13 and adults under 18', () => {
    expect(groupFor('student', '2013-11-16', today)).toHaveProperty('warning');
    expect(groupFor('adult', '2009-01-01', today)).toHaveProperty('warning');
  });

  it('gives A under 16, B from 16, C from 18; D for adults and E for teachers', () => {
    expect(group('student', '2013-11-15')).toBe('A');
    expect(group('student', '2010-11-16')).toBe('A');
    expect(group('student', '2010-11-15')).toBe('B');
    expect(group('student', '2008-11-15')).toBe('C');
    expect(group('adult', '2008-11-15')).toBe('D');
    expect(group('teacher', '')).toBe('E');
  });

  it('rejects an unknown participant or a malformed birth date', () => {
    expect(groupFor('admin', '2010-01-01', today)).toBeNull();
    expect(groupFor('student', '01-01-2010', today)).toBeNull();
  });

  it("uses India's date, not the server's", () => {
    // 20:00 UTC on 14 Nov is already 15 Nov in India.
    const d = istToday(new Date(Date.UTC(2026, 10, 14, 20, 0)));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([
      2026, 10, 15,
    ]);
  });
});

describe('Group 0 and fees', () => {
  it('makes an under-16 student Group 0 only when Std 6 to 8 was in a government school', () => {
    expect(withSchool('A', true)).toBe('0');
    expect(withSchool('A', false)).toBe('A');
    expect(withSchool('B', true)).toBe('B');
  });

  it('charges the published fees', () => {
    expect(feeFor(DEFAULT_FEES, '0', true)).toBe(0);
    expect(feeFor(DEFAULT_FEES, 'A', true)).toBe(230);
    expect(feeFor(DEFAULT_FEES, 'B', true)).toBe(156);
    expect(feeFor(DEFAULT_FEES, 'B', false)).toBe(369);
    expect(feeFor(DEFAULT_FEES, 'C', true)).toBe(651);
    expect(feeFor(DEFAULT_FEES, 'D', false)).toBe(1651);
    expect(feeFor(DEFAULT_FEES, 'E', false)).toBe(963);
  });

  it('asks for school proof only for Group 0 and the Group B government fee', () => {
    expect(needsSchoolProof('0', false)).toBe(true);
    expect(needsSchoolProof('B', true)).toBe(true);
    expect(needsSchoolProof('B', false)).toBe(false);
    expect(needsSchoolProof('A', true)).toBe(false);
  });

  it('asks Std 10, Std 12 and Group C for a quiz slot', () => {
    expect(picksQuizSlot('B', 'Std 10')).toBe(true);
    expect(picksQuizSlot('B', 'Std 12')).toBe(true);
    expect(picksQuizSlot('C', '12 pass')).toBe(true);
    expect(picksQuizSlot('A', 'Std 9')).toBe(false);
  });

  it('offers Std 7 to 10 to Groups 0 and A, and Std 9 to 12 to Group B', () => {
    expect(classesFor('0')).toEqual(['Std 7', 'Std 8', 'Std 9', 'Std 10']);
    expect(classesFor('A')).toEqual(['Std 7', 'Std 8', 'Std 9', 'Std 10']);
    expect(classesFor('B')).toEqual(['Std 9', 'Std 10', 'Std 11', 'Std 12']);
  });

  it('allows Group 0 only at a Government school', () => {
    expect(groupZeroSchool('government')).toBe(true);
    expect(groupZeroSchool('granted')).toBe(false);
    expect(groupZeroSchool('private')).toBe(false);
    // Private + "yes" stays Group A; only Government pays the lower Group B fee.
    expect(withSchool('A', groupZeroSchool('private') && true)).toBe('A');
    expect(feeFor(DEFAULT_FEES, 'B', false)).toBe(369);
  });
});

describe('field checks', () => {
  it('accepts only real birth dates from 1920 up to today', () => {
    expect(isBirthDate('2012-02-29', today)).toBe(true);
    expect(isBirthDate('2013-02-29', today)).toBe(false);
    expect(isBirthDate('2026-11-16', today)).toBe(false);
    expect(isBirthDate('1919-12-31', today)).toBe(false);
    expect(groupFor('student', '2013-02-30', today)).toBeNull();
  });

  it('takes 12 digits not starting with 0 or 1 as an Aadhaar number', () => {
    expect(isAadhaar('234567890123')).toBe(true);
    expect(isAadhaar('999999999999')).toBe(true);
    expect(isAadhaar('123456789012')).toBe(false);
    expect(isAadhaar('023456789012')).toBe(false);
    expect(isAadhaar('23456789012')).toBe(false);
    expect(isAadhaar('2345 6789 0123')).toBe(false);
  });

  it('refuses links and markup in free text', () => {
    expect(isPlainText('12, Shanti Nagar, Rajkot')).toBe(true);
    expect(isPlainText('visit https://x.io')).toBe(false);
    expect(isPlainText('www.example.com')).toBe(false);
    expect(isPlainText('<script>')).toBe(false);
  });
});
