import { createClient } from '@sanity/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// --- Configuration ---
const SANITY_PROJECT_ID = '92p0tpps';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2023-05-03';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

// Azure OpenAI / Foundry config
const AZURE_OPENAI_KEY = process.env.OPENAI_API_KEY;
const AZURE_OPENAI_ENDPOINT =
  process.env.OPENAI_API_BASE || 'https://03coding-agent-test-resource.cognitiveservices.azure.com';
const AZURE_OPENAI_DEPLOYMENT = process.env.OPENAI_DEPLOYMENT || 'gpt-5.4';
const AZURE_OPENAI_API_VERSION = process.env.OPENAI_API_VERSION || '2024-05-01-preview';

if (!SANITY_TOKEN || !AZURE_OPENAI_KEY) {
  console.error('Missing SANITY_API_TOKEN or OPENAI_API_KEY environment variables.');
  process.exit(1);
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  useCdn: false,
  apiVersion: SANITY_API_VERSION,
});

const openai = new OpenAI({
  apiKey: AZURE_OPENAI_KEY,
  // For Azure: baseURL is the resource URL + `/openai`
  baseURL: `${AZURE_OPENAI_ENDPOINT}/openai`,
  defaultQuery: { 'api-version': AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': AZURE_OPENAI_KEY },
});
