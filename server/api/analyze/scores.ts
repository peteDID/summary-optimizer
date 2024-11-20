// server/api/analyze/scores.ts

import { OpenAI } from 'openai'
import { 
  EVALUATION_PROMPT, 
  AlignmentScore, 
  DEFAULT_ALIGNMENT_SCORES 
} from '../../../constants/prompts'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { content, summary } = await readBody(event)
  
  if (!content || !summary) {
    throw createError({
      statusCode: 400,
      message: 'Content and summary are required'
    })
  }

  const openai = new OpenAI({
    apiKey: config.openaiApiKey
  })

  try {
    // Generate alignment scores with rationales and examples
    const evaluationCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: EVALUATION_PROMPT
        },
        {
          role: 'user',
          content: `Original content: ${content}\n\nSummary: ${summary}`
        }
      ]
    })

    let alignmentScores: AlignmentScore
    try {
      alignmentScores = JSON.parse(evaluationCompletion.choices[0]?.message?.content || '{}')
      
      // Validate the structure of the response
      if (!alignmentScores.tone || !alignmentScores.voice || 
        !alignmentScores.dictionAndSyntax || !alignmentScores.figurativeLanguage ||
        !alignmentScores.rhythmAndCadence || !alignmentScores.keyPointsAndStructure) {
      throw new Error('Invalid alignment scores structure')
    }
      
      // Validate each score detail
      Object.entries(alignmentScores).forEach(([key, detail]) => {
        if (!detail.score || !detail.rationale || !detail.example) {
          throw new Error(`Invalid score detail for ${key}`)
        }
      })
    } catch (error) {
      console.error('Error parsing alignment scores:', error)
      alignmentScores = DEFAULT_ALIGNMENT_SCORES
    }

    return {
      alignmentScores
    }

  } catch (error) {
    console.error('Error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Error analyzing content'
    })
  }
})