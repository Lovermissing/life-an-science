// experiments.js - 实验详细逻辑控制器
class ExperimentsController {
    constructor() {
        this.currentExperiment = null;
        this.experimentData = {
            'leeuwenhoek': {
                title: 'Leeuwenhoek Discovers Microorganisms',
                year: '1676',
                keyConcept: 'First observation of microorganisms',
                icon: '🔬',
                color: '#4CAF50',
                quickFacts: [
                    'Used homemade microscopes with 300x magnification',
                    'Called microorganisms "animalcules"',
                    'Discovered bacteria, yeast, and blood cells',
                    'Kept his methods secret for 50 years'
                ]
            },
            'mendel': {
                title: 'Mendel\'s Pea Plant Experiments',
                year: '1856-1863',
                keyConcept: 'Foundations of genetics',
                icon: '🌱',
                color: '#2196F3',
                quickFacts: [
                    'Studied 28,000 pea plants over 8 years',
                    'Discovered dominant and recessive traits',
                    'Work remained unrecognized for 35 years',
                    'A monk with a passion for science'
                ]
            },
            'watson-crick': {
                title: 'DNA Double Helix Discovery',
                year: '1953',
                keyConcept: 'Structure of DNA',
                icon: '🧬',
                color: '#9C27B0',
                quickFacts: [
                    'Published in Nature journal, only 900 words',
                    'Relied on Rosalind Franklin\'s X-ray data',
                    'Won Nobel Prize in 1962',
                    'Called "the secret of life" by Crick'
                ]
            }
        };
        
        this.initExperimentLogic();
    }
    
    initExperimentLogic() {
        // 当实验详情面板打开时
        document.addEventListener('experimentOpened', (e) => {
            this.onExperimentOpened(e.detail);
        });
        
        // 当返回按钮点击时
        document.addEventListener('experimentClosed', () => {
            this.onExperimentClosed();
        });
    }
    
    onExperimentOpened(experimentId) {
        this.currentExperiment = experimentId;
        this.updateExperimentUI();
        this.showExperimentAnimation();
        
        // 初始化AI聊天控制器
        if (window.aiChat) {
            window.aiChat.setExperiment(experimentId);
        }
    }
    
    onExperimentClosed() {
        this.currentExperiment = null;
        this.cleanupExperiment();
    }
    
    updateExperimentUI() {
        const data = this.experimentData[this.currentExperiment];
        if (!data) return;
        
        // 更新页面标题
        const expTitle = document.getElementById('expTitle');
        if (expTitle) {
            expTitle.innerHTML = `${data.icon} ${data.title} <span class="year">(${data.year})</span>`;
        }
        
        // 更新聊天界面的样式
        this.updateChatTheme(data.color);
    }
    
    updateChatTheme(color) {
        const chatInput = document.querySelector('.chat-input input');
        const sendBtn = document.querySelector('.chat-input button');
        const detailHeader = document.querySelector('.detail-header');
        
        if (chatInput) {
            chatInput.style.borderColor = `${color}80`;
        }
        
        if (sendBtn) {
            sendBtn.style.background = `linear-gradient(135deg, ${color}, ${this.darkenColor(color, 20)})`;
        }
        
        if (detailHeader) {
            detailHeader.style.background = `${color}20`;
            detailHeader.style.borderBottomColor = `${color}40`;
        }
    }
    
