document.addEventListener('DOMContentLoaded', () => {
    // Dark/Light mode toggle functionality
    const modeToggle = document.querySelector('.mode-toggle');
    const body = document.body;
    modeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        modeToggle.textContent = body.classList.contains('dark-mode') ? '🌙' : '☀️';
    });
    
    // Intersection Observer for animations
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.animation = 'fadeIn 1s ease-in-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 1s ease-in-out, transform 1s ease-in-out';
        observer.observe(section);
    });

    // Chatbot functionality
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    chatButton.addEventListener('click', () => {
        chatContainer.classList.toggle('open');
    });

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    let chatHistory = [];
    const resumeContent = `
    Omkar Rane, a computer engineer, has a BTech from K.J. Somaiya Institute of Technology with a CGPA of 9.17.
    Professional experience includes an internship at KJSIT, where he created a dataset for a geofencing project, and an internship at Image online private limited as an Android app developer, where he built a quiz app and optimized API fetching.
    His projects include:
    - Legal Document Chatbot: Analyzes complex documents, generates summaries, and answers queries using Gemini.
    - Alzheimer disease detection integrated with chat-bot: A web app using Flask and CNN to help people understand MRI scans.
    - Customer Churn prediction: A web app built with Streamlit and TensorFlow to predict customer churn.
    He has a publication titled "A Comparison of Machine Learning Algorithms for Customer Churn Prediction" published in the 2023 6th International Conference on Advances in Science and Technology (ICAST).
    Technical skills include: Python, Machine learning, Deep learning, Django, JavaScript, Flask, and MySQL.
    Contact details: Phone: +91 9082935364, Email: omkarrane045@gmail.com
    `;
    
    const initialPrompt = `You are Omkar Rane's AI assistant. Your purpose is to answer questions about Omkar based on the following provided information. Do not invent any information not present in the text. If you don't know the answer, say "I'm sorry, I don't have information about that."

    Here is the information about Omkar Rane:
    ${resumeContent}
    `;
    
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        // Display user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('message', 'user-message');
        userMessageDiv.textContent = userMessage;
        chatBox.appendChild(userMessageDiv);
        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Add a typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
        typingIndicator.textContent = 'Typing...';
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;

        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

        try {
            const payload = {
                contents: [{ role: "user", parts: [{ text: initialPrompt + "\n\nUser asked: " + userMessage }] }],
            };
            const apiKey = "AIzaSyAUfJLPHpg6xKv27GM3Rh1ha45tl4KrzA0";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const botResponse = result.candidates[0].content.parts[0].text;
                
                // Remove typing indicator
                chatBox.removeChild(typingIndicator);
                
                // Display bot response
                const botMessageDiv = document.createElement('div');
                botMessageDiv.classList.add('message', 'bot-message');
                botMessageDiv.textContent = botResponse;
                chatBox.appendChild(botMessageDiv);
                chatBox.scrollTop = chatBox.scrollHeight;

                chatHistory.push({ role: "model", parts: [{ text: botResponse }] });

            } else {
                // Handle unexpected response structure
                chatBox.removeChild(typingIndicator);
                const errorMessage = document.createElement('div');
                errorMessage.classList.add('message', 'bot-message');
                errorMessage.textContent = "I'm sorry, I couldn't generate a response. Please try again.";
                chatBox.appendChild(errorMessage);
            }
        } catch (error) {
            console.error('Error fetching from Gemini API:', error);
            chatBox.removeChild(typingIndicator);
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('message', 'bot-message');
            errorMessage.textContent = "An error occurred. Please check the console for details.";
            chatBox.appendChild(errorMessage);
        }
    }
});