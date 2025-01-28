const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool, saveMessage, learnResponse } = require('./database');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const predefinedResponses = {
    'what is html': 'HTML (HyperText Markup Language) is the standard markup language for creating web pages and web applications.',
    'what is css': 'CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML or XML.',
    'what is javascript': 'JavaScript is a high-level, often just-in-time compiled language that conforms to the ECMAScript specification. It is a programming language that is one of the core technologies of the World Wide Web, alongside HTML and CSS.',
};

const getPredefinedResponse = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    return predefinedResponses[lowerCaseQuery] || null;
};

const getLearnedResponse = async (query) => {
    const connection = await pool.getConnection();
    try {
        const checkQuery = 'SELECT * FROM learned_responses WHERE query = ?';
        const [rows] = await connection.execute(checkQuery, [query]);
        if (rows.length > 0) {
            return rows[0].response;
        }
        return null;
    } finally {
        connection.release();
    }
};

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    let botResponse = getPredefinedResponse(message);

    if (!botResponse) {
        botResponse = await getLearnedResponse(message);
    }

    if (!botResponse) {
        botResponse = 'I couldn\'t find an explanation for your query.';
    }

    // Save the message and response to the database
    await saveMessage(message, botResponse);

    res.json({ response: botResponse });
});

app.post('/learn', async (req, res) => {
    const { query, response } = req.body;
    await learnResponse(query, response);
    res.json({ message: 'Learned response successfully' });
});

app.get('/history', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT user_message, bot_response, created_at FROM messages ORDER BY created_at DESC');
        res.json(rows);
    } finally {
        connection.release();
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});