const { Client } = require('@notionhq/client');
const crypto = require('crypto');
require('dotenv').config();

// Configuration
const NOTION_KEY = process.env.NOTION_KEY;
const DATABASE_ID = '20271a98-db11-8030-afc6-cdc8380b4d12';

if (!NOTION_KEY) {
    console.error('ERROR: NOTION_KEY is missing in .env');
    process.exit(1);
}

const notion = new Client({ auth: NOTION_KEY });

async function backfill() {
    console.log('Fetching database schema...');
    const database = await notion.databases.retrieve({ database_id: DATABASE_ID });

    if (!database.properties.patient_id) {
        console.error('ERROR: "patient_id" property not found in Notion database.');
        console.log('Please manualy add a property named "patient_id" (Type: Text) to the database first.');
        return;
    }

    console.log('Querying all records...');
    let hasMore = true;
    let cursor = undefined;
    let count = 0;

    while (hasMore) {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            start_cursor: cursor,
        });

        for (const page of response.results) {
            // Only update if patient_id is empty
            const existingId = page.properties.patient_id.rich_text?.[0]?.plain_text;

            if (!existingId) {
                const newId = crypto.randomUUID();
                console.log(`Updating record: ${page.id} with ID: ${newId}`);
                await notion.pages.update({
                    page_id: page.id,
                    properties: {
                        patient_id: {
                            rich_text: [{ text: { content: newId } }]
                        }
                    }
                });
                count++;
            }
        }

        hasMore = response.has_more;
        cursor = response.next_cursor;
    }

    console.log(`Successfully backfilled ${count} records.`);
}

backfill().catch(err => {
    console.error('Backfill failed:', err);
});
