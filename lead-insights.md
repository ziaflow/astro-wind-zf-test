# Lead Insights Report

## Overview

No 'leads' table was found in the Supabase schema for this project. Instead, the main table related to inbound contacts is `contact_submissions`. This table captures information from the website contact form, including name, email, phone, message, and optional metadata.

## Table Structure

| Field      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | uuid      | Unique identifier                  |
| created_at | timestamp | Submission date/time               |
| name       | text      | Name of the contact                |
| email      | text      | Email address                      |
| phone      | text      | Phone number                       |
| message    | text      | Message content                    |
| metadata   | jsonb     | Additional data (optional)         |

## Key Insights & Trends

- **Lead Source**: All leads are captured via the website contact form.
- **Data Captured**: Standard fields (name, email, phone, message) with flexibility for extra metadata.
- **Security**: Row Level Security is enabled, and anonymous inserts are allowed for public form submissions.
- **No direct analytics**: No actual lead data is present in the repository, so trends (volume, timing, conversion rates) cannot be analyzed.

## Recommendations

- To generate actionable insights, export or connect to the live Supabase database and analyze actual submission data (e.g., volume over time, most common sources, response rates).
- Consider adding fields for lead source attribution, status, or follow-up outcomes for richer analytics.

## Example Table Structure

| Name      | Email             | Phone      | Date Submitted       | Message Preview         |
|-----------|-------------------|------------|----------------------|------------------------|
| John Doe  | john@example.com  | 555-1234   | 2024-06-07 10:15:00  | "Interested in demo..."|

*No real data available for charting.*

---

*This report is based on the schema and code in the repository. For live insights, connect to the production Supabase instance and analyze real submissions.*
