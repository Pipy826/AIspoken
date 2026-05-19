// ===== 口语教练页面 =====

let speakState = {
    scene: 'free',
    isRecording: false,
    messages: [],
    sessionScore: { ...AppData.speakScores },
};

function renderSpeak() {
    const scenes = AppData.speakScenes;
    speakState.messages = [...AppData.chatHistory];

    document.getElementById('page-speak').innerHTML = `
        <!-- 顶部 -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <h2 style="font-size:20px;font-weight:800;">口语练习</h2>
            <div style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.85);padding:6px 12px;border-radius:20px;border:1.5px solid var(--primary-light);">
                <span style="width:8px;height:8px;border-radius:50%;background:#4caf50;animation:pulse-ring 1.5s ease-out infinite;display:inline-block;"></span>
                <span style="font-size:12px;color:var(--primary-dark);font-weight:600;">AI 教练在线</span>
            </div>
        </div>

        <!-- 场景选择 -->
        <div class="scene-tabs" style="margin-bottom:14px;" id="scene-tabs">
            ${scenes.map(s => `
                <button class="scene-tab ${s.id === speakState.scene ? 'active' : ''}"
                    onclick="selectScene('${s.id}', this)">
                    ${s.icon} ${s.label}
                </button>
            `).join('')}
        </div>

        <!-- AI 角色卡 -->
        <div class="card card-p-sm" style="margin-bottom:14px;display:flex;align-items:center;gap:12px;">
            <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--primary-light),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 12px rgba(125,185,168,0.3);flex-shrink:0;" class="animate-float">🐟</div>
            <div style="flex:1;">
                <h3 style="font-weight:800;font-size:14px;margin-bottom:2px;">AI 口语伙伴 · 小鱼</h3>
                <p style="font-size:11px;color:var(--text-secondary);">难度：中级 · 场景：${scenes.find(s=>s.id===speakState.scene)?.label || '自由对话'}</p>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="openScorePanel()">查看评分</button>
        </div>

        <!-- 对话区域 -->
        <div id="chat-area" style="margin-bottom:100px;display:flex;flex-direction:column;gap:14px;">
            ${renderChatMessages(speakState.messages)}
        </div>

        <!-- 底部输入区 -->
        <div style="position:fixed;bottom:calc(var(--tab-height) + 12px);left:50%;transform:translateX(-50%);width:100%;max-width:430px;padding:0 16px;z-index:50;">
            <div style="background:rgba(255,255,255,0.95);border-radius:24px;padding:12px 16px;box-shadow:0 4px 24px rgba(125,185,168,0.2);border:1.5px solid var(--border-light);display:flex;align-items:center;gap:10px;">
                <!-- 文字输入 -->
                <input type="text" id="speak-input" placeholder="输入文字或按麦克风说话..."
                    style="flex:1;border:none;outline:none;font-size:13px;background:transparent;color:var(--text-main);"
                    onkeydown="if(event.key==='Enter')sendTextMessage()"
                    onfocus="this.placeholder=''"
                    onblur="this.placeholder='输入文字或按麦克风说话...'">
                <!-- 发送按钮 -->
                <button onclick="sendTextMessage()" style="width:32px;height:32px;border-radius:50%;background:var(--primary);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;">
                    <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
                </button>
                <!-- 语音按钮 -->
                <div class="voice-btn-wrap" style="flex-shrink:0;">
                    <div class="pulse-ring" id="voice-pulse" style="display:none;"></div>
                    <button class="voice-btn" id="voice-btn" onclick="toggleVoice()" style="width:44px;height:44px;font-size:20px;border-width:3px;">
                        <span id="voice-icon">🎙️</span>
                    </button>
                </div>
            </div>
            <p style="text-align:center;font-size:11px;color:var(--text-secondary);margin-top:6px;" id="voice-hint">点击麦克风开始说话</p>
        </div>
    `;
}

