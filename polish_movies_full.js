(function () {
    'use strict';

    if (window.plugin_polish_movies_v7) return;
    window.plugin_polish_movies_v7 = true;

    var component_name = 'polish_movies';
    var component_title = 'Польське кіно';

    function Component(object) {
        var comp = this;

        this.create = function () {
            var language = Lampa.Storage.get('language', 'uk');

            // Формуємо параметри запиту до TMDB
            object.url = 'discover/movie?with_original_language=pl&sort_by=popularity.desc';
            object.page = object.page || 1;

            // Використовуємо стандартний клас Catalog
            this.catalog = new Lampa.Catalog(object);

            // Перевизначаємо метод завантаження даних
            this.catalog.fetch = function (url, page, resolve, reject) {
                var req_url = url + '&page=' + page + '&language=' + language;

                // Виклики через Lampa.TMDB.api або Lampa.Api.part
                var get_data = Lampa.TMDB.api || Lampa.TMDB.get;

                if (typeof get_data === 'function') {
                    get_data(req_url, {}, function (data) {
                        if (data && data.results && data.results.length) {
                            resolve(data);
                        } else {
                            reject();
                        }
                    }, function (err) {
                        reject(err);
                    });
                } else {
                    // Резервний варіант через нативний Lampa.Api.sources
                    Lampa.Api.sources.tmdb.get(req_url, {}, function (data) {
                        if (data && data.results && data.results.length) {
                            resolve(data);
                        } else {
                            reject();
                        }
                    }, function (err) {
                        reject(err);
                    });
                }
            };

            return this.catalog.create();
        };

        this.render = function () {
            return this.catalog ? this.catalog.render() : $('<div></div>');
        };

        this.destroy = function () {
            if (this.catalog && this.catalog.destroy) {
                this.catalog.destroy();
            }
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
