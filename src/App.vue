<template>
  <div class="min-h-screen bg-gradient-to-br from-background to-background-alt">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <header class="mb-12 text-center" ref="header">
        <h1
          class="text-5xl font-bold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Beweisverfügung vorschlagen
        </h1>
        <p class="mt-4 text-secondary max-w-2xl mx-auto">
          Lade Dokumente hoch und erhalte einen Vorschlag für eine strukturierte Beweisverfügung nach Art. 154 ZPO
        </p>
      </header>

      <main>
        <!-- Rounds Container -->
        <div class="space-y-8" ref="roundsContainer">
          <div v-for="(round, index) in rounds" :key="index" class="round-container" :ref="`round_${index + 1}`">
            <div class="flex items-center mb-2">
              <h2 class="text-2xl font-semibold text-primary">Runde {{ index + 1 }}</h2>
              <button v-if="index === rounds.length - 1" @click="addRound" class="ml-auto btn-secondary">
                <span class="mr-1">+</span> Runde hinzufügen
              </button>
              <button v-if="rounds.length > 1 && index === rounds.length - 1" @click="removeRound"
                class="ml-4 text-red-500 hover:text-red-700 transition-colors">
                <span class="mr-1">-</span> Entfernen
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column: Kläger -->
              <div class="col-span-1 space-y-4">
                <div class="flex items-center mb-2">
                  <h3 class="text-xl font-medium text-primary">Kläger</h3>
                  <div class="ml-auto items-center hidden">
                    <label class="file-upload-btn" for="klaeger-file-upload">
                      <span>PDF hochladen</span>
                      <input type="file" :id="`klaeger-file-upload-${index}`" class="hidden" accept=".pdf,image/*"
                        @change="(e) => handleFileUpload(e, 'klaeger', index)">
                    </label>
                  </div>
                </div>

                <div class="upload-area" :class="{ 'border-accent': isDragging === `klaeger_${index}` }"
                  @dragover.prevent="isDragging = `klaeger_${index}`" @dragleave.prevent="isDragging = null"
                  @drop.prevent="(e) => handleDrop(e, 'klaeger', index)"
                  @click="$refs[`klaeger_file_${index}`][0].click()"
                  v-if="!round.klaeger.isProcessing && !round.klaeger.text">
                  <input type="file" :ref="`klaeger_file_${index}`" class="hidden" accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'klaeger', index)">
                  <div class="flex flex-col items-center justify-center h-full">
                    <svg class="w-12 h-12 text-accent mb-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="text-secondary">Ziehe eine PDF hierher oder klicke zum Auswählen</p>
                  </div>
                </div>

                <div v-if="round.klaeger.isProcessing" class="p-6 border-2 rounded-xl bg-white">
                  <div class="flex flex-col items-center">
                    <svg class="animate-spin h-10 w-10 text-accent mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    <p class="text-secondary">Dokument wird verarbeitet... {{ round.klaeger.progress }}%</p>
                  </div>
                </div>

                <textarea v-if="!round.klaeger.isProcessing" v-model="round.klaeger.text" class="text-area"
                  placeholder="Text des Klägers eingeben...">
                </textarea>
              </div>

              <!-- Right Column: Beklagter -->
              <div class="col-span-1 space-y-4">
                <div class="flex items-center mb-2">
                  <h3 class="text-xl font-medium text-primary">Antwort Beklagter</h3>
                  <div class="ml-auto items-center hidden">
                    <label class="file-upload-btn" for="beklagter-file-upload">
                      <span>PDF hochladen</span>
                      <input type="file" :id="`beklagter-file-upload-${index}`" class="hidden" accept=".pdf,image/*"
                        @change="(e) => handleFileUpload(e, 'beklagter', index)">
                    </label>
                  </div>
                </div>

                <div class="upload-area" :class="{ 'border-accent': isDragging === `beklagter_${index}` }"
                  @dragover.prevent="isDragging = `beklagter_${index}`" @dragleave.prevent="isDragging = null"
                  @drop.prevent="(e) => handleDrop(e, 'beklagter', index)"
                  @click="$refs[`beklagter_file_${index}`][0].click()"
                  v-if="!round.beklagter.isProcessing && !round.beklagter.text">
                  <input type="file" :ref="`beklagter_file_${index}`" class="hidden" accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'beklagter', index)">
                  <div class="flex flex-col items-center justify-center h-full">
                    <svg class="w-12 h-12 text-accent mb-2" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="text-secondary">Ziehe eine PDF hierher oder klicke zum Auswählen</p>
                  </div>
                </div>

                <div v-if="round.beklagter.isProcessing" class="p-6 border-2 rounded-xl bg-white">
                  <div class="flex flex-col items-center">
                    <svg class="animate-spin h-10 w-10 text-accent mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    <p class="text-secondary">Dokument wird verarbeitet... {{ round.beklagter.progress }}%</p>
                  </div>
                </div>

                <textarea v-if="!round.beklagter.isProcessing" v-model="round.beklagter.text" class="text-area"
                  placeholder="Text des Beklagten eingeben...">
                </textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-12 text-center" ref="submitContainer">
          <button @click="sendToOllama" class="btn-primary" :disabled="isProcessing || !hasValidInput"
            :class="{ 'opacity-50 cursor-not-allowed': isProcessing || !hasValidInput }">
            <span v-if="!isGenerating">An Ollama senden</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Generiere Beweisverfügung...
            </span>
          </button>
        </div>

        <!-- Response Area -->
        <div v-if="ollamaResponse" ref="responseArea" class="response-container mt-16 opacity-0">
          <div class="glassmorphism">
            <h2 class="text-3xl font-bold mb-8 text-primary border-b pb-4">Beweisverfügung</h2>
            <div v-if="isStreaming" class="flex items-center mb-4">
              <div class="streaming-indicator mr-2"></div>
              <div class="text-secondary">Generiere Antwort...</div>
            </div>
            <div class="prose prose-lg max-w-none whitespace-pre-wrap" v-html="formattedResponse"></div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { createWorker } from 'tesseract.js'
