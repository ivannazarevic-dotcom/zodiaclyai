import { openai, ensureOpenAIConfigured } from './client'

export type ZodiacSign =
  | 'ARIES' | 'TAURUS' | 'GEMINI' | 'CANCER'
  | 'LEO' | 'VIRGO' | 'LIBRA' | 'SCORPIO'
  | 'SAGITTARIUS' | 'CAPRICORN' | 'AQUARIUS' | 'PISCES'

export interface HoroscopeContent {
  general: string
  love: string
  career: string
  health: string
  money?: string
  luckyNumber?: number
  luckyColor?: string
}

const zodiacSignNames: Record<ZodiacSign, string> = {
  ARIES: 'Aries',
  TAURUS: 'Taurus',
  GEMINI: 'Gemini',
  CANCER: 'Cancer',
  LEO: 'Leo',
  VIRGO: 'Virgo',
  LIBRA: 'Libra',
  SCORPIO: 'Scorpio',
  SAGITTARIUS: 'Sagittarius',
  CAPRICORN: 'Capricorn',
  AQUARIUS: 'Aquarius',
  PISCES: 'Pisces'
}

const zodiacDates: Record<ZodiacSign, string> = {
  ARIES: 'March 21 - April 19',
  TAURUS: 'April 20 - May 20',
  GEMINI: 'May 21 - June 20',
  CANCER: 'June 21 - July 22',
  LEO: 'July 23 - August 22',
  VIRGO: 'August 23 - September 22',
  LIBRA: 'September 23 - October 22',
  SCORPIO: 'October 23 - November 21',
  SAGITTARIUS: 'November 22 - December 21',
  CAPRICORN: 'December 22 - January 19',
  AQUARIUS: 'January 20 - February 18',
  PISCES: 'February 19 - March 20'
}

export async function generateDailyHoroscope(sign: ZodiacSign): Promise<HoroscopeContent> {
  ensureOpenAIConfigured()

  const signName = zodiacSignNames[sign]
  const dateRange = zodiacDates[sign]
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const prompt = `You are a professional astrologer. Write today's daily horoscope for ${signName} (${dateRange}) for ${today}.

Provide the following sections:
1. GENERAL: A 2-3 sentence overview of the day's energy and main themes
2. LOVE: 1-2 sentences about romance and relationships
3. CAREER: 1-2 sentences about work and professional matters
4. HEALTH: 1-2 sentences about wellness and energy levels
5. LUCKY_NUMBER: A single number between 1-100
6. LUCKY_COLOR: A single color name

Keep the tone positive, insightful, and empowering. Be specific but not overly prescriptive.
Always complete your sentences and thoughts naturally - never cut off mid-sentence.
Always complete your sentences and thoughts naturally - never cut off mid-sentence.
Format your response as JSON with keys: general, love, career, health, luckyNumber, luckyColor`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional astrologer providing daily horoscope guidance. Always respond with valid JSON.'
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 700,
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('Failed to generate horoscope')

  return JSON.parse(content) as HoroscopeContent
}

export async function generateWeeklyHoroscope(sign: ZodiacSign): Promise<HoroscopeContent> {
  ensureOpenAIConfigured()

  const signName = zodiacSignNames[sign]
  const dateRange = zodiacDates[sign]
  const startOfWeek = getStartOfWeek()
  const endOfWeek = getEndOfWeek()

  const prompt = `You are a professional astrologer. Write this week's horoscope for ${signName} (${dateRange}) for the week of ${startOfWeek.toLocaleDateString()} to ${endOfWeek.toLocaleDateString()}.

Provide the following sections:
1. GENERAL: A 3-4 sentence overview of the week's energy, planetary influences, and main themes
2. LOVE: 2-3 sentences about romance, relationships, and emotional connections this week
3. CAREER: 2-3 sentences about work, professional growth, and career opportunities
4. HEALTH: 2 sentences about wellness, energy management, and self-care
5. MONEY: 2 sentences about finances, investments, and material matters
6. LUCKY_NUMBER: A single number between 1-100
7. LUCKY_COLOR: A single color name

Keep the tone positive, insightful, and empowering. Mention potential challenges but focus on opportunities.
Always complete your sentences and thoughts naturally - never cut off mid-sentence.
Format your response as JSON with keys: general, love, career, health, money, luckyNumber, luckyColor`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional astrologer providing weekly horoscope guidance. Always respond with valid JSON.'
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 900,
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('Failed to generate horoscope')

  return JSON.parse(content) as HoroscopeContent
}

