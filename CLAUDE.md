# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Code Style Guidelines
- **Formatting**: Use consistent indentation (2 spaces) and follow Vue.js conventions
- **Imports**: Group imports by type (Vue core, third-party libraries, local components)
- **File Structure**: Vue components use the `<template>`, `<script setup>`, structure
- **State Management**: Use Vue 3's Composition API with `ref` and `reactive`
- **Error Handling**: Always use try/catch blocks for async operations
- **Naming**: Use camelCase for variables/methods, PascalCase for components
- **CSS**: Use Tailwind utility classes in templates
- **Animations**: Use GSAP for animations when needed
- **Documentation**: Add comments for complex logic or non-obvious functionality

## Project-Specific Notes
- This is a Vue 3 project using Vite, Tailwind CSS, and PDF/OCR processing
- The app communicates with a local Ollama API for AI text generation
- Error logging should use console.error with descriptive messages