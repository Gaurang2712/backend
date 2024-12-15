import express from 'express';
import { Client } from 'pg';
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

// Create the table if it doesn't exist
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      description TEXT
    );
  `;

  await client.query(query);
};

// Insert sample data if the table is empty
const insertSampleData = async () => {
  const checkQuery = 'SELECT COUNT(*) FROM students;';
  const result = await client.query(checkQuery);
  
  if (result.rows[0].count === '0') {
    const insertQuery = `
      INSERT INTO your_table (name, description) VALUES
      ('Item 1', 'Description of item 1'),
      ('Item 2', 'Description of item 2');
    `;
    await client.query(insertQuery);
  }
};

// Initialize database schema and data
createTable();
insertSampleData();

// Express routes
app.get('/', (req, res) => {
  res.send('Hello from Node.js app with PostgreSQL!');
});

app.get('/data', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
