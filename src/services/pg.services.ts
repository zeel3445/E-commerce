import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export class PostgresService {
  client: Pool;
  constructor() {
    this.connect();
  }
  connect() {
    this.client = new Pool({
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: Number(process.env.DATABASE_PORT),
    });
    console.log('hello');
  }
  async query(queryText: string, params?: any[]): Promise<any> {
    const client = await this.client.connect();
    try {
      const result = await client.query(queryText, params);
      return result;
    } finally {
      client.release();
    }
  }
}
