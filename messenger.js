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

    const modeSwitchBtn = document.querySelector('.mode-switch-btn');
    const messengerContainer = document.querySelector('.messenger-container');
    const chatHeader = document.querySelector('.chat-header');
    const minimizeBtn = document.querySelector('.minimize-btn');

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

    // Collapse/expand logic for in-page chat
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        messengerContainer.classList.toggle('collapsed');
    });

    chatHeader.addEventListener('click', () => {
        if (messengerContainer.classList.contains('collapsed')) {
            messengerContainer.classList.remove('collapsed');
        }
    });

    // Rating Widget Logic
    const starsContainer = document.querySelector('.stars');
    const stars = document.querySelectorAll('.stars .fa-star');
    const ratingTextarea = document.querySelector('.rating-textarea');
    const ratingSubmitBtn = document.querySelector('.rating-submit-btn');
    let currentRating = 0;

    function updateStars(rating) {
        stars.forEach(star => {
            if (star.dataset.value <= rating) {
                star.classList.remove('far');
                star.classList.add('fas'); // 'fas' is for solid star
            } else {
                star.classList.remove('fas');
                star.classList.add('far'); // 'far' is for regular/outline star
            }
        });
    }

    starsContainer.addEventListener('mouseover', (e) => {
        if (e.target.matches('.fa-star')) {
            const rating = e.target.dataset.value;
            updateStars(rating);
        }
    });

    starsContainer.addEventListener('mouseout', () => {
        updateStars(currentRating); // Revert to the last clicked rating
    });

    starsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.fa-star')) {
            currentRating = e.target.dataset.value;
            updateStars(currentRating);
        }
    });

    ratingSubmitBtn.addEventListener('click', () => {
        const feedbackText = ratingTextarea.value.trim();
        if (currentRating === 0) {
            alert('Please select a star rating before submitting.');
            return;
        }
        
        console.log(`Rating submitted: ${currentRating} stars`);
        console.log(`Feedback: ${feedbackText}`);
        
        // Provide feedback to the user
        document.querySelector('.rating-widget').innerHTML = '<h3>Thank you for your feedback!</h3>';
    });
});