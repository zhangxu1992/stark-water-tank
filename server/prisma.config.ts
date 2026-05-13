import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  schema: 'src/database/prisma/schema.prisma',
  migrations: {
    path: 'src/database/prisma/migrations',
  },
  seed: {
    tsx: {
      tsconfig: 'tsconfig.json',
      script: 'src/database/prisma/seed.ts',
    },
  },
});
