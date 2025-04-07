<template>
  <div class="galaxy-background">
    <div class="light-dots"></div>
    <div class="container mx-auto px-4 py-8 max-w-7xl relative z-10">
      <header class="text-center" ref="header">
        <div class="glimmer-wrapper mb-4">
          <h1 class="text-6xl font-bold glimmer-text glitch-text" data-text="Beweisverfügung vorschlagen">
            Beweisverfügung vorschlagen
          </h1>
        </div>
        <p class="mt-6 text-white/80 max-w-2xl mx-auto text-lg fancy-text">
          Lade Inhalte hoch und erhalte einen Vorschlag für eine strukturierte Beweisverfügung nach Art. 154 ZPO
        </p>
      </header>

      <main>
        <!-- Rounds -->
        <div class="space-y-12 reveal-content mt-8" ref="roundsContainer">
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
              <!-- Kläger -->
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
                    <div class="w-12 h-12 mb-4 upload-icon-animation">
                      <svg class="w-full h-full text-accent" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p class="text-sm text-white/40">
                      PDF oder Bild hochladen
                    </p>
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

              <!-- Beklagter -->
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
                    <div class="w-12 h-12 mb-4 upload-icon-animation-alt">
                      <svg class="w-full h-full text-accent-alt" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p class="text-sm text-white/40">
                      PDF oder Bild hochladen
                    </p>
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

        <!-- Gönn dir!!!  -->
        <div class="mt-12 8 text-center" ref="submitContainer">
          <button @click="sendToOllama" class="fancy-submit-button !px-32" :disabled="isGenerating || !hasValidInput"
            :class="{ 'opacity-50 cursor-not-allowed': isGenerating || !hasValidInput }">
            <span v-if="!isGenerating" class="submit-text text-2xl">
              <span class="glow-effect"></span>
              Hau rein!
            </span>
            <span v-else class="flex items-center justify-center submit-text">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Auf Beweissuche&nbsp;&nbsp;&nbsp;&nbsp;<svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
          </button>
        </div>

        <!-- Antwort -->
        <div v-if="ollamaResponse || isGenerating" ref="responseArea"
          class="floating-card my-16 bg-opacity-60 hover:transform-none hover:border hover:border-white/30">
          <div class="bg-transparent">
            <h2 class="text-3xl font-bold mb-8 text-white/90 border-b border-white/10 pb-4 reveal-text">Output
            </h2>
            <div v-if="isGenerating" class="flex flex-col items-center py-8">
              <div class="fancy-spinner mb-6"></div>
              <p class="text-xl text-white/80">Beweisverfügung wird erstellt...</p>
            </div>

            <div v-else class="max-w-none response-content" v-html="formattedResponse"></div>
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

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

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

const hasValidInput = computed(() => {
  return rounds.value.some(round =>
    (round.klaeger.text && round.klaeger.text.trim() !== '') ||
    (round.beklagter.text && round.beklagter.text.trim() !== '')
  )
})

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

// Runde entfernen
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
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  pdfjs.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

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
  fullPrompt += `# Vorgehen bei der Beweisführung im Zivilprozess

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
Gib eine strukturierte, kurze Antwort. Jeden streitigen Punkt auf einer eigenen Zeile. Jedes Beweismittel auf einer eigenen Zeile. Nutze Markdown zur Formatierung:\n\n`;
  rounds.value.forEach((round, index) => {
    const roundNum = index + 1;

    if (round.klaeger.text && round.klaeger.text.trim() !== '') {
      fullPrompt += `<Klaeger_Runde_${roundNum}>\n${round.klaeger.text.trim()}\n</Klaeger_Runde_${roundNum}>\n\n`;
    }

    if (round.beklagter.text && round.beklagter.text.trim() !== '') {
      fullPrompt += `<Antwort_Beklagter_Runde_${roundNum}>\n${round.beklagter.text.trim()}\n</Antwort_Beklagter_Runde_${roundNum}>\n\n`;
    }
  });
  fullPrompt += `\n\n# Anleitung zur Erstellung einer Beweisverfügung gemäss Art. 154 ZPO

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

Die korrekte Erstellung der Beweisverfügung ist eine EXTREM wichtige Aufgabe mit HÖCHSTER VERANTWORTUNG. Jeder Fehler kann zu einer fehlerhaften richterlichen Entscheidung führen und damit den Rechtsstaat in seinen Grundfesten erschüttern. Es ist daher ZWINGEND ERFORDERLICH, mit äußerster Sorgfalt, Präzision und Objektivität vorzugehen.`;

  return fullPrompt;
}
const markdownToHtml = (text) => {
  if (!text) return '';
  try {
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-gradient">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^## (.*$)/gim, '<h2 class="text-gradient">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="glimmer-text">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle nested lists first
      .replace(/^(\s*)- (.*$)/gim, function (match, indent, content) {
        const indentLevel = indent.length;
        return `<li data-indent="${indentLevel}">${content}</li>`;
      })
      .replace(/^(\s*)\d+\.\s+(.*$)/gim, function (match, indent, content) {
        const indentLevel = indent.length;
        return `<li data-indent="${indentLevel}" data-ordered="true">${content}</li>`;
      });

    // Process list items with proper nesting
    const lines = html.split('\n');
    const resultLines = [];

    let currentList = null;
    let listStack = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // If it's a list item
      if (line.includes('<li data-indent="')) {
        const indentMatch = line.match(/data-indent="(\d+)"/);
        const isOrdered = line.includes('data-ordered="true"');

        if (indentMatch) {
          const indentLevel = parseInt(indentMatch[1]);
          const listType = isOrdered ? 'ol' : 'ul';

          // Clean up the li
          const cleanLi = line
            .replace(/\s*data-indent="\d+"/, '')
            .replace(/\s*data-ordered="true"/, '');

          // Handle nesting
          if (!currentList) {
            currentList = listType;
            resultLines.push(`<${listType}>`);
            resultLines.push(cleanLi);
          } else if (indentLevel > listStack.length) {
            listStack.push(currentList);
            currentList = listType;
            resultLines.push(`<${listType}>`);
            resultLines.push(cleanLi);
          } else if (indentLevel < listStack.length) {
            while (indentLevel < listStack.length) {
              resultLines.push(`</${currentList}>`);
              currentList = listStack.pop();
            }
            if (currentList !== listType) {
              resultLines.push(`</${currentList}>`);
              currentList = listType;
              resultLines.push(`<${listType}>`);
            }
            resultLines.push(cleanLi);
          } else {
            resultLines.push(cleanLi);
          }
        }
      } else {
        while (listStack.length > 0) {
          resultLines.push(`</${currentList}>`);
          currentList = listStack.pop();
        }
        if (currentList) {
          resultLines.push(`</${currentList}>`);
          currentList = null;
        }

        resultLines.push(line);
      }
    }

    while (listStack.length > 0) {
      resultLines.push(`</${currentList}>`);
      currentList = listStack.pop();
    }
    if (currentList) {
      resultLines.push(`</${currentList}>`);
    }

    html = resultLines.join('\n');

    // Paragraphs
    html = html
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hpluoi])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>')
      .replace(/<p><p>/g, '<p>')
      .replace(/<\/p><\/p>/g, '</p>')
      .replace(/\n/g, ' ');

    return html;
  } catch (error) {
    console.error('Error converting to HTML:', error);
    return `<p>${text}</p>`;
  }
};

