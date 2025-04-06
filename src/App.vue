<template>
  <div class="container mx-auto px-8 py-8 max-w-6xl">
    <header class="mb-12">
      <h1 class="text-4xl font-bold text-primary">
        Beweisverfügung vorschlagen
      </h1>
    </header>

    <main>
      <div class="mb-8" ref="uploadZone">
        <div class="border-2 border-dashed border-secondary rounded-xl p-8 text-center transition-all duration-300"
          :class="{ 'border-accent bg-accent/10': isDragging }" @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
          <input type="file" ref="fileInput" @change="handleFileUpload" accept=".pdf,image/*" class="hidden">
          <p v-if="!isProcessing" class="text-lg">
            PDF hochladen
          </p>
          <p v-else class="text-lg">
            Processing... {{ progress }}%
          </p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Erstelle deinen Prompt:</h2>
        <textarea v-model="manualText"
          class="w-full min-h-[200px] p-4 border-2 border-secondary rounded-lg font-inherit resize-y focus:outline-none focus:border-accent"
          placeholder="Enter your text here...">
        </textarea>
      </div>

      <div v-if="manualText" class="mb-8">
        <button @click="sendToOllama" class="btn" :disabled="isProcessing">
          An Ollama senden
        </button>
      </div>

      <div v-if="ollamaResponse" class="bg-white p-8 rounded-xl shadow-lg">
        <h2 class="text-2xl font-semibold mb-4">AI Response</h2>
        <div class="whitespace-pre-wrap">
          {{ ollamaResponse }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createWorker } from 'tesseract.js'
import { useTimeoutFn } from '@vueuse/core'
import gsap from 'gsap'
import * as pdfjsLib from 'pdfjs-dist';

// State
const manualText = ref('')
const isProcessing = ref(false)
const progress = ref(0)
const isDragging = ref(false)
const ollamaResponse = ref('')
const fileInput = ref(null)
const uploadZone = ref(null)

// File handling
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isProcessing.value = true
  progress.value = 0

  try {
    if (file.type === 'application/pdf') {
      await processPDF(file)
    } else {
      await processImage(file)
    }
  } catch (error) {
    console.error('Error processing file:', error)
  } finally {
    isProcessing.value = false
  }
}

const handleDrop = async (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    const input = fileInput.value
    input.files = event.dataTransfer.files
    handleFileUpload({ target: input })
  }
}

// PDF Processing
const processPDF = async (file) => {
  const pdfjs = await import('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const reader = new FileReader()
  reader.onload = async function (event) {
    const typedarray = new Uint8Array(event.target.result)
    const pdf = await pdfjsLib.getDocument(typedarray).promise

    let fullText = ''

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let lastY = null;
      let pageText = "";

      // Sort items by their vertical position (top to bottom)
      const items = textContent.items.sort(
        (a, b) =>
          b.transform[5] - a.transform[5] ||
          a.transform[4] - b.transform[4]
      );

      // Process each text item
      for (const item of items) {
        const y = item.transform[5];

        // If we have a previous y-coordinate to compare with
        if (lastY !== null) {
          // If the difference is more than a small threshold, it's a new line
          // You might need to adjust this threshold based on your PDFs
          if (Math.abs(y - lastY) > 20) {
            pageText += "\n\n";
          } else if (Math.abs(y - lastY) > 5) {
            pageText += "\n";
          } else if (item.transform[4] === 0) {
            // If x-coordinate is 0, it might also be a new line
            pageText += "\n";
          } else {
            // Same line, add a space
            pageText += " ";
          }
        }

        pageText += item.str;
        lastY = y;
      }

      fullText += pageText + "\n\n"; // Add double newline between pages
    }

    // Update the manualText directly with a default prompt template
    manualText.value = `${fullText}`
  }
  reader.readAsArrayBuffer(file)
}

// Image Processing
const processImage = async (file) => {
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
        progress.value = p.progress * 100
      }
    })

    // Update the manualText directly with a default prompt template
    manualText.value = `${text}`

    await worker.terminate()
  } catch (error) {
    console.error('Tesseract error:', error)
  }
}

// Ollama Integration
const sendToOllama = async () => {
  try {
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

${manualText.value} 

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
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    ollamaResponse.value = data.response;
  } catch (error) {
    console.error('Error calling Ollama:', error);
    ollamaResponse.value = `Error: ${error.message}`;
  }
}

// Animations
onMounted(() => {
  gsap.from('header', {
    y: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  gsap.from('.upload-section', {
    y: 50,
    opacity: 0,
    duration: 1,
    delay: 0.3,
    ease: 'power3.out'
  })
})
</script>