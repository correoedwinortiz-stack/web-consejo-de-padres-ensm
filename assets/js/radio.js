/**
 * radio.js - Reproductor de la Emisora Sonaría (Versión Ultra-Robusta)
 */

class SonariaRadio {
    constructor() {
        this.streamUrl = 'https://radio.sonariaradio.online/radio.mp3';
        this.isPlaying = false;
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        
        // Watchdog para detectar cortes
        this.lastTime = 0;
        this.stallCount = 0;
        this.watchdogInterval = null;

        this.createPlayerUI();
        this.initListeners();
    }

    createPlayerUI() {
        const playerHtml = `
            <div id="sonaria-player" class="fixed bottom-6 left-6 z-[60] bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-2xl transition-all duration-500 hover:bg-white/20 group">
                <div class="flex items-center gap-3 pr-4">
                    <div id="radio-disk" class="w-12 h-12 rounded-full bg-[#1e3a5f] flex items-center justify-center relative overflow-hidden shadow-inner border border-white/30">
                        <img src="assets/img/logo_sonaria.png" alt="Sonaria" class="w-full h-full object-cover z-10" id="radio-logo">
                    </div>
                    
                    <div class="flex flex-col bg-black/40 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/10 shadow-lg">
                        <span class="text-[9px] uppercase tracking-widest text-white/90 font-bold leading-none">En Vivo</span>
                        <span class="text-white font-bold text-xs leading-tight" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Emisora Sonaría</span>
                    </div>

                    <button id="radio-play-btn" class="w-10 h-10 rounded-full bg-white text-[#1e3a5f] flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                        <span id="radio-icon">▶</span>
                    </button>
                </div>
                <div id="radio-status" class="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 transition-opacity pointer-events-none whitespace-nowrap">
                    Conectando...
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', playerHtml);
    }

    initListeners() {
        const playBtn = document.getElementById('radio-play-btn');
        const icon = document.getElementById('radio-icon');
        const disk = document.getElementById('radio-disk');

        playBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stop();
            } else {
                this.start();
            }
        });

        // Eventos de red
        this.audio.addEventListener('waiting', () => this.showStatus('Cargando buffer...'));
        this.audio.addEventListener('error', () => this.handleError());
        this.audio.addEventListener('stalled', () => this.handleError());
    }

    start() {
        const icon = document.getElementById('radio-icon');
        const disk = document.getElementById('radio-disk');
        
        this.showStatus('Sintonizando...');
        this.audio.src = this.streamUrl + '?t=' + Date.now();
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            icon.textContent = "||";
            disk.classList.add('animate-spin-slow');
            this.showStatus('Sintonizado');
            this.startWatchdog();
        }).catch(err => {
            console.error("Error Radio:", err);
            this.showStatus('Error de conexión');
        });
    }

    stop() {
        const icon = document.getElementById('radio-icon');
        const disk = document.getElementById('radio-disk');
        
        this.audio.pause();
        this.audio.src = ""; 
        this.isPlaying = false;
        icon.textContent = "▶";
        disk.classList.remove('animate-spin-slow');
        this.showStatus('Pausado');
        this.stopWatchdog();
    }

    handleError() {
        if (this.isPlaying) {
            console.log("Detectado corte en el flujo, reconectando...");
            this.showStatus('Reconectando...');
            setTimeout(() => {
                if (this.isPlaying) this.start();
            }, 2000);
        }
    }

    startWatchdog() {
        this.stopWatchdog();
        this.stallCount = 0;
        this.watchdogInterval = setInterval(() => {
            if (this.isPlaying && !this.audio.paused) {
                if (this.audio.currentTime === this.lastTime) {
                    this.stallCount++;
                    if (this.stallCount > 5) { // 5 segundos sin avance
                        console.warn("Watchdog: Flujo estancado, refrescando...");
                        this.handleError();
                    }
                } else {
                    this.lastTime = this.audio.currentTime;
                    this.stallCount = 0;
                }
            }
        }, 1000);
    }

    stopWatchdog() {
        if (this.watchdogInterval) {
            clearInterval(this.watchdogInterval);
            this.watchdogInterval = null;
        }
    }

    showStatus(text) {
        const status = document.getElementById('radio-status');
        if (!status) return;
        status.textContent = text;
        status.classList.remove('opacity-0');
        setTimeout(() => {
            if (status) status.classList.add('opacity-0');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SonariaRadio();
});
