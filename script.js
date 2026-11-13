/* -------------------------------------------------------------
 * Premium Birthday Celebration JavaScript Logic
 * Customized for Saumya (Bestie Edition)
 * ------------------------------------------------------------- */

// State Management
const appState = {
    isMusicMuted: false,
    audioCtx: null,
    ambientSynthInterval: null,
    birthdaySongPlaying: false,
    birthdaySongTimeouts: [],
    balloonsActive: false,
    balloonIntervals: [],
    activeSlide: 0,
    ambientNodes: [],
    currentPageIndex: 1
};

// Bestie Birthday Wishes Database (Balloon Pop Notes)
const birthdayWishes = [
    { sender: "Partner-in-Crime 🤝", text: "Happy Birthday Saumya! Ab jaldi se party ka plan banao, koi bahana nahi chalega! 🍕🥳", avatar: "😎" },
    { sender: "Secret Keeper 🤫", text: "Thanks for keeping all my secrets safe and always giving the best advice. Love you bestie!", avatar: "🥰" },
    { sender: "Iconic Queen 👑", text: "Stay as crazy, confident, and unstoppable as you are. Yeh saal tumhara hi hai! ✨", avatar: "💃" },
    { sender: "24/7 Support Line 📞", text: "Chahe raat ke 2 baje hon ya subah, thanks for always being just one call away. Happy Birthday!", avatar: "💖" },
    { sender: "Memory Maker 📸", text: "From random laughs to deep late-night talks, every moment with you is a core memory!", avatar: "🥳" },
    { sender: "Golden Wish 🌟", text: "May your bank account stay full, your stress stay zero, and your smile shine brighter every day!", avatar: "✨" }
];

// -------------------------------------------------------------
// Web Audio API Synthesizer - 100% Offline & Reliable Audio
// -------------------------------------------------------------

