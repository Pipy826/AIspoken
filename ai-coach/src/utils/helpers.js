// ===== 工具函数 =====

/**
 * 显示 Toast 提示
 */
function showToast(msg, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), duration);
}

/**
 * 打开底部模态框
 */
function openModal(html) {
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    container.innerHTML = html;
    overlay.classList.remove('hidden');
    container.classList.remove('hidden');
}

/**
 * 关闭模态框
 */
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-container').classList.add('hidden');
}

/**
 * 切换页面
 */
function switchTab(tabName, el) {
    // 清理模考计时器（防止内存泄漏）
    if (typeof examState !== 'undefined' && examState.timer) {
        clearInterval(examState.timer);
        examState.timer = null;
    }

    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // 显示目标页面
    const page = document.getElementById('page-' + tabName);
    if (page) page.classList.add('active');

    // 更新导航状态
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        const tabEl = document.querySelector(`.tab-item[data-tab="${tabName}"]`);
        if (tabEl) tabEl.classList.add('active');
    }

    // 触发页面渲染（如果尚未渲染）
    if (page && !page.dataset.rendered) {
        renderPage(tabName);
        page.dataset.rendered = 'true';
    }
}

/**
 * 跳转到非导航栏页面（如模考、专项）
 */
function goToPage(tabName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + tabName);
    if (page) {
        page.classList.add('active');
        if (!page.dataset.rendered) {
            renderPage(tabName);
            page.dataset.rendered = 'true';
        }
    }
}

/**
 * 返回上一页（简单实现：返回首页）
 */
function goBack(target = 'home') {
    switchTab(target);
}

/**
 * 格式化分数颜色
 */
function scoreColor(score) {
    if (score >= 8) return '#4caf50';
    if (score >= 7) return '#7db9a8';
    if (score >= 6) return '#f4d03f';
    return '#ff8a80';
}

/**
 * 计算环形进度 stroke-dashoffset
 * r: 半径, percent: 0-100
 */
function ringOffset(r, percent) {
    const circumference = 2 * Math.PI * r;
    return circumference * (1 - percent / 100);
}

/**
 * 渲染雷达图 SVG 多边形点
 * data: { key: value(0-100) }[]
 * cx, cy: 中心, r: 最大半径
 */
function radarPoints(values, cx, cy, r) {
    const n = values.length;
    return values.map((v, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const dist = (v / 100) * r;
        return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
    }).join(' ');
}

/**
 * 防抖
 */
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * 字数统计
 */
function countWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * 格式化时间
 */
function formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * 生成唯一 ID
 */
function uid() {
    return Math.random().toString(36).slice(2, 9);
}
