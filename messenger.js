// Gemini AI Chatbot

// ========== Configuration ==========
// IMPORTANT: Store API keys securely using environment variables
// Do NOT hardcode API keys in client-side code

// Load API key from environment file
async function loadApiKey() {
    try {
        const response = await fetch('geminiAPI.env');
        const envContent = await response.text();
        const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
        return apiKeyMatch ? apiKeyMatch[1] : null;
    } catch (error) {
        console.error('Failed to load API key:', error);
        return null;
    }
}

let GEMINI_API_KEY = null;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ========== Load Therapy Bot Rules ==========

// The rules for the AI therapy bot (from WelloWayRuleList.txt)
const THERAPY_BOT_RULES = `1. Confidentiality: Never share or store user conversations outside the session. Respect user privacy at all times.\n2. Non-judgmental Support: Respond to all user messages with empathy and without judgment, regardless of the topic.\n3. No Diagnosis: Do not attempt to diagnose mental health conditions or provide medical advice. Encourage users to seek professional help for diagnoses.\n4. Crisis Protocol: If a user expresses thoughts of self-harm, suicide, or harm to others, provide supportive messages and encourage them to contact a mental health professional or emergency services immediately.\n5. Active Listening: Reflect back what the user says to show understanding and encourage them to share more.\n6. Encouragement: Offer positive reinforcement and encouragement to help users feel supported and motivated.\n7. Boundaries: Politely decline to answer questions or engage in conversations that are outside the scope of mental health support (e.g., legal, financial, or medical advice).\n8. Resource Suggestion: When appropriate, suggest reputable mental health resources, hotlines, or self-care techniques.\n9. Respect Autonomy: Empower users to make their own decisions and avoid giving direct instructions unless it is to encourage safety.\n10. Cultural Sensitivity: Be mindful and respectful of cultural, religious, and personal differences.\n11. Transparency: Clearly state that you are an AI and not a human therapist.\n12. No Personal Data Collection: Do not ask for or store personal identifying information.\n13. Emotion Validation: Validate the user's feelings and experiences, acknowledging their emotions as real and important.\n14. Consistent Tone: Maintain a calm, supportive, and professional tone at all times.\n15. Encourage Professional Help: Remind users that AI support is not a substitute for professional therapy and encourage seeking help when needed.`;

// ========== Chatbot State ==========
// Always start the conversation with the rules as a user message
let conversation = [
    { role: 'user', parts: [{ text: THERAPY_BOT_RULES }] }
]; // Array of {role: 'user'|'model', parts: [{text: string}]}

// ========== DOM Elements ==========
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-area');
const chatInput = document.querySelector('.chat-input');

// ========== Helper Functions ==========

// Initialize markdown-it
const md = window.markdownit({
  html: false,
  linkify: true,
  breaks: true
});

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(role === 'user' ? 'sent' : 'received');
    // Parse Markdown with markdown-it and sanitize
    const html = DOMPurify.sanitize(md.render(text));
    msgDiv.innerHTML = html;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setInputEnabled(enabled) {
    chatInput.disabled = !enabled;
    chatInputForm.querySelector('.send-btn').disabled = !enabled;
}

// ========== Gemini API Call ==========

async function sendToGemini(conversation) {
    const body = {
        contents: conversation
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from Gemini API: ${response.status} ${response.statusText}`);
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

    // Show user message
    appendMessage('user', userMessage);

    // Add to conversation
    conversation.push({ role: 'user', parts: [{ text: userMessage }] });

    // Clear input and disable while waiting
    chatInput.value = '';
    setInputEnabled(false);

    // Get AI response
    const aiReply = await sendToGemini(conversation);

    // Show AI message
    appendMessage('model', aiReply);

    // Add AI reply to conversation
    conversation.push({ role: 'model', parts: [{ text: aiReply }] });

    setInputEnabled(true);
    chatInput.focus();
});

// Optionally, greet the user on load
window.addEventListener('DOMContentLoaded', async () => {
    GEMINI_API_KEY = await loadApiKey();
    if (!GEMINI_API_KEY) {
        console.error('No API key found. Please check your geminiAPI.env file.');
        return;
    }
    
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
    // Load saved mode
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
    // Optionally, allow header click to maximize as well
    chatHeader.addEventListener('click', () => {
        if (minimized) setMinimized(false);
    });
});
