import 'reflect-metadata';
import { createApplication } from './bootstrap';

async function main(): Promise<void> {
  const application = await createApplication();
  const port = Number(process.env.PORT ?? 3000);
  await application.listen(port);
  console.log(`Mock da API de remessa em http://localhost:${port} · Swagger em http://localhost:${port}/docs`);
}

void main();
