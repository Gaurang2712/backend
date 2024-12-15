import express from 'express';
import pkg from 'pg'; // Corrected import for pg module
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const app = express();
const port = process.env.PORT || 5000;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1); // Exit if the database connection fails
});

// Create the table if it doesn't exist
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      description TEXT
    );
  `;

  try {
    await client.query(query);
    console.log('Table "students" ensured.');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

// Insert sample data if the table is empty
const insertSampleData = async () => {
  const checkQuery = 'SELECT COUNT(*) FROM students;';
  try {
    const result = await client.query(checkQuery);

    if (result.rows[0].count === '0') {
      const insertQuery = `
        INSERT INTO students (name, description) VALUES
        ('Item 1', 'Description of item 1'),
        ('Item 2', 'Description of item 2');
      `;
      await client.query(insertQuery);
      console.log('Sample data inserted.');
    }
  } catch (err) {
    console.error('Error inserting sample data:', err);
  }
};

// Initialize database schema and data
(async () => {
  await createTable();
  await insertSampleData();
})();

// Express routes
app.get('/', (req, res) => {
  res.send('Hello from Node.js app with PostgreSQL!');
});

app.get('/data', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Database query failed');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
