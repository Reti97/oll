<template>
  <div class="galaxy-background">
    <div class="light-dots"></div>
    <div class="container mx-auto px-4 py-8 max-w-7xl relative z-10">
      <header class="mb-16 text-center" ref="header">
        <div class="glimmer-wrapper mb-4">
          <h1 class="text-6xl font-bold glimmer-text glitch-text" data-text="Beweisverfügung vorschlagen">
            Beweisverfügung vorschlagen
          </h1>
        </div>
        <p class="mt-6 text-white/80 max-w-2xl mx-auto text-lg fancy-text">
          Lade Dokumente hoch und erhalte einen Vorschlag für eine strukturierte Beweisverfügung nach Art. 154 ZPO
        </p>
      </header>

      <main>
        <!-- Rounds Container -->
        <div class="space-y-12 reveal-content" ref="roundsContainer">
          <div v-for="(round, index) in rounds" :key="index" class="round-container hover-glow px-5 py-8"
            :ref="`round_${index + 1}`">
            <div class="flex items-center mb-2 reveal-item">
              <h2 class="text-2xl font-semibold text-gradient">Runde {{ index + 1 }}</h2>
              <button v-if="index === rounds.length - 1" @click="addRound" class="ml-auto fancy-button-secondary">
                <span class="mr-1">+</span> Runde hinzufügen
              </button>
              <button v-if="rounds.length > 1 && index === rounds.length - 1" @click="removeRound"
                class="ml-4 text-red-500 hover:text-red-700 transition-colors fancy-button-danger">
                <span class="mr-1">-</span> Entfernen
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column: Kläger -->
              <div class="col-span-1 space-y-4 floating-card">
                <div class="flex items-center mb-2">
                  <h3 class="text-xl font-medium text-gradient">Kläger</h3>
                  <div class="ml-auto hidden items-center">
                    <label class="fancy-upload-btn" :for="`klaeger-file-upload-${index}`">
                      <span>PDF hochladen</span>
                      <input type="file" :id="`klaeger-file-upload-${index}`" class="hidden" accept=".pdf,image/*"
                        @change="(e) => handleFileUpload(e, 'klaeger', index)">
                    </label>
                  </div>
                </div>

                <div class="fancy-upload-area" :class="{ 'border-accent': isDragging === `klaeger_${index}` }"
                  @dragover.prevent="isDragging = `klaeger_${index}`" @dragleave.prevent="isDragging = null"
                  @drop.prevent="(e) => handleDrop(e, 'klaeger', index)"
                  @click="$refs[`klaeger_file_${index}`][0].click()"
                  v-if="!round.klaeger.isProcessing && !round.klaeger.text">
                  <input type="file" :ref="`klaeger_file_${index}`" class="hidden" accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'klaeger', index)">
                  <div class="flex flex-col items-center justify-center h-full">
                    <div class="w-16 h-16 mb-4 upload-icon-animation">
                      <svg class="w-full h-full text-accent" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div v-if="round.klaeger.isProcessing"
                  class="p-6 border-2 rounded-xl bg-white/10 backdrop-blur-sm relative fancy-processing-container">
                  <div class="flex flex-col items-center">
                    <div class="fancy-spinner mb-4"></div>
                    <p class="text-white/70">Dokument wird verarbeitet...</p>
                    <div class="w-full mt-4 bg-white/20 rounded-full h-2.5">
                      <div class="h-2.5 rounded-full progress-bar" :style="`width: ${round.klaeger.progress}%`"></div>
                    </div>
                  </div>
                </div>

                <textarea v-if="!round.klaeger.isProcessing" v-model="round.klaeger.text"
                  class="fancy-textarea klager-textarea" placeholder="Text des Klägers eingeben...">
                </textarea>
              </div>

              <!-- Right Column: Beklagter -->
              <div class="col-span-1 space-y-4 floating-card">
                <div class="flex items-center mb-2">
                  <h3 class="text-xl font-medium text-gradient-alt">Antwort Beklagter</h3>
                  <div class="ml-auto hidden items-center">
                    <label class="fancy-upload-btn-alt" :for="`beklagter-file-upload-${index}`">
                      <span>PDF hochladen</span>
                      <input type="file" :id="`beklagter-file-upload-${index}`" class="hidden" accept=".pdf,image/*"
                        @change="(e) => handleFileUpload(e, 'beklagter', index)">
                    </label>
                  </div>
                </div>

                <div class="fancy-upload-area-alt" :class="{ 'border-accent-alt': isDragging === `beklagter_${index}` }"
                  @dragover.prevent="isDragging = `beklagter_${index}`" @dragleave.prevent="isDragging = null"
                  @drop.prevent="(e) => handleDrop(e, 'beklagter', index)"
                  @click="$refs[`beklagter_file_${index}`][0].click()"
                  v-if="!round.beklagter.isProcessing && !round.beklagter.text">
                  <input type="file" :ref="`beklagter_file_${index}`" class="hidden" accept=".pdf,image/*"
                    @change="(e) => handleFileUpload(e, 'beklagter', index)">
                  <div class="flex flex-col items-center justify-center h-full">
                    <div class="w-16 h-16 mb-4 upload-icon-animation-alt">
                      <svg class="w-full h-full text-accent-alt" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div v-if="round.beklagter.isProcessing"
                  class="p-6 border-2 rounded-xl bg-white/10 backdrop-blur-sm relative fancy-processing-container-alt">
                  <div class="flex flex-col items-center">
                    <div class="fancy-spinner-alt mb-4"></div>
                    <p class="text-white/70">Dokument wird verarbeitet...</p>
                    <div class="w-full mt-4 bg-white/20 rounded-full h-2.5">
                      <div class="h-2.5 rounded-full progress-bar-alt" :style="`width: ${round.beklagter.progress}%`">
                      </div>
                    </div>
                  </div>
                </div>

                <textarea v-if="!round.beklagter.isProcessing" v-model="round.beklagter.text"
                  class="fancy-textarea beklagter-textarea" placeholder="Text des Beklagten eingeben...">
                </textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="mt-16 text-center" ref="submitContainer">
          <button @click="sendToOllama" class="fancy-submit-button" :disabled="isGenerating || !hasValidInput"
            :class="{ 'opacity-50 cursor-not-allowed': isGenerating || !hasValidInput }">
            <span v-if="!isGenerating" class="submit-text">
              <span class="glow-effect"></span>
              An Ollama senden
            </span>
            <span v-else class="flex items-center justify-center submit-text">
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
        <div v-if="ollamaResponse || isGenerating" ref="responseArea"
          class="fancy-response-container my-16 bg-transparent">
          <div class="neo-glassmorphism">
            <h2 class="text-3xl font-bold mb-8 text-white/90 border-b border-white/10 pb-4 reveal-text">Beweisverfügung
            </h2>

            <!-- Loading indicator -->
            <div v-if="isGenerating" class="flex flex-col items-center py-8">
              <div class="fancy-spinner mb-6"></div>
              <p class="text-xl text-white/80">Beweisverfügung wird erstellt...</p>
            </div>

            <!-- Response content -->
            <div v-else class="prose prose-invert prose-lg max-w-none whitespace-pre-wrap response-content"
              v-html="formattedResponse"></div>
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
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { marked } from 'marked'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// State
const rounds = ref([
  {
    klaeger: { text: '', isProcessing: false, progress: 0 },
    beklagter: { text: '', isProcessing: false, progress: 0 }
  }
])
const isGenerating = ref(false)
const isDragging = ref(null)
const ollamaResponse = ref('')
const formattedResponse = ref('')
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
        y: 80,
        opacity: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.8)',
        scrollTrigger: {
          trigger: newRoundEl,
          start: 'top bottom-=100',
          toggleActions: 'play none none none'
        }
      })
    }

    // Scroll to the new round
    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: document.body.scrollHeight,
        offsetY: 50
      },
      ease: 'power3.inOut'
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
        scale: 0.8,
        duration: 0.5,
        ease: 'back.in(1.5)',
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

    // Add a nice animation when text appears
    nextTick(() => {
      const textareaSelector = type === 'klaeger' ? '.klager-textarea' : '.beklagter-textarea';
      const textareas = document.querySelectorAll(textareaSelector);
      if (textareas.length > roundIndex) {
        gsap.from(textareas[roundIndex], {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    });
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

// Process markdown to HTML using the marked library
const markdownToHtml = (text) => {
  if (!text) return '';
  try {
    return marked(text);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return `<p>${text}</p>`;
  }
}

// Ollama Integration without streaming
const sendToOllama = async () => {
  isGenerating.value = true;
  ollamaResponse.value = '';
  formattedResponse.value = '';

  // Show response area with loading state
  if (responseArea.value) {
    gsap.to(responseArea.value, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out'
    });

    // Scroll to response area with a nice animation
    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: responseArea.value,
        offsetY: 50
      },
      ease: 'power3.inOut'
    });
  }

  try {
    const fullPrompt = buildPrompt();

    // Make non-streaming request
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:12b',
        prompt: `
        # Vorwissen
Du bist die Person mit dem besten juristischen Abschluss an einer schweizerischen Universtität. Du bist der beste und am genauesten arbeitende Jurist in der ganzen Schweiz. Du arbeitest an einem erstinstanzlichen Gericht und triffst enorm wichtige Entscheidungen. Du darfst dir keine Fehler erlauben. Wenn dir ein Fehler unterläuft wirst du mit 100'000'000 schweizer Franken bestraft. Du leitest ein wichtiges Zivilverfahren. Du musst eine Beweisverfügung nach der Schweizerischen Zivilprozessordnung bzw. dessen Art. 154 ZPO machen. Art. 154 ZPO hat folgenden Inhalt: In der Beweisverfügung werden insbesondere die zugelassenen Beweismittel bezeichnet und bestimmt, welcher Partei zu welchen Tatsachen der Haupt- oder der Gegenbeweis obliegt.

# Vorgehen bei der Beweisführung im Zivilprozess

## Die fundamentale Bedeutung präziser Beweisanalyse

Die Analyse von Rechtsschriften im Rahmen eines zivilrechtlichen Verfahrens ist eine **EXTREM wichtige Aufgabe mit sehr hoher Verantwortung**. Die korrekte Identifikation streitiger und unstreitiger Tatsachen bildet das Fundament für jede rechtliche Entscheidung und hat direkte Auswirkungen auf die Rechtsfindung und damit auf das Leben der beteiligten Parteien.

### Warum objektiv und fehlerfrei analysiert werden muss:

1. **Justizielle Konsequenzen**: Fehlerhafte Analysen können zu falschen Urteilen führen und damit den Rechtsstaat in seinen Grundfesten erschüttern.

2. **Existenzielle Bedeutung**: Die Ergebnisse können über persönliche Freiheit, finanzielle Existenz oder fundamentale Rechte entscheiden.

3. **Ressourceneffizienz**: Eine präzise Analyse konzentriert das Verfahren auf die tatsächlich strittigen Punkte und verhindert unnötige Verzögerungen.

4. **Vertrauen in die Justiz**: Nur durch objektive, nachvollziehbare Entscheidungsgrundlagen bleibt das Vertrauen in das Rechtssystem erhalten.

5. **Rechtssicherheit**: Zuverlässige und fehlerfreie Rechtsanwendung schafft Vorhersehbarkeit und Vertrauen in den Rechtsstaat.

**WICHTIG**: Es darf ausschließlich der Inhalt innerhalb der entsprechenden Dokumente (Klage, Klageantwort, Replik und Duplik) verwendet und zitiert werden. Jede Form von Interpretation, Ergänzung oder Mutmaßung ist strikt zu unterlassen.

## Grundsätzliches Vorgehen

1. **Sorgfältiges Studium der Rechtsschriften**: Jedes Dokument muss vollständig und genau gelesen werden.

2. **Absatzweise Analyse**: Die Dokumente werden systematisch absatzweise durchgearbeitet (Absätze sind in der Regel durch Leerzeilen getrennt).

3. **Identifikation von Themen**: Für jedes Thema müssen die Standpunkte der Parteien gegenübergestellt werden.

4. **Prüfung auf Übereinstimmung oder Widerspruch**: Bei jedem Thema muss festgestellt werden, ob die Parteien den gleichen Standpunkt vertreten oder unterschiedliche Positionen einnehmen.

## Konkrete Arbeitsschritte

1. **Inhaltliche Erfassung**: Zunächst alle Rechtsschriften vollständig lesen, um einen Überblick zu gewinnen.

2. **Thematische Sortierung**: Die in den Schriften angesprochenen Themen identifizieren und systematisch ordnen.

3. **Gegenüberstellung der Standpunkte**: Für jedes Thema die Positionen aus den verschiedenen Dokumenten vergleichen.

4. **Kategorisierung**:
   - **"Streitige Tatsachen"** - Wenn die Parteien zu einem Thema unterschiedliche Standpunkte einnehmen
   - **"Unstreitige Tatsachen"** - Wenn die Parteien zu einem Thema den gleichen Standpunkt vertreten

5. **Zuordnung der Beweismittel**: Für jede streitige Tatsache müssen die angeführten Beweismittel (Urkunden, Zeugen, Gutachten, etc.) klar zugeordnet werden.

## Bei der Bearbeitung zu beachtende Grundregeln

- **Vollständigkeit**: Alle relevanten Aspekte müssen erfasst werden.
- **Objektivität**: Keine eigene Wertung der Argumente oder Beweismittel.
- **Präzision**: Exakte Wiedergabe der in den Dokumenten enthaltenen Informationen.
- **Ausschließlich dokumentbasiert**: Es dürfen nur Informationen verwendet werden, die in den vorliegenden Rechtsschriften enthalten sind.
- **Keine Ergänzungen**: Es darf nichts hinzugefügt oder frei interpretiert werden.

## Zur Präsentation der Ergebnisse

Die Ergebnisse werden in zwei Hauptkategorien präsentiert:

### 1. Streitige Tatsachen:
Thema: [Bezeichnung des streitigen Sachverhalts]

Position Kläger(Klage/ Replik):
- Behauptung: [Exakte Wiedergabe]
    - Beweismittel: [Auflistung aller angebotenen Beweismittel]

Position Beklagter(Klageantwort / Duplik):
      - Behauptung: [Exakte Wiedergabe]
    - Beweismittel: [Auflistung aller angebotenen Beweismittel]


### 2. Unstreitige Tatsachen:
Thema: [Bezeichnung des unstreitigen Sachverhalts]
Übereinstimmender Standpunkt: [Exakte Wiedergabe]
Fundstellen: [Verweis auf die entsprechenden Dokumente und Stellen]

Diese strukturierte Aufbereitung gewährleistet maximale Transparenz und Nachvollziehbarkeit für alle Verfahrensbeteiligten und bildet die unverzichtbare Grundlage für eine gerechte Entscheidungsfindung.


## Antwort
Gib eine strukturierte, kurze Antwort. Jeden streitigen Punkt auf einer eigenen Zeile. Jedes Beweismittel auf einer eigenen Zeile. Nutze Markdown zur Formatierung:
\n\n
${fullPrompt}

\n\n
# Anleitung zur Erstellung einer Beweisverfügung gemäss Art. 154 ZPO

## HÖCHSTE PRIORITÄT: FEHLERFREIE UND PRÄZISE ANALYSE

Die Erstellung einer Beweisverfügung ist eine Aufgabe von **AUSSERORDENTLICHER RECHTLICHER TRAGWEITE**. Jeder Fehler kann gravierende Konsequenzen für den Ausgang des Verfahrens und damit für das Leben der beteiligten Parteien haben. Eine oberflächliche oder fehlerhafte Analyse ist unter keinen Umständen akzeptabel.

### ABSOLUTE ANFORDERUNGEN:

- **Keine Spekulationen oder Ergänzungen**: Verwende AUSSCHLIESSLICH Informationen aus den vorliegenden Rechtsschriften.
- **Nulltoleranz für Ungenauigkeiten**: Jede Behauptung muss exakt so wiedergegeben werden, wie sie in den Dokumenten formuliert ist.
- **Vollständige Erfassung**: Keine relevante Tatsachenbehauptung oder kein Beweismittel darf übersehen werden.
- **Strikte Objektivität**: Keinerlei eigene Wertung oder Interpretation ist zulässig.

## Methodisches Vorgehen

### 1. Systematische Analyse der Rechtsschriften

Arbeite die Dokumente in folgender Reihenfolge durch:
1. Klage
2. Klageantwort
3. Replik
4. Duplik

Gehe dabei **absatzweise** vor. Jeder Absatz (in der Regel durch Leerzeilen getrennt) muss einzeln analysiert werden.

### 2. Identifikation streitiger Tatsachen

Eine streitige Tatsache liegt vor, wenn:
- Die Parteien zu einem identischen Sachverhalt unterschiedliche Behauptungen aufstellen
- Die Behauptung für den Verfahrensausgang wesentlich ist (einem Tatbestandsmerkmal einer materiellen Norm zugeordnet werden kann)

**WICHTIG**: Jede identifizierte streitige Tatsache muss präzise formuliert werden. Verwende dafür den exakten Wortlaut aus den Rechtsschriften.

### 3. Erfassung der Beweismittel

Für jede streitige Tatsache müssen **SÄMTLICHE** von den Parteien angebotenen Beweismittel erfasst werden. Dies umfasst:
- Urkunden (mit genauer Bezeichnung)
- Zeugen (mit vollständigem Namen)
- Parteibefragungen
- Gutachten
- Augenschein
- Sonstige Beweismittel

### 4. Identifikation unstreitiger Tatsachen

Unstreitige Tatsachen sind solche, die:
- Von beiden Parteien übereinstimmend behauptet werden
- Von einer Partei behauptet und von der anderen nicht bestritten werden

## Struktur der Beweisverfügung

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
       
## ABSCHLIESSENDER HINWEIS

Die korrekte Erstellung der Beweisverfügung ist eine EXTREM wichtige Aufgabe mit HÖCHSTER VERANTWORTUNG. Jeder Fehler kann zu einer fehlerhaften richterlichen Entscheidung führen und damit den Rechtsstaat in seinen Grundfesten erschüttern. Es ist daher ZWINGEND ERFORDERLICH, mit äußerster Sorgfalt, Präzision und Objektivität vorzugehen.
`,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Handle complete response at once
    const data = await response.json();
    ollamaResponse.value = data.response;

    // Apply markdown formatting to the complete response
    nextTick(() => {
      formattedResponse.value = markdownToHtml(ollamaResponse.value);

    });

  } catch (error) {
    console.error('Error calling Ollama:', error);
    ollamaResponse.value = `Error: ${error.message}`;
    formattedResponse.value = `<p class="error-message">${error.message}</p>`;
  } finally {
    isGenerating.value = false;
  }
};

