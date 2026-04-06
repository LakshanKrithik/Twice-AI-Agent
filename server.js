const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Retell = require('retell-sdk');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

console.log('Starting server...');
console.log('API Key exists:', !!process.env.RETELL_API_KEY);

const { RetellClient } = require('retell-sdk');
const axios = require('axios');

app.get('/api/create-web-call', async (req, res) => {
  const agentId = process.env.RETELL_AGENT_ID;

  if (!agentId) {
    return res.status(500).json({ error: 'RETELL_AGENT_ID not set in .env' });
  }

  try {
    const response = await axios.post(
      'https://api.retellai.com/v2/create-web-call',
      { agent_id: agentId },
      {
        headers: {
          'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error creating web call:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create web call' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
