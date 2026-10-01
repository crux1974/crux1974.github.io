(function () {
    'use strict';

    if (window.plugin_polish_movies_fixed_v5) return;
    window.plugin_polish_movies_fixed_v5 = true;

    var component_name = 'polish_movies';
    var component_title = 'Польське кіно';

    function Component(object) {
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var last;
        var page    = 1;
        var total_pages = 0;
        var loading = false;

        this.create = function () {
            var _this = this;

            this.activity.loader(true);
            html.append(scroll.render());
            scroll.append(body);

            this.loadData(true);

            return this.render();
        };

        this.loadData = function (reset) {
            var _this = this;

            if (loading) return;
            if (reset) {
                page = 1;
                body.empty();
                this.activity.loader(true);
            }

            loading = true;

            // Використовуємо with_original_language замість with_origin_country
            var url = 'discover/movie?with_original_language=pl&sort_by=popularity.desc&page=' + page;

            // Виклик через нативний движок Lampa TMDB
            Lampa.TMDB.get(url, {}, function (data) {
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
                    body.append('<div class="empty__title" style="padding: 3em; text-align: center; font-size: 1.2em;">Нічого не знайдено</div>');
                    _this.startController();
                }
            }, function () {
                _this.activity.loader(false);
                loading = false;
                if (reset) {
                    body.append('<div class="empty__title" style="padding: 3em; text-align: center; color: #ff5252;">Помилка завантаження даних</div>');
                }
            });
        };

        this.startController = function() {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    Lampa.Controller.toggle('menu');
                }
            });

            Lampa.Controller.toggle('content');
        };

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
            });
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            html.remove();
        };
    }

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