export async function generateYearlyHoroscope(sign: ZodiacSign): Promise<HoroscopeContent> {
  ensureOpenAIConfigured()

  const signName = zodiacSignNames[sign]
  const dateRange = zodiacDates[sign]
  const currentYear = new Date().getFullYear()

  const prompt = `You are a professional astrologer. Write the yearly horoscope for ${signName} (${dateRange}) for the year ${currentYear}.

Provide the following sections:
1. GENERAL: A comprehensive 4-5 sentence overview of the year's major themes, planetary transits, and transformative periods. Focus on personal growth and life direction.
2. LOVE: 3-4 sentences about romantic relationships, emotional evolution, and important relationship milestones throughout the year
3. CAREER: 3-4 sentences about professional development, career opportunities, major work transitions, and success periods
4. HEALTH: 2-3 sentences about overall wellness trends, energy cycles, and self-care priorities for the year
5. MONEY: 2-3 sentences about financial outlook, investment opportunities, and material abundance throughout the year
6. LUCKY_NUMBER: A single number between 1-100
7. LUCKY_COLOR: A single color name that will bring luck this year

Make the tone inspirational, forward-looking, and empowering. Acknowledge challenges as opportunities for growth.
Always complete your sentences and thoughts naturally - never cut off mid-sentence.
Format your response as JSON with keys: general, love, career, health, money, luckyNumber, luckyColor`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a professional astrologer providing yearly horoscope guidance for ${currentYear}. Always respond with valid JSON.`
      },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1400,
  })

  const content = completion.choices[0].message.content
  if (!content) throw new Error('Failed to generate yearly horoscope')

  return JSON.parse(content) as HoroscopeContent
}

export async function generateAllDailyHoroscopes(): Promise<Record<ZodiacSign, HoroscopeContent>> {
  const signs: ZodiacSign[] = [
    'ARIES', 'TAURUS', 'GEMINI', 'CANCER',
    'LEO', 'VIRGO', 'LIBRA', 'SCORPIO',
    'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
  ]

  const horoscopes = await Promise.all(
    signs.map(async (sign) => {
      const content = await generateDailyHoroscope(sign)
      return { sign, content }
    })
  )

  return horoscopes.reduce((acc, { sign, content }) => {
    acc[sign] = content
    return acc
  }, {} as Record<ZodiacSign, HoroscopeContent>)
}

export async function generateAllWeeklyHoroscopes(): Promise<Record<ZodiacSign, HoroscopeContent>> {
  const signs: ZodiacSign[] = [
    'ARIES', 'TAURUS', 'GEMINI', 'CANCER',
    'LEO', 'VIRGO', 'LIBRA', 'SCORPIO',
    'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
  ]

  const horoscopes = await Promise.all(
    signs.map(async (sign) => {
      const content = await generateWeeklyHoroscope(sign)
      return { sign, content }
    })
  )

  return horoscopes.reduce((acc, { sign, content }) => {
    acc[sign] = content
    return acc
  }, {} as Record<ZodiacSign, HoroscopeContent>)
}

export async function generateAllYearlyHoroscopes(): Promise<Record<ZodiacSign, HoroscopeContent>> {
  const signs: ZodiacSign[] = [
    'ARIES', 'TAURUS', 'GEMINI', 'CANCER',
    'LEO', 'VIRGO', 'LIBRA', 'SCORPIO',
    'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
  ]

  const horoscopes = await Promise.all(
    signs.map(async (sign) => {
      const content = await generateYearlyHoroscope(sign)
      return { sign, content }
    })
  )

  return horoscopes.reduce((acc, { sign, content }) => {
    acc[sign] = content
    return acc
  }, {} as Record<ZodiacSign, HoroscopeContent>)
}

// Helper functions
function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  return new Date(now.setDate(diff))
}

function getEndOfWeek(): Date {
  const start = getStartOfWeek()
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end
}

export function getZodiacSignFromDate(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'ARIES'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'TAURUS'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'GEMINI'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'CANCER'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'LEO'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'VIRGO'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'LIBRA'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'SCORPIO'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'SAGITTARIUS'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'CAPRICORN'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'AQUARIUS'
  return 'PISCES'
}

export { zodiacSignNames, zodiacDates }