// Ollama Integration, okay, it's not ollama anymore, but ollama is great, just like me :)
// Check ollama out here: https://ollama.com/
// Check me out here: 079... https://open.spotify.com/intl-de/track/3dfCKQy9JY2ixI58zTeUn9?si=83d4abdc399f4f79
const sendToOllama = async () => {
  isGenerating.value = true;
  ollamaResponse.value = '';
  formattedResponse.value = '';

  // Show response area with loading state
  if (responseArea.value) {
    gsap.to(responseArea.value, {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': '',
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 8096,
        system:
          "Du bist die Person mit dem besten juristischen Abschluss an einer schweizerischen Universtität. Du bist der beste und am genauesten arbeitende Jurist in der ganzen Schweiz. Du arbeitest an einem erstinstanzlichen Gericht und triffst enorm wichtige Entscheidungen. Du darfst dir keine Fehler erlauben. Wenn dir ein Fehler unterläuft wirst du mit 100'000'000 schweizer Franken bestraft. Du leitest ein wichtiges Zivilverfahren. Du musst eine Beweisverfügung nach der Schweizerischen Zivilprozessordnung bzw. dessen Art. 154 ZPO machen. Art. 154 ZPO hat folgenden Inhalt: In der Beweisverfügung werden insbesondere die zugelassenen Beweismittel bezeichnet und bestimmt, welcher Partei zu welchen Tatsachen der Haupt- oder der Gegenbeweis obliegt.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    ollamaResponse.value = responseText;

    // Render Markdown
    nextTick(() => {
      formattedResponse.value = markdownToHtml(ollamaResponse.value);
    });

  } catch (error) {
    console.error('Error calling Claude API:', error);
    ollamaResponse.value = `Error: ${error.message}`;
    formattedResponse.value = `<p class="error-message">${error.message}</p>`;
  } finally {
    isGenerating.value = false;
  }
};

// Animations
onMounted(() => {
  const createParticles = () => {
    const container = document.querySelector('.light-dots');
    for (let i = 0; i < 100; i++) {
      const dot = document.createElement('div');
      dot.classList.add('light-dot');
      dot.style.left = `${Math.random() * 100}vw`;
      dot.style.top = `${Math.random() * 200}vh`;
      const size = Math.random() * 4 + 1;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.opacity = Math.random() * 0.7 + 0.3;
      const duration = Math.random() * 15 + 5;
      dot.style.animation = `float ${duration}s ease-in-out infinite, twinkle ${Math.random() * 4 + 1}s ease-in-out infinite`;
      dot.style.animationDelay = `${Math.random() * duration}s`;
      container.appendChild(dot);
    }
  };

  createParticles();

  gsap.from('.glimmer-text', {
    opacity: 0,
    scale: 0.9,
    duration: 1.5,
    ease: 'elastic.out(1, 0.8)'
  });

  gsap.from('.fancy-text', {
    opacity: 0,
    y: 20,
    duration: 1.2,
    delay: 0.3,
    ease: 'power3.out'
  });

  gsap.from(roundsContainer.value.children, {
    y: 80,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.6
  });

  gsap.from(submitContainer.value, {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.8
  });

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

  setInterval(glitchText, 5000);
});
</script>