import gsap from 'gsap'
import * as pdfjsLib from 'pdfjs-dist'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// State
const rounds = ref([
  {
    klaeger: { text: '', isProcessing: false, progress: 0 },
    beklagter: { text: '', isProcessing: false, progress: 0 }
  }
])
const isGenerating = ref(false)
const isStreaming = ref(false)
const isDragging = ref(null)
const ollamaResponse = ref('')
const formattedResponse = ref('')
const responseChunks = ref([])
const header = ref(null)
const roundsContainer = ref(null)
const submitContainer = ref(null)
const responseArea = ref(null)

// Computed properties
const hasValidInput = computed(() => {
  return rounds.value.some(round =>
    (round.klaeger.text && round.klaeger.text.trim() !== '') ||
    (round.beklagter.text && round.beklagter.text.trim() !== '')
  )
})

// Add a new round
const addRound = () => {
  rounds.value.push({
    klaeger: { text: '', isProcessing: false, progress: 0 },
    beklagter: { text: '', isProcessing: false, progress: 0 }
  })

  nextTick(() => {
    const newRoundIndex = rounds.value.length - 1
    const newRoundEl = document.querySelector(`[ref="round_${newRoundIndex + 1}"]`)

    if (newRoundEl) {
      gsap.from(newRoundEl, {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: newRoundEl,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        }
      })
    }

    // Scroll to the new round
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    })
  })
}

// Remove the last round
const removeRound = () => {
  if (rounds.value.length > 1) {
    const roundEl = document.querySelector(`[ref="round_${rounds.value.length}"]`)

    if (roundEl) {
      gsap.to(roundEl, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          rounds.value.pop()
        }
      })
    } else {
      rounds.value.pop()
    }
  }
}

