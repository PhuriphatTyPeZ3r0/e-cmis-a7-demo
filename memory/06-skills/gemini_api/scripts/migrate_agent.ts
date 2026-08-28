import { GoogleGenAI, Type } from '@google/genai';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Reference endpoint using Gemini SDK
app.post('/api/agent/schedule-gemini', async (req: Request, res: Response): Promise<any> => {
  const { prompt, patientId } = req.body;

  if (!prompt || !patientId) {
    return res.status(400).json({ error: 'prompt and patientId are required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // System instruction configuration
        systemInstruction: `You are the E-CMIS Patient Scheduling Assistant. You help clinic staff manage appointments.
Always be polite and confirm actions before proceeding.`,
        
        // Define tool declarations for Gemini's native function calling
        tools: [{
          functionDeclarations: [
            {
              name: 'checkAvailability',
              description: 'Check clinic availability and existing appointments for a specific date',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  date: {
                    type: Type.STRING,
                    description: 'The date to check in YYYY-MM-DD format'
                  }
                },
                required: ['date']
              }
            }
          ]
        }]
      }
    });

    res.json({
      text: response.text,
      functionCalls: response.functionCalls
    });
  } catch (error) {
    console.error('Gemini Agent Error:', error);
    res.status(500).json({ error: 'Failed to process agent request' });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini Reference Service running on port ${PORT}`);
});
