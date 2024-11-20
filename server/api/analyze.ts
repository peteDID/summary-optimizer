// server/api/analyze.ts

import { OpenAI } from 'openai'
import * as cheerio from 'cheerio'
import { 
  EVALUATION_PROMPT,
  getSummaryPrompt,
  parseSummaryResponse,
  AlignmentScore,
  DEFAULT_ALIGNMENT_SCORES 
} from '../../constants/prompts'

interface RequestError {
  statusCode?: number;
  message: string;
}

function extractCleanText(html: string): { title: string; content: string } {
  const $ = cheerio.load(html)
  
  // Remove unwanted elements
  $('script').remove()
  $('style').remove()
  $('nav').remove()
  $('header').remove()
  $('footer').remove()
  $('aside').remove()
  $('comments').remove()
  
  // Extract title
  const title = $('h1').first().text().trim() || 
                $('title').text().trim() || 
                ''
                
  // Extract main content
  const article = $('article').text() || 
                 $('.post-content').text() || 
                 $('.body').text()
  
  // Clean the text
  const cleanContent = article
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim()
  
  return {
    title,
    content: cleanContent
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { url, promptType = 'arc' } = await readBody(event)
  
  const openai = new OpenAI({
    apiKey: config.openaiApiKey
  })

  try {
    // Fetch and process the content
    const response = await fetch(url)
    if (!response.ok) {
      throw createError({
        statusCode: 400,
        message: 'Failed to fetch URL'
      })
    }
    
    const html = await response.text()
    const { title, content } = extractCleanText(html)
    
    // Generate the summary and category in one call
    const summaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: getSummaryPrompt(promptType)
        },
        {
          role: 'user',
          content: content
        }
      ]
    })

    const summaryResponse = summaryCompletion.choices[0]?.message?.content || ''
    const { category, summary } = parseSummaryResponse(summaryResponse)

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

    let alignmentScores: AlignmentScore;
    try {
      alignmentScores = JSON.parse(evaluationCompletion.choices[0]?.message?.content || '{}')
      
      // Validate all required fields are present
      const requiredFields = [
        'tone',
        'voice',
        'dictionAndSyntax',
        'figurativeLanguage',
        'rhythmAndCadence',
        'keyPointsAndStructure'
      ]

      // Check if all required fields exist
      const hasAllFields = requiredFields.every(field => 
        alignmentScores[field as keyof AlignmentScore] !== undefined
      )

      if (!hasAllFields) {
        throw new Error('Invalid alignment scores structure')
      }
      
      // Validate each score detail has all required properties
      Object.entries(alignmentScores).forEach(([key, detail]) => {
        if (!detail.score || !detail.rationale || !detail.example) {
          throw new Error(`Invalid score detail for ${key}`)
        }
        
        // Validate score is one of the allowed values
        if (!['Closely Aligned', 'Partially Aligned', 'Not Aligned'].includes(detail.score)) {
          throw new Error(`Invalid score value for ${key}`)
        }
      })

    } catch (error) {
      console.error('Error parsing alignment scores:', error)
      alignmentScores = DEFAULT_ALIGNMENT_SCORES
    }

    return {
      title,
      category,
      summary,
      content,
      alignmentScores
    }

  } catch (error: unknown) {
    console.error('Error:', error)
    
    if (error instanceof Error) {
      throw createError({
        statusCode: (error as RequestError).statusCode || 500,
        message: error.message || 'Error analyzing content'
      })
    }
    
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred'
    })
  }
})