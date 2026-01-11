'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import { SessionUser } from '@/types'
import {
  calculateNumerologyProfile,
  getNumberMeaning,
  type NumerologyProfile
} from '@/lib/numerology/calculations'

interface NumerologyResult {
  profile: NumerologyProfile
  fullName: string
  birthDate: Date
  interpretation?: any
}

interface NumerologyCalculatorProps {
  user: SessionUser | null
}

export default function NumerologyCalculator({ user }: NumerologyCalculatorProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [result, setResult] = useState<NumerologyResult | null>(null)
  const [error, setError] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [exporting, setExporting] = useState(false)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }

    if (!birthDate) {
      setError('Please enter your birth date')
      return
    }

    setCalculating(true)

    try {
      const birth = new Date(birthDate)
      const profile = calculateNumerologyProfile(birth, fullName.trim())

      setResult({
        profile,
        fullName: fullName.trim(),
        birthDate: birth
      })
    } catch (err) {
      setError('Invalid birth date. Please try again.')
    } finally {
      setCalculating(false)
    }
  }

  function handleReset() {
    setFullName('')
    setBirthDate('')
    setResult(null)
    setError('')
  }

  async function handleGetAIReading() {
    if (!user) {
      router.push('/auth/register')
      return
    }

    if (user.plan === 'FREE') {
      router.push('/auth/register') // Redirect to upgrade
      return
    }

    if (!result) return

    setGeneratingAI(true)
    setError('')

    try {
      const res = await fetch('/api/numerology/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: result.profile,
          fullName: result.fullName,
        })
      })

      const data = await res.json()

      if (data.success) {
        setResult({
          ...result,
          interpretation: data.interpretation
        })
      } else {
        setError(data.error || 'Failed to generate AI reading')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setGeneratingAI(false)
    }
  }

  async function exportNumerologyPDF() {
    if (!result || !result.interpretation) return

    setExporting(true)
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let yPosition = margin

      // Cover Page
      pdf.setFillColor(10, 10, 31)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')

      pdf.setTextColor(147, 51, 234) // cosmic-primary
      pdf.setFontSize(32)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Numerology Report', pageWidth / 2, 60, { align: 'center' })

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text(result.fullName, pageWidth / 2, 80, { align: 'center' })

      pdf.setTextColor(156, 163, 175)
      pdf.setFontSize(14)
      pdf.text(
        result.birthDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        pageWidth / 2,
        95,
        { align: 'center' }
      )

      pdf.setTextColor(107, 114, 128)
      pdf.setFontSize(10)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 105, { align: 'center' })

      // Decorative numbers
      pdf.setTextColor(251, 191, 36)
      pdf.setFontSize(20)
      pdf.text('1  2  3  4  5  6  7  8  9', pageWidth / 2, 120, { align: 'center' })

      // Core Numbers Page
      pdf.addPage()
      pdf.setFillColor(10, 10, 31)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      yPosition = margin

      pdf.setTextColor(147, 51, 234)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Your Core Numbers', margin, yPosition)
      yPosition += 15

      const coreNumbers = [
        { title: 'Life Path Number', value: result.profile.lifePathNumber, meaning: getNumberMeaning(result.profile.lifePathNumber), color: [147, 51, 234] as const },
        { title: 'Expression Number', value: result.profile.expressionNumber, meaning: getNumberMeaning(result.profile.expressionNumber), color: [234, 88, 12] as const },
        { title: 'Soul Urge Number', value: result.profile.soulUrgeNumber, meaning: getNumberMeaning(result.profile.soulUrgeNumber), color: [59, 130, 246] as const },
        { title: 'Personality Number', value: result.profile.personalityNumber, meaning: getNumberMeaning(result.profile.personalityNumber), color: [251, 191, 36] as const }
      ]

      for (const num of coreNumbers) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage()
          pdf.setFillColor(10, 10, 31)
          pdf.rect(0, 0, pageWidth, pageHeight, 'F')
          yPosition = margin
        }

        pdf.setTextColor(...num.color)
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${num.title}: ${num.value}`, margin, yPosition)
        yPosition += 8

        pdf.setTextColor(229, 231, 235)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(num.meaning.title, margin, yPosition)
        yPosition += 6

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.text(num.meaning.keywords.join(' • '), margin, yPosition)
        yPosition += 10
      }

      // Additional Numbers
      yPosition += 10
      pdf.setTextColor(147, 51, 234)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Additional Insights', margin, yPosition)
      yPosition += 10

      const additionalNumbers = [
        { title: 'Birthday Number', value: result.profile.birthdayNumber },
        { title: 'Maturity Number', value: result.profile.maturityNumber },
        { title: `Personal Year ${new Date().getFullYear()}`, value: result.profile.personalYearNumber }
      ]

      pdf.setTextColor(229, 231, 235)
      pdf.setFontSize(11)
      for (const num of additionalNumbers) {
        pdf.text(`${num.title}: ${num.value}`, margin, yPosition)
        yPosition += 7
      }

      // AI Interpretation Pages (if exists)
      if (result.interpretation) {
        // Overview
        pdf.addPage()
        pdf.setFillColor(10, 10, 31)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        yPosition = margin

        pdf.setTextColor(147, 51, 234)
        pdf.setFontSize(18)
        pdf.setFont('helvetica', 'bold')
        pdf.text('AI Overview', margin, yPosition)
        yPosition += 12

        pdf.setTextColor(229, 231, 235)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        const overviewLines = pdf.splitTextToSize(result.interpretation.overview, contentWidth)
        pdf.text(overviewLines, margin, yPosition)
        yPosition += (overviewLines.length * 6) + 15

        // Life Path Interpretation
        pdf.addPage()
        pdf.setFillColor(10, 10, 31)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        yPosition = margin

        pdf.setTextColor(147, 51, 234)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Life Path Interpretation', margin, yPosition)
        yPosition += 12

        pdf.setTextColor(229, 231, 235)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const lifePathLines = pdf.splitTextToSize(result.interpretation.lifePathInterpretation, contentWidth)
        pdf.text(lifePathLines, margin, yPosition)

        // Expression Interpretation
        pdf.addPage()
        pdf.setFillColor(10, 10, 31)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        yPosition = margin

        pdf.setTextColor(234, 88, 12)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Expression Number Interpretation', margin, yPosition)
        yPosition += 12

        pdf.setTextColor(229, 231, 235)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const expressionLines = pdf.splitTextToSize(result.interpretation.expressionInterpretation, contentWidth)
        pdf.text(expressionLines, margin, yPosition)

        // Soul Urge Interpretation
        pdf.addPage()
        pdf.setFillColor(10, 10, 31)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        yPosition = margin

        pdf.setTextColor(59, 130, 246)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Soul Urge Interpretation', margin, yPosition)
        yPosition += 12

        pdf.setTextColor(229, 231, 235)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const soulUrgeLines = pdf.splitTextToSize(result.interpretation.soulUrgeInterpretation, contentWidth)
        pdf.text(soulUrgeLines, margin, yPosition)

        // Personality Interpretation
        pdf.addPage()
        pdf.setFillColor(10, 10, 31)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        yPosition = margin

        pdf.setTextColor(251, 191, 36)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Personality Interpretation', margin, yPosition)
        yPosition += 12

        pdf.setTextColor(229, 231, 235)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const personalityLines = pdf.splitTextToSize(result.interpretation.personalityInterpretation, contentWidth)
        pdf.text(personalityLines, margin, yPosition)

        // Personal Year Interpretation
        pdf.addPage()
        pdf.setFillColor(10, 10, 31)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')
        yPosition = margin

        pdf.setTextColor(147, 51, 234)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`Personal Year ${new Date().getFullYear()}`, margin, yPosition)
        yPosition += 12

        pdf.setTextColor(229, 231, 235)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const personalYearLines = pdf.splitTextToSize(result.interpretation.personalYearInterpretation, contentWidth)
        pdf.text(personalYearLines, margin, yPosition)

        // Footer on last page
        pdf.setTextColor(107, 114, 128)
        pdf.setFontSize(8)
        pdf.text('Generated by Zodiacly.online • AI-Powered Numerology', pageWidth / 2, pageHeight - 10, {
          align: 'center',
        })
      }

      pdf.save(`${result.fullName.replace(/\s+/g, '-')}-numerology-report.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
      setError('Failed to export PDF report')
    } finally {
      setExporting(false)
    }
  }

  const NumberCard = ({
    number,
    title,
    description,
    color
  }: {
    number: number
    title: string
    description: string
    color: string
  }) => {
    const meaning = getNumberMeaning(number)
    const isMasterNumber = number === 11 || number === 22 || number === 33

    return (
      <Card className={`border-${color}/30 hover:border-${color} transition-colors`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className={`text-lg font-bold text-${color} mb-1`}>{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          {isMasterNumber && (
            <Badge variant="pro" className="ml-2">Master</Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className={`text-5xl font-bold text-${color}`}>{number}</div>
          <div>
            <div className="font-semibold text-white">{meaning.title}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {meaning.keywords.slice(0, 3).map((keyword, i) => (
                <span key={i} className="text-xs text-gray-400 bg-cosmic-surface px-2 py-1 rounded">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Calculator Form */}
      {!result ? (
        <Card>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Calculate Your Numerology Numbers
          </h2>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name (as on birth certificate)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Michael Smith"
                className="w-full px-4 py-3 bg-cosmic-surface border border-cosmic-primary/20 rounded-lg focus:border-cosmic-primary focus:outline-none transition-colors"
                disabled={calculating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use your birth name for most accurate results
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Birth Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-cosmic-surface border border-cosmic-primary/20 rounded-lg focus:border-cosmic-primary focus:outline-none transition-colors"
                disabled={calculating}
              />
            </div>

            {error && (
              <Alert type="error">{error}</Alert>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={calculating}
            >
              {calculating ? 'Calculating...' : 'Calculate My Numbers'}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Free instant calculation • No signup required
            </p>
          </form>
        </Card>
      ) : (
        <>
          {/* Results Header */}
          <Card className="bg-gradient-to-r from-cosmic-primary/20 to-cosmic-secondary/20 border-cosmic-primary">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{result.fullName}</h2>
              <p className="text-gray-400">
                {result.birthDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-4"
              >
                Calculate for Someone Else
              </Button>
            </div>
          </Card>

          {/* Core Numbers */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Your Core Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberCard
                number={result.profile.lifePathNumber}
                title="Life Path Number"
                description="Your life's purpose and direction"
                color="cosmic-primary"
              />
              <NumberCard
                number={result.profile.expressionNumber}
                title="Expression Number"
                description="Your talents and destiny"
                color="cosmic-secondary"
              />
              <NumberCard
                number={result.profile.soulUrgeNumber}
                title="Soul Urge Number"
                description="Your inner desires and motivations"
                color="cosmic-accent"
              />
              <NumberCard
                number={result.profile.personalityNumber}
                title="Personality Number"
                description="How others see you"
                color="cosmic-gold"
              />
            </div>
          </div>

          {/* Additional Numbers */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Additional Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NumberCard
                number={result.profile.birthdayNumber}
                title="Birthday Number"
                description="Special talents"
                color="cosmic-primary"
              />
              <NumberCard
                number={result.profile.maturityNumber}
                title="Maturity Number"
                description="Goals for later life"
                color="cosmic-secondary"
              />
              <NumberCard
                number={result.profile.personalYearNumber}
                title={`Personal Year ${new Date().getFullYear()}`}
                description="Theme for this year"
                color="cosmic-accent"
              />
            </div>
          </div>

          {/* AI Reading Section */}
          {!result.interpretation ? (
            <Card className="text-center bg-gradient-to-r from-cosmic-primary/10 to-cosmic-secondary/10">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold mb-2">Want Deeper Insights?</h3>
              <p className="text-gray-400 mb-6">
                Get AI-powered interpretations of all your numbers with detailed explanations of what they mean for your life
              </p>
              <Button
                size="lg"
                onClick={handleGetAIReading}
                loading={generatingAI}
              >
                {generatingAI ? 'Generating...' : user?.plan === 'PRO' ? 'Generate AI Reading' : 'Get Full AI Reading (PRO)'}
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                {user?.plan === 'PRO' ? 'Click to generate your personalized reading' : 'Unlock detailed interpretations with PRO plan'}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* PDF Export Button */}
              <Card className="bg-gradient-to-r from-cosmic-primary/10 to-cosmic-secondary/10 border-cosmic-primary">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Download Your Complete Report</h3>
                    <p className="text-sm text-gray-400">
                      Save your numerology profile and AI interpretations as a beautiful PDF
                    </p>
                  </div>
                  <Button
                    onClick={exportNumerologyPDF}
                    disabled={exporting}
                    size="lg"
                  >
                    {exporting ? 'Generating...' : '📊 Full PDF Report'}
                  </Button>
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold mb-4">AI Overview</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {result.interpretation.overview}
                </p>
              </Card>

              {user?.plan === 'PRO' && (
                <>
                  <Card>
                    <h3 className="text-xl font-bold mb-3 text-cosmic-primary">Life Path Interpretation</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.interpretation.lifePathInterpretation}
                    </p>
                  </Card>

                  <Card>
                    <h3 className="text-xl font-bold mb-3 text-cosmic-secondary">Expression Number Interpretation</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.interpretation.expressionInterpretation}
                    </p>
                  </Card>

                  <Card>
                    <h3 className="text-xl font-bold mb-3 text-cosmic-accent">Soul Urge Interpretation</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.interpretation.soulUrgeInterpretation}
                    </p>
                  </Card>

                  <Card>
                    <h3 className="text-xl font-bold mb-3 text-cosmic-gold">Personality Interpretation</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.interpretation.personalityInterpretation}
                    </p>
                  </Card>

                  <Card>
                    <h3 className="text-xl font-bold mb-3 text-cosmic-primary">Personal Year {new Date().getFullYear()}</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.interpretation.personalYearInterpretation}
                    </p>
                  </Card>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
