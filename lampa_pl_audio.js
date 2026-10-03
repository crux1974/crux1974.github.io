(function () {
    'use strict';

    if (window.plugin_pl_audio_loaded) return;
    window.plugin_pl_audio_loaded = true;

    // Налаштування плагіна Lampa
    Lampa.SettingsApi.addParam({
        component: 'plugins',
        param: {
            name: 'pl_audio_source',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Польська озвучка (Polski Lektor/Dubbing)',
            description: 'Пошук польського аудіо та субтитрів'
        },
        onChange: function (value) {
            Lampa.Storage.set('pl_audio_source', value);
        }
    });

    // Модуль пошуку потоків з польським лектором/дубляжем
    function PolishAudioProvider(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var files = new Lampa.Files();
        var filter = new Lampa.Filter(object);
        var results = [];

        this.search = function (title, year, season, episode) {
            var query = encodeURIComponent(title);
            var searchUrl = 'https://cda.pl/info/' + query; // Приклад запиту до польської бази/CDA

            network.silent(searchUrl, function (json) {
                // Парсинг та створення переліку варіантів озвучки
                results = [
                    {
                        title: title + ' (Lektor PL)',
                        quality: '1080p',
                        translation: 'Polski Lektor',
                        url: 'https://example-pl-stream.com/video_lektor.mp4'
                    },
                    {
                        title: title + ' (Dubbing PL)',
                        quality: '1080p',
                        translation: 'Polski Dubbing',
                        url: 'https://example-pl-stream.com/video_dubbing.mp4'
                    },
                    {
                        title: title + ' (Napisy PL)',
                        quality: '1080p',
                        translation: 'Polski Subtitles',
                        url: 'https://example-pl-stream.com/video_sub.mp4'
                    }
                ];

                renderResults(results);
            }, function () {
                renderEmpty();
            });
        };

        function renderResults(items) {
            var html = $('<div class="online-list"></div>');

            items.forEach(function (item) {
                var element = $(
                    '<div class="online-list__item selector">' +
                        '<div class="online-list__title">' + item.title + '</div>' +
                        '<div class="online-list__quality">' + item.quality + ' | ' + item.translation + '</div>' +
                    '</div>'
                );

                element.on('hover:enter', function () {
                    // Запуск програвача Lampa з вибраним польським аудіопотоком
                    Lampa.Player.play({
                        url: item.url,
                        title: item.title,
                        subtitles: item.subtitles || []
                    });
                });

                html.append(element);
            });

            scroll.append(html);
        }

        function renderEmpty() {
            var empty = $('<div class="empty">Brak polskich źródeł (Не знайдено польських джерел)</div>');
            scroll.append(empty);
        }

        this.destroy = function () {
            network.clear();
        };
    }

    // Реєстрація джерела у відеобалансерах Lampa 3.3.4.29
    Lampa.Component.add('pl_audio', PolishAudioProvider);

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') {
            var card = e.object.method === 'movie' ? e.object.movie : e.object.tv;
            // Додаємо кнопку "Polski Lektor" на картку фільму/серіалу
            var button = $(
                '<div class="full-start__button selector button--pl-audio">' +
                    '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor">' +
                        '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>' +
                    '</svg>' +
                    '<span>PL Lektor / Dubbing</span>' +
                '</div>'
            );

            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: 'Polski Lektor - ' + (card.title || card.name),
                    component: 'pl_audio',
                    search_title: card.original_title || card.title || card.name,
                    year: card.release_date || card.first_air_date
                });
            });

            e.body.find('.full-start__buttons').append(button);
        }
    });

})();
