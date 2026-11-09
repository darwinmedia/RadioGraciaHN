
/* =====================================================
   RADIO GRACIA HN
   REPRODUCTOR DE RADIO
   Streaming: Zeno.fm
===================================================== */

(() => {
    "use strict";

    const STREAM_URL = "https://stream.zeno.fm/pzcmwtafagctv";
    const STATION_ID = "pzcmwtafagctv";

    const METADATA_URL =
        `https://api.zeno.fm/mounts/metadata/subscribe/${STATION_ID}`;

    const LISTENERS_URL =
        `https://api.zeno.fm/mounts/${STATION_ID}`;

    const container = document.getElementById("radio-player-container");

    if (!container) return;

    container.innerHTML = `
        <div class="radio-player" id="radioPlayer">

            <div class="radio-player-content">

                <div class="radio-player-brand">

                    <img
                        class="radio-player-logo"
                        src="assets/images/brand/logo-radio-gracia-hn.png"
                        alt="Radio Gracia HN"
                    >

                    <h3>RADIO GRACIA HN</h3>

                    <p>UNA VOZ DE FE, ESPERANZA Y BENDICIÓN</p>

                </div>

                <div class="radio-player-status">

                    <span class="radio-live-dot"></span>

                    <span id="radioStatus">DETENIDO</span>

                </div>

                <div class="radio-equalizer" aria-hidden="true">
                    ${Array.from({ length: 19 }, () => "<span></span>").join("")}
                </div>

                <div class="radio-now-playing" aria-live="polite">

                    <small>AHORA EN RADIO GRACIA</small>

                    <span id="radioNowPlaying">
                        Preparado para transmitir
                    </span>

                </div>

                <button
                    type="button"
                    class="radio-play-button"
                    id="radioPlayButton"
                    aria-label="Escuchar Radio Gracia HN"
                >
                    <i class="fas fa-play" aria-hidden="true"></i>
                    <span>ESCUCHAR EN VIVO</span>
                </button>

                <div class="radio-player-details">

                    <span>
                        <i class="fas fa-broadcast-tower"></i>
                        Señal online 24/7
                    </span>

                    <span id="radioListeners">
                        <i class="fas fa-users"></i>
                        Oyentes: --
                    </span>

                </div>

                <div class="radio-volume">

                    <i class="fas fa-volume-down" aria-hidden="true"></i>

                    <input
                        type="range"
                        id="radioVolume"
                        min="0"
                        max="1"
                        step="0.01"
                        value="0.8"
                        aria-label="Volumen"
                    >

                    <i class="fas fa-volume-up" aria-hidden="true"></i>

                </div>

                <p
                    class="radio-player-message"
                    id="radioMessage"
                    role="status"
                    aria-live="polite"
                >
                    Transmitiendo desde Quimistán, Honduras.
                </p>

                <audio id="radioAudio" preload="none">
                    <source src="${STREAM_URL}" type="audio/mpeg">
                    Tu navegador no puede reproducir audio HTML5.
                </audio>

            </div>

        </div>
    `;

    const audio = document.getElementById("radioAudio");
    const player = document.getElementById("radioPlayer");
    const playButton = document.getElementById("radioPlayButton");
    const status = document.getElementById("radioStatus");
    const nowPlaying = document.getElementById("radioNowPlaying");
    const listeners = document.getElementById("radioListeners");
    const volume = document.getElementById("radioVolume");
    const message = document.getElementById("radioMessage");

    let metadataTimer = null;
    let listenersTimer = null;

    function setStatus(state, detail) {
        player.classList.remove("is-playing", "is-loading");

        if (state === "playing") {
            player.classList.add("is-playing");
            status.textContent = "EN VIVO";
            playButton.innerHTML =
                '<i class="fas fa-pause"></i><span>DETENER RADIO</span>';
            playButton.setAttribute("aria-label", "Detener Radio Gracia HN");
            message.textContent = "Estás escuchando Radio Gracia HN.";
        }

        if (state === "loading") {
            player.classList.add("is-loading");
            status.textContent = "CARGANDO...";
            playButton.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i><span>CONECTANDO...</span>';
            message.textContent = "Conectando con nuestra señal...";
        }

        if (state === "stopped") {
            status.textContent = "DETENIDO";
            playButton.innerHTML =
                '<i class="fas fa-play"></i><span>ESCUCHAR EN VIVO</span>';
            playButton.setAttribute("aria-label", "Escuchar Radio Gracia HN");

            if (detail) message.textContent = detail;
        }

        if (state === "error") {
            status.textContent = "SIN CONEXIÓN";
            playButton.innerHTML =
                '<i class="fas fa-redo"></i><span>INTENTAR DE NUEVO</span>';
            playButton.setAttribute("aria-label", "Reintentar conexión");
            message.textContent =
                "No fue posible conectar. Comprueba tu conexión e inténtalo nuevamente.";
        }
    }

    async function togglePlayback() {
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            setStatus("stopped", "La reproducción está detenida.");
            return;
        }

        setStatus("loading");

        try {
            await audio.play();
        } catch (error) {
            console.error("Error de reproducción:", error);
            setStatus("error");
        }
    }

    playButton.addEventListener("click", togglePlayback);

    audio.addEventListener("playing", () => setStatus("playing"));

    audio.addEventListener("waiting", () => {
        if (!audio.paused) setStatus("loading");
    });

    audio.addEventListener("pause", () => {
        if (audio.currentTime === 0 || audio.ended) {
            setStatus("stopped", "La reproducción está detenida.");
        }
    });

    audio.addEventListener("error", () => setStatus("error"));

    volume.addEventListener("input", () => {
        audio.volume = Number(volume.value);
    });

    audio.volume = Number(volume.value);

    async function loadMetadata() {
        try {
            const response = await fetch(METADATA_URL, {
                cache: "no-store"
            });

            if (!response.ok) throw new Error("Metadata no disponible");

            const data = await response.json();

            nowPlaying.textContent =
                data?.streamTitle || "Transmisión en vivo";

        } catch (error) {
            nowPlaying.textContent = "Transmisión en vivo";
        }
    }

    async function loadListeners() {
        try {
            const response = await fetch(LISTENERS_URL, {
                cache: "no-store"
            });

            if (!response.ok) throw new Error("Oyentes no disponibles");

            const data = await response.json();

            const count = data?.listeners;

            listeners.innerHTML =
                '<i class="fas fa-users"></i> Oyentes: ' +
                (Number.isFinite(Number(count)) ? count : "--");

        } catch (error) {
            listeners.innerHTML =
                '<i class="fas fa-users"></i> Oyentes: --';
        }
    }

    loadMetadata();
    loadListeners();

    metadataTimer = window.setInterval(loadMetadata, 15000);
    listenersTimer = window.setInterval(loadListeners, 20000);

    window.addEventListener("pagehide", () => {
        window.clearInterval(metadataTimer);
        window.clearInterval(listenersTimer);
    });

    setStatus("stopped", "Transmisión lista para reproducir.");
})();
