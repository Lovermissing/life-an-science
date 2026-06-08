// main.js - Main logic controller
document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const flaskBtn = document.getElementById('flaskBtn');
    const experimentsPanel = document.getElementById('experimentsPanel');
    const experimentDetail = document.getElementById('experimentDetail');
    const backToMain = document.getElementById('backToMain');
    const closeDetail = document.getElementById('closeDetail');
    const expContent = document.getElementById('expContent');
    const expTitle = document.getElementById('expTitle');
    const nextLabBtn = document.getElementById('nextLabBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const aiBubble = document.getElementById('aiBubble');
    const aiMessage = document.getElementById('aiMessage');
    
    // Chat interface elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // Current state
    let currentState = 'main'; // main, experiments, detail
    let currentExperiment = null;
    let aiChat = null;
    
    // Experiment title mapping
    const experimentTitles = {
        'leeuwenhoek': {
            title: 'Leeuwenhoek Discovers Microorganisms',
            year: '1676',
            icon: '🔬',
            color: '#4CAF50'
        },
        'mendel': {
            title: 'Mendel\'s Pea Plant Experiments',
            year: '1856-1863',
            icon: '🌱',
            color: '#2196F3'
        },
        'watson-crick': {
            title: 'Watson & Crick Discover DNA Structure',
            year: '1953',
            icon: '🧬',
            color: '#9C27B0'
        }
    };
    
    // Initialize
    init();
    
    // Initialize function
    function init() {
        // Show welcome message
        setTimeout(() => {
            showWelcomeMessage();
        }, 1000);
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize AI chat
        initAIChat();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Flask button click event
        flaskBtn.addEventListener('click', () => {
            if (currentState === 'main') {
                showExperimentsPanel();
            }
        });
        
        // Back to main interface
        backToMain.addEventListener('click', () => {
            showMainInterface();
        });
        
        // Close experiment detail
        closeDetail.addEventListener('click', () => {
            closeExperimentDetail();
        });
        
        // Experiment buttons click
        document.querySelectorAll('.experiment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const experiment = btn.dataset.exp;
                showExperimentDetail(experiment);
            });
        });
        
        // Next lab button
        nextLabBtn.addEventListener('click', () => {
            // Fill in the URL for the next lab
            // window.location.href = 'https://example.com/next-lab';
            alert('Next lab URL to be configured');
        });
        
        // Chat send button
        sendBtn.addEventListener('click', sendMessage);
        
        // Enter key to send message
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Hide loading overlay when page is loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }, 1500);
        });
    }
    
    // Initialize AI chat
    function initAIChat() {
        aiChat = {
            currentExperiment: null,
            chatHistory: [],
            
            setExperiment: function(experiment) {
                this.currentExperiment = experiment;
                this.chatHistory = [];
            },
            
            addMessage: function(content, sender) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}`;
                messageDiv.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
                
                // Add timestamp
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                timeDiv.textContent = new Date().toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                messageDiv.appendChild(timeDiv);
                
                if (chatMessages) {
                    chatMessages.appendChild(messageDiv);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            },
            
            sendMessage: async function(message) {
                this.addMessage(message, 'user');
                if (sendBtn) sendBtn.disabled = true;
                
                try {
                    const response = await this.callAI(message);
                    this.addMessage(response, 'ai');
                } catch (error) {
                    console.error('AI Error:', error);
                    this.addMessage("I apologize, but I'm having trouble connecting right now. Please try again.", 'ai');
                } finally {
                    if (sendBtn) sendBtn.disabled = false;
                    if (userInput) userInput.focus();
                }
            },
            
            callAI: async function(message) {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'question',
                        experiment: this.currentExperiment,
                        message: message,
                        history: this.chatHistory.slice(-5)
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Add to history
                this.chatHistory.push({ 
                    role: 'user', 
                    content: message 
                });
                this.chatHistory.push({ 
                    role: 'assistant', 
                    content: data.content 
                });
                
                return data.content;
            },
            
            escapeHtml: function(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        };
    }
    
    // Send message
    function sendMessage() {
        if (!userInput || !aiChat) return;
        
        const message = userInput.value.trim();
        if (!message) return;
        
        userInput.value = '';
        
        if (aiChat && currentExperiment) {
            aiChat.sendMessage(message);
        } else {
            // If not in experiment detail, show prompt
            if (chatMessages) {
                const tempMsg = document.createElement('div');
                tempMsg.className = 'message ai';
                tempMsg.innerHTML = '<p>Please select an experiment first to start asking questions.</p>';
                chatMessages.appendChild(tempMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }
    
    // Show welcome message
    async function showWelcomeMessage() {
        try {
            // Try to get AI-generated welcome message
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'welcome'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    aiMessage.textContent = data.content;
                } else {
                    aiMessage.textContent = "Welcome to the Life Science Laboratory! I'm Dr. Qian Xuesen, and I'm excited to show you the wonders of life sciences. Let's explore together!";
                }
            } else {
                throw new Error('Failed to fetch welcome message');
            }
        } catch (error) {
            console.error('Error loading welcome message:', error);
            // Fallback welcome message
            aiMessage.textContent = "Welcome to the Life Science Laboratory! I'm Dr. Qian Xuesen, and I'm excited to show you the wonders of life sciences. Let's explore together!";
        }
        
        // Add subtle animation
        setTimeout(() => {
            if (aiBubble) {
                aiBubble.style.animation = 'none';
                setTimeout(() => {
                    aiBubble.style.animation = 'bubbleAppear 0.5s';
                }, 10);
            }
        }, 500);
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }
    
    // Show experiments panel (CENTERED)
    function showExperimentsPanel() {
        currentState = 'experiments';
        if (experimentsPanel) {
            experimentsPanel.style.display = 'flex';
            
            // Animation effect
            experimentsPanel.style.opacity = '0';
            setTimeout(() => {
                experimentsPanel.style.transition = 'all 0.5s ease';
                experimentsPanel.style.opacity = '1';
            }, 10);
        }
        
        // AI prompt
        setTimeout(() => {
            if (aiMessage) {
                aiMessage.textContent = "Please choose one of the three life science experiments below. Each represents a milestone discovery!";
            }
        }, 500);
    }
    
    // Show main interface
    function showMainInterface() {
        currentState = 'main';
        
        if (experimentsPanel) {
            // Animation effect
            experimentsPanel.style.transition = 'all 0.5s ease';
            experimentsPanel.style.opacity = '0';
            
            setTimeout(() => {
                experimentsPanel.style.display = 'none';
                experimentsPanel.style.opacity = '1';
            }, 500);
        }
        
        // AI back to welcome state
        setTimeout(() => {
            if (aiMessage) {
                aiMessage.textContent = "Welcome back! Click the flask to explore more experiments.";
            }
        }, 300);
    }
    
    // Show experiment detail
    function showExperimentDetail(experiment) {
        currentState = 'detail';
        currentExperiment = experiment;
        
        if (experimentsPanel) {
            experimentsPanel.style.display = 'none';
        }
        
        if (experimentDetail) {
            experimentDetail.style.display = 'flex';
        }
        
        // Set experiment title
        const expData = experimentTitles[experiment];
        if (expData && expTitle) {
            expTitle.innerHTML = `
                ${expData.icon} ${expData.title} 
                <span class="year">(${expData.year})</span>
            `;
            
            // Update theme color
            updateExperimentTheme(expData.color);
        } else if (expTitle) {
            expTitle.textContent = 'Life Science Experiment';
        }
        
        // Set current experiment
        if (aiChat) {
            aiChat.setExperiment(experiment);
        }
        
        // Load experiment introduction
        loadExperimentIntroduction(experiment);
        
        // Clear chat history
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Add welcome message
        setTimeout(() => {
            if (aiChat && experimentTitles[experiment]) {
                aiChat.addMessage(`Welcome to the ${experimentTitles[experiment].title}! What would you like to know?`, 'ai');
            }
        }, 1000);
    }
    
    // Update experiment theme color
    function updateExperimentTheme(color) {
        const chatInput = document.querySelector('.chat-input input');
        const sendBtn = document.querySelector('.chat-input button');
        const detailHeader = document.querySelector('.detail-header');
        
        if (chatInput) {
            chatInput.style.borderColor = `${color}80`;
        }
        
        if (sendBtn) {
            sendBtn.style.background = `linear-gradient(135deg, ${color}, ${darkenColor(color, 20)})`;
        }
        
        if (detailHeader) {
            detailHeader.style.background = `${color}20`;
            detailHeader.style.borderBottomColor = `${color}40`;
        }
    }
    
    // Darken color helper
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    // Close experiment detail
    function closeExperimentDetail() {
        currentState = 'experiments';
        
        if (experimentDetail) {
            // Animation effect
            experimentDetail.style.transition = 'all 0.5s ease';
            experimentDetail.style.opacity = '0';
            experimentDetail.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                experimentDetail.style.display = 'none';
                experimentDetail.style.opacity = '1';
                experimentDetail.style.transform = 'translateY(0)';
                
                // Show experiments panel
                if (experimentsPanel) {
                    experimentsPanel.style.display = 'flex';
                    experimentsPanel.style.opacity = '0';
                    
                    setTimeout(() => {
                        experimentsPanel.style.transition = 'all 0.5s ease';
                        experimentsPanel.style.opacity = '1';
                    }, 10);
                }
            }, 500);
        }
        
        // Reset theme color
        resetTheme();
        
        // Clear input field
        if (userInput) {
            userInput.value = '';
        }
        
        // Reset experiment state
        currentExperiment = null;
        
        // AI prompt
        setTimeout(() => {
            if (aiMessage) {
                aiMessage.textContent = "Which experiment would you like to explore next?";
            }
        }, 300);
    }
    
    // Reset theme color
    function resetTheme() {
        const chatInput = document.querySelector('.chat-input input');
        const sendBtn = document.querySelector('.chat-input button');
        
        if (chatInput) {
            chatInput.style.borderColor = '';
        }
        
        if (sendBtn) {
            sendBtn.style.background = '';
        }
    }
    
    // Load experiment introduction
    async function loadExperimentIntroduction(experiment) {
        if (!expContent) return;
        
        expContent.innerHTML = `
            <div class="experiment-loading">
                <div class="loading-icon">${experimentTitles[experiment]?.icon || '🔬'}</div>
                <div class="loading-text">
                    <h3>Loading ${experimentTitles[experiment]?.title || 'Experiment'}...</h3>
                    <p>Preparing the demonstration</p>
                </div>
            </div>
        `;
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'introduction',
                    experiment: experiment
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(`API error: ${data.error}`);
            }
            
            // Show AI introduction
            expContent.innerHTML = `
                <div class="experiment-header">
                    <h3>${experimentTitles[experiment]?.title || 'Experiment'} 
                        <span class="year">${experimentTitles[experiment]?.year || ''}</span>
                    </h3>
                    <p class="concept">A Milestone in Life Science</p>
                </div>
                
                <div class="experiment-body">
                    <div class="experiment-description">
                        <h4><span>📖</span> Introduction by Dr. Qian</h4>
                        <div class="intro-content">
                            ${formatAIResponse(data.content)}
                        </div>
                    </div>
                    
                    <div class="quick-facts">
                        <h4><span>⚡</span> Quick Facts</h4>
                        <ul>
                            <li>Select an experiment to see specific facts</li>
                            <li>Ask Dr. Qian for more details</li>
                            <li>Explore interactive demonstrations</li>
                        </ul>
                    </div>
                    
                    <div class="interactive-hint">
                        <p>💡 <em>You can now ask Dr. Qian any questions about this experiment!</em></p>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading introduction:', error);
            
            // Show fallback content
            expContent.innerHTML = `
                <div class="experiment-header">
                    <h3>${experimentTitles[experiment]?.title || 'Experiment'}</h3>
                    <p class="concept">A Fascinating Discovery</p>
                </div>
                
                <div class="experiment-description">
                    <h4><span>📖</span> Introduction</h4>
                    <div class="intro-content">
                        <p>This experiment represents a groundbreaking moment in the history of life sciences.</p>
                        <p>As Dr. Qian Xuesen, I'm excited to share with you how curiosity and careful observation led to this important discovery.</p>
                        <p>Feel free to ask me any questions about the methods, findings, or significance of this work!</p>
                    </div>
                </div>
            `;
        }
    }
    
    // Format AI response
    function formatAIResponse(text) {
        if (!text) return '';
        
        // Convert Markdown-style line breaks to HTML paragraphs
        const paragraphs = text.split('\n\n');
        return paragraphs.map(p => {
            if (p.trim()) {
                return `<p>${p.trim()}</p>`;
            }
            return '';
        }).join('');
    }
    
    // Export function for microscope interaction
    window.adjustMicroscope = function(value) {
        const magLevel = document.getElementById('magLevel');
        const waterSample = document.getElementById('waterSample');
        
        if (magLevel) {
            magLevel.textContent = `${value}x`;
        }
        
        if (waterSample) {
            if (value >= 200) {
                waterSample.innerHTML = '🦠 Microorganisms visible!';
                waterSample.style.color = '#4CAF50';
            } else {
                waterSample.innerHTML = '💧 Water Sample';
                waterSample.style.color = '#2196F3';
            }
        }
    };
    
    // Debug info
    console.log('Life Science Laboratory initialized successfully');
});
