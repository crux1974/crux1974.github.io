(function () {
    'use strict';

    if (window.plugin_polish_movies_ready) return;
    window.plugin_polish_movies_ready = true;

    var component_name = 'polish_movies';
    var component_title = 'Польське кіно';

    // Повний список жанрів TMDB
    var genres_list = [
        { title: 'Усі жанри', id: '' },
        { title: 'Комедія', id: '35' },
        { title: 'Драма', id: '18' },
        { title: 'Екшн / Бойовик', id: '28' },
        { title: 'Трилер', id: '53' },
        { title: 'Кримінал', id: '80' },
        { title: 'Жахи', id: '27' },
        { title: 'Мелодрама', id: '10749' },
        { title: 'Детектив', id: '9648' },
        { title: 'Історичний', id: '36' },
        { title: 'Пригоди', id: '12' },
        { title: 'Військовий', id: '10752' },
        { title: 'Документальний', id: '99' },
        { title: 'Фантастика', id: '878' },
        { title: 'Анімація', id: '16' },
        { title: 'Сімейний', id: '10751' }
    ];

    // Повний список часових періодів
    var years_list = [
        { title: 'Усі роки', gte: '', lte: '' },
        { title: '2020 — 2026', gte: '2020-01-01', lte: '2026-12-31' },
        { title: '2010 — 2019', gte: '2010-01-01', lte: '2019-12-31' },
        { title: '2000 — 2009', gte: '2000-01-01', lte: '2009-12-31' },
        { title: '1990 — 1999', gte: '1990-01-01', lte: '1999-12-31' },
        { title: '1980 — 1989', gte: '1980-01-01', lte: '1989-12-31' },
        { title: '1970 — 1979', gte: '1970-01-01', lte: '1979-12-31' },
        { title: 'До 1970', gte: '1900-01-01', lte: '1969-12-31' }
    ];

    // Варіанти сортування
    var sort_list = [
        { title: 'За популярністю', id: 'popularity.desc' },
        { title: 'За рейтингом', id: 'vote_average.desc' },
        { title: 'Спочатку нові', id: 'primary_release_date.desc' },
        { title: 'Спочатку старі', id: 'primary_release_date.asc' }
    ];

    function Component(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var filter_html = $('<div class="broad-filter" style="padding: 1em 1.5em; display: flex; gap: 12px; flex-wrap: wrap;"></div>');
        var last;
        var page    = 1;
        var total_pages = 0;
        var loading = false;

        var selected_genre = '';
        var selected_year_gte = '';
        var selected_year_lte = '';
        var selected_sort = 'popularity.desc';

        this.create = function () {
            var _this = this;

            this.activity.loader(true);
            this.buildFilters();

            html.append(filter_html);
            html.append(scroll.render());
            scroll.append(body);

            this.loadData(true);

            return this.render();
        };

        // Створення випадаючих кнопок-фільтрів
        this.buildFilters = function () {
            var _this = this;

            var genre_btn = $('<div class="selector filter-btn" style="padding: 0.6em 1.2em; background: rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer;">Жанр: Усі жанри</div>');
            genre_btn.on('hover:enter', function () {
                Lampa.Select.show({
                    title: 'Оберіть жанр',
                    items: genres_list,
                    onSelect: function (a) {
                        selected_genre = a.id;
                        genre_btn.text('Жанр: ' + a.title);
                        _this.loadData(true);
                    }
                });
            });

            var year_btn = $('<div class="selector filter-btn" style="padding: 0.6em 1.2em; background: rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer;">Рік: Усі роки</div>');
            year_btn.on('hover:enter', function () {
                Lampa.Select.show({
                    title: 'Оберіть період',
                    items: years_list,
                    onSelect: function (a) {
                        selected_year_gte = a.gte;
                        selected_year_lte = a.lte;
                        year_btn.text('Рік: ' + a.title);
                        _this.loadData(true);
                    }
                });
            });

            var sort_btn = $('<div class="selector filter-btn" style="padding: 0.6em 1.2em; background: rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer;">Сортування: За популярністю</div>');
            sort_btn.on('hover:enter', function () {
                Lampa.Select.show({
                    title: 'Тип сортування',
                    items: sort_list,
                    onSelect: function (a) {
                        selected_sort = a.id;
                        sort_btn.text('Сортування: ' + a.title);
                        _this.loadData(true);
                    }
                });
            });

            filter_html.append(genre_btn).append(year_btn).append(sort_btn);
        };

        // Завантаження фільмів
        this.loadData = function (reset) {
            var _this = this;

            if (loading) return;

            if (reset) {
                page = 1;
                body.empty();
                items = [];
                this.activity.loader(true);
            }

            loading = true;

            var path = 'discover/movie?with_origin_country=PL&sort_by=' + selected_sort + '&vote_count.gte=5&page=' + page;
            if (selected_genre) path += '&with_genres=' + selected_genre;
            if (selected_year_gte) path += '&primary_release_date.gte=' + selected_year_gte;
            if (selected_year_lte) path += '&primary_release_date.lte=' + selected_year_lte;

            var url = Lampa.TMDB.api(path);

            var request_method = function(req_url, success, error) {
                if (Lampa.Fetch) {
                    Lampa.Fetch.get(req_url, success, error);
                } else {
                    network.native(req_url, success, error);
                }
            };

            request_method(url, function (data) {
                _this.activity.loader(false);
                loading = false;

                if (data && data.results && data.results.length) {
                    total_pages = data.total_pages;
                    _this.append(data.results);

                    scroll.onWheel = function (step) {
                        if (step > 0 && !loading && page < total_pages) {
                            page++;
                            _this.loadData(false);
                        }
                    };

                    _this.startController();
                } else if (reset) {
                    body.append('<div class="empty__title" style="padding: 3em; text-align: center; font-size: 1.2em;">За вашим запитом нічого не знайдено</div>');
                    _this.startController();
                }
            }, function () {
                _this.activity.loader(false);
                loading = false;
                if (reset) {
                    body.append('<div class="empty__title" style="padding: 3em; text-align: center; color: red;">Помилка завантаження даних</div>');
                }
            });
        };

        // Контролер навігації пульта
        this.startController = function() {
            var _this = this;

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    Lampa.Controller.toggle('menu');
                },
                up: function () {
                    if (navigator.app) navigator.app.exitApp();
                }
            });

            Lampa.Controller.toggle('content');
        };

        // Додавання карток у сітку
        this.append = function (data) {
            data.forEach(function (element) {
                var card = Lampa.Template.get('card', element);

                card.on('hover:focus', function () {
                    last = card[0];
                    scroll.update(card);
                });

                card.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: element.url,
                        component: 'full',
                        id: element.id,
                        method: 'movie',
                        card: element
                    });
                });

                body.append(card);
                items.push(card);
            });
        };

        this.render = function () {
            return html;
        };

        // Очищення ресурсів при закритті компонента
        this.destroy = function () {
            network.clear();
            items = null;
            html.remove();
        };
    }

    // Реєстрація компонента та пункту меню
    function startPlugin() {
        Lampa.Component.add(component_name, Component);

        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') {
                var menu_item = $('<li class="menu__item selector" data-action="' + component_name + '">' +
                    '<div class="menu__ico">' +
                        '<svg height="24" viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11h16M4 15h16M4 7h16"/></svg>' +
                    '</div>' +
                    '<div class="menu__text">' + component_title + '</div>' +
                '</li>');

                menu_item.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: component_title,
                        component: component_name,
                        page: 1
                    });
                });

                $('.menu .menu__list').eq(0).append(menu_item);
            }
        });
    }

    // Запуск після ініціалізації Lampa
    if (window.Lampa) {
        startPlugin();
    } else {
        var timer = setInterval(function () {
            if (window.Lampa) {
                clearInterval(timer);
                startPlugin();
            }
        }, 100);
    }
})();
