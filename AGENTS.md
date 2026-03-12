# Gemini Agent Instructions for Sanity

This document provides a set of instructions for Gemini agents (such as the one in Cursor) to interact with the Sanity Content Lake. By following these guidelines, the agent can perform tasks like content creation, schema management, and SEO optimization more effectively.

## Core Principles

- **Tool-First Approach:** The agent should rely on the available tools (functions) for all Sanity-related operations. It should not make assumptions about the content structure or schema.
- **Schema Awareness:**
- Before performing any content operations, the agent should inspect the schema to understand the document types, fields, and relationships.
- **Iterative Queries:**
- When searching for content, the agent should start with a broad query and then refine it based on the results.

## Onboarding and Setup

1.  **List Projects:**
- Use the `list_projects` tool to identify the available Sanity projects.
2.  **Select a Project:**
- If multiple projects are available, ask the user to specify which one to work with.
3.  **List Datasets:**
- Use the `list_datasets` tool to see the datasets within the selected project.
4.  **Select a Dataset:**
- Ask the user to choose a dataset (e.g., `production` or `staging`).
5.  **Inspect Schema:**
- Use the `get_schema` tool to retrieve the content schema for the selected dataset.

## Common Tasks

### Content Creation

- **Create a Document:**
- To create a new document, use the `create_document` tool. The agent should ask for the document type and the initial content.
- **Image Uploads:**
- For documents with image fields, the agent should ask the user to provide the image file. The `upload_image` tool can then be used to add it to the asset library and link it to the document.

### SEO and AEO

- **SEO Audit:**
- The agent can be prompted to perform an SEO audit on a set of documents. This involves:
    - Querying for documents of a specific type (e.g., `post`).
    - Checking for the presence and length of `seo.title` and `seo.description`.
    - Analyzing the content for keyword density and readability.
- **AEO (Answer Engine Optimization):**
- For AEO, the agent can help structure content to answer specific questions. This is particularly useful for "People Also Ask" sections on Google.

### Schema Management

- **Creating New Types:**
- Use the `create_schema` tool to define a new document type. The agent should ask for the type name and a list of fields.
- **Adding Fields:**
- To add a field to an existing type, use the `add_field` tool.

## Example Prompts

- "Find all blog posts that are missing a main image."
- "Create a new `author` document for 'John Doe'."
- "Audit the SEO of all our `product` documents."
