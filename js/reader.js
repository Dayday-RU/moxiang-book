/**
 * 墨香书屋 - 阅读器逻辑
 */

// ===== 阅读器状态 =====
var readerState = {
    novelId: null,
    novel: null,
    currentChapter: 0,
    fontSize: 18,
    theme: 'default'
};

// ===== 初始化阅读器 =====
document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    readerState.novelId = params.get('novel');
    readerState.currentChapter = parseInt(params.get('chapter')) || 0;
    readerState.novel = getNovel(readerState.novelId);

    if (!readerState.novel) {
        document.getElementById('readerContent').innerHTML =
            '<div class="empty-state"><div class="icon">📖</div><div class="text">未找到该小说</div></div>';
        return;
    }

    // 加载阅读器设置
    loadSettings();

    // 渲染章节
    renderChapter();

    // 绑定事件
    bindReaderEvents();
});

// ===== 渲染章节 =====
function renderChapter() {
    var novel = readerState.novel;
    var chapterIndex = readerState.currentChapter;

    if (!novel || chapterIndex < 0 || chapterIndex >= novel.chapters.length) {
        showReaderToast('没有更多章节了');
        return;
    }

    var chapter = novel.chapters[chapterIndex];

    // 更新标题
    document.title = chapter.title + ' - ' + novel.title + ' - 墨香书屋';

    // 更新导航书名
    var navTitle = document.getElementById('readerNavTitle');
    if (navTitle) navTitle.textContent = novel.title + ' - ' + chapter.title;

    // 更新章节标题
    var titleEl = document.getElementById('readerChapterTitle');
    if (titleEl) titleEl.textContent = chapter.title;

    // 更新正文
    var textEl = document.getElementById('readerText');
    if (textEl) {
        // 按换行分段，每段首行缩进
        var paragraphs = chapter.content.split('\n');
        var html = '';
        paragraphs.forEach(function (p) {
            var trimmed = p.trim();
            if (trimmed) {
                html += '<p>' + trimmed + '</p>';
            } else {
                html += '<br>';
            }
        });
        textEl.innerHTML = html;
    }

    // 更新按钮状态
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
        prevBtn.disabled = chapterIndex <= 0;
        prevBtn.style.opacity = chapterIndex <= 0 ? '0.4' : '1';
    }
    if (nextBtn) {
        nextBtn.disabled = chapterIndex >= novel.chapters.length - 1;
        nextBtn.style.opacity = chapterIndex >= novel.chapters.length - 1 ? '0.4' : '1';
    }

    // 更新返回链接
    var backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.href = 'novel.html?id=' + novel.id;
    }

    // 恢复滚动位置
    restoreScrollPosition();

    // 滚动到顶部
    window.scrollTo(0, 0);
}

// ===== 绑定事件 =====
function bindReaderEvents() {
    // 上一章
    var prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            if (readerState.currentChapter > 0) {
                readerState.currentChapter--;
                renderChapter();
                saveProgress();
            }
        });
    }

    // 下一章
    var nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            if (readerState.currentChapter < readerState.novel.chapters.length - 1) {
                readerState.currentChapter++;
                renderChapter();
                saveProgress();
            }
        });
    }

    // 键盘快捷键
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
            if (prevBtn && !prevBtn.disabled) prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            if (nextBtn && !nextBtn.disabled) nextBtn.click();
        }
    });

    // 字体增大
    document.getElementById('fontInc').addEventListener('click', function () {
        if (readerState.fontSize < 32) {
            readerState.fontSize += 2;
            applyFontSize();
            saveSettings();
        }
    });

    // 字体减小
    document.getElementById('fontDec').addEventListener('click', function () {
        if (readerState.fontSize > 12) {
            readerState.fontSize -= 2;
            applyFontSize();
            saveSettings();
        }
    });

    // 记住位置
    document.getElementById('scrollSaveBtn').addEventListener('click', function () {
        saveScrollPosition();
        showReaderToast('📍 阅读位置已保存');
    });
}

// ===== 字体大小 =====
function applyFontSize() {
    var textEl = document.getElementById('readerText');
    var display = document.getElementById('fontSizeDisplay');
    if (textEl) textEl.style.fontSize = readerState.fontSize + 'px';
    if (display) display.textContent = readerState.fontSize;
}

// ===== 主题切换 =====
function setTheme(theme) {
    readerState.theme = theme;
    document.body.className = theme !== 'default' ? 'theme-' + theme : '';
    saveSettings();
}

// ===== 阅读进度保存 =====
function saveProgress() {
    try {
        var progress = JSON.parse(localStorage.getItem('readerProgress') || '{}');
        progress[readerState.novelId] = readerState.currentChapter;
        localStorage.setItem('readerProgress', JSON.stringify(progress));
    } catch (e) {}
}

// ===== 滚动位置 =====
function saveScrollPosition() {
    try {
        var scrollPos = JSON.parse(localStorage.getItem('readerScroll') || '{}');
        var key = readerState.novelId + '_' + readerState.currentChapter;
        scrollPos[key] = window.scrollY;
        localStorage.setItem('readerScroll', JSON.stringify(scrollPos));
    } catch (e) {}
}

function restoreScrollPosition() {
    try {
        var scrollPos = JSON.parse(localStorage.getItem('readerScroll') || '{}');
        var key = readerState.novelId + '_' + readerState.currentChapter;
        var pos = scrollPos[key];
        if (pos) {
            setTimeout(function () { window.scrollTo(0, pos); }, 100);
        }
    } catch (e) {}
}

// ===== 设置持久化 =====
function saveSettings() {
    try {
        localStorage.setItem('readerSettings', JSON.stringify({
            fontSize: readerState.fontSize,
            theme: readerState.theme
        }));
    } catch (e) {}
}

function loadSettings() {
    try {
        var settings = JSON.parse(localStorage.getItem('readerSettings') || '{}');
        if (settings.fontSize) readerState.fontSize = settings.fontSize;
        if (settings.theme) readerState.theme = settings.theme;

        applyFontSize();
        setTheme(readerState.theme);
    } catch (e) {}
}

// ===== 阅读器 Toast =====
function showReaderToast(msg) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
    }, 1500);
}