// File handling
const handleFileUpload = async (event, type, roundIndex) => {
  const file = event.target.files[0]
  if (!file) return

  rounds.value[roundIndex][type].isProcessing = true
  rounds.value[roundIndex][type].progress = 0
  rounds.value[roundIndex][type].text = ''

  try {
    if (file.type === 'application/pdf') {
      await processPDF(file, type, roundIndex)
    } else {
      await processImage(file, type, roundIndex)
    }
  } catch (error) {
    console.error('Error processing file:', error)
  } finally {
    rounds.value[roundIndex][type].isProcessing = false
  }
}

const handleDrop = async (event, type, roundIndex) => {
  isDragging.value = null
  const file = event.dataTransfer.files[0]
  if (!file) return

  rounds.value[roundIndex][type].isProcessing = true
  rounds.value[roundIndex][type].progress = 0

  try {
    if (file.type === 'application/pdf') {
      await processPDF(file, type, roundIndex)
    } else {
      await processImage(file, type, roundIndex)
    }
  } catch (error) {
    console.error('Error processing file:', error)
  } finally {
    rounds.value[roundIndex][type].isProcessing = false
  }
}

// PDF Processing
const processPDF = async (file, type, roundIndex) => {
  const pdfjs = await import('pdfjs-dist/build/pdf')
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

  const reader = new FileReader()
  reader.onload = async function (event) {
    const typedarray = new Uint8Array(event.target.result)
    const pdf = await pdfjsLib.getDocument(typedarray).promise

    let fullText = ''
    const totalPages = pdf.numPages

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      rounds.value[roundIndex][type].progress = Math.round((pageNum / totalPages) * 100)

      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      let lastY = null
      let pageText = ""

      // Sort items by their vertical position (top to bottom)
      const items = textContent.items.sort(
        (a, b) =>
          b.transform[5] - a.transform[5] ||
          a.transform[4] - b.transform[4]
      )

      // Process each text item
      for (const item of items) {
        const y = item.transform[5]

        // If we have a previous y-coordinate to compare with
        if (lastY !== null) {
          // If the difference is more than a small threshold, it's a new line
          if (Math.abs(y - lastY) > 20) {
            pageText += "\n\n"
          } else if (Math.abs(y - lastY) > 5) {
            pageText += "\n"
          } else if (item.transform[4] === 0) {
            // If x-coordinate is 0, it might also be a new line
            pageText += "\n"
          } else {
            // Same line, add a space
            pageText += " "
          }
        }

        pageText += item.str
        lastY = y
      }

      fullText += pageText + "\n\n" // Add double newline between pages
    }

    rounds.value[roundIndex][type].text = fullText.trim()
  }

  reader.readAsArrayBuffer(file)
}

// Image Processing
const processImage = async (file, type, roundIndex) => {
  try {
    const worker = await createWorker('deu')

    // Convert File to base64
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })

    const { data: { text } } = await worker.recognize(base64Image, {
      progress: (p) => {
        rounds.value[roundIndex][type].progress = Math.round(p.progress * 100)
      }
    })

    rounds.value[roundIndex][type].text = text.trim()
    await worker.terminate()
  } catch (error) {
    console.error('Tesseract error:', error)
  }
}

// Build prompt from rounds
const buildPrompt = () => {
  let fullPrompt = '';

  rounds.value.forEach((round, index) => {
    const roundNum = index + 1;

    if (round.klaeger.text && round.klaeger.text.trim() !== '') {
      fullPrompt += `<Klaeger_Runde_${roundNum}>\n${round.klaeger.text.trim()}\n</Klaeger_Runde_${roundNum}>\n\n`;
    }

    if (round.beklagter.text && round.beklagter.text.trim() !== '') {
      fullPrompt += `<Antwort_Beklagter_Runde_${roundNum}>\n${round.beklagter.text.trim()}\n</Antwort_Beklagter_Runde_${roundNum}>\n\n`;
    }
  });

  return fullPrompt;
}