    darkenColor(color, percent) {
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
    
    showExperimentAnimation() {
        const expContent = document.getElementById('expContent');
        if (!expContent) return;
        
        const data = this.experimentData[this.currentExperiment];
        
        // 添加加载动画
        expContent.innerHTML = `
            <div class="experiment-loading">
                <div class="loading-icon">${data.icon}</div>
                <div class="loading-text">
                    <h3>Loading ${data.title}...</h3>
                    <p>Preparing the ${data.keyConcept.toLowerCase()} demonstration</p>
                </div>
            </div>
        `;
        
        // 3秒后显示内容
        setTimeout(() => {
            this.displayExperimentContent();
        }, 2000);
    }
    
    displayExperimentContent() {
        const expContent = document.getElementById('expContent');
        const data = this.experimentData[this.currentExperiment];
        
        if (!expContent || !data) return;
        
        expContent.innerHTML = `
            <div class="experiment-header">
                <h3>${data.title} <span class="year">${data.year}</span></h3>
                <p class="concept">${data.keyConcept}</p>
            </div>
            
            <div class="experiment-body">
                <div class="quick-facts">
                    <h4><span>⚡</span> Quick Facts</h4>
                    <ul>
                        ${data.quickFacts.map(fact => `<li>${fact}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="experiment-description">
                    <h4><span>📖</span> About This Experiment</h4>
                    <div class="description-placeholder">
                        <div class="typing-animation">
                            <span></span><span></span><span></span>
                        </div>
                        <p>Dr. Qian is preparing the introduction...</p>
                    </div>
                </div>
                
                <div class="interactive-hint">
                    <p>💡 <em>You can now ask Dr. Qian any questions about this experiment!</em></p>
                </div>
            </div>
        `;
        
        // 模拟AI正在输入的效果
        this.simulateTyping();
    }
    
    simulateTyping() {
        const typingElement = document.querySelector('.typing-animation');
        if (!typingElement) return;
        
        let dots = 0;
        const typingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            typingElement.innerHTML = '<span>.</span>'.repeat(dots);
        }, 500);
        
        // 5秒后清除动画
        setTimeout(() => {
            clearInterval(typingInterval);
            if (typingElement) {
                typingElement.style.opacity = '0';
            }
        }, 5000);
    }
    
    cleanupExperiment() {
        // 重置聊天输入框
        const userInput = document.getElementById('userInput');
        const chatMessages = document.getElementById('chatMessages');
        
        if (userInput) {
            userInput.value = '';
        }
        
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // 重置主题颜色
        this.resetTheme();
    }
    
    resetTheme() {
        const chatInput = document.querySelector('.chat-input input');
        const sendBtn = document.querySelector('.chat-input button');
        
        if (chatInput) {
            chatInput.style.borderColor = '';
        }
        
        if (sendBtn) {
            sendBtn.style.background = '';
        }
    }
    
    // 实验特定的交互功能
    setupExperimentInteractions() {
        switch(this.currentExperiment) {
            case 'leeuwenhoek':
                this.setupMicroscopeInteraction();
                break;
            case 'mendel':
                this.setupPeaExperimentInteraction();
                break;
            case 'watson-crick':
                this.setupDNAInteraction();
                break;
        }
    }
    
    setupMicroscopeInteraction() {
        // 显微镜交互逻辑
        const expContent = document.getElementById('expContent');
        if (!expContent) return;
        
        setTimeout(() => {
            const descriptionDiv = expContent.querySelector('.experiment-description');
            if (descriptionDiv) {
                descriptionDiv.innerHTML += `
                    <div class="microscope-interactive">
                        <div class="microscope-view">
                            <div class="specimen" id="waterSample">💧 Water Sample</div>
                            <div class="magnification">Magnification: <span id="magLevel">100x</span></div>
                        </div>
                        <div class="controls">
                            <button onclick="adjustMicroscope(50)">-</button>
                            <input type="range" min="50" max="300" value="100" 
                                   oninput="adjustMicroscope(this.value)">
                            <button onclick="adjustMicroscope(300)">+</button>
                        </div>
                        <p class="hint">Adjust the magnification to see what Leeuwenhoek saw!</p>
                    </div>
                `;
            }
        }, 3000);
    }
    
    setupPeaExperimentInteraction() {
        // 豌豆实验交互逻辑
        const expContent = document.getElementById('expContent');
        if (!expContent) return;
        
        setTimeout(() => {
            const descriptionDiv = expContent.querySelector('.experiment-description');
            if (descriptionDiv) {
                descriptionDiv.innerHTML += `
                    <div class="pea-experiment">
                        <div class="pea-cross">
                            <div class="parent-generation">
                                <div class="plant tall">Tall</div>
                                <div class="plant short">Short</div>
                            </div>
                            <div class="cross-symbol">×</div>
                            <div class="offspring">
                                <div class="plant f1">F₁: All Tall</div>
                                <div class="plant f2">F₂: 3 Tall : 1 Short</div>
                            </div>
                        </div>
                        <p class="hint">Observe the inheritance patterns Mendel discovered!</p>
                    </div>
                `;
            }
        }, 3000);
    }
    
    setupDNAInteraction() {
        // DNA交互逻辑
        const expContent = document.getElementById('expContent');
        if (!expContent) return;
        
        setTimeout(() => {
            const descriptionDiv = expContent.querySelector('.experiment-description');
            if (descriptionDiv) {
                descriptionDiv.innerHTML += `
                    <div class="dna-model">
                        <div class="dna-strand">
                            <div class="base-pair" style="--color: #FF5252">A-T</div>
                            <div class="base-pair" style="--color: #4CAF50">T-A</div>
                            <div class="base-pair" style="--color: #2196F3">G-C</div>
                            <div class="base-pair" style="--color: #FF9800">C-G</div>
                        </div>
                        <p class="hint">The double helix structure with complementary base pairing!</p>
                    </div>
                `;
            }
        }, 3000);
    }
}

// 全局函数供HTML调用
function adjustMicroscope(value) {
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
}

// 初始化实验控制器
let experimentsController = null;
document.addEventListener('DOMContentLoaded', () => {
    experimentsController = new ExperimentsController();
    window.experimentsController = experimentsController;
    
    // 派发自定义事件
    window.dispatchExperimentOpened = (experimentId) => {
        document.dispatchEvent(new CustomEvent('experimentOpened', {
            detail: experimentId
        }));
    };
    
    window.dispatchExperimentClosed = () => {
        document.dispatchEvent(new CustomEvent('experimentClosed'));
    };
});