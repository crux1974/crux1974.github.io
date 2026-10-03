(function () {
    'use strict';

    if (window.plugin_pl_test_all_loaded) return;
    window.plugin_pl_test_all_loaded = true;

    // 1. Додаємо стилі для плашки
    var styleHtml = `
        <style id="pl-test-all-styles">
            .card__pl-test-badge {
                position: absolute !important;
                top: 6px !important;
                right: 6px !important;
                background: #dc3545 !important;
                color: #ffffff !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-size: 11px !important;
                font-weight: bold !important;
                z-index: 99 !important;
                box-shadow: 0 2px 5px rgba(0,0,0,0.8) !important;
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
                line-height: 1.2 !important;
                pointer-events: none !important;
            }
            .card__pl-test-flag {
                width: 10px;
                height: 7px;
                background: linear-gradient(to bottom, #ffffff 50%, #dc3545 50%);
                border: 1px solid rgba(0,0,0,0.3);
                border-radius: 1px;
                display: inline-block;
            }
        </style>
    `;
    $('head').append(styleHtml);

    // 2. Функція безпосереднього вставлення мітки в DOM
    function injectBadge(cardNode) {
        var $card =$(cardNode);

        // Якщо мітка вже є — пропускаємо
        if ($card.find('.card__pl-test-badge').length) return;

        // Шукаємо контейнер зображення в картці
        var target = $card.find('.card__view, .card__img, .card__cover, .img-box').first();
        if (!target.length) target = $card;

        target.css('position', 'relative');

        var badge = $(
            '<div class="card__pl-test-badge">' +
                '<span class="card__pl-test-flag"></span>' +
                '<span>PL</span>' +
            '</div>'
        );

        target.append(badge);
    }

    // 3. Метод №1: Стандартний слухач подій Lampa (каркас)
    Lampa.Listener.follow('card', function (e) {
        var node = e.node || (e.object ? e.object.node : null) || (e.card ? e.card.node : null);
        if (node) {
            injectBadge(node);
        }
    });

    // 4. Метод №2: Примусове сканування всіх існуючих карток у DOM
    function scanAndApply() {
        $('.card, .card-full, .full-start').each(function () {
            injectBadge(this);
        });
    }

    // Запускаємо сканування кожні 1.5 секунди (для гарантії при скролі)
    setInterval(scanAndApply, 1500);

    // 5. Метод №3: MutationObserver для миттєвої реакції на появу нових карток
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (node.nodeType === 1) {
                    if ($(node).hasClass('card')) {                         injectBadge(node);                     } else {$(node).find('.card').each(function () {
                            injectBadge(this);
                        });
                    }
                }
            });
        });
    });

    // Запускаємо спостереження за всім тілом сторінки
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