function getAudioContext() {
    if (!appState.audioCtx) {
        appState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (appState.audioCtx.state === 'suspended') {
        appState.audioCtx.resume();
    }
    return appState.audioCtx;
}

function playPopSound() {
    if (appState.isMusicMuted) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        osc.start();
        osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function playBlowSound() {
    if (appState.isMusicMuted) return;
    try {
        const ctx = getAudioContext();
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noiseNode.start();
        noiseNode.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function playMagicChime() {
    if (appState.isMusicMuted) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.5);
        });
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function startAmbientSoundscape() {
    const ctx = getAudioContext();
    const delayNode = ctx.createDelay();
    delayNode.delayTime.value = 0.4;
    const feedbackNode = ctx.createGain();
    feedbackNode.gain.value = 0.3;

    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);
    delayNode.connect(ctx.destination);

    function playSoftPluck(freq, time) {
        if (appState.isMusicMuted || appState.birthdaySongPlaying) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(delayNode);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.04, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
        
        osc.start(time);
        osc.stop(time + 1.5);
        
        appState.ambientNodes.push({ osc, gain });
        setTimeout(() => {
            appState.ambientNodes = appState.ambientNodes.filter(n => n.osc !== osc);
        }, 2000);
    }

    const notesProgression = [
        [261.63, 329.63, 392.00, 493.88],
        [349.23, 440.00, 523.25, 659.25],
        [293.66, 349.23, 440.00, 587.33],
        [392.00, 493.88, 587.33, 783.99]
    ];

    let count = 0;
    function triggerNextChord() {
        if (appState.birthdaySongPlaying) return;
        const now = ctx.currentTime;
        const chord = notesProgression[count % notesProgression.length];
        
        chord.forEach((freq, i) => {
            playSoftPluck(freq, now + i * 0.15);
        });
        count++;
    }

    triggerNextChord();
    appState.ambientSynthInterval = setInterval(triggerNextChord, 4800);
}

function playHappyBirthdaySong() {
    if (appState.birthdaySongPlaying) return;
    appState.birthdaySongPlaying = true;
    
    const ctx = getAudioContext();
    
    const delayNode = ctx.createDelay();
    delayNode.delayTime.value = 0.3;
    const feedbackNode = ctx.createGain();
    feedbackNode.gain.value = 0.45;
    
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);
    delayNode.connect(ctx.destination);

    const G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
    
    const melody = [
        { freq: G4, dur: 0.35, delay: 0.4 },
        { freq: G4, dur: 0.12, delay: 0.15 },
        { freq: A4, dur: 0.45, delay: 0.5 },
        { freq: G4, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.45, delay: 0.5 },
        { freq: B4, dur: 0.9, delay: 1.0 },

        { freq: G4, dur: 0.35, delay: 0.4 },
        { freq: G4, dur: 0.12, delay: 0.15 },
        { freq: A4, dur: 0.45, delay: 0.5 },
        { freq: G4, dur: 0.45, delay: 0.5 },
        { freq: D5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.9, delay: 1.0 },

        { freq: G4, dur: 0.35, delay: 0.4 },
        { freq: G4, dur: 0.12, delay: 0.15 },
        { freq: G5, dur: 0.45, delay: 0.5 },
        { freq: E5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.45, delay: 0.5 },
        { freq: B4, dur: 0.45, delay: 0.5 },
        { freq: A4, dur: 0.7, delay: 0.8 },

        { freq: F5, dur: 0.35, delay: 0.4 },
        { freq: F5, dur: 0.12, delay: 0.15 },
        { freq: E5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 0.45, delay: 0.5 },
        { freq: D5, dur: 0.45, delay: 0.5 },
        { freq: C5, dur: 1.0, delay: 1.2 }
    ];

    let accumTime = ctx.currentTime + 0.5;

    melody.forEach((note) => {
        const playTime = accumTime;
        accumTime += note.delay;

        const timer = setTimeout(() => {
            if (appState.isMusicMuted) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.connect(delayNode);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.freq, playTime);
            
            gain.gain.setValueAtTime(0, playTime);
            gain.gain.linearRampToValueAtTime(0.18, playTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, playTime + note.dur * 1.5);

            osc.start(playTime);
            osc.stop(playTime + note.dur * 1.8);
        }, (playTime - ctx.currentTime) * 1000);

        appState.birthdaySongTimeouts.push(timer);
    });

    const totalDuration = (accumTime - ctx.currentTime) * 1000;
    const finalTimer = setTimeout(() => {
        appState.birthdaySongPlaying = false;
        appState.birthdaySongTimeouts = [];
    }, totalDuration);
    
    appState.birthdaySongTimeouts.push(finalTimer);
}

function stopBirthdaySong() {
    appState.birthdaySongTimeouts.forEach(t => clearTimeout(t));
    appState.birthdaySongTimeouts = [];
    appState.birthdaySongPlaying = false;
}

// -------------------------------------------------------------
// Canvas Particle & Confetti Engine
// -------------------------------------------------------------
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let stars = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, colorType) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 10 - 5;
        this.speedY = Math.random() * -12 - 5;
        this.gravity = 0.25;
        this.drag = 0.98;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        
        if (colorType === 'confetti') {
            this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
            this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
        } else {
            this.color = `hsl(${Math.random() * 15 + 40}, 100%, ${Math.random() * 30 + 60}%)`;
            this.shape = 'circle';
            this.size = Math.random() * 5 + 2;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -6 - 2;
        }
        
        this.opacity = 1;
        this.fade = Math.random() * 0.015 + 0.01;
    }

    update() {
        this.speedX *= this.drag;
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;

        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        }
        ctx.restore();
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.02 + 0.005;
        this.increasing = Math.random() > 0.5;
    }

    update() {
        if (this.increasing) {
            this.alpha += this.speed;
            if (this.alpha >= 1) this.increasing = false;
        } else {
            this.alpha -= this.speed;
            if (this.alpha <= 0.1) this.increasing = true;
        }
        
        this.y -= 0.05;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function initStars() {
    stars = [];
    const count = Math.min(window.innerWidth / 12, 100);
    for (let i = 0; i < count; i++) {
        stars.push(new Star());
    }
}

function spawnConfetti(x, y, count = 120) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, 'confetti'));
    }
}

