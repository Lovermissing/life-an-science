// main.js - 主逻辑控制器
document.addEventListener('DOMContentLoaded', () => {
    // 元素引用
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
    
    // 实验按钮
    const experimentBtns = document.querySelectorAll('.experiment-btn');
    
    // 聊天界面元素
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    // 当前状态
    let currentState = 'main'; // main, experiments, detail
    let currentExperiment = null;
    let aiChat = null;
    
    // 实验标题映射
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
    
    // 初始化
    init();
    
    // 初始化函数
    function init() {
        // 初始化AI欢迎语
        setTimeout(() => {
            showWelcomeMessage();
        }, 1000);
        
        // 事件监听器
        setupEventListeners();
        
        // 初始化AI聊天
        initAIChat();
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 锥形瓶点击事件
        flaskBtn.addEventListener('click', () => {
            if (currentState === 'main') {
                showExperimentsPanel();
            }
        });
        
        // 返回主界面
        backToMain.addEventListener('click', () => {
            showMainInterface();
        });
        
        // 关闭实验详情
        closeDetail.addEventListener('click', () => {
            closeExperimentDetail();
        });
        
        // 实验按钮点击
        experimentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const experiment = btn.dataset.exp;
                showExperimentDetail(experiment);
            });
        });
        
        // 下一个实验室按钮
        nextLabBtn.addEventListener('click', () => {
            // 这里填入下一个实验室的URL
            // window.location.href = 'https://example.com/next-lab';
            alert('Next lab URL to be configured');
        });
        
        // 聊天发送按钮
        sendBtn.addEventListener('click', sendMessage);
        
        // 回车键发送消息
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // 页面加载完成后隐藏加载动画
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }, 1500);
        });
    }
    
    // 初始化AI聊天
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
                
                // 添加时间戳
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
                sendBtn.disabled = true;
                
                try {
                    const response = await this.callAI(message);
                    this.addMessage(response, 'ai');
                } catch (error) {
                    console.error('AI Error:', error);
                    this.addMessage("I apologize, but I'm having trouble connecting right now. Please try again.", 'ai');
                } finally {
                    sendBtn.disabled = false;
                    userInput.focus();
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
                
                // 添加到历史记录
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
    
    // 发送消息
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        userInput.value = '';
        
        if (aiChat && currentExperiment) {
            aiChat.sendMessage(message);
        } else {
            // 如果不在实验详情中，显示提示
            const tempMsg = document.createElement('div');
            tempMsg.className = 'message ai';
            tempMsg.innerHTML = '<p>Please select an experiment first to start asking questions.</p>';
            chatMessages.appendChild(tempMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // 显示欢迎消息
    function showWelcomeMessage() {
        aiMessage.textContent = "Welcome to the Life Science Laboratory. Let me show you the beauty of life sciences!";
        
        // 添加一些微妙的动画
        setTimeout(() => {
            aiBubble.style.animation = 'none';
            setTimeout(() => {
                aiBubble.style.animation = 'bubbleAppear 0.5s';
            }, 10);
        }, 500);
    }
    
    // 显示实验面板
    function showExperimentsPanel() {
        currentState = 'experiments';
        experimentsPanel.style.display = 'block';
        
        // 动画效果
        experimentsPanel.style.opacity = '0';
        experimentsPanel.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            experimentsPanel.style.transition = 'all 0.5s ease';
            experimentsPanel.style.opacity = '1';
            experimentsPanel.style.transform = 'translateY(0)';
        }, 10);
        
        // 触发AI提示
        setTimeout(() => {
            aiMessage.textContent = "Please choose one of the three life science experiments below. Each represents a milestone discovery!";
        }, 500);
    }
    
    // 显示主界面
    function showMainInterface() {
        currentState = 'main';
        
        // 动画效果
        experimentsPanel.style.transition = 'all 0.5s ease';
        experimentsPanel.style.opacity = '0';
        experimentsPanel.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            experimentsPanel.style.display = 'none';
            experimentsPanel.style.opacity = '1';
            experimentsPanel.style.transform = 'translateY(0)';
        }, 500);
        
        // AI回到欢迎状态
        setTimeout(() => {
            aiMessage.textContent = "Welcome back! Click the flask to explore more experiments.";
        }, 300);
    }
    
    // 显示实验详情
    function showExperimentDetail(experiment) {
        currentState = 'detail';
        currentExperiment = experiment;
        
        experimentsPanel.style.display = 'none';
        experimentDetail.style.display = 'flex';
        
        // 设置实验标题
        const expData = experimentTitles[experiment];
        if (expData) {
            expTitle.innerHTML = `
                ${expData.icon} ${expData.title} 
                <span class="year">(${expData.year})</span>
            `;
            
            // 更新主题颜色
            updateExperimentTheme(expData.color);
        } else {
            expTitle.textContent = 'Life Science Experiment';
        }
        
        // 设置当前实验
        if (aiChat) {
            aiChat.setExperiment(experiment);
        }
        
        // 加载实验介绍
        loadExperimentIntroduction(experiment);
        
        // 清空聊天记录
        chatMessages.innerHTML = '';
        
        // 添加欢迎消息
        setTimeout(() => {
            if (aiChat) {
                aiChat.addMessage(`Welcome to the ${expData?.title || 'experiment'}! What would you like to know?`, 'ai');
            }
        }, 1000);
    }
    
    // 更新实验主题颜色
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
    
    // 加深颜色
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
    
    // 关闭实验详情
    function closeExperimentDetail() {
        currentState = 'experiments';
        
        // 动画效果
        experimentDetail.style.transition = 'all 0.5s ease';
        experimentDetail.style.opacity = '0';
        experimentDetail.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            experimentDetail.style.display = 'none';
            experimentDetail.style.opacity = '1';
            experimentDetail.style.transform = 'translateY(0)';
            
            // 显示实验选择面板
            experimentsPanel.style.display = 'block';
            experimentsPanel.style.opacity = '0';
            
            setTimeout(() => {
                experimentsPanel.style.transition = 'all 0.5s ease';
                experimentsPanel.style.opacity = '1';
            }, 10);
        }, 500);
        
        // 重置主题颜色
        resetTheme();
        
        // 清空输入框
        userInput.value = '';
        
        // 重置实验状态
        currentExperiment = null;
        
        // AI提示
        setTimeout(() => {
            aiMessage.textContent = "Which experiment would you like to explore next?";
        }, 300);
    }
    
    // 重置主题颜色
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
    
    // 加载实验介绍
    async function loadExperimentIntroduction(experiment) {
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
            
            const data = await response.json();
            
            // 显示实验介绍
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
            
            // 显示备用内容
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
    
    // 格式化AI响应
    function formatAIResponse(text) {
        // 将Markdown风格的换行转换为HTML段落
        const paragraphs = text.split('\n\n');
        return paragraphs.map(p => {
            if (p.trim()) {
                return `<p>${p.trim()}</p>`;
            }
            return '';
        }).join('');
    }
    
    // 导出一些函数供实验交互使用
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
    
    // 调试信息
    console.log('Life Science Laboratory initialized successfully');
});