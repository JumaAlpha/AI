const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const saveMessage = async (userMessage, botResponse) => {
    const connection = await pool.getConnection();
    try {
        const query = 'INSERT INTO messages (user_message, bot_response) VALUES (?, ?)';
        await connection.execute(query, [userMessage, botResponse]);
    } finally {
        connection.release();
    }
};

const learnResponse = async (query, response) => {
    const connection = await pool.getConnection();
    try {
        const checkQuery = 'SELECT * FROM learned_responses WHERE query = ?';
        const [rows] = await connection.execute(checkQuery, [query]);
        if (rows.length === 0) {
            const insertQuery = 'INSERT INTO learned_responses (query, response) VALUES (?, ?)';
            await connection.execute(insertQuery, [query, response]);
        } else {
            const updateQuery = 'UPDATE learned_responses SET response = ? WHERE query = ?';
            await connection.execute(updateQuery, [response, query]);
        }
    } finally {
        connection.release();
    }
};

module.exports = { pool, saveMessage, learnResponse };