function renderChatMessages(messages) {
    return messages.map(msg => {
        if (msg.role === 'ai') {
            return `
                <div style="display:flex;gap:10px;align-items:flex-start;">
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--primary-light),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:2px;">🐟</div>
                    <div>
                        <div class="chat-bubble-ai">
                            <p style="font-size:13px;line-height:1.7;color:var(--text-main);">${msg.text}</p>
                            ${msg.tip ? `
                                <div style="margin-top:10px;padding:8px 10px;background:#e8f5e9;border-radius:12px;">
                                    <p style="font-size:11px;color:var(--primary-dark);font-weight:700;margin-bottom:2px;">${msg.tip.label}</p>
                                    <p style="font-size:12px;color:var(--text-main);">${msg.tip.content}</p>
                                </div>
                            ` : ''}
                            <span class="chat-time">${msg.time}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div style="display:flex;gap:10px;align-items:flex-start;justify-content:flex-end;">
                    <div>
                        <div class="chat-bubble-user">
                            <p style="font-size:13px;line-height:1.7;">${msg.text}</p>
                            <span class="chat-time" style="text-align:right;">${msg.time}</span>
                        </div>
                    </div>
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#ffcc80,#ff8a65);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;margin-top:2px;">😊</div>
                </div>
            `;
        }
    }).join('');
}

