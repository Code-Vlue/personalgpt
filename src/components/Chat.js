// src/components/Chat.js
import React, { useState } from 'react';
import axios from 'axios';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("The REACT_APP_OPENAI_API_KEY environment variable is missing or empty.");
}

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    setMessages([...messages, { text: inputText, user: 'user' }]);
    setInputText('');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: inputText },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': apiKey,
          },
        }
      );

      const aiReply = response.data.choices[0].message.content;
      setMessages([...messages, { text: aiReply, user: 'ai' }]);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Handle 429 error with a retry mechanism
        console.log('Too many requests, retrying...');
        // You can implement a retry mechanism here, for example, wait for a few seconds and then try again
        setTimeout(() => {
          sendMessage(); // Retry the sendMessage function
        }, 5000); // Wait for 5 seconds before retrying (adjust as needed)
      } else {
        console.error('Error generating response:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '10px', color: message.user === 'ai' ? 'green' : 'blue' }}>
            {message.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
