import { openai } from './client'
import { NumerologyProfile, getNumberMeaning } from '@/lib/numerology/calculations'

export interface NumerologyInterpretation {
  lifePathInterpretation: string
  expressionInterpretation: string
  soulUrgeInterpretation: string
  personalityInterpretation: string
  personalYearInterpretation: string
  overview: string
  generatedAt: Date
}

export async function generateNumerologyInterpretation(
  profile: NumerologyProfile,
  fullName: string,
  isPro: boolean
): Promise<NumerologyInterpretation> {
  if (!isPro) {
    // FREE plan: brief overview only
    return await generateFreeNumerologyOverview(profile, fullName)
  }

  // PRO plan: full detailed interpretation
  return await generateProNumerologyReading(profile, fullName)
}

async function generateFreeNumerologyOverview(
  profile: NumerologyProfile,
  fullName: string
): Promise<NumerologyInterpretation> {
  const lifePathMeaning = getNumberMeaning(profile.lifePathNumber)

  const prompt = `You are a professional numerologist. Write a brief 2-3 sentence overview for ${fullName} with Life Path Number ${profile.lifePathNumber} (${lifePathMeaning.title}).

Keep it inspiring and insightful. Focus on core personality traits.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
  })

  const overview = completion.choices[0].message.content || 'Unable to generate reading.'

  return {
    overview,
    lifePathInterpretation: '',
    expressionInterpretation: '',
    soulUrgeInterpretation: '',
    personalityInterpretation: '',
    personalYearInterpretation: '',
    generatedAt: new Date()
  }
}

async function generateProNumerologyReading(
  profile: NumerologyProfile,
  fullName: string
): Promise<NumerologyInterpretation> {
  const [
    overview,
    lifePathInterpretation,
    expressionInterpretation,
    soulUrgeInterpretation,
    personalityInterpretation,
    personalYearInterpretation
  ] = await Promise.all([
    generateOverview(profile, fullName),
    generateLifePathInterpretation(profile.lifePathNumber),
    generateExpressionInterpretation(profile.expressionNumber),
    generateSoulUrgeInterpretation(profile.soulUrgeNumber),
    generatePersonalityInterpretation(profile.personalityNumber),
    generatePersonalYearInterpretation(profile.personalYearNumber)
  ])

  return {
    overview,
    lifePathInterpretation,
    expressionInterpretation,
    soulUrgeInterpretation,
    personalityInterpretation,
    personalYearInterpretation,
    generatedAt: new Date()
  }
}

async function generateOverview(
  profile: NumerologyProfile,
  fullName: string
): Promise<string> {
  const lifePathMeaning = getNumberMeaning(profile.lifePathNumber)
  const expressionMeaning = getNumberMeaning(profile.expressionNumber)

  const prompt = `As a professional numerologist, write a comprehensive personality overview for ${fullName} with:
- Life Path Number ${profile.lifePathNumber} (${lifePathMeaning.title})
- Expression Number ${profile.expressionNumber} (${expressionMeaning.title})

Include their core essence, life purpose, and natural talents. Make it insightful and empowering. 3-4 paragraphs.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200,
  })

  return completion.choices[0].message.content || ''
}

async function generateLifePathInterpretation(number: number): Promise<string> {
  const meaning = getNumberMeaning(number)

  const prompt = `As a numerologist, interpret Life Path Number ${number} (${meaning.title}).

Explain what this number reveals about:
- Life purpose and direction
- Natural strengths and talents
- Challenges to overcome
- Career paths that suit them

2-3 paragraphs. Be specific and actionable.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
  })

  return completion.choices[0].message.content || ''
}

async function generateExpressionInterpretation(number: number): Promise<string> {
  const meaning = getNumberMeaning(number)

  const prompt = `Interpret Expression/Destiny Number ${number} (${meaning.title}).

Explain:
- Natural talents and abilities
- How they express themselves
- What they're meant to do in life
- Gifts they bring to the world

2 paragraphs.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
  })

  return completion.choices[0].message.content || ''
}

async function generateSoulUrgeInterpretation(number: number): Promise<string> {
  const meaning = getNumberMeaning(number)

  const prompt = `Interpret Soul Urge Number ${number} (${meaning.title}).

Explain:
- Inner desires and motivations
- What truly fulfills them
- Heart's deepest wishes
- What drives them from within

2 paragraphs.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
  })

  return completion.choices[0].message.content || ''
}

async function generatePersonalityInterpretation(number: number): Promise<string> {
  const meaning = getNumberMeaning(number)

  const prompt = `Interpret Personality Number ${number} (${meaning.title}).

Explain:
- How others perceive them
- First impressions they make
- Social persona and mask
- Outer personality traits

2 paragraphs.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
  })

  return completion.choices[0].message.content || ''
}

async function generatePersonalYearInterpretation(number: number): Promise<string> {
  const meaning = getNumberMeaning(number)
  const currentYear = new Date().getFullYear()

  const prompt = `Interpret Personal Year Number ${number} (${meaning.title}) for ${currentYear}.

Explain:
- Themes for this year
- Opportunities coming their way
- What to focus on
- Advice for making the most of this year

2 paragraphs.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
  })

  return completion.choices[0].message.content || ''
}
