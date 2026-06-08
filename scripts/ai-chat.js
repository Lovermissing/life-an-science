// AI聊天控制器
class AIChatController {
    constructor() {
        this.messageInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.currentExperiment = null;
        this.chatHistory = [];
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    
    setExperiment(experiment) {
        this.currentExperiment = experiment;
        this.chatHistory = [];
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // 清空输入框
        this.messageInput.value = '';
        
        // 显示用户消息
        this.addMessage(message, 'user');
        
        // 禁用发送按钮
        this.sendBtn.disabled = true;
        
        try {
            const response = await this.callAI(message);
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage("I apologize, but I'm having trouble connecting right now. Please try again.", 'ai');
        } finally {
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }
    
    async callAI(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'question',
                experiment: this.currentExperiment,
                message: message,
                history: this.chatHistory.slice(-5) // 只发送最近5条历史
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 添加到历史记录
        this.chatHistory.push({ role: 'user', content: message });
        this.chatHistory.push({ role: 'assistant', content: data.content });
        
        return data.content;
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // 添加时间戳
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.appendChild(timeDiv);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化AI聊天
let aiChat = null;
document.addEventListener('DOMContentLoaded', () => {
    aiChat = new AIChatController();
});