function spawnSparkles(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, 'sparkle'));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
}

// -------------------------------------------------------------
// Slide Navigation Engine
// -------------------------------------------------------------

function navigateToPage(pageIndex) {
    const pageIds = ['page1', 'page2', 'page3', 'page4', 'page5', 'page6'];
    if (pageIndex < 1 || pageIndex > pageIds.length) return;

    const activePage = document.querySelector('.celebration-page.active');
    
    if (activePage) {
        activePage.classList.remove('active');
        activePage.classList.add('exit');
        
        setTimeout(() => {
            activePage.classList.add('hidden');
            activePage.classList.remove('exit');
            
            const targetPage = document.getElementById(pageIds[pageIndex - 1]);
            targetPage.classList.remove('hidden');
            
            setTimeout(() => {
                targetPage.classList.add('active');
            }, 50);
        }, 800);
    } else {
        const targetPage = document.getElementById(pageIds[pageIndex - 1]);
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
    appState.currentPageIndex = pageIndex;

    if (pageIndex === 2) {
        if (stars.length === 0) initStars();
    }
    if (pageIndex !== 5) {
        appState.balloonsActive = false;
        appState.balloonIntervals.forEach(clearInterval);
        appState.balloonIntervals = [];
    }
}

// -------------------------------------------------------------
// Interactive Element Logic
// -------------------------------------------------------------

// Optional URL override (?name=...)
const urlParams = new URLSearchParams(window.location.search);
const nameParam = urlParams.get('name');
if (nameParam) {
    const cleanName = nameParam.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const nameEl = document.getElementById('birthdayName');
    if (nameEl) nameEl.innerHTML = `${cleanName} 💖`;
    document.title = `Happy Birthday ${cleanName}! ✨`;
}

// 1. Entrance Transition (Page 1 -> Page 2)
const enterBtn = document.getElementById('enterBtn');
const mainContent = document.getElementById('mainContent');

function enterCelebration() {
    getAudioContext();
    playMagicChime();
    mainContent.classList.remove('hidden');
    navigateToPage(2);
    setTimeout(() => {
        startAmbientSoundscape();
    }, 600);
}
enterBtn.addEventListener('click', enterCelebration);

// 2. Go to Cake Page (Page 2 -> Page 3)
const goToCakeBtn = document.getElementById('goToCakeBtn');
goToCakeBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(3);
});

// 3. Candle Blowing & Cake Page Logic
const candle = document.getElementById('candle');
const flame = document.getElementById('flame');
const smoke = document.getElementById('smoke');
const wishInstructions = document.getElementById('wishInstructions');
const cakeNavContainer = document.getElementById('cakeNavContainer');
const goToGiftBtn = document.getElementById('goToGiftBtn');
const cakeWrapper = document.querySelector('.cake-wrapper');

function blowCandle(e) {
    if (e) {
        e.stopPropagation();
    }
    if (flame && !flame.classList.contains('hidden')) {
        flame.classList.add('hidden');
        if (smoke) smoke.classList.remove('hidden');
        
        playBlowSound();
        playMagicChime();
        
        const targetRect = candle ? candle.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;
        spawnConfetti(centerX, centerY, 150);
        
        if (wishInstructions) {
            wishInstructions.innerHTML = `<span class="animate-fade-in" style="color: var(--color-gold); font-size: 1.1rem;">May all your wishes come true, Saumya! 🌟</span>`;
        }
        
        setTimeout(() => {
            if (cakeNavContainer) cakeNavContainer.classList.remove('hidden');
        }, 1200);
        
        setTimeout(() => {
            playHappyBirthdaySong();
        }, 1000);
    }
}

