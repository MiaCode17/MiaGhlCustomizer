import { env } from './config/env';
import { connectDb } from './db/connect';
import { ensureDefaultCompany } from './middleware/company';
import { createServer } from './server';

async function main(): Promise<void> {
  await connectDb();
  await ensureDefaultCompany();
  const app = createServer();
  app.listen(env.PORT, () => {
    console.log(`Customizer API listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
