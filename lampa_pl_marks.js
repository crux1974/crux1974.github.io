// ==UserScript==
// @name         Polish Audio Poster Badge
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Додає мітку "PL Voice" на постери з польською озвучкою
// @match        https://*/*
// @grant        GM_addStyle
// ==/scope==

(function() {
    'stylesheet';

    // Стилі для мітки на постері
    const css = `
        .poster-container {
            position: relative;
            display: inline-block;
        }
        .badge-pl-audio {
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: #dc2626; /* Червоний колір польського прапора */
            color: #ffffff;
            font-family: Arial, sans-serif;
            font-size: 11px;
            font-weight: bold;
            padding: 3px 7px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            z-index: 10;
            letter-spacing: 0.5px;
            border: 1px solid #ffffff;
        }
    `;

    // Додавання стилів у DOM
    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(css);
    } else {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Функція для додавання бейджа на постер
    function attachPolishBadge(posterElement, text = 'PL / Lektor') {
        if (!posterElement || posterElement.querySelector('.badge-pl-audio')) return;

        // Переконуємось, що контейнер має relative позиціонування
        posterElement.style.position = 'relative';

        const badge = document.createElement('div');
        badge.className = 'badge-pl-audio';
        badge.innerText = text;

        posterElement.appendChild(badge);
    }

    // Приклад автоматичного пошуку карточок з тегом/атрибутом польського аудіо
    function scanPosters() {
        // Замініть селектори під ваш конкретний сайт
        const items = document.querySelectorAll('.movie-item, .card, .poster');

        items.forEach(item => {
            // Перевіряємо, чи є в описі або атрибутах згадка про польську озвучку
            const hasPolishAudio = item.textContent.includes('Lektor') || 
                                   item.textContent.includes('Polski') || 
                                   item.dataset.audio === 'pl';

            if (hasPolishAudio) {
                attachPolishBadge(item, 'PL Lektor');
            }
        });
    }

    // Запуск при завантаженні та спостереження за динамічним контентом (AJAX/React)
    window.addEventListener('load', scanPosters);

    const observer = new MutationObserver(scanPosters);
    observer.observe(document.body, { childList: true, subtree: true });
})();
