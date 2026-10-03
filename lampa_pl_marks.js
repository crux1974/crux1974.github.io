(function () {
    'use strict';

    if (window.plugin_pl_marks_v2_loaded) return;
    window.plugin_pl_marks_v2_loaded = true;

    // Впровадження стилів для мітки
    var styleHtml = `
        <style id="pl-marks-styles">
            .card__pl-badge {
                position: absolute !important;
                top: 6px !important;
                right: 6px !important;
                background: #dc3545 !important;
                color: #ffffff !important;
                padding: 2px 6px !important;
                border-radius: 4px !important;
                font-size: 10px !important;
                font-weight: bold !important;
                z-index: 10 !important;
                box-shadow: 0 2px 5px rgba(0,0,0,0.7) !important;
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
                line-height: 1.2 !important;
                pointer-events: none !important;
            }
            .card__pl-flag {
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

    // Функція аналізу даних фільму/серіалу
    function hasPolishAudio(data) {
        if (!data) return false;

        var title = (data.title || data.name || '').toLowerCase();
        var originalTitle = (data.original_title || data.original_name || '').toLowerCase();
        var origLang = (data.original_language || '').toLowerCase();

        // 1. Якщо фільм польського виробництва
        if (origLang === 'pl' || origLang === 'pol') return 'PL';

        // 2. Перевірка країни
        if (data.production_countries && Array.isArray(data.production_countries)) {
            var isPl = data.production_countries.some(function (c) {
                return c.iso_3166_1 === 'PL' || c.name === 'Poland';
            });
            if (isPl) return 'PL';
        }

        // 3. Перевірка ключів у назві (корисно для баз з озвучками та торентів)
        var plKeywords = ['lektor pl', 'dubbing pl', 'napisy pl', 'polski', 'pl sub', 'pl audio'];
        for (var i = 0; i < plKeywords.length; i++) {
            if (title.indexOf(plKeywords[i]) !== -1 || originalTitle.indexOf(plKeywords[i]) !== -1) {
                return 'PL';
            }
        }

        return false;
    }

    // Додавання бейджа на постер
    function applyBadge(node, label) {
        var $node =$(node);
        if ($node.find('.card__pl-badge').length) return;

        var target = $node.find('.card__view, .card__img, .card__cover, .img-box').first();
        if (!target.length) target = $node;

        target.css('position', 'relative');
        
        var badge = $(
            '<div class="card__pl-badge">' +
                '<span class="card__pl-flag"></span>' +
                '<span>' + label + '</span>' +
            '</div>'
        );

        target.append(badge);
    }

    // Слухач подій Lampa 3.3.4.29
    Lampa.Listener.follow('card', function (e) {
        if (e.type === 'build' || e.type === 'visible') {
            var data = e.card || e.data || (e.object ? e.object.data : null);
            var node = e.node || (e.object ? e.object.node : null);

            if (data && node) {
                var badgeLabel = hasPolishAudio(data);
                if (badgeLabel) {
                    applyBadge(node, badgeLabel);
                }
            }
        }
    });

})();
