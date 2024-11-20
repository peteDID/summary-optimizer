<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-stone-100 font-sans">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8 text-center">
        <h1 class="text-2xl font-light text-gray-600 mb-2">
          How well do AI generated summaries align with the orginal prose?
        </h1>
      </header>

      <main class="max-w-6xl mx-auto">
        <!-- URL Input -->
        <div class="bg-white shadow-lg rounded-lg mb-8">
          <div class="p-6">
            <div class="flex gap-4">
              <input 
                v-model="url"
                type="text"
                placeholder="Enter article URL and choose your AI summary"
                class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                v-model="promptType"
                class="px-4 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 8px center; background-size: 16px;"
              >
                <option value="arc">Arc Browser</option>
                <option value="openai">OpenAI Default</option>
              </select>
              <button 
                @click="analyzeContent"
                :disabled="isLoading"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 
                       transition-colors duration-200"
              >
                <span v-if="isLoading" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Evaluating...
                </span>
                <span v-else>Check Alignment</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div v-if="results" class="space-y-8">
          <!-- Title -->
          <div class="bg-white rounded-lg">
            <div class="p-6">
              <div class="flex items-center gap-3">
                <h2 class="text-xl font-regular">{{ results.title }}</h2>
                <span 
                  class="px-8 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                  :class="{
                    'bg-stone-100 text-blue-800': results.category === 'News',
                    'bg-stone-100 text-green-800': results.category === 'Health',
                    'bg-stone-100 text-purple-800': results.category === 'Thought Piece',
                    'bg-stone-100 text-yellow-800': results.category === 'Fiction'
                  }"
                >
                  {{ results.category }}
                </span>
              </div>
            </div>
          </div>

          

          <!-- Summary Alignment Overview -->
          <div class="bg-white rounded-lg p-6">
            <h2 class="text-lg font-light text-stone-500 mb-4">Summary Alignment Overview</h2>
            <div class="text-sm text-gray-600">
              <p class="mb-4">Key elements lost in summarization:</p>
              <ul class="list-disc pl-5 space-y-2">
                <li v-if="getLostElements.tone">
                  <span class="font-medium">Tone:</span> {{ getLostElements.tone }}
                </li>
                <li v-if="getLostElements.voice">
                  <span class="font-medium">Voice:</span> {{ getLostElements.voice }}
                </li>
                <li v-if="getLostElements.style">
                  <span class="font-medium">Style:</span> {{ getLostElements.style }}
                </li>
                <li v-if="getLostElements.content">
                  <span class="font-medium">Content:</span> {{ getLostElements.content }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Alignment Scores Section -->
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-light ml-6 text-stone-500">Summary Alignment</h2>
              <button 
                v-if="!isEditing"
                @click="reanalyze"
                :disabled="isReanalyzing"
                class="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50"
              >
                <span v-if="isReanalyzing" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Re-analysing...
                </span>
                <span v-else>Re-analyse</span>
              </button>
            </div>

            <!-- 3x2 Grid of Score Cards -->
            <div class="grid grid-cols-3 gap-6">
              <div 
                v-for="(score, key) in results.alignmentScores" 
                :key="key"
                class="bg-white rounded-lg p-6"
              >
              <h3 class="text-sm font-semibold text-gray-600 mb-2">{{ titleMappings[key] }}</h3>
                <div :class="getScorePillClass(score.score)">
                  {{ score.score }}
                </div>
                <div class="mt-2 text-xs text-gray-600">
                  <p class="mb-1">{{ score.rationale }}</p>
                  
                  <!-- Collapsible Example Section -->
                  <div class="mt-2">
                    <button 
                      @click="toggleExample(key)"
                      class="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium flex items-center gap-1"
                    >
                      Example
                      <svg 
                        class="w-3 h-3 transform transition-transform duration-200"
                        :class="{ 'rotate-180': expandedExamples[key] }"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <transition
                      enter-active-class="transition-all duration-300 ease-in-out"
                      leave-active-class="transition-all duration-300 ease-in-out"
                      enter-from-class="opacity-0 max-h-0"
                      enter-to-class="opacity-100 max-h-[500px]"
                      leave-from-class="opacity-100 max-h-[500px]"
                      leave-to-class="opacity-0 max-h-0"
                    >
                      <div 
                        v-if="expandedExamples[key]"
                        class="bg-gray-50 p-2 rounded mt-2 overflow-hidden"
                      >
                        {{ score.example }}
                      </div>
                    </transition>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Section -->
          <div class="bg-white rounded-lg">
            <div class="p-6">
              <button 
                @click="isSummaryExpanded = !isSummaryExpanded"
                class="w-full flex justify-between items-center text-lg font-light text-stone-500 mb-4 hover:text-blue-600 
                       transition-colors duration-200"
              >
                <span>Typical AI Generated Summary by {{ promptType }} </span>
                <span class="text-blue-600 text-sm font-normal flex items-center gap-2">
                  {{ isSummaryExpanded ? 'Collapse' : 'Expand' }}
                  <svg 
                    class="w-4 h-4 transform transition-transform duration-200"
                    :class="{ 'rotate-180': isSummaryExpanded }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <transition
                enter-active-class="transition-all duration-300 ease-in-out"
                leave-active-class="transition-all duration-300 ease-in-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[2000px]"
                leave-from-class="opacity-100 max-h-[2000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="isSummaryExpanded" class="space-y-4">
                  <!-- Summary Display -->
                  <div v-if="!isEditing" class="prose max-w-none whitespace-pre-wrap">
                    {{ currentSummary }}
                    <div class="mt-4 flex justify-end">
                      <button 
                        @click="isEditing = true"
                        class="text-blue-600 text-sm hover:text-blue-800 transition-colors duration-200"
                      >
                        Edit Summary
                      </button>
                    </div>
                  </div>

                  <!-- Summary Editor -->
                  <div v-else class="space-y-4">
                    <textarea
                      v-model="editedSummary"
                      rows="8"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your custom summary..."
                    ></textarea>
                    <div class="flex justify-end gap-3">
                      <button
                        @click="resetSummary"
                        class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        Reset to AI Summary
                      </button>
                      <button
                        @click="saveSummary"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        Save & Re-analyse
                      </button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Article Content -->
          <div class="bg-white rounded-lg">
            <div class="p-6">
              <button 
                @click="isContentExpanded = !isContentExpanded"
                class="w-full flex justify-between items-center text-lg font-light text-stone-500 mb-4 hover:text-blue-600 
                       transition-colors duration-200"
              >
                <span>Article Content</span>
                <span class="text-blue-600 text-sm font-normal flex items-center gap-2">
                  {{ isContentExpanded ? 'Collapse' : 'Expand' }}
                  <svg 
                    class="w-4 h-4 transform transition-transform duration-200"
                    :class="{ 'rotate-180': isContentExpanded }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <transition
                enter-active-class="transition-all duration-300 ease-in-out"
                leave-active-class="transition-all duration-300 ease-in-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-[2000px]"
                leave-from-class="opacity-100 max-h-[2000px]"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="!isContentExpanded" class="prose max-w-none overflow-hidden">
                  {{ truncatedContent }}
                  <div class="mt-2 text-blue-600 text-sm cursor-pointer hover:text-blue-800 transition-colors duration-200" 
                       @click.stop="isContentExpanded = true">
                    Click to read more...
                  </div>
                </div>

                <div v-else class="prose max-w-none whitespace-pre-wrap">
                  {{ results.content }}
                </div>
              </transition>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const url = ref('')
const isLoading = ref(false)
const isReanalyzing = ref(false)
const results = ref(null)
const isContentExpanded = ref(false)
const isSummaryExpanded = ref(true)
const isEditing = ref(false)
const editedSummary = ref('')
const currentSummary = computed(() => results.value?.summary || '')
const promptType = ref('arc')
const expandedExamples = ref({})

// Computed property for truncated content
const truncatedContent = computed(() => {
  if (!results.value?.content) return ''
  
  const words = results.value.content.split(' ')
  if (words.length <= 50) return results.value.content
  
  return words.slice(0, 50).join(' ') + '...'
})

// Format title helper
const titleMappings = {
  tone: 'Tone',
  voice: 'Voice',
  dictionAndSyntax: 'Diction & Syntax',
  figurativeLanguage: 'Figurative Language',
  rhythmAndCadence: 'Rhythm & Cadence',
  keyPointsAndStructure: 'Key Points & Structure'
}

// Toggle example visibility
function toggleExample(key) {
  expandedExamples.value[key] = !expandedExamples.value[key]
}

// Get score pill class
function getScorePillClass(score) {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium text-center'
  
  switch (score) {
    case 'Closely Aligned':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Partially Aligned':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'Not Aligned':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

// Computed property for lost elements summary
const getLostElements = computed(() => {
  if (!results.value?.alignmentScores) return {}
  
  const scores = results.value.alignmentScores
  const elements = {
    tone: '',
    voice: '',
    style: '',
    content: ''
  }
  
  if (scores.tone.score !== 'Closely Aligned') {
    elements.tone = 'Original emotional resonance and attitude are diminished'
  }
  
  if (scores.voice.score !== 'Closely Aligned') {
    elements.voice = "Author's unique expression style is not fully preserved"
  }
  
  if (scores.dictionAndSyntax.score !== 'Closely Aligned' || 
      scores.figurativeLanguage.score !== 'Closely Aligned') {
    elements.style = 'Literary devices and language complexity are simplified'
  }
  
  if (scores.keyPointsAndStructure.score !== 'Closely Aligned') {
    elements.content = 'Some nuanced arguments and supporting details are omitted'
  }
  
  return elements
})

async function analyzeContent() {
  if (!url.value) return
  
  isLoading.value = true
  results.value = null
  isContentExpanded.value = false
  isEditing.value = false
  editedSummary.value = ''
  
  try {
    const response = await $fetch('/api/analyze', {
      method: 'POST',
      body: { 
        url: url.value,
        promptType: promptType.value
      }
    })
    results.value = response
  } catch (error) {
    console.error('Analysis error:', error)
  } finally {
    isLoading.value = false
  }
}

async function reanalyze() {
  if (!results.value?.content) return
  
  isReanalyzing.value = true
  
  try {
    const response = await $fetch('/api/analyze/scores', {
      method: 'POST',
      body: {
        content: results.value.content,
        summary: results.value.summary
      }
    })
    results.value = {
      ...results.value,
      alignmentScores: response.alignmentScores
    }
  } catch (error) {
    console.error('Re-analysis error:', error)
  } finally {
    isReanalyzing.value = false
  }
}

function resetSummary() {
  editedSummary.value = results.value?.summary || ''
}

async function saveSummary() {
  if (!editedSummary.value || !results.value?.content) return
  
  isReanalyzing.value = true
  
  try {
    const response = await $fetch('/api/analyze/scores', {
      method: 'POST',
      body: {
        content: results.value.content,
        summary: editedSummary.value
      }
    })
    
    results.value = {
      ...results.value,
      summary: editedSummary.value,
      alignmentScores: response.alignmentScores
    }
    
    isEditing.value = false
  } catch (error) {
    console.error('Summary update error:', error)
  } finally {
    isReanalyzing.value = false
  }
}

// Watch for summary changes
watch(() => results.value?.summary, (newSummary) => {
  if (newSummary && !editedSummary.value) {
    editedSummary.value = newSummary
  }
})
</script>

<style scoped>
/* Import Inter font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Apply custom font settings */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Base font settings */
html {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom class for prose content */
.prose {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.75;
  color: #374151;
}

/* Ensure pills have consistent width and font */
[class*="bg-"][class*="text-"] {
  min-width: 120px;
  display: inline-block;
  font-family: var(--font-sans);
}

/* Example box styling with updated font */
.bg-gray-50 {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  line-height: 1.25;
}

/* Additional font weight utilities */
.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

/* Enhance heading styles */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  letter-spacing: -0.025em;
}

/* Optional: Adjust specific text elements */
.text-3xl {
  letter-spacing: -0.03em;
}

.text-xl, .text-2xl {
  letter-spacing: -0.02em;
}
</style>