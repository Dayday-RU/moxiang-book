/**
 * 墨香书屋 - 主应用逻辑
 */

// ===== DOM 加载完成后初始化 =====
document.addEventListener('DOMContentLoaded', function () {
    initSite();
});

function initSite() {
    // 站点信息
    var footer = document.getElementById('footerText');
    if (footer) footer.textContent = novelData.site.footer;

    // 加载分类
    renderCategories();

    // 加载所有小说
    renderNovels(novelData.novels);

    // Banner 随机推荐
    renderBanner();

    // 搜索功能
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            var keyword = this.value.trim();
            if (keyword.length > 0) {
                var results = searchNovels(keyword);
                renderNovels(results);
                updateSectionTitle('🔍 搜索: "' + keyword + '"', '共 ' + results.length + ' 部');
            } else {
                renderNovels(novelData.novels);
                updateSectionTitle('📚 全部小说', '共 ' + novelData.novels.length + ' 部');
            }
        });
    }
}

// ===== 分类渲染 =====
function renderCategories() {
    var container = document.getElementById('categoryList');
    if (!container) return;

    var html = '<button class="category-btn active" onclick="filterByCategory(\'all\', this)">🏠 全部</button>';

    novelData.categories.forEach(function (cat) {
        html += '<button class="category-btn" onclick="filterByCategory(\'' + cat.id + '\', this)">' +
                cat.icon + ' ' + cat.name + '</button>';
    });

    container.innerHTML = html;
}

// ===== 分类筛选 =====
function filterByCategory(catId, btn) {
    // 更新按钮状态
    document.querySelectorAll('.category-btn').forEach(function (b) {
        b.classList.remove('active');
    });
    btn.classList.add('active');

    // 筛选小说
    var novels;
    if (catId === 'all') {
        novels = novelData.novels;
    } else {
        novels = getNovelsByCategory(catId);
    }

    renderNovels(novels);

    var name = catId === 'all' ? '全部小说' : getCategoryName(catId);
    updateSectionTitle('📚 ' + name, '共 ' + novels.length + ' 部');
}

// ===== 渲染小说网格 =====
function renderNovels(novels) {
    var grid = document.getElementById('novelGrid');
    if (!grid) return;

    if (!novels || novels.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="icon">📚</div><div class="text">暂无小说</div></div>';
        return;
    }

    var html = '';
    novels.forEach(function (novel) {
        var statusClass = novel.status === '连载中' ? 'lianzai' : 'wanjie';
        html += '<div class="novel-card fade-in" onclick="goToNovel(\'' + novel.id + '\')">' +
                    '<img class="novel-cover" src="' + novel.cover + '" alt="' + novel.title + '" loading="lazy" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22><rect fill=%22%23333%22 width=%22200%22 height=%22280%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2214%22>暂无封面</text></svg>\'">' +
                    '<div class="novel-info">' +
                        '<div class="novel-title">' + novel.title + '</div>' +
                        '<div class="novel-author">' + novel.author + '</div>' +
                        '<div class="novel-meta">' +
                            '<span class="novel-status ' + statusClass + '">' + novel.status + '</span>' +
                            '<span class="novel-rating">★ ' + novel.rating + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
    });

    grid.innerHTML = html;
    updateSectionTitle('📚 全部小说', '共 ' + novels.length + ' 部');
}

// ===== 更新标题 =====
function updateSectionTitle(title, count) {
    var titleEl = document.getElementById('sectionTitle');
    var countEl = document.getElementById('novelCount');
    if (titleEl) titleEl.textContent = title;
    if (countEl) countEl.textContent = count;
}

// ===== Banner 渲染 =====
function renderBanner() {
    var titleEl = document.getElementById('bannerTitle');
    var descEl = document.getElementById('bannerDesc');
    if (!titleEl || !descEl) return;

    // 选评分最高的作为推荐
    var top = novelData.novels.reduce(function (best, n) {
        return n.rating > best.rating ? n : best;
    });

    titleEl.textContent = top.title;
    descEl.textContent = top.description.substring(0, 50) + '...';

    // 点击Banner跳转
    var banner = document.querySelector('.banner');
    if (banner) {
        banner.style.cursor = 'pointer';
        banner.onclick = function () { goToNovel(top.id); };
    }
}

// ===== 页面跳转 =====
function goToNovel(id) {
    window.location.href = 'novel.html?id=' + id;
}

function goToReader(novelId, chapterIndex) {
    window.location.href = 'reader.html?novel=' + novelId + '&chapter=' + chapterIndex;
}

