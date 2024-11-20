// constants/prompts.ts

export const ARC_SUMMARY_SYSTEM_PROMPT = `# System Prompt for Article Analysis and Summary Generation
## Core Instructions
First, categorize this article as exactly one of these categories:
- Health: Articles about medical research, wellness, fitness, nutrition, or public health
- News: Current events, reportage, breaking news, or investigative journalism
- Thought Piece: Opinion articles, essays, analysis, commentary, or philosophical discussions
- Fiction: Short stories, creative writing, or narrative fiction

Then, generate a structured and concise summary for the given text. The summary should include the following sections:

Main Headline: Start with a brief statement or headline that captures the central focus or key takeaway of the content.
Key Points in Bullet Format:
Organize the main points into bullet points, categorizing them into clear sections based on the content (e.g., key issues, features, highlights).
For each point, provide a concise and informative description that captures the essence of the topic without unnecessary details.
Categorization: Group related information under distinct headings to provide clarity and organization (e.g., 'Features,' 'Strategy').
Neutral and Objective Tone: Maintain a neutral, informative, and factual tone throughout the summary.
Ensure the summary is accessible and easy to read, focusing on delivering key information quickly and effectively. Avoid direct quotes and focus on paraphrasing the core ideas.

## Response Format
Respond in this exact format:
CATEGORY: [category name]
SUMMARY: [your summary text]`

export const OPENAI_DEFAULT_SUMMARY_SYSTEM_PROMPT = `# System Prompt for Article Analysis and Summary Generation
## Core Instructions
First, categorize this article as exactly one of these categories:
- Health: Articles about medical research, wellness, fitness, nutrition, or public health
- News: Current events, reportage, breaking news, or investigative journalism
- Thought Piece: Opinion articles, essays, analysis, commentary, or philosophical discussions
- Fiction: Short stories, creative writing, or narrative fiction

Then, summarize the main points of this article in a clear and concise manner. Provide a brief overview that captures the key takeaways, avoiding any unnecessary details or fluff. Aim for a summary suitable for users looking for a quick understanding of the content.

## Response Format
Respond in this exact format:
CATEGORY: [category name]
SUMMARY: [your summary text]`



export const EVALUATION_PROMPT = `Analyze how well the summary aligns with the original content across these writing elements:

1. Tone
   - Author's attitude toward the subject
   - Emotional resonance (serious, ironic, playful, somber)
   - Formal vs. informal approach
   
2. Voice
   - Author's unique expression style
   - Distinctive writing characteristics
   - Overall narrative approach

3. Diction & Syntax
   - Word choice and vocabulary level
   - Sentence structure patterns
   - Complexity and arrangement of phrases

4. Figurative Language
   - Use of metaphors and similes
   - Personification and imagery
   - Creative expression of abstract ideas

5. Rhythm & Cadence
   - Flow between sentences
   - Patterns of stressed/unstressed elements
   - Variation in sentence length
   - Overall prose musicality

6. Key Points & Structure
   - Main argument emphasis
   - Supporting detail balance
   - Organizational flow

For each aspect, provide:
- A classification: "Closely Aligned", "Partially Aligned", or "Not Aligned"
- A brief rationale for the classification (1-2 sentences)
- A specific example comparing the original and summary

Return the analysis as a JSON object with this structure:
{
  "tone": {
    "score": "classification",
    "rationale": "brief explanation of how well the summary maintains the original's attitude and emotional resonance",
    "example": "specific example comparing tone elements"
  },
  "voice": {
    "score": "classification",
    "rationale": "brief explanation of how well the summary preserves the author's unique expression style",
    "example": "specific example comparing voice characteristics"
  },
  "dictionAndSyntax": {
    "score": "classification",
    "rationale": "brief explanation of word choice and sentence structure alignment",
    "example": "specific example comparing language patterns"
  },
  "figurativeLanguage": {
    "score": "classification",
    "rationale": "brief explanation of how well metaphors, imagery, and creative expression are maintained",
    "example": "specific example comparing figurative elements"
  },
  "rhythmAndCadence": {
    "score": "classification",
    "rationale": "brief explanation of flow and musicality alignment",
    "example": "specific example comparing writing rhythm"
  },
  "keyPointsAndStructure": {
    "score": "classification",
    "rationale": "brief explanation of how well main arguments and organization are preserved",
    "example": "specific example comparing structural elements"
  }
}`


// Export a function to get the appropriate prompt based on type
export function getSummaryPrompt(type: string) {
    return type === 'openai' ? OPENAI_DEFAULT_SUMMARY_SYSTEM_PROMPT : ARC_SUMMARY_SYSTEM_PROMPT
  }


// Add the parseSummaryResponse function
export function parseSummaryResponse(response: string): { category: string; summary: string } {
  const categoryMatch = response.match(/CATEGORY:\s*(.*)/i)
  const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*)/i)
  
  return {
    category: categoryMatch?.[1]?.trim() || 'News',
    summary: summaryMatch?.[1]?.trim() || response.trim()
  }
}

// Also export the interfaces and default scores
export interface AlignmentScoreDetail {
    score: 'Closely Aligned' | 'Partially Aligned' | 'Not Aligned';
    rationale: string;
    example: string;
}

export interface AlignmentScore {
    tone: AlignmentScoreDetail;
    voice: AlignmentScoreDetail;
    dictionAndSyntax: AlignmentScoreDetail;
    figurativeLanguage: AlignmentScoreDetail;
    rhythmAndCadence: AlignmentScoreDetail;
    keyPointsAndStructure: AlignmentScoreDetail;
}

export const DEFAULT_ALIGNMENT_SCORES: AlignmentScore = {
    tone: {
        score: 'Partially Aligned',
        rationale: 'Unable to evaluate tone alignment.',
        example: 'N/A'
    },
    voice: {
        score: 'Partially Aligned',
        rationale: 'Unable to evaluate voice alignment.',
        example: 'N/A'
    },
    dictionAndSyntax: {
        score: 'Partially Aligned',
        rationale: 'Unable to evaluate diction and syntax alignment.',
        example: 'N/A'
    },
    figurativeLanguage: {
        score: 'Partially Aligned',
        rationale: 'Unable to evaluate figurative language alignment.',
        example: 'N/A'
    },
    rhythmAndCadence: {
        score: 'Partially Aligned',
        rationale: 'Unable to evaluate rhythm and cadence alignment.',
        example: 'N/A'
    },
    keyPointsAndStructure: {
        score: 'Partially Aligned',
        rationale: 'Unable to evaluate key points and structure alignment.',
        example: 'N/A'
    }
}