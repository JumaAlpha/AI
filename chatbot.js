require('dotenv').config();
const axios = require('axios');
const readlineSync = require('readline-sync');
const { Message } = require('./database');

const apiKey = process.env.SERPAPI_KEY;

const getWebSearchResults = async (query) => {
    try {
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                q: query,
                api_key: apiKey,
                engine: 'google'
            }
        });
        return response.data.organic_results;
    } catch (error) {
        console.error('Error fetching search results:', error);
        return [];
    }
};

const chat = async () => {
    while (true) {
        const message = readlineSync.question('You: ');
        if (message.toLowerCase() === 'bye') {
            console.log('Bot: Goodbye!');
            break;
        }
        const results = await getWebSearchResults(message);
        let botResponse = 'I couldn\'t find any results for your query.';
        if (results.length > 0) {
            botResponse = 'Here are some results I found:\n';
            results.slice(0, 3).forEach((result, index) => {
                botResponse += `${index + 1}. ${result.title}\n${result.link}\n${result.snippet}\n---\n`;
            });
        }

        console.log(`Bot: ${botResponse}`);

        // Save the message and response to the database
        await Message.create({
            user_message: message,
            bot_response: botResponse
        });
    }
};

chat();