function selectScene(sceneId, el) {
    speakState.scene = sceneId;
    document.querySelectorAll('.scene-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const scene = AppData.speakScenes.find(s => s.id === sceneId);
    showToast(`已切换到：${scene?.label}`);

    // 更新角色卡场景文字
    const roleDesc = document.querySelector('#page-speak .card p');
    if (roleDesc) roleDesc.textContent = `难度：中级 · 场景：${scene?.label}`;

    // 添加场景切换消息
    addAIMessage(`好的！我们现在切换到「${scene?.label}」场景。${getSceneGreeting(sceneId)}`);
}

function getSceneGreeting(sceneId) {
    const greetings = {
        free: "随便聊聊吧，有什么想说的？",
        interview: "Let's practice for your job interview! Tell me about yourself.",
        ielts: "Welcome to IELTS Speaking Practice! Let's start with Part 1. Can you tell me about your hometown?",
        travel: "Imagine you're at the airport. How can I help you today?",
        business: "Good morning! Shall we discuss the terms of our partnership?",
        campus: "Hey! How's campus life treating you lately?",
    };
    return greetings[sceneId] || '';
}

function sendTextMessage() {
    const input = document.getElementById('speak-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    const time = formatTime(new Date());

    // 添加用户消息
    const userMsg = { role: 'user', text, time, corrections: [] };
    speakState.messages.push(userMsg);
    appendMessage(userMsg);

    // 模拟 AI 回复
    setTimeout(() => {
        const aiReply = generateAIReply(text);
        speakState.messages.push(aiReply);
        appendMessage(aiReply);
        scrollChatToBottom();
    }, 800);

    scrollChatToBottom();
}

function appendMessage(msg) {
    const chatArea = document.getElementById('chat-area');
    if (!chatArea) return;
    const div = document.createElement('div');
    div.innerHTML = renderChatMessages([msg]);
    chatArea.appendChild(div.firstElementChild);
}

function scrollChatToBottom() {
    const page = document.getElementById('page-speak');
    if (page) setTimeout(() => page.scrollTo({ top: page.scrollHeight, behavior: 'smooth' }), 100);
}

function generateAIReply(userText) {
    const time = formatTime(new Date());
    const replies = [
        {
            text: "That's a great point! 👍 Your sentence structure is clear. One small suggestion: instead of saying <span class='highlight-error'>\"I think\"</span>, try using <span class='highlight-good'>\"In my opinion\"</span> or <span class='highlight-good'>\"From my perspective\"</span> for a more academic tone.",
            tip: { label: '💡 学术表达', content: '"In my view / From my perspective / It seems to me that..."' }
        },
        {
            text: "Excellent! 🌟 You're expressing yourself very naturally. I noticed you used <span class='highlight-good'>\"furthermore\"</span> — that's a great linking word! Can you elaborate more on that point?",
            tip: null
        },
        {
            text: "Good effort! Let me help you with a more natural phrasing. Instead of <span class='highlight-error'>\"very good\"</span>, native speakers often say <span class='highlight-good'>\"excellent\"</span>, <span class='highlight-good'>\"outstanding\"</span>, or <span class='highlight-good'>\"remarkable\"</span>.",
            tip: { label: '📚 词汇升级', content: 'good → excellent / outstanding / remarkable / superb' }
        },
        {
            text: "I love your enthusiasm! 😊 Your pronunciation is improving. Just a quick note: the word <span class='highlight-error'>\"comfortable\"</span> is often mispronounced. It's <span class='highlight-good'>/ˈkʌmftəbl/</span> — notice the silent syllable!",
            tip: { label: '🔊 发音提示', content: 'comfortable = /ˈkʌmf-tə-bl/ (3 syllables, not 4)' }
        },
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    return { role: 'ai', text: reply.text, time, tip: reply.tip, corrections: [] };
}

let isRecording = false;
function toggleVoice() {
    isRecording = !isRecording;
    const btn = document.getElementById('voice-btn');
    const icon = document.getElementById('voice-icon');
    const hint = document.getElementById('voice-hint');
    const pulse = document.getElementById('voice-pulse');

    if (isRecording) {
        btn.classList.add('recording');
        icon.textContent = '⏹️';
        hint.textContent = '正在聆听... 点击停止';
        hint.style.color = 'var(--accent-coral)';
        if (pulse) pulse.style.display = 'block';
        showToast('🎙️ 开始录音...');

        // 模拟录音 3 秒后自动停止
        setTimeout(() => {
            if (isRecording) {
                isRecording = false;
                btn.classList.remove('recording');
                icon.textContent = '🎙️';
                hint.textContent = '点击麦克风开始说话';
                hint.style.color = 'var(--text-secondary)';
                if (pulse) pulse.style.display = 'none';

                // 模拟识别结果
                const sampleTexts = [
                    "I believe that education is the key to success in modern society.",
                    "In my opinion, technology has both positive and negative impacts on our lives.",
                    "I think the most important thing is to keep practicing every day.",
                ];
                const recognized = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
                const input = document.getElementById('speak-input');
                if (input) {
                    input.value = recognized;
                    sendTextMessage();
                }
            }
        }, 3000);
    } else {
        btn.classList.remove('recording');
        icon.textContent = '🎙️';
        hint.textContent = '点击麦克风开始说话';
        hint.style.color = 'var(--text-secondary)';
        if (pulse) pulse.style.display = 'none';
    }
}

function addAIMessage(text) {
    const time = formatTime(new Date());
    const msg = { role: 'ai', text, time, corrections: [] };
    speakState.messages.push(msg);
    const chatArea = document.getElementById('chat-area');
    if (chatArea) {
        const div = document.createElement('div');
        div.innerHTML = renderChatMessages([msg]);
        chatArea.appendChild(div.firstElementChild);
        scrollChatToBottom();
    }
}

function openScorePanel() {
    const s = speakState.sessionScore;
    openModal(`
        <div style="padding-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="font-size:18px;font-weight:800;">实时评分</h3>
                <span style="font-size:13px;color:var(--text-secondary);">综合 ${s.overall}</span>
            </div>
            <div class="score-dim-grid">
                ${[
                    { label: '发音', score: s.pronunciation, color: '#7db9a8' },
                    { label: '语法', score: s.grammar, color: '#64b5f6' },
                    { label: '词汇', score: s.vocabulary, color: '#f4d03f' },
                    { label: '流利度', score: s.fluency, color: '#ba68c8' },
                ].map(d => `
                    <div class="score-dim-item">
                        <div class="dim-label">${d.label}</div>
                        <div class="dim-score" style="color:${d.color};">${d.score}</div>
                        <div class="progress-bar" style="margin-top:6px;">
                            <div class="progress-fill progress-green" style="width:${d.score * 10}%;background:${d.color};"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:16px;padding:14px;background:#f0f7f4;border-radius:16px;">
                <p style="font-size:12px;color:var(--text-secondary);line-height:1.7;">
                    💡 <strong>提升建议：</strong>你的发音表现优秀！语法方面建议多练习复杂句式，词汇可以尝试使用更多学术词汇替换日常用词。
                </p>
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="closeModal()">继续练习</button>
        </div>
    `);
}