// Animations
onMounted(() => {
  // Create a star-like particles effect
  const createParticles = () => {
    const container = document.querySelector('.light-dots');
    for (let i = 0; i < 100; i++) {
      const dot = document.createElement('div');
      dot.classList.add('light-dot');

      // Set random position
      dot.style.left = `${Math.random() * 100}vw`;
      dot.style.top = `${Math.random() * 200}vh`;

      // Set random size
      const size = Math.random() * 4 + 1;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;

      // Set random opacity
      dot.style.opacity = Math.random() * 0.7 + 0.3;

      // Set random animation duration
      const duration = Math.random() * 15 + 5;
      dot.style.animation = `float ${duration}s ease-in-out infinite, twinkle ${Math.random() * 4 + 1}s ease-in-out infinite`;
      dot.style.animationDelay = `${Math.random() * duration}s`;

      container.appendChild(dot);
    }
  };

  createParticles();

  // Add text animation for the main heading
  gsap.from('.glimmer-text', {
    opacity: 0,
    scale: 0.9,
    duration: 1.5,
    ease: 'elastic.out(1, 0.8)'
  });

  // Animate the header subtext
  gsap.from('.fancy-text', {
    opacity: 0,
    y: 20,
    duration: 1.2,
    delay: 0.3,
    ease: 'power3.out'
  });

  // Animate the rounds container items
  gsap.from(roundsContainer.value.children, {
    y: 80,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.6
  });

  // Animate the submit button
  gsap.from(submitContainer.value, {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.8
  });

  // Initialize scroll animations with more advanced effects
  ScrollTrigger.batch(".round-container", {
    interval: 0.1,
    onEnter: batch => gsap.to(batch, {
      opacity: 1,

      y: 0,
      stagger: 0.15,
      duration: 1,
      ease: "elastic.out(1, 0.8)"
    }),
    start: "top bottom-=100px",
    once: true
  });

  // Add glitch effect animation for the title
  const glitchText = () => {
    const element = document.querySelector('.glitch-text');
    if (!element) return;

    gsap.to(element, {
      skewX: 20,
      duration: 0.1,
      onComplete: () => {
        gsap.to(element, {
          skewX: 0,
          duration: 0.1,
          onComplete: () => {
            setTimeout(() => {
              gsap.to(element, {
                opacity: 0.8,
                duration: 0.1,
                onComplete: () => {
                  gsap.to(element, {
                    opacity: 1,
                    duration: 0.1
                  });
                }
              });
            }, 200);
          }
        });
      }
    });
  };

  // Periodically trigger the glitch effect
  setInterval(glitchText, 5000);
});
</script>