// ===== 小说详情页渲染 =====
function renderNovelDetail(novelId) {
    var container = document.getElementById('novelDetail');
    var novel = getNovel(novelId);

    if (!novel) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📖</div><div class="text">未找到该小说</div></div>';
        return;
    }

    // 更新页面标题
    document.title = novel.title + ' - 墨香书屋';

    // 页脚
    var footer = document.getElementById('footerText');
    if (footer) footer.textContent = novelData.site.footer;

    var statusClass = novel.status === '连载中' ? 'lianzai' : 'wanjie';
    var catName = getCategoryName(novel.category);

    var html =
        '<div class="detail-header fade-in">' +
            '<img class="detail-cover" src="' + novel.cover + '" alt="' + novel.title + '" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22><rect fill=%22%23333%22 width=%22200%22 height=%22280%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2214%22>暂无封面</text></svg>\'">' +
            '<div class="detail-info">' +
                '<h1 class="detail-title">' + novel.title + '</h1>' +
                '<p class="detail-author">✍ ' + novel.author + '</p>' +
                '<div class="detail-tags">' +
                    '<span class="detail-tag">' + getCategoryIcon(novel.category) + ' ' + catName + '</span>' +
                    '<span class="detail-tag novel-status ' + statusClass + '">' + novel.status + '</span>' +
                '</div>' +
                '<div class="detail-stats">' +
                    '<div class="stat-item"><div class="stat-value">' + novel.words + '</div><div class="stat-label">总字数</div></div>' +
                    '<div class="stat-item"><div class="stat-value">★ ' + novel.rating + '</div><div class="stat-label">评分</div></div>' +
                    '<div class="stat-item"><div class="stat-value">' + novel.views + '</div><div class="stat-label">人气</div></div>' +
                    '<div class="stat-item"><div class="stat-value">' + novel.chapters.length + '</div><div class="stat-label">章节</div></div>' +
                '</div>' +
                '<p class="detail-desc">' + novel.description + '</p>' +
                '<div class="btn-group">' +
                    '<button class="btn btn-primary" onclick="goToReader(\'' + novel.id + '\', 0)">▶ 开始阅读</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="chapter-list">' +
            '<h3 class="chapter-list-title">📑 章节目录（共 ' + novel.chapters.length + ' 章）</h3>';

    novel.chapters.forEach(function (ch, index) {
        html += '<div class="chapter-item" onclick="goToReader(\'' + novel.id + '\', ' + index + ')">' +
                    '<span class="chapter-num">第 ' + (index + 1) + ' 章</span>' +
                    '<span class="chapter-title">' + ch.title + '</span>' +
                    '<span class="chapter-date">→</span>' +
                '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

// ===== 搜索 =====
function searchNovels() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    var keyword = input.value.trim();
    if (!keyword) return;

    var results = searchNovels(keyword);
    renderNovels(results);
    updateSectionTitle('🔍 搜索: "' + keyword + '"', '共 ' + results.length + ' 部');

    // 高亮分类按钮
    document.querySelectorAll('.category-btn').forEach(function (b) {
        b.classList.remove('active');
    });
}

function searchAndJump() {
    var input = document.getElementById('searchInput');
    if (!input) return;
    var keyword = input.value.trim();
    if (!keyword) return;

    var results = searchNovels(keyword);
    if (results.length > 0) {
        window.location.href = 'index.html?search=' + encodeURIComponent(keyword);
    } else {
        showToast('未找到相关小说');
    }
}

// ===== 滚动到分类 =====
function scrollToCategory(catId) {
    var el = document.getElementById('categoryList');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ===== 移动端菜单 =====
function toggleMenu() {
    var nav = document.getElementById('navLinks');
    nav.classList.toggle('open');
}

// ===== Toast 通知 =====
function showToast(msg) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
    }, 2000);
}

// ===== URL 参数读取 =====
(function () {
    var params = new URLSearchParams(window.location.search);
    var search = params.get('search');
    if (search && document.getElementById('searchInput')) {
        document.getElementById('searchInput').value = search;
        var results = searchNovels(search);
        renderNovels(results);
        updateSectionTitle('🔍 搜索: "' + search + '"', '共 ' + results.length + ' 部');
    }

    // 点击其它区域关闭菜单
    document.addEventListener('click', function (e) {
        var nav = document.getElementById('navLinks');
        var toggle = document.querySelector('.menu-toggle');
        if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('open');
        }
    });
})();