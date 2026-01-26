#!/usr/bin/env node
import { MCPServer } from '@modelcontextprotocol/sdk';

const server = new MCPServer({ name: 'marketing-data', version: '0.1.0' });

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

server.tool('ga4.metrics', {
  summary: 'Fetch GA4 event metrics for experiments',
  description: 'Inputs: eventName, startDate, endDate, dimensions array',
  inputSchema: {
    type: 'object',
    properties: {
      eventName: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
      dimensions: {
        type: 'array',
        items: { type: 'string' },
        default: [],
      },
    },
    required: ['eventName', 'startDate', 'endDate'],
  },
  handler: ({ input }) => fetchGA4Metrics(input),
});

server.tool('clarity.sessions', {
  summary: 'Fetch Microsoft Clarity session stats filtered by experiment variant',
  description: 'Inputs: variantKey, startDate, endDate',
  inputSchema: {
    type: 'object',
    properties: {
      variantKey: { type: 'string' },
      startDate: { type: 'string' },
      endDate: { type: 'string' },
    },
    required: ['variantKey', 'startDate', 'endDate'],
  },
  handler: ({ input }) => fetchClaritySessions(input),
});

server.tool('crm.leads', {
  summary: 'Fetch recent leads for QA by variant',
  description: 'Inputs: variant, limit',
  inputSchema: {
    type: 'object',
    properties: {
      variant: { type: 'string' },
      limit: { type: 'number', default: 10 },
    },
    required: ['variant'],
  },
  handler: ({ input }) => fetchCRMLeads(input),
});

server.start();
