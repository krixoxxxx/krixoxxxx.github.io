// Gemini AI Chatbot

// ========== Configuration ==========
const GEMINI_API_KEY = 'AIzaSyACsRYQWrJfFTB8RVrh_S945O_j2WvLNu8'; // <-- Replace with your Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ========== Load Therapy Bot Rules ==========
let THERAPY_BOT_RULES = '';
let conversation = [];

async function loadTherapyBotRules() {
    try {
        const response = await fetch('WelloWayRuleList.txt');
        if (!response.ok) throw new Error('Failed to load rules');
        THERAPY_BOT_RULES = await response.text();
        conversation = [
            { role: 'user', parts: [{ text: THERAPY_BOT_RULES }] }
        ];
    } catch (error) {
        console.error('Error loading rules:', error);
        THERAPY_BOT_RULES = 'Therapy bot rules could not be loaded.';
        conversation = [
            { role: 'user', parts: [{ text: THERAPY_BOT_RULES }] }
        ];
    }
}

// ========== DOM Elements ==========
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-area');
const chatInput = document.querySelector('.chat-input');

// ========== Helper Functions ==========
const md = window.markdownit({ html: false, linkify: true, breaks: true });

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role === 'user' ? 'sent' : 'received');
    msgDiv.innerHTML = DOMPurify.sanitize(md.render(text));
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setInputEnabled(enabled) {
    chatInput.disabled = !enabled;
    chatInputForm.querySelector('.send-btn').disabled = !enabled;
}

// ========== Gemini API Call ==========
async function sendToGemini(conversation) {
    // Debug: log the conversation being sent
    console.log("Sending to Gemini:", JSON.stringify({ contents: conversation }, null, 2));
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: conversation })
        });
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0] &&
            data.candidates[0].content.parts[0].text
        ) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Sorry, I didn't understand that.";
        }
    } catch (error) {
        console.error("Error: Unable to connect to Gemini API.", error);
        return "Sorry, I couldn't connect to the AI service.";
    }
}

// ========== Event Handlers ==========
chatInputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    appendMessage('user', userMessage);
    conversation.push({ role: 'user', parts: [{ text: userMessage }] });
    chatInput.value = '';
    setInputEnabled(false);
    const aiReply = await sendToGemini(conversation);
    appendMessage('model', aiReply);
    conversation.push({ role: 'model', parts: [{ text: aiReply }] });
    setInputEnabled(true);
    chatInput.focus();
});

// ========== App Initialization ==========
window.addEventListener('DOMContentLoaded', async () => {
    await loadTherapyBotRules();
    const greeting = "Hi! I'm WelloWay, your supportive therapy bot. How can I help you today?";
    appendMessage('model', greeting);
    conversation.push({ role: 'model', parts: [{ text: greeting }] });

    // Minimize/open logic
    const minimizeBtn = document.querySelector('.minimize-btn');
    const maximizeBtn = document.querySelector('.maximize-btn');
    const modeSwitchBtn = document.querySelector('.mode-switch-btn');
    const messengerContainer = document.querySelector('.messenger-container');
    const chatHeader = document.querySelector('.chat-header');
    let minimized = false;

    // Theme logic
    const root = document.documentElement;
    function setMode(mode) {
        if (mode === 'light') {
            root.classList.add('light-mode');
            modeSwitchBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('chat-theme', 'light');
        } else {
            root.classList.remove('light-mode');
            modeSwitchBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('chat-theme', 'dark');
        }
    }
    const savedMode = localStorage.getItem('chat-theme');
    setMode(savedMode === 'light' ? 'light' : 'dark');
    modeSwitchBtn.addEventListener('click', () => {
        const isLight = root.classList.contains('light-mode');
        setMode(isLight ? 'dark' : 'light');
    });

    function setMinimized(state) {
        minimized = state;
        if (minimized) {
            messengerContainer.classList.add('minimized');
            maximizeBtn.style.display = 'block';
            minimizeBtn.innerHTML = '<i class="fas fa-plus"></i>';
        } else {
            messengerContainer.classList.remove('minimized');
            maximizeBtn.style.display = 'none';
            minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        }
    }
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setMinimized(true);
    });
    maximizeBtn.addEventListener('click', () => {
        setMinimized(false);
    });
    chatHeader.addEventListener('click', () => {
        if (minimized) setMinimized(false);
    });
});