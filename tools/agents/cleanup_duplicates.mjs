import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '92p0tpps',
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function main() {
  const query = `*[_type == "post"]{ _id, title, "slug": slug.current }`;
  const posts = await client.fetch(query);
  console.log('Total posts in Sanity:', posts.length);
  const webDevPosts = posts.filter(p => (p.slug && p.slug.includes('web-development-in-2026')) || (p.title && p.title.includes('Web Development in 2026')));
  console.log('Found web-development duplicate posts:', webDevPosts.length);
  for (const p of webDevPosts) {
    console.log(`Deleting ${p._id}: ${p.slug || p.title}`);
    await client.delete(p._id);
  }
  console.log('Finished Sanity duplicate cleanup.');
}

main().catch(console.error);
