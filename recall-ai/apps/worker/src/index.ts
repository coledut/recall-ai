import { run } from 'graphile-worker';
import { Pool } from 'pg';
import { getEnv } from '@recall/config';

// Import job definitions
import { registerGmailIngestJob } from './jobs/ingest-gmail.js';
import { registerCalendarIngestJob } from './jobs/ingest-calendar.js';

const main = async () => {
  const env = getEnv();

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  console.log('Starting Recall AI background worker...');

  try {
    await run({
      pgPool: pool,
      concurrency: 5,
      noHandleSignals: false,
      pollInterval: 1000,
      taskHandlers: {
        ingest_gmail: registerGmailIngestJob(env),
        ingest_calendar: registerCalendarIngestJob(env),
      },
    });
  } catch (error) {
    console.error('Worker error:', error);
    process.exit(1);
  }
};

main();
