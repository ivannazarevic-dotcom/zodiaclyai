import { openai, ensureOpenAIConfigured } from './client'
import { ChartData, AIReading, PlanetPosition } from '@/types'

export async function generateChartInterpretation(
  chartData: ChartData,
  isPro: boolean
): Promise<AIReading> {
  if (!isPro) {
    // FREE plan: short summary only
    return await generateFreeSummary(chartData)
  }

  // PRO plan: full detailed reading
  return await generateProReading(chartData)
}

async function generateFreeSummary(chartData: ChartData): Promise<AIReading> {
  ensureOpenAIConfigured()

  const sun = chartData.planets.find((p) => p.name === 'Sun')
  const moon = chartData.planets.find((p) => p.name === 'Moon')
  const ascendant = chartData.ascendant

  const prompt = `You are a professional astrologer. Provide a brief 2-3 sentence overview of this natal chart:
- Sun in ${sun?.sign} (${sun?.house}th house)
- Moon in ${moon?.sign} (${moon?.house}th house)
- Ascendant: ${ascendant.sign}

Keep it inspiring and positive. Focus on core personality traits.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  })

  const overview = completion.choices[0].message.content || 'Unable to generate reading.'

  return {
    overview,
    planetAnalysis: [],
    houseAnalysis: [],
    aspectAnalysis: [],
    ascendantAnalysis: '',
    generatedAt: new Date(),
  }
}

async function generateProReading(chartData: ChartData): Promise<AIReading> {
  // Generate comprehensive reading in parallel
  const [overview, planetAnalysis, houseAnalysis, aspectAnalysis, ascendantAnalysis] =
    await Promise.all([
      generateOverview(chartData),
      generatePlanetAnalysis(chartData.planets),
      generateHouseAnalysis(chartData.houses, chartData.planets),
      generateAspectAnalysis(chartData.aspects),
      generateAscendantAnalysis(chartData.ascendant),
    ])

  return {
    overview,
    planetAnalysis,
    houseAnalysis,
    aspectAnalysis,
    ascendantAnalysis,
    generatedAt: new Date(),
  }
}

async function generateOverview(chartData: ChartData): Promise<string> {
  ensureOpenAIConfigured()

  const sun = chartData.planets.find((p) => p.name === 'Sun')
  const moon = chartData.planets.find((p) => p.name === 'Moon')
  const ascendant = chartData.ascendant

  const prompt = `As a professional astrologer, write a comprehensive personality overview for someone with:
- Sun in ${sun?.sign} (${sun?.house}th house)
- Moon in ${moon?.sign} (${moon?.house}th house)
- ${ascendant.sign} Rising

Include their core essence, emotional nature, and life approach. Make it insightful and empowering. 3-4 paragraphs.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
  })

  return completion.choices[0].message.content || ''
}

async function generatePlanetAnalysis(
  planets: PlanetPosition[]
): Promise<{ planet: string; interpretation: string }[]> {
  const majorPlanets = planets.filter((p) =>
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(p.name)
  )

  const analyses = await Promise.all(
    majorPlanets.map(async (planet) => {
      const prompt = `As an astrologer, interpret ${planet.name} in ${planet.sign} in the ${planet.house}th house.
${planet.retrograde ? 'This planet is retrograde.' : ''}
2-3 paragraphs. Focus on practical insights.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      })

      return {
        planet: planet.name,
        interpretation: completion.choices[0].message.content || '',
      }
    })
  )

  return analyses
}

async function generateHouseAnalysis(
  houses: any[],
  planets: PlanetPosition[]
): Promise<{ house: number; interpretation: string }[]> {
  // Analyze houses with planets in them
  const occupiedHouses = Array.from(new Set(planets.map((p) => p.house)))
    .slice(0, 6) // Limit to 6 most important

  const analyses = await Promise.all(
    occupiedHouses.map(async (houseNum) => {
      const planetsInHouse = planets.filter((p) => p.house === houseNum)
      const planetList = planetsInHouse.map((p) => `${p.name} in ${p.sign}`).join(', ')

      const prompt = `Interpret the ${houseNum}th house with: ${planetList}.
Explain what this means for this life area. 1-2 paragraphs.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
      })

      return {
        house: houseNum,
        interpretation: completion.choices[0].message.content || '',
      }
    })
  )

  return analyses
}

async function generateAspectAnalysis(
  aspects: any[]
): Promise<{ aspect: string; interpretation: string }[]> {
  // Take top 5 strongest aspects
  const majorAspects = aspects.slice(0, 5)

  const analyses = await Promise.all(
    majorAspects.map(async (aspect) => {
      const prompt = `Interpret the ${aspect.type} between ${aspect.planet1} and ${aspect.planet2}.
Orb: ${aspect.orb.toFixed(1)}°. 1-2 paragraphs.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      })

      return {
        aspect: `${aspect.planet1} ${aspect.type} ${aspect.planet2}`,
        interpretation: completion.choices[0].message.content || '',
      }
    })
  )

  return analyses
}

async function generateAscendantAnalysis(ascendant: {
  sign: string
  degree: number
}): Promise<string> {
  const prompt = `Interpret ${ascendant.sign} Rising at ${ascendant.degree.toFixed(2)}°.
Explain how this shapes first impressions, appearance, and life approach. 2 paragraphs.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
  })

  return completion.choices[0].message.content || ''
}
