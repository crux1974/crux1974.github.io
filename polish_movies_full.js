(function () {
    'use strict';

    var component_name = 'polish_movies';
    var component_title = 'Польське кіно';

    // Список жанрів TMDB
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
        { title: 'Пригоди', id: '12' }
    ];

    // Список періодів виходу
    var years_list = [
        { title: 'Усі роки', gte: '', lte: '' },
        { title: '2020 — 2026', gte: '2020-01-01', lte: '2026-12-31' },
        { title: '2010 — 2019', gte: '2010-01-01', lte: '2019-12-31' },
        { title: '2000 — 2009', gte: '2000-01-01', lte: '2009-12-31' },
        { title: '1990 — 1999', gte: '1990-01-01', lte: '1999-12-31' },
        { title: 'До 1990', gte: '1900-01-01', lte: '1989-12-31' }
    ];

    // Опції сортування
    var sort_list = [
        { title: 'За популярністю', id: 'popularity.desc' },
        { title: 'За рейтингом (високий спочатку)', id: 'vote_average.desc' },
        { title: 'Спочатку нові', id: 'primary_release_date.desc' },
        { title: 'Спочатку старі', id: 'primary_release_date.asc' }
    ];

    function Component(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var filter_html = $('<div class="broad-filter" style="padding: 1em; display: flex; gap: 10px; flex-wrap: wrap;"></div>');
        var last;
        var page    = 1;
        var total_pages = 0;

        // Початкові значення фільтрів
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

        // Побудова випадаючих списків фільтрів
        this.buildFilters = function () {
            var _this = this;

            // Кнопка жанру
            var genre_btn = $('<div class="selector filter-btn" style="padding: 0.5em 1em; background: rgba(255,255,255,0.1); border-radius: 4px;">Жанр: Усі жанри</div>');
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

            // Кнопка року
            var year_btn = $('<div class="selector filter-btn" style="padding: 0.5em 1em; background: rgba(255,255,255,0.1); border-radius: 4px;">Рік: Усі роки</div>');
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

            // Кнопка сортування
            var sort_btn = $('<div class="selector filter-btn" style="padding: 0.5em 1em; background: rgba(255,255,255,0.1); border-radius: 4px;">Сортування: За популярністю</div>');
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

        // Завантаження даних із TMDB
        this.loadData = function (reset) {
            var _this = this;

            if (reset) {
                page = 1;
                body.empty();
                items = [];
                this.activity.loader(true);
            }

            // Щоб уникнути показу низькоякісних тайтлів при сортуванні за рейтингом, додаємо обмеження за голосами (vote_count.gte=10)
            var url = 'discover/movie?with_origin_country=PL&sort_by=' + selected_sort + '&vote_count.gte=10&page=' + page;
            if (selected_genre) url += '&with_genres=' + selected_genre;
            if (selected_year_gte) url += '&primary_release_date.gte=' + selected_year_gte;
            if (selected_year_lte) url += '&primary_release_date.lte=' + selected_year_lte;

            network.share(Lampa.TMDB.api(url), function (data) {
                _this.activity.loader(false);

                if (data.results && data.results.length) {
                    total_pages = data.total_pages;
                    _this.append(data.results);

                    scroll.onWheel = function (step) {
                        if (step > 0 && !network.isWork() && page < total_pages) {
                            page++;
                            _this.loadData(false);
                        }
                    };

                    Lampa.Controller.add('content', {
                        toggle: function () {
                            Lampa.Controller.collectionSet(html);
                            Lampa.Controller.collectionFocus(last || false, html);
                        },
                        left: function () {
                            Lampa.Controller.toggle('menu');
                        }
                    });

                    Lampa.Controller.toggle('content');
                } else if (reset) {
                    body.append('<div class="empty__title" style="padding: 2em; text-align: center;">За вашим запитом нічого не знайдено</div>');
                }
            }, function () {
                _this.activity.loader(false);
            });
        };

        // Рендер карток фільмів
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
    }

    function startPlugin() {
        window.plugin_polish_movies_ready = true;
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

    if (!window.plugin_polish_movies_ready) {
        startPlugin();
    }
})();
