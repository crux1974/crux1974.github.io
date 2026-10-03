(function () {
    'use strict';

    if (window.plugin_pl_audio_loaded) return;
    window.plugin_pl_audio_loaded = true;

    // Налаштування плагіна
    Lampa.SettingsApi.addParam({
        component: 'plugins',
        param: {
            name: 'pl_audio_source',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Польська озвучка (Polski Lektor)',
            description: 'Відображати кнопку польської озвучки'
        },
        onChange: function (value) {
            Lampa.Storage.set('pl_audio_source', value);
        }
    });

    // Компонент відображення результатів
    function PolishAudioProvider(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        
        this.create = function () {
            var html = $('<div class="online-list"></div>');
            var cardTitle = object.search_title || 'Фільм';

            var results = [
                { title: cardTitle + ' (Lektor PL 1080p)', url: 'https://example-pl-stream.com/lektor.mp4' },
                { title: cardTitle + ' (Dubbing PL 1080p)', url: 'https://example-pl-stream.com/dubbing.mp4' },
                { title: cardTitle + ' (Napisy PL / Субтитри)', url: 'https://example-pl-stream.com/napisy.mp4' }
            ];

            results.forEach(function (item) {
                var element = $(
                    '<div class="online-list__item selector">' +
                        '<div class="online-list__title">' + item.title + '</div>' +
                    '</div>'
                );

                element.on('hover:enter', function () {
                    Lampa.Player.play({
                        url: item.url,
                        title: item.title
                    });
                });

                html.append(element);
            });

            scroll.append(html);
            return scroll.render();
        };

        this.destroy = function () {
            scroll.destroy();
        };
    }

    Lampa.Component.add('pl_audio', PolishAudioProvider);

    // Додавання кнопки на картку
    function addButton(e) {
        if (!Lampa.Storage.get('pl_audio_source', true)) return;

        var card = e.object.method === 'movie' ? e.object.movie : e.object.tv;
        if (!card) return;

        var buttonHtml = $(
            '<div class="full-start__button selector button--pl-audio">' +
                '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor">' +
                    '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>' +
                '</svg>' +
                '<span>PL Lektor</span>' +
            '</div>'
        );

        buttonHtml.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'PL Lektor - ' + (card.title || card.name),
                component: 'pl_audio',
                search_title: card.original_title || card.title || card.name,
                year: (card.release_date || card.first_air_date || '').substring(0, 4)
            });
        });

        // Шукаємо контейнер для кнопок (підтримка старих і нових версій Lampa)
        var container = e.body.find('.full-start__buttons, .full-start-new__buttons, .full-start__controls').first();

        if (container.length) {
            container.append(buttonHtml);
        } else {
            // Якщо контейнер не знайдено одразу, очікуємо появи в DOM
            setTimeout(function () {
                var retryContainer = e.body.find('.full-start__buttons, .full-start-new__buttons, .full-start__controls').first();
                if (retryContainer.length) {
                    retryContainer.append(buttonHtml);
                }
            }, 300);
        }
    }

    // Підписка на події відкриття картки
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'start') {
            addButton(e);
        }
    });

})();
