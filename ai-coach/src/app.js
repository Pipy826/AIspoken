// ===== 应用入口 =====

/**
 * 页面渲染分发
 */
function renderPage(tabName) {
    switch (tabName) {
        case 'home':    renderHome();    break;
        case 'speak':   renderSpeak();   break;
        case 'write':   renderWrite();   break;
        case 'report':  renderReport();  break;
        case 'profile': renderProfile(); break;
        case 'exam':    renderExam();    break;
        case 'improve': renderImprove(); break;
    }
}

/**
 * 应用初始化
 */
function initApp() {
    // 渲染首页
    renderPage('home');
    document.getElementById('page-home').dataset.rendered = 'true';

    // 进度条动画延迟触发：先设置 transition，再更新 dashoffset 触发动画
    setTimeout(() => {
        const ring = document.getElementById('home-progress-ring');
        if (ring) {
            const r = 52;
            const circumference = 2 * Math.PI * r;
            const u = AppData.user;
            const progress = Math.round((u.todayGoal.done / u.todayGoal.total) * 100);
            const targetOffset = circumference * (1 - progress / 100);
            // 先设置为满圆（无进度），再动画到目标值
            ring.style.strokeDashoffset = circumference.toFixed(2);
            ring.style.transition = 'none';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ring.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                    ring.style.strokeDashoffset = targetOffset.toFixed(2);
                });
            });
        }
    }, 300);

    // 监听键盘弹出（移动端适配）
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            const tabBar = document.getElementById('tab-bar');
            if (tabBar) {
                const keyboardHeight = window.innerHeight - window.visualViewport.height;
                if (keyboardHeight > 100) {
                    tabBar.style.display = 'none';
                } else {
                    tabBar.style.display = 'flex';
                }
            }
        });
    }

    // 防止页面滚动穿透
    document.getElementById('modal-overlay')?.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
