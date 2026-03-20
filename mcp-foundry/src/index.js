#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'marketing-data', version: '0.1.0' });

async function fetchGA4Metrics(params) {
  // placeholder: call GA4 Data API using service account credentials from env
  return { stub: true, params };
}

async function fetchClaritySessions(params) {
  // placeholder: call Clarity API
  return { stub: true, params };
}

async function fetchCRMLeads(params) {
  return { stub: true, params };
}

server.tool(
  'ga4_metrics',
  'Fetch GA4 event metrics for experiments',
  {
    eventName: z.string().describe('GA4 event name to query'),
    startDate: z.string().describe('Start date in YYYY-MM-DD format'),
    endDate: z.string().describe('End date in YYYY-MM-DD format'),
    dimensions: z.array(z.string()).default([]).describe('Optional dimension array'),
  },
  async ({ eventName, startDate, endDate, dimensions }) => {
    const result = await fetchGA4Metrics({ eventName, startDate, endDate, dimensions });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'clarity_sessions',
  'Fetch Microsoft Clarity session stats filtered by experiment variant',
  {
    variantKey: z.string().describe('Experiment variant key to filter by'),
    startDate: z.string().describe('Start date in YYYY-MM-DD format'),
    endDate: z.string().describe('End date in YYYY-MM-DD format'),
  },
  async ({ variantKey, startDate, endDate }) => {
    const result = await fetchClaritySessions({ variantKey, startDate, endDate });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'crm_leads',
  'Fetch recent CRM leads for QA by experiment variant',
  {
    variant: z.string().describe('Experiment variant to filter leads by'),
    limit: z.number().default(10).describe('Maximum number of leads to return'),
  },
  async ({ variant, limit }) => {
    const result = await fetchCRMLeads({ variant, limit });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