if (candle) {
    candle.addEventListener('click', blowCandle);
}
if (cakeWrapper) {
    cakeWrapper.addEventListener('click', blowCandle);
}

goToGiftBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(4);
});

// 4. Gift Box Page Logic (Page 4 -> Page 5)
const giftBox = document.getElementById('giftBox');
const giftPanel = document.getElementById('giftPanel');
const secretCard = document.getElementById('secretCard');
const closeCardBtn = document.getElementById('closeCardBtn');
const goToBalloonsBtn = document.getElementById('goToBalloonsBtn');

giftBox.addEventListener('click', function() {
    if (!giftBox.classList.contains('open')) {
        giftBox.classList.add('open');
        playMagicChime();
        
        const rect = giftBox.getBoundingClientRect();
        spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
        
        setTimeout(() => {
            secretCard.classList.remove('hidden');
            giftPanel.classList.remove('hidden');
            setTimeout(() => {
                secretCard.classList.add('show');
            }, 50);
        }, 600);
    }
});

closeCardBtn.addEventListener('click', function() {
    secretCard.classList.remove('show');
    setTimeout(() => {
        secretCard.classList.add('hidden');
        giftPanel.classList.add('hidden');
        giftBox.classList.remove('open');
    }, 700);
});

goToBalloonsBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(5);
});

// 5. Balloon Wishes Page Logic (Page 5 -> Page 6)
const startBalloonsBtn = document.getElementById('startBalloonsBtn');
const balloonStartOverlay = document.getElementById('balloonStartOverlay');
const balloonField = document.getElementById('balloonField');
const wishDisplay = document.getElementById('wishDisplay');
const wishSender = document.getElementById('wishSender');
const wishText = document.getElementById('wishText');
const wishAvatar = document.getElementById('wishAvatar');
const closeWishBtn = document.getElementById('closeWishBtn');
const goToGalleryBtn = document.getElementById('goToGalleryBtn');

startBalloonsBtn.addEventListener('click', () => {
    balloonStartOverlay.classList.add('fade-out');
    appState.balloonsActive = true;
    startSpawningBalloons();
    getAudioContext();
});

closeWishBtn.addEventListener('click', () => {
    wishDisplay.classList.remove('show');
    setTimeout(() => {
        wishDisplay.classList.add('hidden');
    }, 500);
});

goToGalleryBtn.addEventListener('click', () => {
    playMagicChime();
    navigateToPage(6);
});

function startSpawningBalloons() {
    if (!appState.balloonsActive) return;

    function spawnSingleBalloon() {
        if (!appState.balloonsActive) return;
        
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        const hues = [0, 130, 200, 270, 320, 45];
        const hue = hues[Math.floor(Math.random() * hues.length)];
        const balloonColor = `hsl(${hue}, 85%, 65%)`;
        balloon.style.color = balloonColor;
        balloon.style.backgroundColor = balloonColor;
        
        const size = Math.random() * 15 + 40; 
        balloon.style.width = `${size}px`;
        balloon.style.height = `${size * 1.3}px`;
        
        const fieldWidth = balloonField.clientWidth;
        const left = Math.random() * (fieldWidth - 80) + 10;
        balloon.style.left = `${left}px`;
        
        const string = document.createElement('div');
        string.className = 'balloon-string';
        balloon.appendChild(string);
        
        balloonField.appendChild(balloon);
        
        let currentPos = -80;
        const speed = Math.random() * 2 + 1.2;
        const wobbleSpeed = Math.random() * 0.04 + 0.02;
        let wobble = 0;

        const floatInterval = setInterval(() => {
            currentPos += speed;
            wobble += wobbleSpeed;
            const wobbleOffset = Math.sin(wobble) * 15;
            
            balloon.style.bottom = `${currentPos}px`;
            balloon.style.transform = `translateX(${wobbleOffset}px)`;
            
            if (currentPos > balloonField.clientHeight + 100) {
                clearInterval(floatInterval);
                balloon.remove();
            }
        }, 16);
        
        balloon.addEventListener('click', () => {
            clearInterval(floatInterval);
            popBalloon(balloon, balloonColor);
        });

        const timer = setTimeout(spawnSingleBalloon, Math.random() * 1200 + 700);
        appState.balloonIntervals.push(timer);
    }

    spawnSingleBalloon();
    spawnSingleBalloon();
}

