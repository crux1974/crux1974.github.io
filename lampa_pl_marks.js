(function () {
    'use me strict';

    function addPolishBadge() {
        // Слухаємо подію рендерингу картки в Lampa
        Lampa.Listener.follow('card', function (e) {
            if (e.type == 'build') {
                var card = e.object;
                var data = e.data;

                // Перевірка на наявність польської озвучки у метаданих
                var hasPolish = false;

                if (data.spoken_languages) {
                    hasPolish = data.spoken_languages.some(function (lang) {
                        return lang.iso_639_1 === 'pl';
                    });
                }

                // Додаткова перевірка за назвою або тегами (якщо джерело передає info)
                if (!hasPolish && data.translation) {
                    var translation = data.translation.toLowerCase();
                    if (translation.indexOf('pl') !== -1 || translation.indexOf('lektor') !== -1 || translation.indexOf('polish') !== -1) {
                        hasPolish = true;
                    }
                }

                // Додавання мітки на постер
                if (hasPolish) {
                    var badge = $('<div class="card__quality pl-badge" style="background: #dc3545; color: #fff; font-weight: bold;">PL</div>');
                    $(card.node).find('.card__view').append(badge);
                }
            }
        });
    }

    if (window.appready) {
        addPolishBadge();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addPolishBadge();
        });
    }
})();