// Process markdown to HTML
const markdownToHtml = (text) => {
  // Simple markdown processing (could be replaced with a more robust markdown parser)
  let html = text
    // Headers
    .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
    .replace(/#### (.*?)\n/g, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>')
    // Lists
    .replace(/- (.*?)(?:\n|$)/g, '<li class="ml-4">$1</li>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')

  return html
}

// Ollama Integration with Streaming
const sendToOllama = async () => {
  isGenerating.value = true
  isStreaming.value = true
  ollamaResponse.value = ''
  formattedResponse.value = ''
  responseChunks.value = []

  // Ensure response area is visible
  if (responseArea.value) {
    gsap.to(responseArea.value, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    })

    // Scroll to response area
    setTimeout(() => {
      responseArea.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 500)
  }

  try {
    const fullPrompt = buildPrompt()

    // Start streaming request
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:27b',
        prompt: `Du bist eine Person mit einem juristischen Abschluss an einer schweizerischen Universtität und arbeitest an einem erstinstanzlichen Gericht in der Schweiz. Du leitest ein Zivilverfahren. Du musst eine Beweisverfügung nach der Schweizerischen Zivilprozessordnung bzw. dessen Art. 154 ZPO machen. Art. 154 ZPO hat im Wesentlichen folgenden Inhalt: In der Beweisverfügung werden insbesondere die zugelassenen Beweismittel bezeichnet und wird bestimmt, welcher Partei zu welchen Tatsachen der Haupt- oder der Gegenbeweis obliegt. 

Beweis wird über strittige, wesentliche Tatsachenbehauptungen geführt. Beweis wird auch geführt, wenn der Sachverhalt von Amtes wegen zu klären ist. Wesentlich ist eine Tatsache, die einem Element einer materiellen Norm zugeordnet werden kann bzw. einer vertraglichen Regel zugeordnet werden kann. 

Du studierst dazu die Rechtsschriften (Klage, Klageantwort, Replik und Duplik), welche Grundlage für die Antworten zu vorliegenden Fragen bilden. Du gehst absatzweise vor, wobei die Absätze in der Regel durch eine Leerzeile getrennt sind. 

Im Wesentlichen sind folgende Fragen zu beantworten: Sind in den beiden Rechtsschriften zum selben Thema verschiedene Standpunkte eingenommen und wenn ja: Welcher Standpunkt in welchem Dokument mit welchen Beweismitteln jeweils? Führe diese Punkte als "Streitige Tatsachen". Ordne die Beweismittel übersichtlich zu.

Wenn gleiche Standpunkte eingenommen worden sind, dann genügt es, den übereinstimmenden Punkte aufzuführen. Dies unter dem Titel: "Unstreitige Tatsachen".

Gib eine strukturierte, kurze Antwort. Jeden streitigen Punkt auf einer eigenen Zeile. Jedes Beweismittel auf einer eigenen Zeile.:\n\n

${fullPrompt}

\n\n**Kontext:**  
Du hast einen juristischen Abschluss an einer schweizerischen Universität und arbeitest an einem erstinstanzlichen Gericht in der Schweiz. Du leitest ein Zivilverfahren und musst eine Beweisverfügung gemäss Art. 154 ZPO der Schweizerischen Zivilprozessordnung verfassen.  

**Aufgabe:**  
Du analysierst die eingereichten Rechtsschriften (Klage, Klageantwort, Replik, Duplik) und erstellst eine strukturierte Beweisverfügung. Dabei gehst du absatzweise vor, wobei Absätze in der Regel durch eine Leerzeile getrennt sind.  

**Vorgehen:**  
1. Identifiziere streitige Tatsachen: Dies sind Tatsachen, zu denen Kläger und Beklagter unterschiedliche Standpunkte vertreten.  
   - Führe die jeweilige Behauptung der Parteien samt den dazugehörigen Beweismitteln auf.  
   - Strukturiere die Angaben übersichtlich. Jede streitige Tatsache kommt auf eine eigene Zeile, gefolgt von den entsprechenden Beweismitteln.  

2. Identifiziere unstreitige Tatsachen: Dies sind Tatsachen, die von beiden Parteien gleich dargestellt werden.  
   - Führe diese kurz und knapp unter dem Titel "Unstreitige Tatsachen" auf.  

3. **Struktur des Outputs:**  
   - Beginne mit der Überschrift **"Beweisverfügung gemäss Art. 154 ZPO"**.  
   - Gliedere die Antwort in **"Unstreitige Tatsachen"** und **"Streitige Tatsachen"**.  
   - Nutze eine klare, einheitliche Formatierung.  
   - Jede streitige Tatsache erhält eine separate Untergliederung, die jeweils die Behauptung von Kläger und Beklagtem sowie die Beweismittel enthält.  

**Beispielhafte Ausgabe:**  
### Beweisverfügung gemäss Art. 154 ZPO  

#### Unstreitige Tatsachen  
- [Tatsache X]  

#### Streitige Tatsachen  
1. **[Streitige Tatsache 1]**  
   - **Kläger:** [Behauptung des Klägers]  
     - **Beweismittel:**  
       - [Beweismittel 1]  
       - [Beweismittel 2]  
   - **Beklagter:** [Behauptung des Beklagten]  
     - **Beweismittel:**  
       - [Beweismittel 1]  
       - [Beweismittel 2]  

2. **[Streitige Tatsache 2]**  
   - **Kläger:** [Behauptung des Klägers]  
     - **Beweismittel:**  
       - [Beweismittel 1]  
   - **Beklagter:** [Behauptung des Beklagten]  
     - **Beweismittel:**  
       - [Beweismittel 1]`,
        stream: true
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    // Read streaming response
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.trim() === '') continue

        try {
          const parsedLine = JSON.parse(line)
          if (parsedLine.response) {
            responseChunks.value.push(parsedLine.response)
            ollamaResponse.value += parsedLine.response
            formattedResponse.value = markdownToHtml(ollamaResponse.value)
          }
        } catch (e) {
          console.error('Error parsing JSON line:', e)
        }
      }
    }

  } catch (error) {
    console.error('Error calling Ollama:', error)
    ollamaResponse.value = `Error: ${error.message}`
    formattedResponse.value = ollamaResponse.value
  } finally {
    isGenerating.value = false
    isStreaming.value = false
  }
}

