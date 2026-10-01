(function () {
    'use strict';

    // Уникаємо повторного завантаження
    if (window.polish_voice_plugin) return;
    window.polish_voice_plugin = true;

    function startPlugin() {
        // Реєстрація плагіна
        Lampa.Plugin.add({
            name: 'Polish Voice',
            version: '1.0.0',
            description: 'Фільтр і пріоритет польської озвучки (lektor PL)',
            author: 'User'
        });

        // Додаємо пункт у меню налаштувань (опційно)
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'polish_voice_priority',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Пріоритет польської озвучки',
                description: 'Піднімати джерела з PL / lektor вище'
            },
            onChange: function (value) {
                Lampa.Storage.set('polish_voice_priority', value);
            }
        });

        // Слухаємо відкриття картки фільму/серіалу
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            // Приклад: додаємо власну кнопку "Polish"
            var button = $(`
                <div class="full-start__button selector view--polish">
                    <svg>...</svg>  <!-- іконка -->
                    <span>Polish / PL</span>
                </div>
            `);

            button.on('hover:enter', function () {
                // Тут твоя логіка пошуку джерел з польською озвучкою
                // Наприклад, виклик існуючого балансера + фільтр
                searchPolishSources(e.data.movie);
            });

            $('.full-start__buttons', e.object.activity.render()).prepend(button);
        });

        // Приклад функції фільтрації (псевдокод)
        function searchPolishSources(movie) {
            Lampa.Noty.show('Шукаю джерела з польською озвучкою...');

            // Тут ти підключаєш свій балансер / API
            // і фільтруєш результати за ключовими словами:
            // "PL", "Polish", "Lektor", "Lektor PL", "Dubbing PL" тощо.

            /*
            Lampa.Api.request(url, function (data) {
                var filtered = data.filter(item => {
                    var title = (item.title || item.quality || item.voice || '').toLowerCase();
                    return title.includes('pl') || title.includes('lektor') || title.includes('polish');
                });

                // Показуємо результати через стандартний компонент Lampa
                Lampa.Component.get('files')({
                    data: filtered,
                    movie: movie
                });
            });
            */
        }

        // Пріоритет у списку онлайн-джерел (якщо балансер підтримує)
        Lampa.Listener.follow('online', function (e) {
            if (!Lampa.Storage.get('polish_voice_priority', true)) return;

            if (e.type === 'balance') {
                // Сортуємо балансери / файли, піднімаючи ті, що містять PL
                e.data.sort(function (a, b) {
                    var aPl = /pl|polish|lektor/i.test(a.title || a.quality || '');
                    var bPl = /pl|polish|lektor/i.test(b.title || b.quality || '');
                    return (bPl ? 1 : 0) - (aPl ? 1 : 0);
                });
            }
        });
    }

    // Запуск після готовності додатку
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
