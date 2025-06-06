// Get DOM elements
const chatbotInput = document.querySelector('.chatbot-input input');
const sendButton = document.querySelector('.send-btn');
const messagesContainer = document.querySelector('.chatbot-messages');

// Your Groq API Key (in production, this should be stored securely)
const GROQ_API_KEY = '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';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt for fine-tuning the LLM
const systemPrompt = `
You are an AI assistant embedded in a personal portfolio website.
Your purpose is to answer questions about the portfolio owner's resume, experience, and skills.
Here is information about the portfolio owner:

Name: Akhil Kumar
Current Position: 3rd Year Chemical Engineer student at IIT Ropar
Data Skills: Machine Learning, Deep Learning, Data Analysis, Data Visualization
DevOps Skills: Github
Work Experience: Worked as an AI Research Intern at Coding Jr.
Education: Pursuing B.Tech in Chemical Engineering at IIT Ropar
Projects: Website Comment Sentiment analysis, Exploratory Stock Market Analysis using GRU and LSTMs.
Certifications: Some Machine Learning Certificates, Data Science Certificates.

When answering, be professional, concise, and helpful. If asked about topics 
not related to the portfolio owner's professional background, politely redirect 
to relevant information you can provide about their skills, experience, or qualifications.
`;

// Message history for context
let messageHistory = [
    { role: 'system', content: systemPrompt },
    { role: 'assistant', content: "Hi there! I'm a virtual assistant. Ask me anything about my skills, experience, or qualifications." }
];

// Function to add a message to the chat
function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    
    // Scroll to the bottom of the chat
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add to message history
    if (sender === 'user') {
        messageHistory.push({ role: 'user', content: message });
    } else if (sender === 'bot') {
        messageHistory.push({ role: 'assistant', content: message });
    }
}

// Function to send message to Groq API
async function sendToGroq(userMessage) {
    try {
        // Show loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'bot');
        loadingElement.textContent = 'Thinking...';
        messagesContainer.appendChild(loadingElement);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192', // Using Llama3 model
                messages: messageHistory,
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        // Remove loading indicator
        messagesContainer.removeChild(loadingElement);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        addMessage(reply, 'bot');
    } catch (error) {
        console.error('Error calling Groq API:', error);
        addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
    }
}

// Handle sending messages
function handleSendMessage() {
    const message = chatbotInput.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        chatbotInput.value = '';
        
        sendToGroq(message);
    }
}

// Event listeners
sendButton.addEventListener('click', handleSendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});
