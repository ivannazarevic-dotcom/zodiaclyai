'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type ZodiacSign =
  | 'ARIES' | 'TAURUS' | 'GEMINI' | 'CANCER'
  | 'LEO' | 'VIRGO' | 'LIBRA' | 'SCORPIO'
  | 'SAGITTARIUS' | 'CAPRICORN' | 'AQUARIUS' | 'PISCES'

interface HoroscopeContent {
  general: string
  love: string
  career: string
  health: string
  money?: string
  luckyNumber?: number
  luckyColor?: string
}

interface Horoscope {
  sign: ZodiacSign
  content: HoroscopeContent
  date: string
}

const zodiacSigns: { sign: ZodiacSign; emoji: string; name: string; dates: string }[] = [
  { sign: 'ARIES', emoji: '♈', name: 'Aries', dates: 'Mar 21 - Apr 19' },
  { sign: 'TAURUS', emoji: '♉', name: 'Taurus', dates: 'Apr 20 - May 20' },
  { sign: 'GEMINI', emoji: '♊', name: 'Gemini', dates: 'May 21 - Jun 20' },
  { sign: 'CANCER', emoji: '♋', name: 'Cancer', dates: 'Jun 21 - Jul 22' },
  { sign: 'LEO', emoji: '♌', name: 'Leo', dates: 'Jul 23 - Aug 22' },
  { sign: 'VIRGO', emoji: '♍', name: 'Virgo', dates: 'Aug 23 - Sep 22' },
  { sign: 'LIBRA', emoji: '♎', name: 'Libra', dates: 'Sep 23 - Oct 22' },
  { sign: 'SCORPIO', emoji: '♏', name: 'Scorpio', dates: 'Oct 23 - Nov 21' },
  { sign: 'SAGITTARIUS', emoji: '♐', name: 'Sagittarius', dates: 'Nov 22 - Dec 21' },
  { sign: 'CAPRICORN', emoji: '♑', name: 'Capricorn', dates: 'Dec 22 - Jan 19' },
  { sign: 'AQUARIUS', emoji: '♒', name: 'Aquarius', dates: 'Jan 20 - Feb 18' },
  { sign: 'PISCES', emoji: '♓', name: 'Pisces', dates: 'Feb 19 - Mar 20' }
]

export default function HoroscopeSection() {
  const [type, setType] = useState<'daily' | 'weekly' | 'yearly'>('daily')
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>('ARIES')
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHoroscope()
  }, [type, selectedSign])

  async function fetchHoroscope() {
    setLoading(true)
    console.log('Fetching horoscope:', { type, selectedSign })
    try {
      const url = `/api/horoscopes/${type}?sign=${selectedSign}`
      console.log('Fetch URL:', url)
      const res = await fetch(url)
      const data = await res.json()
      console.log('API Response:', data)

      if (data.success) {
        setHoroscope(data.horoscope)
        console.log('Horoscope set:', data.horoscope)
      } else {
        console.error('API returned error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch horoscope:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedZodiac = zodiacSigns.find(z => z.sign === selectedSign)

  return (
    <section className="py-20 bg-gradient-to-b from-cosmic-surface to-cosmic-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your {type === 'daily' ? 'Daily' : type === 'weekly' ? 'Weekly' : 'Yearly'} Horoscope 🔮
          </h2>
          <p className="text-xl text-gray-400">
            {type === 'yearly'
              ? `AI-powered astrological guidance for ${new Date().getFullYear()}`
              : 'AI-powered astrological guidance for your journey'
            }
          </p>
        </div>

        {/* Type Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={type === 'daily' ? 'primary' : 'outline'}
            onClick={() => setType('daily')}
          >
            Daily
          </Button>
          <Button
            variant={type === 'weekly' ? 'primary' : 'outline'}
            onClick={() => setType('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={type === 'yearly' ? 'primary' : 'outline'}
            onClick={() => setType('yearly')}
          >
            Yearly 2026
          </Button>
        </div>

        {/* Zodiac Sign Selector */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-3 mb-8">
          {zodiacSigns.map((zodiac) => (
            <button
              key={zodiac.sign}
              onClick={() => setSelectedSign(zodiac.sign)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedSign === zodiac.sign
                  ? 'border-cosmic-primary bg-cosmic-primary/20 scale-105'
                  : 'border-cosmic-primary/20 hover:border-cosmic-primary/50'
              }`}
              title={`${zodiac.name} (${zodiac.dates})`}
            >
              <div className="text-3xl">{zodiac.emoji}</div>
              <div className="text-xs mt-1 font-bold">{zodiac.name}</div>
            </button>
          ))}
        </div>

        {/* Horoscope Content */}
        {loading ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">🔮</div>
            <p className="text-gray-400">Loading your cosmic guidance...</p>
          </Card>
        ) : horoscope ? (
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="bg-gradient-to-r from-cosmic-primary/20 to-cosmic-secondary/20 border-cosmic-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedZodiac?.emoji}</div>
                  <div>
                    <h3 className="text-3xl font-bold">{selectedZodiac?.name}</h3>
                    <p className="text-gray-400">{selectedZodiac?.dates}</p>
                    <p className="text-sm text-cosmic-accent mt-1">
                      {type === 'daily' ? 'Today' : type === 'weekly' ? 'This Week' : `Year ${new Date().getFullYear()}`} • {new Date(horoscope.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {horoscope.content.luckyNumber && horoscope.content.luckyColor && (
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Lucky Number</div>
                    <div className="text-3xl font-bold text-cosmic-gold mb-2">
                      {horoscope.content.luckyNumber}
                    </div>
                    <div className="text-sm text-gray-400">Lucky Color</div>
                    <div className="text-lg font-bold capitalize" style={{ color: horoscope.content.luckyColor }}>
                      {horoscope.content.luckyColor}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* General */}
            <Card>
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span>✨</span> Overview
              </h4>
              <p className="text-gray-300 leading-relaxed">{horoscope.content.general}</p>
            </Card>

            {/* Love, Career, Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-cosmic-accent">
                  <span>💕</span> Love
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{horoscope.content.love}</p>
              </Card>

              <Card>
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-cosmic-primary">
                  <span>💼</span> Career
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{horoscope.content.career}</p>
              </Card>

              <Card>
                <h4 className="text-lg font-bold mb-3 flex items-center gap-2 text-cosmic-secondary">
                  <span>💪</span> Health
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{horoscope.content.health}</p>
              </Card>
            </div>

            {/* Money (weekly & yearly) */}
            {(type === 'weekly' || type === 'yearly') && horoscope.content.money && (
              <Card>
                <h4 className="text-xl font-bold mb-3 flex items-center gap-2 text-cosmic-gold">
                  <span>💰</span> Money & Finances
                </h4>
                <p className="text-gray-300 leading-relaxed">{horoscope.content.money}</p>
              </Card>
            )}
          </div>
        ) : null}

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Want personalized insights based on your exact birth chart?</p>
          <Link href="/create-chart">
            <Button size="lg">Create Your Natal Chart</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
