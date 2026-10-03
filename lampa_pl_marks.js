(function () {
    'use strict';

    if (window.plugin_pl_marks_loaded) return;
    window.plugin_pl_marks_loaded = true;

    // Стилі для міток на постерах
    var styles = `
        .card__pl-mark {
            position: absolute;
            top: 0.4em;
            right: 0.4em;
            background: rgba(220, 53, 69, 0.9);
            color: #fff;
            padding: 0.15em 0.4em;
            border-radius: 0.3em;
            font-size: 0.7em;
            font-weight: bold;
            z-index: 5;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 3px;
            letter-spacing: 0.5px;
        }
        .card__pl-mark--sub {
            background: rgba(40, 167, 69, 0.9);
        }
        .card__pl-mark-flag {
            width: 12px;
            height: 9px;
            background: linear-gradient(to bottom, #ffffff 50%, #dc3545 50%);
            border-radius: 1px;
            display: inline-block;
            border: 1px solid rgba(0,0,0,0.2);
        }
    `;

    var styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Додавання налаштувань у меню Lampa
    Lampa.SettingsApi.addParam({
        component: 'plugins',
        param: {
            name: 'pl_marks_enable',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Мітки PL на постерах',
            description: 'Показувати плашку PL Lektor/Dubbing на картках'
        },
        onChange: function (value) {
            Lampa.Storage.set('pl_marks_enable', value);
        }
    });

    // Список мовних кодів та країнознавчих тегів Польщі
    var POLISH_ISO_CODES = ['pl', 'pol', 'polski', 'pl-pl'];
    var POLISH_COUNTRIES = ['PL', 'Poland', 'Polska'];

    // Перевірка наявності польської озвучки або субтитрів у медіаданих
    function checkPolishAudio(data) {
        if (!data) return null;

        // 1. Перевірка оригінальної мови
        if (POLISH_ISO_CODES.indexOf((data.original_language || '').toLowerCase()) !== -1) {
            return { type: 'audio', label: 'PL' };
        }

        // 2. Перевірка країни виробництва
        if (data.production_countries && Array.isArray(data.production_countries)) {
            var isPlCountry = data.production_countries.some(function (c) {
                return POLISH_COUNTRIES.indexOf(c.iso_3166_1) !== -1 || POLISH_COUNTRIES.indexOf(c.name) !== -1;
            });
            if (isPlCountry) return { type: 'audio', label: 'PL' };
        }

        // 3. Перевірка аудіодоріжок / перекладів (якщо віддаються балансером або TMDB)
        if (data.spoken_languages && Array.isArray(data.spoken_languages)) {
            var hasPlAudio = data.spoken_languages.some(function (l) {
                return POLISH_ISO_CODES.indexOf((l.iso_639_1 || '').toLowerCase()) !== -1;
            });
            if (hasPlAudio) return { type: 'audio', label: 'PL Lektor' };
        }

        // 4. Перевірка альтернативних назв чи тегів озвучки
        if (data.translations && Array.isArray(data.translations)) {
            var hasPlTranslation = data.translations.some(function (t) {
                return POLISH_ISO_CODES.indexOf((t.iso_639_1 || '').toLowerCase()) !== -1;
            });
            if (hasPlTranslation) return { type: 'audio', label: 'PL' };
        }

        return null;
    }

    // Реплікація додавання мітки на DOM-елемент картки
    function attachMark(cardElement, markInfo) {
        if (!cardElement || cardElement.find('.card__pl-mark').length) return;

        var view = cardElement.find('.card__view, .card__img, .card__cover').first();
        if (!view.length) view = cardElement;

        var markHtml = $(
            '<div class="card__pl-mark' + (markInfo.type === 'sub' ? ' card__pl-mark--sub' : '') + '">' +
                '<span class="card__pl-mark-flag"></span>' +
                '<span>' + markInfo.label + '</span>' +
            '</div>'
        );

        view.css('position', 'relative').append(markHtml);
    }

    // Підписка на малювання карток (Card Render) у Lampa 3.3.4.29
    Lampa.Listener.follow('card', function (e) {
        if (e.type === 'visible' || e.type === 'build') {
            if (!Lampa.Storage.get('pl_marks_enable', true)) return;

            var cardData = e.data || (e.object ? e.object.data : null);
            var cardNode = e.node || (e.object ? e.object.node : null);

            if (!cardData || !cardNode) return;

            var mark = checkPolishAudio(cardData);
            if (mark) {
                attachMark($(cardNode), mark);
            }
        }
    });

})();
