// scripts/main.js - Complete final version
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
    
    // ==================== INITIALIZATION ====================
    
    // Initialize the application
    function init() {
        console.log('Initializing Life Science Laboratory...');
        
        // Show welcome message
        setTimeout(() => {
            showWelcomeMessage();
        }, 500);
        
        // Set up event listeners
        setTimeout(() => {
            setupEventListeners();
        }, 1000);
        
        // Initialize AI chat
        setTimeout(() => {
            initAIChat();
        }, 1500);
        
        // Hide loading overlay
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Flask button click
        if (flaskBtn) {
            flaskBtn.addEventListener('click', () => {
                console.log('Flask button clicked, current state:', currentState);
                if (currentState === 'main') {
                    showExperimentsPanel();
                }
            });
        }
        
        // Back to main button
        if (backToMain) {
            backToMain.addEventListener('click', () => {
                showMainInterface();
            });
        }
        
        // Close detail button
        if (closeDetail) {
            closeDetail.addEventListener('click', () => {
                closeExperimentDetail();
            });
        }
        
        // Global click handler for experiment buttons
        document.addEventListener('click', function(event) {
            const experimentBtn = event.target.closest('.experiment-btn');
            if (experimentBtn && currentState === 'experiments') {
                const experiment = experimentBtn.dataset.exp;
                console.log('Experiment button clicked:', experiment);
                if (experiment) {
                    showExperimentDetail(experiment);
                }
            }
        });
        
        // Next lab button
        if (nextLabBtn) {
            nextLabBtn.addEventListener('click', () => {
                alert('Next laboratory coming soon!');
            });
        }
        
        // Chat send button
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        // Enter key to send message
        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
        
        console.log('Event listeners set up successfully');
    }
    
    // Initialize AI chat
    function initAIChat() {
        console.log('Initializing AI chat...');
        
        aiChat = {
            currentExperiment: null,
            chatHistory: [],
            
            setExperiment: function(experiment) {
                this.currentExperiment = experiment;
                this.chatHistory = [];
                console.log('AI chat set to experiment:', experiment);
            },
            
            addMessage: function(content, sender) {
                if (!chatMessages) return;
                
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
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
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
        
        console.log('AI chat initialized successfully');
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
            if (chatMessages) {
                const tempMsg = document.createElement('div');
                tempMsg.className = 'message ai';
                tempMsg.innerHTML = '<p>Please select an experiment first to start asking questions.</p>';
                chatMessages.appendChild(tempMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }
    
    // ==================== WELCOME MESSAGE ====================
    
    // Show welcome message
    function showWelcomeMessage() {
        console.log('Showing welcome message...');
        
        if (aiMessage) {
            aiMessage.textContent = "Welcome! I'm Dr. Qian Xuesen. Click the flask to explore life science experiments!";
        }
        
        // Add animation
        setTimeout(() => {
            if (aiBubble) {
                aiBubble.style.animation = 'none';
                setTimeout(() => {
                    aiBubble.style.animation = 'bubbleAppear 0.5s';
                }, 10);
            }
        }, 500);
        
        // Show flask button
        setTimeout(() => {
            if (flaskBtn) {
                flaskBtn.style.opacity = '0';
                flaskBtn.style.display = 'block';
                setTimeout(() => {
                    flaskBtn.style.transition = 'opacity 1s ease';
                    flaskBtn.style.opacity = '1';
                }, 100);
            }
        }, 1000);
        
        console.log('Welcome message displayed');
    }
    
    // ==================== EXPERIMENTS PANEL ====================
    
    // Show experiments panel (CENTRAL)
    function showExperimentsPanel() {
        console.log('Showing experiments panel...');
        currentState = 'experiments';
        
        if (experimentsPanel) {
            experimentsPanel.style.display = 'flex';
            
            // Ensure buttons are clickable
            const experimentBtns = experimentsPanel.querySelectorAll('.experiment-btn');
            experimentBtns.forEach(btn => {
                btn.style.pointerEvents = 'auto';
                btn.style.cursor = 'pointer';
            });
            
            // Animation
            setTimeout(() => {
                experimentsPanel.style.transition = 'all 0.5s ease';
                experimentsPanel.style.opacity = '1';
            }, 10);
        }
        
        // Update AI message
        setTimeout(() => {
            if (aiMessage) {
                aiMessage.textContent = "Choose an experiment to explore!";
            }
        }, 300);
        
        console.log('Experiments panel displayed');
    }
    
    // Show main interface
    function showMainInterface() {
        console.log('Returning to main interface...');
        currentState = 'main';
        
        if (experimentsPanel) {
            experimentsPanel.style.transition = 'all 0.5s ease';
            experimentsPanel.style.opacity = '0';
            
            setTimeout(() => {
                experimentsPanel.style.display = 'none';
                experimentsPanel.style.opacity = '1';
            }, 500);
        }
        
        // Show flask button
        if (flaskBtn) {
            flaskBtn.style.display = 'block';
        }
        
        // Update AI message
        setTimeout(() => {
            if (aiMessage) {
                aiMessage.textContent = "Welcome back! Click the flask to explore more experiments.";
            }
        }, 300);
        
        console.log('Main interface displayed');
    }
    
    // ==================== EXPERIMENT DETAIL ====================
    
    // Show experiment detail
    function showExperimentDetail(experiment) {
        console.log('Showing experiment detail:', experiment);
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
        
        console.log('Experiment detail displayed');
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
        console.log('Closing experiment detail...');
        currentState = 'experiments';
        
        if (experimentDetail) {
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
        
        // Update AI message
        setTimeout(() => {
            if (aiMessage) {
                aiMessage.textContent = "Which experiment would you like to explore next?";
            }
        }, 300);
        
        console.log('Experiment detail closed');
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
        
        console.log('Loading experiment introduction:', experiment);
        
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
            
            console.log('Experiment introduction loaded successfully');
            
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
        
        const paragraphs = text.split('\n\n');
        return paragraphs.map(p => {
            if (p.trim()) {
                return `<p>${p.trim()}</p>`;
            }
            return '';
        }).join('');
    }
    
    // ==================== START APPLICATION ====================
    
    // Start the application
    init();
    
    // Debug info
    console.log('Life Science Laboratory initialized successfully');
});