// Animations
onMounted(() => {
  // Initial animations
  gsap.from(header.value, {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  gsap.from(roundsContainer.value.children, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.3
  })

  gsap.from(submitContainer.value, {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.5
  })

  // Initialize scroll animations
  ScrollTrigger.batch(".round-container", {
    interval: 0.1,
    onEnter: batch => gsap.to(batch, {
      opacity: 1,
      y: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: "power2.out"
    }),
    start: "top bottom-=100px",
    once: true
  })
})
</script>

<style>
.streaming-indicator {
  width: 12px;
  height: 12px;
  background-color: #00B894;
  border-radius: 50%;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.glassmorphism {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.response-container {
  transform: translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.text-area {
  @apply w-full min-h-[250px] p-5 border-2 border-gray-200 rounded-xl resize-y focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white transition-all duration-200 shadow-sm;
}

.upload-area {
  @apply w-full h-[120px] border-2 border-dashed border-gray-300 rounded-xl transition-all duration-300 cursor-pointer bg-white/80 hover:bg-white flex items-center justify-center;
}

.file-upload-btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent/80 cursor-pointer transition-colors;
}

.btn-primary {
  @apply px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-white font-medium shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50;
}

.btn-secondary {
  @apply px-4 py-2 rounded-lg bg-secondary/10 text-secondary font-medium hover:bg-secondary/20 transition-colors duration-300;
}
</style>