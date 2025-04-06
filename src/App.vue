y the tex<template>
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
            Drop your PDF or image here, or click to upload
          </p>
          <p v-else class="text-lg">
            Processing... {{ progress }}%
          </p>
        </div>
      </div>

      <div v-if="!uploadedText" class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Or enter your text directly:</h2>
        <textarea v-model="manualText"
          class="w-full min-h-[200px] p-4 border-2 border-secondary rounded-lg font-inherit resize-y focus:outline-none focus:border-accent"
          placeholder="Enter your text here...">
        </textarea>
      </div>

      <div v-if="uploadedText || manualText" class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Generated Prompt</h2>
        <textarea v-model="generatedPrompt"
          class="w-full min-h-[200px] p-4 border-2 border-secondary rounded-lg font-inherit resize-y focus:outline-none focus:border-accent mb-4"
          placeholder="Your prompt will appear here...">
        </textarea>
        <button @click="sendToOllama" class="btn" :disabled="isProcessing">
          Send to Ollama
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
import * as pdfjsLib from 'pdfjs-dist'
import { useTimeoutFn } from '@vueuse/core'
import gsap from 'gsap'

// State
const uploadedText = ref('')
const manualText = ref('')
const generatedPrompt = ref('')
const ollamaResponse = ref('')
const isProcessing = ref(false)
const progress = ref(0)
const isDragging = ref(false)
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
  const reader = new FileReader()
  reader.onload = async function (event) {
    const typedarray = new Uint8Array(event.target.result)
    const pdf = await pdfjsLib.getDocument(typedarray).promise

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
      progress.value = (i / pdf.numPages) * 100
    }

    uploadedText.value = fullText
    generatePrompt(fullText)
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

    uploadedText.value = text
    generatePrompt(text)
    await worker.terminate()
  } catch (error) {
    console.error('Tesseract error:', error)
  }
}

// Prompt Generation
const generatePrompt = (text) => {
  generatedPrompt.value = `Please analyze the following text and suggest a Beweisverfügung:\n\n${text}`
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
        model: 'llama3.2_20k',
        prompt: generatedPrompt.value,
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