function popBalloon(balloonElement, color) {
    playPopSound();
    
    const rect = balloonElement.getBoundingClientRect();
    spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    
    balloonElement.classList.add('pop');
    
    const wish = birthdayWishes[Math.floor(Math.random() * birthdayWishes.length)];
    
    setTimeout(() => {
        wishAvatar.innerText = wish.avatar;
        wishSender.innerText = wish.sender;
        wishText.innerText = wish.text;
        
        wishDisplay.style.borderColor = color;
        wishDisplay.style.boxShadow = `0 0 20px ${color}`;
        wishDisplay.classList.remove('hidden');
        setTimeout(() => {
            wishDisplay.classList.add('show');
        }, 50);
        
        balloonElement.remove();
    }, 200);
}

// 6. Journey Polaroid Slideshow
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevSlideBtn = document.getElementById('prevSlide');
const nextSlideBtn = document.getElementById('nextSlide');

function showSlide(index) {
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    slides[appState.activeSlide].classList.remove('active');
    dots[appState.activeSlide].classList.remove('active');
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    appState.activeSlide = index;
}

prevSlideBtn.addEventListener('click', () => {
    showSlide(appState.activeSlide - 1);
});

nextSlideBtn.addEventListener('click', () => {
    showSlide(appState.activeSlide + 1);
});

dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        showSlide(index);
    });
});

let autoSlideInterval = setInterval(() => {
    if (appState.currentPageIndex === 6) {
        showSlide(appState.activeSlide + 1);
    }
}, 5500);

const slideshowSection = document.getElementById('page6');
slideshowSection.addEventListener('click', () => {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        if (appState.currentPageIndex === 6) {
            showSlide(appState.activeSlide + 1);
        }
    }, 5500);
});

// 7. Restart Button (Page 6 -> Page 2)
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', () => {
    playMagicChime();
    stopBirthdaySong();
    
    flame.classList.remove('hidden');
    smoke.classList.add('hidden');
    wishInstructions.innerHTML = `<span class="pulse-text">Click the candle flame!</span>`;
    cakeNavContainer.classList.add('hidden');
    
    giftBox.classList.remove('open');
    secretCard.classList.remove('show');
    secretCard.classList.add('hidden');
    
    balloonStartOverlay.classList.remove('fade-out');
    wishDisplay.classList.remove('show');
    wishDisplay.classList.add('hidden');
    const spawnedBalloons = balloonField.querySelectorAll('.balloon');
    spawnedBalloons.forEach(b => b.remove());
    
    showSlide(0);
    navigateToPage(2);
});

// 8. Sound System Controls (Mute / Unmute)
const musicToggle = document.getElementById('musicToggle');
const iconPlaying = musicToggle.querySelector('.music-icon.playing');
const iconMuted = musicToggle.querySelector('.music-icon.muted');

musicToggle.addEventListener('click', () => {
    appState.isMusicMuted = !appState.isMusicMuted;
    
    if (appState.isMusicMuted) {
        iconPlaying.classList.add('hidden');
        iconMuted.classList.remove('hidden');
        stopBirthdaySong();
    } else {
        iconPlaying.classList.remove('hidden');
        iconMuted.classList.add('hidden');
        getAudioContext();
        
        if (flame.classList.contains('hidden') && !appState.birthdaySongPlaying) {
            playHappyBirthdaySong();
        }
    }
});

// Start background animations
animateParticles();