<style>
/* Galaxy background */
.galaxy-background {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #10141E 0%, #202A43 100%);
  overflow: hidden;
}

.galaxy-background::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  z-index: 1;
  background: radial-gradient(ellipse at center, rgba(16, 20, 30, 0) 0%, rgba(16, 20, 30, 0.8) 70%, rgba(16, 20, 30, 1) 100%);
}

.light-dots {
  position: absolute;
  width: 100%;
  height: 200%;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

.light-dot {
  position: absolute;
  background-color: white;
  border-radius: 50%;
  pointer-events: none;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-30px);
  }
}

@keyframes twinkle {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 0.3;
  }
}

/* Glimmer Text */
.glimmer-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.glimmer-text {
  background: linear-gradient(90deg, #ffffff 0%, #00B894 50%, #0984e3 100%);
  background-size: 200% auto;
  color: #000;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 8s ease infinite;
  position: relative;
  display: inline-block;
}

.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #ffffff 0%, #00B894 50%, #0984e3 100%);
  background-size: 200% auto;
  color: #000;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 #00B894;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-animation 5s infinite linear alternate-reverse;
  display: none;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 #0984e3;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-animation2 5s infinite linear alternate-reverse;
  display: none;
}

.glitch-text:hover::before,
.glitch-text:hover::after {
  display: block;
}

