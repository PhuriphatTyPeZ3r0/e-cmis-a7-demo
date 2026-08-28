---
name: gemini-api
description: Skill for integrating Google GenAI SDK and using Gemini models to analyze documents and DrawIO diagrams.
---

# 🤖 Gemini API Integration Skill

This skill provides playbooks, best practices, and scripts for integrating the Google GenAI SDK into E-CMIS and using Gemini's multimodal capabilities to analyze DOCX documents and DrawIO diagram schemas.

## 📋 When to use this skill
- When migrating the Express agent service ([index.ts](file:///C:/Users/iznamu/OneDrive%20-%20Panyapiwat%20Institute%20of%20Management/CAI%202nd%20Year%202025/CAI%202.2%202026/PMO1-03-08-2026/E-CMIS/ecmis-agent-service/src/index.ts)) from OpenAI to the official Google GenAI SDK (`@google/genai`).
- When implementing structured JSON output schemas for document metadata extraction.
- When validating DrawIO diagram XML files using Gemini models.

## 🛠️ SDK Setup and Authentication

Install the official Google GenAI SDK in the service directory:
```bash
npm install @google/genai
```

Add your API key to `.env`:
```env
GEMINI_API_KEY=your-api-key-here
```

Initialize the client:
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

## 📖 Playbooks & Patterns

### 1. Migrating from OpenAI to Gemini API
When migrating from `ai` (Vercel AI SDK) with `openai` to `@google/genai`, use the following mapping:

- **Model:** Map `gpt-4o` to `gemini-2.5-pro` (for complex reasoning/document parsing) or `gemini-2.5-flash` (for fast scheduling tasks).
- **System Instructions:** Pass system instructions directly to the configuration.
- **Function Calling / Tools:** Define tools using the Gemini tool declaration format.

### 2. Structured JSON Output
To enforce strict schema adherence for document checks, use `responseSchema`:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Extract details from the document check logs...',
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: {
          type: 'array',
          items: { type: 'string' }
        },
        metadata: {
          type: 'object',
          properties: {
            author: { type: 'string' },
            fontName: { type: 'string' }
          }
        }
      },
      required: ['isValid', 'errors']
    }
  }
});
```

### 3. DrawIO / XML Layout Validation
Gemini's large context and strong XML/layout reasoning make it ideal for validating DrawIO diagrams. Feed the XML string directly to the model with guidelines to check:
- Diagram connectedness.
- Correct naming conventions.
- Shape colors conforming to E-CMIS standards (e.g., `#FFFFFF` for default shapes).

---
*Created for the E-CMIS Agent Project.*
