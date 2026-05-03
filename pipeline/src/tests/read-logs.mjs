import { Logging } from '@google-cloud/logging';

async function quickstart() {
  const logging = new Logging({ projectId: 'prisincera' });
  const log = logging.log('run.googleapis.com/stderr');

  const entries = await logging.getEntries({
    filter: 'resource.type="cloud_run_job" resource.labels.job_name="prisignal-composer" severity>=ERROR',
    pageSize: 10,
    orderBy: 'timestamp desc'
  });

  entries[0].forEach(entry => {
    console.log(`[${entry.metadata.timestamp}] ${entry.data.message || entry.data}`);
  });
}

quickstart().catch(console.error);
