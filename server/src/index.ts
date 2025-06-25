import path from 'path';
import dotenv from 'dotenv';
import { app } from './app';

// dotenv 読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const port = Number(process.env.PORT) || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
