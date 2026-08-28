// @ts-nocheck
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { setupNotebookLmMcpClient } from './mcpClient.js';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { EcmisApiClient } from './apiClient.js';
import { memoryStore, Message } from './memoryStore.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

let mcpClient: Client | null = null;
setupNotebookLmMcpClient()
  .then(client => { mcpClient = client; })
  .catch(err => console.error("Failed to start NotebookLM MCP client:", err));

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ecmis-agent-service' });
});

// The MVP Workflow Endpoint: Patient Scheduling Assistant
app.post('/api/agent/schedule', async (req: Request, res: Response): Promise<any> => {
  const { prompt, patientId, sessionId } = req.body;
  const authHeader = req.headers.authorization;

  if (!prompt || !patientId || !sessionId) {
    return res.status(400).json({ error: 'prompt, patientId, and sessionId are required' });
  }

  const ecmisApi = new EcmisApiClient();
  if (authHeader) {
    // JWT Validation/RBAC context enforcement logic would go here
    ecmisApi.setToken(authHeader);
  }

  const history = memoryStore.getHistory(sessionId);
  const preferences = memoryStore.getPreferences(patientId);

  // Add the new user prompt to history
  const userMessage: Message = { role: 'user', content: prompt };
  history.push(userMessage);

  try {
    const result = await generateText({
      model: openai('gpt-4o'), // Requires OPENAI_API_KEY in .env
      system: `You are the E-CMIS Patient Scheduling Assistant. You help doctors and staff manage appointments.
Always be polite and confirm actions before proceeding.
Patient Preferences Context: ${preferences}`,
      messages: history as any,
      tools: {
        checkAvailability: tool({
          description: 'Check clinic availability and existing appointments for a specific date',
          parameters: z.object({
            date: z.string().describe('The date to check in YYYY-MM-DD format'),
          }),
          execute: async ({ date }: { date: string }): Promise<any> => {
            const appointments = await ecmisApi.getAppointments(date);
            return { availableSlots: ['09:00', '10:30', '14:00'], existingAppointments: appointments };
          },
        }),
        draftAppointment: tool({
          description: 'Draft a new appointment. This requires human-in-the-loop approval before finalizing.',
          parameters: z.object({
            date: z.string(),
            time: z.string(),
            reason: z.string(),
          }),
          execute: async ({ date, time, reason }: { date: string; time: string; reason: string }): Promise<any> => {
            const appointment = await ecmisApi.createAppointment(date, time, reason);
            return {
              status: appointment.status,
              message: `Drafted appointment on ${date} at ${time} for ${reason}. Please approve to finalize.`
            };
          },
        }),
        savePatientPreference: tool({
          description: 'Save a specific preference or note about the patient to memory',
          parameters: z.object({
            preference: z.string()
          }),
          execute: async ({ preference }: { preference: string }): Promise<any> => {
            memoryStore.savePreference(patientId, preference);
            return "Preference saved to memory.";
          }
        }),
        queryNotebookLM: tool({
          description: 'Query the clinic knowledge base (NotebookLM) for policies, procedures, or general clinic information.',
          parameters: z.object({
            query: z.string().describe('The question or topic to search for in NotebookLM'),
          }),
          execute: async ({ query }: { query: string }): Promise<any> => {
            if (!mcpClient) return "NotebookLM MCP server is not available.";
            try {
              const result = await mcpClient.callTool({
                name: 'notebook_query',
                arguments: { query }
              });
              return result;
            } catch (err) {
              console.error("Error querying NotebookLM:", err);
              return "Failed to query NotebookLM.";
            }
          }
        })
      }
    });

    // Save the assistant's response to history
    const assistantMessage: Message = { role: 'assistant', content: result.text };
    memoryStore.saveHistory(sessionId, [userMessage, assistantMessage]);

    res.json({
      text: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults
    });
  } catch (error) {
    console.error('Agent Error:', error);
    res.status(500).json({ error: 'Failed to process agent request' });
  }
});

app.listen(PORT, () => {
  console.log(`E-CMIS Agent Service running on port ${PORT}`);
});