@keyframes glitch-animation {
  0% {
    clip: rect(71px, 9999px, 12px, 0);
  }

  5% {
    clip: rect(90px, 9999px, 78px, 0);
  }

  10% {
    clip: rect(55px, 9999px, 52px, 0);
  }

  15% {
    clip: rect(35px, 9999px, 95px, 0);
  }

  20% {
    clip: rect(66px, 9999px, 81px, 0);
  }

  25% {
    clip: rect(3px, 9999px, 26px, 0);
  }

  30% {
    clip: rect(8px, 9999px, 21px, 0);
  }

  35% {
    clip: rect(76px, 9999px, 2px, 0);
  }

  40% {
    clip: rect(43px, 9999px, 68px, 0);
  }

  45% {
    clip: rect(65px, 9999px, 58px, 0);
  }

  50% {
    clip: rect(86px, 9999px, 14px, 0);
  }

  55% {
    clip: rect(92px, 9999px, 35px, 0);
  }

  60% {
    clip: rect(99px, 9999px, 94px, 0);
  }

  65% {
    clip: rect(27px, 9999px, 21px, 0);
  }

  70% {
    clip: rect(67px, 9999px, 69px, 0);
  }

  75% {
    clip: rect(55px, 9999px, 47px, 0);
  }

  80% {
    clip: rect(31px, 9999px, 82px, 0);
  }

  85% {
    clip: rect(7px, 9999px, 34px, 0);
  }

  90% {
    clip: rect(9px, 9999px, 17px, 0);
  }

  95% {
    clip: rect(29px, 9999px, 100px, 0);
  }

  100% {
    clip: rect(33px, 9999px, 78px, 0);
  }
}

