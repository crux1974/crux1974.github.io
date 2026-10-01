(function () {
    'use strict';

    if (window.polish_tracks_plugin) return;
    window.polish_tracks_plugin = true;

    const POLISH_CODES = ['pl', 'pol', 'polish', 'polski', 'pl-pl', 'pl_pl'];
    const POLISH_LABEL = 'Polski';

    function isPolish(track) {
        if (!track) return false;
        const lang = (track.language || '').toLowerCase().trim();
        const label = (track.label || track.name || '').toLowerCase().trim();
        return POLISH_CODES.some(c => lang === c || lang.startsWith(c + '-') || label.includes(c));
    }

    function improveLabel(track) {
        if (isPolish(track)) {
            track.label = POLISH_LABEL + (track.label && !/polski|polish|pl/i.test(track.label) ? ' — ' + track.label : '');
            track.language = 'pl';
        }
        return track;
    }

    function selectPolishIfExists(tracks) {
        if (!Array.isArray(tracks) || !tracks.length) return tracks;

        let polishIndex = -1;
        tracks.forEach((t, i) => {
            improveLabel(t);
            if (isPolish(t) && polishIndex === -1) polishIndex = i;
        });

        if (polishIndex > -1) {
            tracks.forEach((t, i) => {
                t.selected = false;
                if (typeof t.enabled !== 'undefined') t.enabled = false;
            });
            const chosen = tracks[polishIndex];
            chosen.selected = true;
            if (typeof chosen.enabled !== 'undefined') chosen.enabled = true;

            // Реально перемикаємо в HTML5/video
            try {
                const video = Lampa.PlayerVideo.video();
                if (video && video.audioTracks) {
                    for (let i = 0; i < video.audioTracks.length; i++) {
                        video.audioTracks[i].enabled = false;
                        video.audioTracks[i].selected = false;
                    }
                    if (video.audioTracks[polishIndex]) {
                        video.audioTracks[polishIndex].enabled = true;
                        video.audioTracks[polishIndex].selected = true;
                    }
                }
            } catch (e) {}
        }
        return tracks;
    }

    function onTracks(data) {
        if (data && data.tracks) {
            data.tracks = selectPolishIfExists(data.tracks);
            if (Lampa.PlayerPanel && Lampa.PlayerPanel.setTracks) {
                Lampa.PlayerPanel.setTracks(data.tracks);
            }
        }
    }

    function onWebosTracks(data) {
        if (data && data.tracks) {
            data.tracks = selectPolishIfExists(data.tracks);
        }
    }

    function init() {
        Lampa.Player.listener.follow('start', function () {
            // Підписуємось на появу доріжок
            Lampa.PlayerVideo.listener.follow('tracks', onTracks);
            Lampa.PlayerVideo.listener.follow('webos_tracks', onWebosTracks);
            Lampa.PlayerVideo.listener.follow('canplay', function () {
                // На всяк випадок ще раз після canplay
                setTimeout(() => {
                    try {
                        const video = Lampa.PlayerVideo.video();
                        if (video && video.audioTracks && video.audioTracks.length) {
                            const arr = Array.from(video.audioTracks);
                            selectPolishIfExists(arr);
                            if (Lampa.PlayerPanel && Lampa.PlayerPanel.setTracks) {
                                Lampa.PlayerPanel.setTracks(arr);
                            }
                        }
                    } catch (e) {}
                }, 800);
            });
        });

        Lampa.Player.listener.follow('destroy', function () {
            Lampa.PlayerVideo.listener.remove('tracks', onTracks);
            Lampa.PlayerVideo.listener.remove('webos_tracks', onWebosTracks);
        });

        console.log('[Polish Tracks] Plugin loaded');
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
