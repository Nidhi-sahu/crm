const job = require('./src/jobs/overdueReminders.job');
const { connectDB, disconnectDB } = require('./src/database/connect');

(async () => {
  await connectDB();
  const r = await job.run();
  console.log('overdue job result:', JSON.stringify(r));
  await disconnectDB();
  process.exit(0);
})().catch((e) => {
  console.error('failed:', e.message);
  process.exit(1);
});