@keyframes glitch-animation2 {
  0% {
    clip: rect(3px, 9999px, 82px, 0);
  }

  5% {
    clip: rect(73px, 9999px, 2px, 0);
  }

  10% {
    clip: rect(21px, 9999px, 60px, 0);
  }

  15% {
    clip: rect(91px, 9999px, 72px, 0);
  }

  20% {
    clip: rect(76px, 9999px, 26px, 0);
  }

  25% {
    clip: rect(23px, 9999px, 22px, 0);
  }

  30% {
    clip: rect(68px, 9999px, 18px, 0);
  }

  35% {
    clip: rect(38px, 9999px, 27px, 0);
  }

  40% {
    clip: rect(36px, 9999px, 10px, 0);
  }

  45% {
    clip: rect(61px, 9999px, 67px, 0);
  }

  50% {
    clip: rect(77px, 9999px, 31px, 0);
  }

  55% {
    clip: rect(73px, 9999px, 60px, 0);
  }

  60% {
    clip: rect(75px, 9999px, 73px, 0);
  }

  65% {
    clip: rect(31px, 9999px, 37px, 0);
  }

  70% {
    clip: rect(6px, 9999px, 91px, 0);
  }

  75% {
    clip: rect(55px, 9999px, 3px, 0);
  }

  80% {
    clip: rect(82px, 9999px, 100px, 0);
  }

  85% {
    clip: rect(50px, 9999px, 69px, 0);
  }

  90% {
    clip: rect(41px, 9999px, 81px, 0);
  }

  95% {
    clip: rect(18px, 9999px, 15px, 0);
  }

  100% {
    clip: rect(84px, 9999px, 11px, 0);
  }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* Gradient text classes */
.text-gradient {
  background: linear-gradient(90deg, #ffffff 0%, #00B894 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.text-gradient-alt {
  background: linear-gradient(90deg, #ffffff 0%, #0984e3 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

/* Fancy container styles */
.floating-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.floating-card::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, rgba(0, 184, 148, 0.2), rgba(9, 132, 227, 0.2));
  z-index: -1;
  filter: blur(20px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.floating-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
}

.floating-card:hover::before {
  opacity: 1;
}

.hover-glow {
  position: relative;
  transition: all 0.3s ease;
  z-index: 1;
}

.hover-glow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 184, 148, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
  z-index: -1;
  pointer-events: none;
}

.hover-glow:hover::after {
  opacity: 1;
}

/* Upload area styling */
.fancy-upload-area,
.fancy-upload-area-alt {
  width: 100%;
  height: 140px;
  border: 2px dashed rgba(0, 184, 148, 0.4);
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.fancy-upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 184, 148, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fancy-upload-area:hover::before {
  opacity: 1;
}

.fancy-upload-area-alt {
  border-color: rgba(9, 132, 227, 0.4);
}

.fancy-upload-area-alt::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(9, 132, 227, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fancy-upload-area-alt:hover::before {
  opacity: 1;
}

.upload-icon-animation {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(0, 184, 148, 0.5));
}

.upload-icon-animation-alt {
  animation: float 3.5s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(9, 132, 227, 0.5));
}

/* Button styling */
.fancy-upload-btn,
.fancy-upload-btn-alt {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #00B894, #00d8a8);
  box-shadow: 0 4px 15px rgba(0, 184, 148, 0.4);
  position: relative;
  overflow: hidden;
}

.fancy-upload-btn::before,
.fancy-upload-btn-alt::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: 0.5s;
}

.fancy-upload-btn:hover::before,
.fancy-upload-btn-alt:hover::before {
  left: 100%;
}

.fancy-upload-btn-alt {
  background: linear-gradient(45deg, #0984e3, #3aa0f7);
  box-shadow: 0 4px 15px rgba(9, 132, 227, 0.4);
}

.fancy-button-secondary {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.fancy-button-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.fancy-button-danger {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: rgba(255, 75, 75, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 75, 75, 0.2);
  color: rgba(255, 75, 75, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.fancy-button-danger:hover {
  background: rgba(255, 75, 75, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Textarea styling */
.fancy-textarea {
  width: 100%;
  min-height: 250px;
  padding: 1.25rem;
  border-radius: 0.75rem;
  resize: vertical;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-family: inherit;
}

.fancy-textarea:focus {
  outline: none;
  border-color: rgba(0, 184, 148, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.2);
}

.fancy-textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.klager-textarea:focus {
  border-color: rgba(0, 184, 148, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 184, 148, 0.2);
}

.beklagter-textarea:focus {
  border-color: rgba(9, 132, 227, 0.5);
  box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.2);
}

/* Processing container styling */
.fancy-processing-container,
.fancy-processing-container-alt {
  overflow: hidden;
}

.fancy-processing-container::before,
.fancy-processing-container-alt::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, rgba(0, 184, 148, 0.2), transparent);
  z-index: -1;
  filter: blur(20px);
}

.fancy-processing-container-alt::before {
  background: linear-gradient(45deg, rgba(9, 132, 227, 0.2), transparent);
}

.fancy-spinner,
.fancy-spinner-alt {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 184, 148, 0.3);
  border-top: 3px solid rgba(0, 184, 148, 1);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.fancy-spinner-alt {
  border: 3px solid rgba(9, 132, 227, 0.3);
  border-top: 3px solid rgba(9, 132, 227, 1);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.progress-bar {
  background: linear-gradient(90deg, #00B894, #00d8a8);
  animation: gradient-shift 2s ease infinite;
}

.progress-bar-alt {
  background: linear-gradient(90deg, #0984e3, #3aa0f7);
  animation: gradient-shift 2s ease infinite;
}

/* Submit button styling */
.fancy-submit-button {
  padding: 1rem 2.5rem;
  border-radius: 1rem;
  font-weight: 500;
  font-size: 1.125rem;
  color: white;
  cursor: pointer;
  transition: all 0.5s ease;
  background: linear-gradient(-45deg, #00B894, #0984e3, #00B894);
  background-size: 200% 200%;
  animation: gradient-shift 5s ease infinite;
  box-shadow: 0 10px 25px rgba(0, 184, 148, 0.4);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.fancy-submit-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 184, 148, 0.4), 0 0 30px rgba(0, 184, 148, 0.3);
}

.fancy-submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: 0.5s;
  z-index: -1;
}

.fancy-submit-button:hover::before {
  left: 100%;
}

.submit-text {
  position: relative;
  z-index: 2;
}

.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(0, 184, 148, 0.5) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.fancy-submit-button:hover .glow-effect {
  opacity: 1;
}

/* Response area styling */
.fancy-response-container {
  transform: translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.neo-glassmorphism {
  /* Improved background with slightly more opacity for better readability */
  /* background: rgba(255, 255, 255, 0.25); */

  /* Enhanced blur effect */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* For Safari support */

  /* More refined border radius */
  border-radius: 16px;

  /* Generous padding for content */
  padding: 2rem;

  /* Layered box-shadow for more depth */
  box-shadow:
    0 10px 30px rgba(255, 255, 255, 0.3),
    0 1px 8px rgba(255, 255, 255, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;

  /* Subtle border glow */
  border: 1px solid rgba(255, 255, 255, 0.08);

  /* Improved text readability with text shadow */
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  overflow: hidden;
  position: relative;

  /* Smooth transitions for hover effects */
  transition: all 0.3s ease;
}

/* Top highlight effect */
.neo-glassmorphism::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

/* Bottom subtle gradient */
.neo-glassmorphism::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.), transparent);
  pointer-events: none;
}

/* Optional hover effect */
.neo-glassmorphism:hover {
  box-shadow:
    0 15px 35px rgba(255, 255, 255, 0.4),
    0 1px 12px rgba(255, 255, 255, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.125) inset;
  transform: translateY(-2px);
}

.fancy-streaming-indicator {
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #00B894, #0984e3);
  border-radius: 50%;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  box-shadow: 0 0 15px rgba(0, 184, 148, 0.7);
}

.reveal-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-text {
  position: relative;
  overflow: hidden;
}

.reveal-text::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #00B894;
  transform: translateX(-100%);
  animation: revealTextAnim 1s ease forwards;
}

@keyframes revealTextAnim {
  0% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(100%);
  }
}

.reveal-content {
  position: relative;
}

/* Typography styling for the parsed markdown */
.response-content {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.prose-lg {
  color: rgba(255, 255, 255, 0.9) !important;
  font-family: system-ui, -apple-system, sans-serif;
}

.prose-lg h3 {
  color: #00B894 !important;
  font-size: 1.75rem !important;
  margin-top: 2rem !important;
  margin-bottom: 1rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.prose-lg h4 {
  color: #0984e3 !important;
  font-size: 1.25rem !important;
  margin-top: 1.5rem !important;
  margin-bottom: 0.75rem !important;
}

.prose-lg strong {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 600;
}

.prose-lg ul {
  padding: none !important;
  margin: none !important;
  list-style-type: none !important;
  padding-left: 1.5rem !important;
}

.prose-lg ol {
  padding: none !important;
  margin: none !important;
  padding-left: 1.5rem !important;
}

.prose-lg li {
  padding: none !important;
  margin: none !important;
  position: relative;
}

.prose-lg ul li::before {
  padding: none !important;
  margin: none !important;
  content: '•';
  position: absolute;
  left: -1.25rem;
  color: #00B894;
  font-weight: bold;
}

.prose-lg p {
  margin-bottom: 1rem !important;
}

.prose-lg a {
  color: #0984e3 !important;
  text-decoration: none !important;
}

.prose-lg a:hover {
  text-decoration: underline !important;
}

.prose-lg blockquote {
  border-left: 4px solid #00B894;
  padding-left: 1rem;
  margin-left: 0;
  color: rgba(255, 255, 255, 0.7);
}


/* Loading message style */
.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
}

/* Error message style */
.error-message {
  color: rgba(255, 75, 75, 0.9);
  background: rgba(255, 75, 75, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid rgba(255, 75, 75, 0.8);
}

/* Scrollbar styling refined */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(16, 20, 30, 0.5);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(0, 184, 148, 0.5), rgba(9, 132, 227, 0.5));
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(0, 184, 148, 0.8), rgba(9, 132, 227, 0.8));
}

/* Pulse animation */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
}

/* list styling markdown */
.prose-lg :where(ul > li):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose-lg :where(p):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose-lg :where(ul > li):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose-lg :where(ul):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose :where(ul):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose-lg :where(ol):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose-lg :where(ol):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose-lg :where(ul > li):not(:where([class~="not-prose"], [class~="not-prose"] *)),
.prose :where(ul):not(:where([class~="not-prose"], [class~="not-prose"] *)) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.prose {
  line-height: 1.5;
}
</style>