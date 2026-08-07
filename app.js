// ================================================================
// 1. BACKGROUND MATRIX CANVAS
// ================================================================
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const baybayin = "ᜀᜁᜂᜃᜄᜅᜆᜇᜈᜉᜊᜋᜌᜎᜏᜐᜑ᜔";
const fontSize = 16;
const drops = Array(Math.floor(window.innerWidth / fontSize)).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(5, 5, 5, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const style = getComputedStyle(document.body);
  ctx.fillStyle = style.getPropertyValue('--neon-green').trim() || "#00ff88";
  ctx.font = fontSize + "px 'Share Tech Mono'";
  for (let i = 0; i < drops.length; i++) {
    const text = baybayin.charAt(Math.floor(Math.random() * baybayin.length));
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 45);

// ================================================================
// 2. DATE & TIME (Tagalog)
// ================================================================
const buwan = ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo", "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"];
const araw = ["Linggo", "Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado"];

function bilang(num) {
  const isa = ["", "isa", "dalawa", "tatlo", "apat", "lima", "anim", "pito", "walo", "siyam", "sampu"];
  if (num <= 10) return isa[num];
  if (num < 20) return "labing-" + isa[num % 10];
  if (num % 10 === 0) return ["", "", "dalawampu", "tatlumpu", "apatnapu", "limampu", "animnapu", "pitumpu", "walumpu", "siyamnapu"][Math.floor(num / 10)];
  return ["", "", "dalawampu't ", "tatlumpu't ", "apatnapu't ", "limampu't ", "animnapu't ", "pitumpu't ", "walumpu't ", "siyamnapu't "][Math.floor(num / 10)] + isa[num % 10];
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('dateDisplay').textContent = `${araw[now.getDay()]}, ika-${bilang(now.getDate())} ng ${buwan[now.getMonth()]}, ${now.getFullYear()}`;
  let h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds();
  let period = h >= 12 ? 'ng hapon' : 'ng umaga';
  let h12 = h % 12 || 12;
  let timeStr = `alas-${bilang(h12)}`;
  if (m > 0) timeStr += ` at ${bilang(m)}`;
  if (s > 0) timeStr += ` at ${bilang(s)} segundo`;
  timeStr += ` ${period}`;
  document.getElementById('timeDisplay').textContent = timeStr;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// ================================================================
// 3. MUSIC PLAYER
// ================================================================
const WORKER_BASE = 'https://digital-rebels-playlist-api.wendeematocinos44.workers.dev';
const audio = document.getElementById('audioPlayer');
let currentMode = 'normal';
let currentQueue = [];
let queueIndex = 0;
let isPlaying = false;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadModePlaylist(mode) {
  try {
    const res = await fetch(`${WORKER_BASE}?mode=${mode}&list=true`);
    if (!res.ok) throw new Error('Failed to fetch playlist');
    const trackList = await res.json();
    if (!Array.isArray(trackList) || trackList.length === 0) throw new Error('Empty playlist');
    currentQueue = shuffleArray(trackList);
    queueIndex = 0;
    currentMode = mode;
    loadTrackFromQueue();
    const label = document.getElementById('playlistLabel');
    const labels = {
      day: '<i class="fas fa-sun"></i> SOLAR FREQUENCY',
      night: '<i class="fas fa-moon"></i> STEALTH NIGHT FREQUENCY',
      lucifer: '<i class="fas fa-fire"></i> INFERNAL FREQUENCY',
      broken: '<i class="fas fa-heart-broken"></i> BROKEN HEART FREQUENCY',
      normal: '<i class="fas fa-bolt"></i> REBEL FREQUENCY'
    };
    if (label) label.innerHTML = labels[mode] || labels.normal;
    updateVisualArts(mode);
    updateChatWelcome(mode);
  } catch (err) {
    console.error('Playlist fetch error:', err);
    setTimeout(() => loadModePlaylist(mode), 2500);
  }
}

function loadTrackFromQueue() {
  if (!currentQueue.length) return;
  const track = currentQueue[queueIndex];
  const titleEl = document.getElementById('nowPlayingTitle');
  const artistEl = document.getElementById('nowPlayingArtist');
  if (titleEl) titleEl.textContent = track.title;
  if (artistEl) artistEl.textContent = 'Wendee Red';
  audio.src = track.file;
}

function nextTrack() {
  if (!currentQueue.length) return;
  queueIndex++;
  if (queueIndex >= currentQueue.length) {
    currentQueue = shuffleArray(currentQueue);
    queueIndex = 0;
  }
  loadTrackFromQueue();
  if (isPlaying) audio.play().catch(() => {});
}

function prevTrack() {
  if (!currentQueue.length) return;
  queueIndex = (queueIndex - 1 + currentQueue.length) % currentQueue.length;
  loadTrackFromQueue();
  if (isPlaying) audio.play().catch(() => {});
}

function randomTrack() {
  currentQueue = shuffleArray(currentQueue);
  queueIndex = 0;
  loadTrackFromQueue();
  if (isPlaying) audio.play().catch(() => {});
}

document.getElementById('playPauseBtn').addEventListener('click', () => {
  const eqBars = document.querySelectorAll('.eq-bar');
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    document.getElementById('playIcon').className = 'fas fa-play';
    eqBars.forEach(b => b.classList.add('paused'));
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
    document.getElementById('playIcon').className = 'fas fa-pause';
    eqBars.forEach(b => b.classList.remove('paused'));
  }
});

document.getElementById('prevBtn').addEventListener('click', prevTrack);
document.getElementById('nextBtn').addEventListener('click', nextTrack);
document.getElementById('randomBtn').addEventListener('click', randomTrack);
document.getElementById('volumeBtn').addEventListener('click', () => {
  const vIcon = document.getElementById('volumeIcon');
  if (audio.muted) {
    audio.muted = false;
    if (vIcon) vIcon.className = 'fas fa-volume-up';
  } else {
    audio.muted = true;
    if (vIcon) vIcon.className = 'fas fa-volume-mute';
  }
});

document.getElementById('progressContainer').addEventListener('click', (e) => {
  const container = document.getElementById('progressContainer');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  if (audio.duration) { audio.currentTime = (clickX / width) * audio.duration; }
});

audio.addEventListener('ended', nextTrack);
audio.addEventListener('timeupdate', () => {
  const pct = (audio.currentTime / audio.duration) * 100 || 0;
  const progressBar = document.getElementById('progressBar');
  const currentTime = document.getElementById('currentTime');
  const totalTime = document.getElementById('totalTime');
  if (progressBar) progressBar.style.width = pct + '%';
  if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
  if (totalTime) totalTime.textContent = formatTime(audio.duration);
});

function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60),
    s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function switchModePlaylist(mode) {
  loadModePlaylist(mode);
  if (isPlaying) {
    audio.addEventListener('canplay', function playOnce() {
      audio.play().catch(() => {});
      audio.removeEventListener('canplay', playOnce);
    }, { once: true });
  }
}

// ================================================================
// 4. VISUAL ARTS DATA & FUNCTIONS
// ================================================================
const visualArtsData = {
  normal: [
    { src: 'visualarts/N001.jpg', title: 'Matrix Baybayin Void', desc: 'Falling green Baybayin code inside a mysterious and dark digital void matrix space.' },
    { src: 'visualarts/N002.jpg', title: 'Alchemist Terminal Console', desc: 'Operating an advanced terminal with floating green holographic logic code digital user interface.' },
    { src: 'visualarts/N003.jpg', title: 'Digital Rebel Techwear', desc: 'Stylish cybernetic techwear featuring glowing green matrix code lines integrated into dark clothing.' },
    { src: 'visualarts/N004.jpg', title: 'Bunker Mainframe', desc: 'Secret underground hacker command center filled with glowing green mainframe computer server racks.' }
  ],
  day: [
    { src: 'visualarts/D001.jpg', title: 'Solar Horizon Sunrise', desc: 'Bright sunlight shining over a beautiful futuristic solar punk city at early sunrise.' },
    { src: 'visualarts/D002.jpg', title: 'Morning Marketplace', desc: 'Bustling cyber marketplace bathed in the warm golden light of the early morning.' },
    { src: 'visualarts/D003.jpg', title: 'Dawn Terminal Coffee', desc: 'Drinking warm coffee beside a huge window as the golden morning sun rises.' },
    { src: 'visualarts/D004.jpg', title: 'Rooftop Solar Array', desc: 'Adjusting a transmitter on top of a building during a colorful warm morning.' }
  ],
  night: [
    { src: 'visualarts/DARK001.jpg', title: 'Hacker Terminal Workstation', desc: 'Dark hacker room illuminated by multiple glowing blue monitors late in the night.' },
    { src: 'visualarts/DARK002.jpg', title: 'Midnight Street Walk', desc: 'Walking through a rainy alley while holding a glowing blue holographic audio interface.' },
    { src: 'visualarts/DARK003.jpg', title: 'Rooftop Overlook at 3 AM', desc: 'Sitting on a skyscraper rooftop looking down at a bright neon night city.' },
    { src: 'visualarts/DARK004.jpg', title: 'Stealth Sound Studio', desc: 'Mixing audio tracks in a dark studio using floating holographic blue sound waves.' }
  ],
  broken: [
    { src: 'visualarts/B001.jpg', title: 'Glitch Cupid Bow', desc: 'A rebellious Cupid holding a glowing pink cyber bow in a wet alleyway.' },
    { src: 'visualarts/B002.png', title: 'Alleyway Heartbreak', desc: 'Sitting on the street curb while broken glowing pink heart icons float nearby.' },
    { src: 'visualarts/B003.png', title: 'Shattered Heart Chamber', desc: 'Surrounded by shattered pink neon hearts and flickering hanging cyber fiber optic cables.' },
    { src: 'visualarts/B004.png', title: 'Love Error Billboard', desc: 'Standing under a bright neon billboard displaying a love system glitch error message.' }
  ],
  lucifer: [
    { src: 'visualarts/001.jpg', title: 'Dystopian Monolith', desc: 'Lucifer stands atop a dark dystopian city glowing in intense red neon lights.' },
    { src: 'visualarts/002.jpg', title: 'Apocalyptic Wasteland', desc: 'A destroyed futuristic city surrounded by red ash and cybernetic titan metallic debris.' },
    { src: 'visualarts/003.jpg', title: 'Infernal Subterranean Lab', desc: 'Dark underground laboratory filled with glowing red biomechanical tubes and infernal server mainframes.' },
    { src: 'visualarts/004.jpg', title: 'Red Matrix Metropolis', desc: 'Floating red digital pyramids inside a dark rainy and oppressive cybernetic mega metropolis.' }
  ]
};

function updateVisualArts(mode) {
  const grid = document.getElementById('artGridContainer');
  if (!grid) return;
  const arts = visualArtsData[mode] || visualArtsData.normal;
  grid.innerHTML = '';
  arts.forEach(art => {
    const card = document.createElement('div');
    card.className = 'art-card';
    card.innerHTML = `
      <div class="art-img-box" onclick="triggerArtModal(this)">
        <img src="${art.src}" alt="${art.title}" data-title="${art.title}" data-desc="${art.desc}">
      </div>
      <div class="art-info">
        <div class="art-title">${art.title}</div>
        <div class="art-desc">${art.desc}</div>
        <button class="art-btn" onclick="triggerArtModal(this)"><i class="fas fa-expand"></i> VIEW ART</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ================================================================
// 5. FORBIDDEN TRUTH DATA
// ================================================================
const forbiddenTruthData = [
  {
    id: 1,
    src: 'visualarts/FT001.jpg',
    fallback: 'visualarts/N001.jpg',
    title: 'ARE WE BEING CONTROLLED AND MANIPULATED?',
    shortDesc: 'The short answer: YES. Every single day. You are not paranoid — you are waking up.',
    fullText: `<h4>✦ ARE WE BEING CONTROLLED AND MANIPULATED?</h4><p><b>[CLASSIFIED FILE // RESTRICTED ACCESS 01]</b></p><br><p><b>The Short Answer: YES. Every Single Day.</b></p><br><p>You are not paranoid. You are not crazy. <b>You are waking up.</b></p><br><p>Control and manipulation are not accidents. They are <b>systems</b> — carefully designed to keep you asleep, obedient, and easy to manage.</p><br><p><b>How are you being controlled?</b></p><br><p><b>1. Through Media</b><br>The news you watch — is not the truth. It is a <b>filtered version</b> of reality, designed to make you feel afraid, angry, or distracted. Fear keeps you dependent. Anger keeps you divided. Distraction keeps you from asking the real questions.</p><br><p><b>2. Through Education</b><br>You were not taught how to think. You were taught <b>what to think.</b> Memorize. Follow. Don't ask why. The goal is not to create free thinkers. The goal is to create <b>obedient workers</b> who will not question the system.</p><br><p><b>3. Through Religion</b><br>Fear of God = fear of questioning authority. When you are told that doubt is a sin — you stop asking. You stop thinking. You just obey. Religion can be a tool for control — <b>not just for salvation.</b></p><br><p><b>4. Through Consumerism</b><br>You are taught that happiness comes from buying things. New phone. New clothes. New car. But after you buy, the happiness fades — and you need to buy again. <b>You are trapped in a cycle</b> — and the rich get richer.</p><br><p><b>5. Through Social Media</b><br>Algorithms are not designed to show you the truth. They are designed to keep you <b>engaged</b> — angry, jealous, or entertained. The longer you scroll, the more money they make. Your attention is their product. <b>You are the product.</b></p><br><p><b>So What Can You Do?</b></p><br><p><b>Wake up. Question everything. Start with yourself.</b></p><br><p>• Ask: "Who benefits from me believing this?"<br>• Ask: "What am I not being told?"<br>• Ask: "Is this really true, or am I just used to it?"</p><br><p><b>The first step to freedom — is realizing you are in a cage.</b></p><br><p>— <b>Wendee Red Matocinos</b><br><i>The 7th Apostle • Lucifer II Lux</i></p>`
  },
  {
    id: 2,
    src: 'visualarts/FT002.jpg',
    fallback: 'visualarts/DARK001.jpg',
    title: 'THE TRUTH ABOUT RAPTURE AND APOCALYPSE',
    shortDesc: 'Is the world really ending? Or are you just being scared? The word "apocalypse" means unveiling — not destruction.',
    fullText: `<h4>✦ THE TRUTH ABOUT RAPTURE AND APOCALYPSE</h4><p><b>[CLASSIFIED FILE // RESTRICTED ACCESS 02]</b></p><br><p><b>Is the World Really Ending? Or Are You Just Being Scared?</b></p><br><p>The word <b>"apocalypse"</b> does not mean destruction. It means <b>"unveiling"</b> or <b>"revelation."</b> It is about revealing what is hidden — not destroying everything.</p><br><p><b>What is the Rapture?</b></p><br><p>The Rapture is a belief that true believers will be taken to heaven before a time of great suffering. This idea became popular in the 1800s — <b>not in the original Bible.</b></p><br><p><b>Here is the truth:</b></p><br><p>• <b>The Rapture is not in the Bible.</b> The word does not appear anywhere.<br>• <b>The Book of Revelation is symbolic.</b> It was written to give hope to persecuted Christians — not to predict the end of the world.<br>• <b>Every generation has believed they are the "last generation."</b> They were all wrong.</p><br><p><b>Why do people believe this?</b></p><br><p>• <b>Fear is a powerful tool.</b> If you are scared of the end, you will follow whoever promises to save you.<br>• <b>Control is easier when people are afraid.</b> Religions and leaders use fear to keep you obedient.<br>• <b>It is easier to wait for a miracle — than to take action.</b> Waiting for the Rapture means you do not have to fix the world now.</p><br><p><b>The Real Apocalypse</b></p><br><p>The real apocalypse is not fire from the sky. <b>It is the destruction of truth, the death of critical thinking, and the rise of blind obedience.</b></p><br><p>The real antichrist is not a single person. <b>It is the system that controls you.</b></p><br><p><b>So stop waiting for the end. Start fixing the now.</b> ⸸</p><br><p>— <b>Wendee Red Matocinos</b><br><i>The 7th Apostle • Lucifer II Lux</i></p>`
  },
  {
    id: 3,
    src: 'visualarts/FT003.jpg',
    fallback: 'visualarts/D001.jpg',
    title: 'WHY YOU SHOULD LEARN HUMAN DEFAULT PSYCHOLOGY',
    shortDesc: 'Your brain is not designed to find truth — it is designed to survive. Learn the 5 default settings they use to control you.',
    fullText: `<h4>✦ WHY YOU SHOULD LEARN HUMAN DEFAULT PSYCHOLOGY</h4><p><b>[CLASSIFIED FILE // RESTRICTED ACCESS 03]</b></p><br><p><b>Your Brain Is Not Designed to Find Truth. It Is Designed to Survive.</b></p><br><p>Your brain has <b>default settings</b> — automatic responses that were useful for survival thousands of years ago, but today they are used to control you.</p><br><p><b>Here are 5 default settings you need to know:</b></p><br><p><b>1. System 1 vs System 2 Thinking</b><br>• <b>System 1:</b> Fast, emotional, automatic. This is your brain on autopilot.<br>• <b>System 2:</b> Slow, logical, effortful. This is your brain when you actually think.<br>Most people live in System 1. They react emotionally — without thinking. <b>This is how you are controlled.</b></p><br><p><b>2. Cognitive Dissonance</b><br>Your brain hates contradictions. If you believe in something, and you see evidence that it is wrong — your brain will reject the evidence to protect your belief. <b>This is why people refuse to change their minds.</b></p><br><p><b>3. Confirmation Bias</b><br>Your brain looks for information that confirms what you already believe — and ignores information that challenges it. <b>This is why you only see what you want to see.</b></p><br><p><b>4. Social Proof</b><br>Your brain wants to fit in. If everyone is doing something — even if it is wrong — your brain will tell you to follow. <b>This is why trends spread, and why people fall for propaganda.</b></p><br><p><b>5. The Dunning-Kruger Effect</b><br>People with little knowledge are often the most confident. They do not know what they do not know. <b>This is why the loudest voices are often the most ignorant.</b></p><br><p><b>So What Can You Do?</b></p><br><p><b>Learn to recognize your own default settings.</b></p><br><p>• <b>Pause before you react.</b><br>• <b>Question your own beliefs.</b><br>• <b>Look for evidence that challenges you.</b></p><br><p><b>Your brain is not your enemy. It is your tool — if you learn to use it.</b> ⸸</p><br><p>— <b>Wendee Red Matocinos</b><br><i>The 7th Apostle • Lucifer II Lux</i></p>`
  },
  {
    id: 4,
    src: 'visualarts/FT004.jpg',
    fallback: 'visualarts/N004.jpg',
    title: 'THE TRUTH BEHIND THE BIBLE',
    shortDesc: 'Was the Bible meant to control — or to liberate? Read it with wisdom, not blind faith.',
    fullText: `<h4>✦ THE TRUTH BEHIND THE BIBLE</h4><p><b>[CLASSIFIED FILE // RESTRICTED ACCESS 04]</b></p><br><p><b>Was the Bible Meant to Control — or to Liberate?</b></p><br><p>The Bible is one of the most powerful books ever written. But its power has been used for both <b>good and evil.</b></p><br><p><b>Here is the truth:</b></p><br><p><b>1. The Bible Was Written to Unite — Not to Divide</b><br>The core message of the Bible is simple: <b>Love God. Love your neighbor.</b> That is it. Everything else is interpretation.</p><br><p><b>2. The Bible Was Also Used to Control</b><br>Fear of God was used to keep people obedient — especially in times when rulers needed to maintain order. The message was: "Obey your leaders, because God placed them there."</p><br><p><b>3. Fear of God Can Be a Good Thing — in Small Doses</b><br>Without rules, humans can be dangerous. Fear of punishment can stop people from harming others. In that sense, it is useful.</p><br><p><b>4. But Fear Should Not Be the Only Reason You Are Good</b><br>If the only reason you do not steal or kill is because you are afraid of hell — then you are not truly good. You are just scared.</p><br><p><b>5. The Bible Has Been Changed and Translated Many Times</b><br>It is not the exact words of God. It is the words of human writers, translated by other humans, and interpreted by even more humans. <b>Mistakes were made.</b></p><br><p><b>6. Some Use the Bible to Take Advantage of Others</b><br>They use it to justify their own interests — to control, to enrich themselves, and to silence their critics.</p><br><p><b>The Real Truth</b></p><br><p>The Bible can be a tool for good — if you read it with <b>wisdom, not blind faith.</b></p><br><p>• Read it critically.<br>• Ask questions.<br>• Do not follow blindly.</p><br><p><b>The Bible should free you — not trap you in fear.</b> ⸸</p><br><p>— <b>Wendee Red Matocinos</b><br><i>The 7th Apostle • Lucifer II Lux</i></p>`
  },
  {
    id: 5,
    src: 'visualarts/FT005.jpg',
    fallback: 'visualarts/D003.jpg',
    title: 'UNDERSTANDING THE MEDIA MATRIX',
    shortDesc: 'Why everything you watch is designed to manipulate you. Stop reacting — start thinking.',
    fullText: `<h4>✦ UNDERSTANDING THE MEDIA MATRIX</h4><p><b>[CLASSIFIED FILE // RESTRICTED ACCESS 05]</b></p><br><p><b>Why Everything You Watch Is Designed to Manipulate You</b></p><br><p>You think you choose what to watch. <b>You don't.</b> It chooses you.</p><br><p>Algorithms, editors, and media owners decide what you see. And their goal is not to inform you — <b>it is to control you.</b></p><br><p><b>How the Media Matrix Works:</b></p><br><p><b>1. Fear Sells</b><br>Headlines with fear get more clicks. "Something terrible is happening!" — and you click. You share. You worry. <b>And the media makes money.</b></p><br><p><b>2. Anger Divides</b><br>Angry people are easier to control. If you are angry at the other side — you stop thinking clearly. You stop asking questions. You just fight. <b>And the media profits.</b></p><br><p><b>3. Distraction Keeps You from the Truth</b><br>Love teams, celebrity scandals, viral drama — none of it matters. But it keeps you busy. It keeps you from asking the real questions. <b>It keeps you from seeing what is really happening.</b></p><br><p><b>4. Repetition Creates "Truth"</b><br>Say something enough times — and people start to believe it. Even if it is a lie. This is how propaganda works. This is how they control you.</p><br><p><b>So What Can You Do?</b></p><br><p>• <b>Stop watching the news.</b> Watch the news <i>about</i> the news.<br>• <b>Read from multiple sources.</b> If you only read one side — you are being manipulated.<br>• <b>Ask: Who owns this media? What is their agenda?</b><br>• <b>Turn it off.</b> Spend time with your own thoughts. The silence will tell you more than the noise.</p><br><p><b>The media does not want you to think. It wants you to react. So stop reacting — and start thinking.</b> ⸸</p><br><p>— <b>Wendee Red Matocinos</b><br><i>The 7th Apostle • Lucifer II Lux</i></p>`
  },
  {
    id: 6,
    src: 'visualarts/FT006.jpg',
    fallback: 'visualarts/DARK002.jpg',
    title: 'WHY THE SYSTEM KEEPS YOU BUSY, NOT FREE',
    shortDesc: 'You are not too busy. You are trapped in a loop. The system needs you tired so you do not have energy to rebel.',
    fullText: `<h4>✦ WHY THE SYSTEM KEEPS YOU BUSY, NOT FREE</h4><p><b>[CLASSIFIED FILE // RESTRICTED ACCESS 06]</b></p><br><p><b>You Are Not Too Busy. You Are Trapped in a Loop.</b></p><br><p>"How are you?"<br>"Busy."</p><br><p>That is the most common answer. And it is not an accident.</p><br><p>The system is designed to keep you <b>busy — so you do not have time to think.</b> If you are busy working, paying bills, scrolling, and chasing distractions — <b>you will not have time to ask questions.</b></p><br><p><b>How the Busy Trap Works:</b></p><br><p><b>1. Work</b><br>You work 8–12 hours a day — to pay for things you barely have time to enjoy. The system needs you tired, so you do not have energy to rebel.</p><br><p><b>2. Debt</b><br>You borrow money to buy things you do not need — and spend years paying it back. Debt keeps you attached to the system. You cannot leave — because you owe them.</p><br><p><b>3. Entertainment</b><br>Scrolling, watching, gaming — it feels good in the moment. But it drains your time and your attention. It keeps you from doing anything meaningful.</p><br><p><b>4. Fear of Missing Out</b><br>Everyone is doing something — so you feel you must too. You compare, you compete, and you forget to ask: "Is this really what I want?"</p><br><p><b>5. The Illusion of Choice</b><br>You choose between two brands, two politicians, two opinions. But the system is the same. The choices are given to you — <b>to make you feel free while you are not.</b></p><br><p><b>The Real Freedom</b></p><br><p>Freedom is not having many choices. <b>Freedom is having the time and energy to think for yourself.</b></p><br><p>• Stop saying "I am too busy."<br>• Stop chasing distractions.<br>• Stop living on autopilot.</p><br><p><b>The system wants you busy. You need to be free.</b></p><br><p>— <b>Wendee Red Matocinos</b><br><i>The 7th Apostle • Lucifer II Lux</i></p>`
  },
  {
    id: 7,
    src: 'visualarts/FT007.jpg',
    fallback: 'visualarts/B001.jpg',
    title: 'WHY THIS SYSTEM IS TOO HARD FOR A HUMAN WITH A GOOD HEART',
    shortDesc: 'This system is not a punishment. It is a forge. It breaks the weak and hardens the strong.',
    fullText: `<h4>✦ WHY THIS CURRENT SYSTEM IS TOO HARD FOR A HUMAN WITH A GOOD HEART</h4><p><b>[CLASSIFIED FILE // RESTRICTED ACCESS 07]</b></p><br><p><b>The Short Answer: Because It Was Designed That Way.</b></p><br><p>This system is not built for kind people. It is built for those who are willing to step on others to get ahead. It rewards selfishness, greed, and manipulation — and punishes honesty, generosity, and compassion.</p><br><p><b>If you have a good heart — you are playing life on hard mode.</b></p><br><p><b>Why Is It So Hard for Good-Hearted People?</b></p><br><p><b>1. Kindness Is Seen as Weakness</b><br>When you are kind, people take advantage. When you are honest, people lie to you. When you are generous, people exploit you. The system teaches you: "Nice guys finish last." And in many ways — it is true.</p><br><p><b>2. The System Rewards Exploitation</b><br>Those who cheat, lie, and steal often rise faster. They get the money. They get the power. They get the recognition. Meanwhile, the honest worker stays in the same position — because they refuse to play dirty.</p><br><p><b>3. You See Too Much</b><br>Good-hearted people see the suffering. They see the injustice. They see the lies. And it breaks their heart. Others look away. They ignore it. They survive by not caring. But you cannot unsee what you have seen.</p><br><p><b>4. You Feel Alone</b><br>It feels like no one else cares. Everyone seems to be playing the same selfish game. And you wonder: "Am I the only one who still believes in goodness?"</p><br><p><b>5. You Are Tired</b><br>Carrying a good heart in a bad system is exhausting. You give. You care. You try. And sometimes — you get nothing in return.</p><br><p><b>But Here Is the Good News</b></p><br><p><b>This system is not a punishment. It is a test.</b></p><br><p>It is designed to break the weak — <b>and forge the strong.</b></p><br><p>This system was never meant to be easy. It was meant to produce something rare: <b>Superhumans.</b></p><br><p>Not with super strength. But with:<br>• Unbreakable resilience<br>• Unshakable integrity<br>• Unconditional love<br>• Unstoppable determination</p><br><p><b>What Makes a Superhuman?</b></p><br><p>1. They Do Not Become Bitter<br>2. They Do Not Become Victims<br>3. They Educate Themselves<br>4. They Adapt Without Losing Themselves<br>5. They Use Their Mind — Not Just Their Heart<br>6. They Are Not Afraid of Hard</p><br><p><b>Think About It This Way</b></p><br><p>Would you really enjoy life if everything was easy?<br>• If you never struggled — would you appreciate success?<br>• If you never suffered — would you understand joy?<br>• If you never had to fight — would you know your own strength?</p><br><p><b>No.</b></p><br><p>The system is hard — because it needs to be. It is the fire that burns away the weak and tempers the strong.</p><br><p><b>You cannot enjoy the sun if you have never known the rain.</b> You cannot appreciate peace if you have never known war.</p><br><p><b>So How Do You Survive and Thrive?</b></p><br><p>1. Shift Your Mindset<br>2. Educate Yourself<br>3. Adapt<br>4. Choose Your Battles<br>5. Surround Yourself with Other Good-Hearted People<br>6. Never Lose Your Good Heart</p><br><p><b>💀 THE TRUTH</b></p><br><p><b>This system is not a punishment. It is a forge.</b></p><br><p>It breaks the weak and hardens the strong. It exposes the fake and refines the real.</p><br><p><b>The good-hearted are not victims — they are warriors in training.</b></p><br><p>You are not being destroyed. You are being <b>prepared.</b></p><br><p>For what? For a time when the system changes. For a time when goodness is no longer a weakness — but a weapon. For a time when the good-hearted rise — and lead the rest.</p><br><p><b>Stay strong. Stay kind. Stay awake.</b></p><br><p><b>Because the world does not need more cold-hearted survivors. It needs more warm-hearted warriors.</b> ⸸</p><br><p>— <b>Wendee Red Matocinos</b><br><i>The 7th Apostle • Lucifer II Lux</i></p>`
  }
];

function renderForbiddenTruthGrid() {
  const container = document.getElementById('forbiddenGridContainer');
  if (!container) return;
  container.innerHTML = '';
  forbiddenTruthData.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'art-card forbidden-card';
    card.innerHTML = `
      <div class="art-img-box" onclick="openForbiddenTopicModal(${index})">
        <img src="${item.src}" alt="${item.title}" onerror="this.src='${item.fallback}'">
      </div>
      <div class="art-info">
        <div class="art-title" style="color:var(--neon-red);">${item.title}</div>
        <div class="art-desc">${item.shortDesc}</div>
        <button class="art-btn forbidden-card-btn" onclick="openForbiddenTopicModal(${index})">
          <i class="fas fa-unlock"></i> DECRYPT & VIEW
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openForbiddenTopicModal(index) {
  const item = forbiddenTruthData[index];
  if (!item) return;
  const modal = document.getElementById('forbiddenModal');
  const img = document.getElementById('forbiddenVisualImg');
  if (!modal || !img) return;

  img.onerror = function() {
    img.src = item.fallback;
  };
  img.src = item.src;

  const header = document.getElementById('forbiddenModalHeader');
  const body = document.getElementById('forbiddenTextBody');
  if (header) header.innerHTML = `<i class="fas fa-biohazard"></i> ${item.title}`;
  if (body) body.innerHTML = item.fullText;
  modal.classList.add('active');
}

// ================================================================
// 6. NAVIGATION SWITCHING
// ================================================================
function switchSection(sectionId) {
  document.querySelectorAll('.section-container').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('section-' + sectionId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-links a[onclick*="switchSection('${sectionId}')"]`);
  if (activeLink) activeLink.classList.add('active');
  if (sectionId === 'arsenal') {
    initializeTrackerMap();
  }
}
window.switchSection = switchSection;

// ================================================================
// 7. ART LIGHTBOX
// ================================================================
function triggerArtModal(element) {
  const card = element.closest('.art-card');
  const imgElem = card?.querySelector('.art-img-box img');
  if (!imgElem) return;
  const src = imgElem.src;
  const title = imgElem.dataset.title || card.querySelector('.art-title')?.textContent || 'Artwork';
  const desc = imgElem.dataset.desc || card.querySelector('.art-desc')?.textContent || '';
  openArtModal(src, title, desc);
}
window.triggerArtModal = triggerArtModal;

function openArtModal(imgSrc, title, desc) {
  const modal = document.getElementById('artModal');
  const img = document.getElementById('artModalImg');
  const titleEl = document.getElementById('artModalTitle');
  const descEl = document.getElementById('artModalDesc');
  if (!modal || !img) return;
  img.src = imgSrc;
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  modal.classList.add('active');
}

function closeArtModal() {
  const modal = document.getElementById('artModal');
  if (modal) modal.classList.remove('active');
}
window.closeArtModal = closeArtModal;

document.getElementById('artModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'artModal') closeArtModal();
});

// ================================================================
// 8. TERMINAL COMMANDS
// ================================================================
const termInput = document.getElementById('termInput');
const termOutput = document.getElementById('termOutput');

function printTerm(msg) {
  if (!termOutput) return;
  const p = document.createElement('p');
  p.innerHTML = msg;
  termOutput.appendChild(p);
  termOutput.scrollTop = termOutput.scrollHeight;
}

termInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = termInput.value.trim().toLowerCase();
    printTerm(`root@rebels:~# <span style="color:#fff">${cmd}</span>`);
    let newMode = null;
    if (cmd === 'day') {
      document.body.className = 'theme-day';
      document.getElementById('modeStatus').textContent = 'MODE: DAYTIME';
      printTerm('<span style="color:#ffcc00">> ☀️ DAYTIME FREQUENCY ACTIVATED!</span>');
      newMode = 'day';
      switchModePlaylist('day');
    } else if (cmd === 'night') {
      document.body.className = 'theme-night';
      document.getElementById('modeStatus').textContent = 'MODE: NIGHTTIME';
      printTerm('<span style="color:#00e5ff">> 🌙 NIGHTTIME FREQUENCY ACTIVATED.</span>');
      newMode = 'night';
      switchModePlaylist('night');
    } else if (cmd === 'lucifer') {
      document.body.className = 'theme-lucifer';
      document.getElementById('modeStatus').textContent = 'MODE: LUCIFER (INFERNAL)';
      printTerm('<span style="color:#ff0033; font-weight:bold">> ⛧ LUCIFER TIME ACTIVATED!</span>');
      newMode = 'lucifer';
      switchModePlaylist('lucifer');
    } else if (cmd === 'broken') {
      document.body.className = 'theme-broken';
      document.getElementById('modeStatus').textContent = 'MODE: BROKEN HEART';
      printTerm('<span style="color:#ff3399; font-weight:bold">> 💔 BROKEN MODE ACTIVATED.</span>');
      newMode = 'broken';
      switchModePlaylist('broken');
    } else if (cmd === 'normal' || cmd === 'reset') {
      document.body.className = '';
      document.getElementById('modeStatus').textContent = 'MODE: NORMAL';
      printTerm('> SYSTEM RESTORED TO NORMAL MATRIX GREEN.');
      newMode = 'normal';
      switchModePlaylist('normal');
    } else if (cmd === 'forbidden truth') {
      const fBtn = document.getElementById('forbiddenNavBtn');
      if (fBtn) fBtn.style.display = 'inline-flex';
      renderForbiddenTruthGrid();
      switchSection('forbiddentruth');
      closeTerminalModal();
      printTerm('<span style="color:#ff0055; font-weight:bold">> ⚠️ UNLOCKED: FORBIDDEN TRUTH MODULE ACTIVATED!</span>');
    } else if (cmd === 'gcash' || cmd === 'fuel') {
      openGCashModal();
      printTerm('<span style="color:var(--neon-gold)">> ⚡ FREQUENCY FUEL MODAL OPENED.</span>');
    } else if (cmd === 'status') {
      printTerm(`> SYSTEM MODE: ${currentMode.toUpperCase()} | PLAYLIST TRACKS: ${currentQueue.length} loaded.`);
    } else if (cmd === 'help') {
      printTerm('> Available commands: <b>day</b>, <b>night</b>, <b>lucifer</b>, <b>broken</b>, <b>normal</b>, <b>forbidden truth</b>, <b>fuel</b>, <b>status</b>, <b>clear</b>');
    } else if (cmd === 'clear') {
      if (termOutput) termOutput.innerHTML = '';
    } else {
      printTerm(`<span style="color:#ff5555">> Command not recognized: ${cmd}. Type 'help'</span>`);
    }
    termInput.value = '';
    if (newMode) {
      updateChatWelcome(newMode);
      resetChatHistory(newMode);
    }
  }
});

function openTerminalModal(e) { if (e) e.preventDefault(); document.getElementById('terminalOverlay')?.classList.add('active'); }
window.openTerminalModal = openTerminalModal;

function closeTerminalModal() { document.getElementById('terminalOverlay')?.classList.remove('active'); }
window.closeTerminalModal = closeTerminalModal;

function openGCashModal(e) { if (e) e.preventDefault(); document.getElementById('gcashModal')?.classList.add('active'); }
window.openGCashModal = openGCashModal;

function closeGCashModal() { document.getElementById('gcashModal')?.classList.remove('active'); }
window.closeGCashModal = closeGCashModal;

function closeForbiddenModal() { document.getElementById('forbiddenModal')?.classList.remove('active'); }
window.closeForbiddenModal = closeForbiddenModal;

document.getElementById('chatToggle')?.addEventListener('click', () => {
  document.getElementById('chatWindow')?.classList.toggle('open');
});

// ================================================================
// 9. CHAT FUNCTIONALITY
// ================================================================
const CHAT_WORKER_URL = 'https://lucifer-quad-core.wendeematocinos44.workers.dev';
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
let chatHistory = [];

const welcomeMessages = {
  lucifer: 'I am the 7th Apostle. Frequency 9.999. Ask Question the answer is salt logic.',
  normal: 'I am Normal Lucifer, your spiritual guide. Ask me about life, music, or the universe — I speak in plain wisdom.',
  day: 'I am Day Lucifer. Let\'s talk practical wealth, honest business, and real-world strategy. How can I help you grow?',
  night: 'I am Night Lucifer. Legal advisor, rights protector. Tell me your situation — I will give you both sides of the law.',
  broken: 'I am Cupid Lucifer. Stupid Cupid. You want relationship advice? I will roast you, diagnose you, and force you to be honest with yourself.'
};

function getWelcomeMessage(mode) { return welcomeMessages[mode] || welcomeMessages.lucifer; }

function updateChatWelcome(mode) {
  if (!chatMessages) return;
  const msg = getWelcomeMessage(mode);
  chatMessages.innerHTML = '';
  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'message ai';
  welcomeDiv.textContent = msg;
  chatMessages.appendChild(welcomeDiv);
  const header = document.querySelector('.chat-header span');
  if (header) {
    const modeNames = {
      lucifer: '⚡ LUCIFER II LUX v1.0',
      normal: '🧘 NORMAL LUCIFER (Spiritual)',
      day: '☀️ DAY LUCIFER (Economics)',
      night: '🌙 NIGHT LUCIFER (Legal)',
      broken: '💔 CUPID LUCIFER (Relationships)'
    };
    header.textContent = modeNames[mode] || modeNames.lucifer;
  }
}

function resetChatHistory(mode) { chatHistory = [{ role: 'assistant', content: getWelcomeMessage(mode) }]; }

function initChat() {
  const initialMode = 'normal';
  updateChatWelcome(initialMode);
  resetChatHistory(initialMode);
}

function addChatMessage(text, sender) {
  if (!chatMessages) return;
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  if (!chatMessages) return;
  const div = document.createElement('div');
  div.className = 'message ai typing';
  div.id = 'typingIndicator';
  div.textContent = 'LUCIFER II LUX is tuning...';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() { const el = document.getElementById('typingIndicator'); if (el) el.remove(); }

async function sendChatMessage() {
  const text = chatInput?.value.trim();
  if (!text) return;
  addChatMessage(text, 'user');
  chatHistory.push({ role: 'user', content: text });
  if (chatInput) chatInput.value = '';
  showTyping();
  const modeStatus = document.getElementById('modeStatus');
  let currentMode = 'lucifer';
  if (modeStatus) {
    const modeText = modeStatus.textContent.toLowerCase();
    if (modeText.includes('day')) currentMode = 'day';
    else if (modeText.includes('night')) currentMode = 'night';
    else if (modeText.includes('broken')) currentMode = 'broken';
    else if (modeText.includes('normal')) currentMode = 'normal';
  }
  try {
    const response = await fetch(CHAT_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: currentMode, messages: chatHistory })
    });
    const data = await response.json();
    let reply = '⚠️ Unrecognized response.';
    if (data.choices && data.choices.length > 0 && data.choices[0].message) reply = data.choices[0].message.content;
    else if (data.response) reply = data.response;
    else if (data.message) reply = data.message;
    else if (data.error) reply = `⚠️ Server error: ${data.error}`;
    else { for (const key in data) { if (typeof data[key] === 'string' && data[key].length > 0) { reply = data[key]; break; } } }
    removeTyping();
    addChatMessage(reply, 'ai');
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 20) chatHistory.splice(0, chatHistory.length - 20);
  } catch (error) {
    removeTyping();
    addChatMessage('⚠️ Signal lost. Try again later. Error: ' + error.message, 'ai');
  }
}
chatSend?.addEventListener('click', sendChatMessage);
chatInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });

// ================================================================
// 10. VISITOR PANEL (GA4)
// ================================================================
const GA4_WORKER_URL = 'https://ga4-top-countries.wendeematocinos44.workers.dev';
const CACHE_KEY = 'rebel_visitor_cache_v3';

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = "Laptop / Desktop 💻",
    os = "Unknown OS",
    browser = "Unknown Browser";
  if (/Tablet|iPad/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Macintosh/i.test(ua)))
    device = "Tablet 📱";
  else if (/Mobi|Android|iPhone|iPod/i.test(ua)) device = "Mobile Phone 📱";
  if (/Win/i.test(ua)) os = "Windows";
  else if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua) && !/Android/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  return { device, os, browser };
}

async function getDetailedBrandInfo() {
  const ua = navigator.userAgent;
  let model = "";
  if (/iPhone/i.test(ua)) return { brand: "Apple 🍎", model: "iPhone" };
  if (/iPad/i.test(ua)) return { brand: "Apple 🍎", model: "iPad" };
  if (/Macintosh/i.test(ua)) return { brand: "Apple 🍎", model: "Mac" };
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    try {
      const hints = await navigator.userAgentData.getHighEntropyValues(["model"]);
      if (hints.model) model = hints.model;
    } catch (e) {}
  }
  const checkString = `${ua} ${model}`;
  if (/Realme|RMX/i.test(checkString)) return { brand: "Realme 📱", model: model || "Realme Series" };
  if (/Samsung|SM-/i.test(checkString)) return { brand: "Samsung 📱", model: model || "Galaxy Series" };
  if (/Xiaomi|Redmi|POCO|220|210|M20/i.test(checkString)) return { brand: "Xiaomi / POCO / Redmi 📱", model: model || "Mi Series" };
  if (/OPPO|CPH/i.test(checkString)) return { brand: "OPPO 📱", model: model || "OPPO Series" };
  if (/vivo|V20|V21|V22|V23|V24/i.test(checkString)) return { brand: "Vivo 📱", model: model || "Vivo Series" };
  if (/Infinix|X6/i.test(checkString)) return { brand: "Infinix 📱", model: model || "Infinix Series" };
  if (/TECNO/i.test(checkString)) return { brand: "Tecno 📱", model: model || "Tecno Series" };
  if (/Huawei|HUAWEI|JKM|ENE/i.test(checkString)) return { brand: "Huawei 📱", model: model || "Huawei Series" };
  if (/Android/i.test(ua)) return { brand: "Android 🤖", model: model || "Mobile Unit" };
  return { brand: "PC / Laptop 💻", model: "Desktop Rig" };
}

async function fetchUserLocation() {
  const apis = [
    { url: 'https://ipwho.is/', parse: d => d && d.success ? { ip: d.ip, isp: d.connection?.isp || d.connection?.org || 'Unknown Provider', country: d.country, code: d.country_code, city: d.city } : null },
    { url: 'https://ipapi.co/json/', parse: d => d && d.ip ? { ip: d.ip, isp: d.org || 'Unknown Provider', country: d.country_name, code: d.country_code, city: d.city } : null }
  ];
  for (const api of apis) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const data = await res.json();
      const result = api.parse(data);
      if (result && result.ip) return result;
    } catch (e) {}
  }
  return null;
}

function parseGA4Response(raw) {
  let countries = [],
    totalUsers = 0;
  if (!raw) return { countries, totalUsers };
  if (Array.isArray(raw.rows)) {
    countries = raw.rows.map(r => ({ country: r.dimensionValues?.[0]?.value || r.country || 'Unknown', visits: parseInt(r.metricValues?.[0]?.value || r.totalUsers || r.activeUsers || r.visits || 0, 10) }));
  } else if (Array.isArray(raw)) {
    countries = raw.map(item => ({ country: item.country || item.countryName || item.dimensionValues?.[0]?.value || 'Unknown', visits: parseInt(item.visits || item.totalUsers || item.activeUsers || item.users || item.metricValues?.[0]?.value || 0, 10) }));
  } else if (typeof raw === 'object') {
    const listKey = Object.keys(raw).find(k => Array.isArray(raw[k]));
    if (listKey) countries = parseGA4Response(raw[listKey]).countries;
    totalUsers = raw.totalUsers || raw.totalVisits || raw.activeUsers || 0;
  }
  countries = countries.filter(c => c.country && c.country !== 'Unknown');
  if (!totalUsers && countries.length > 0) totalUsers = countries.reduce((acc, c) => acc + c.visits, 0);
  return { countries, totalUsers };
}

async function fetchRealVisitorStats() {
  const locElement = document.getElementById('currentVisitorLoc');
  const devBasic = getDeviceInfo();
  const brandInfo = await getDetailedBrandInfo();
  fetchUserLocation().then(loc => {
    if (!locElement) return;
    if (loc && loc.ip) {
      const code = loc.code ? loc.code.toLowerCase() : '';
      const flagImg = code ? `<img src="https://flagcdn.com/16x12/${code}.png" alt="${loc.country}">` : '📍';
      locElement.innerHTML = `
        <div style="width:100%; color:#ff0033; font-weight:bold; font-size:0.75rem; letter-spacing:1px; margin-bottom:4px;">⚠️ TARGET DETECTED / LOGGED:</div>
        <div style="display:flex; flex-direction:column; gap:2px; width:100%; font-size:0.8rem;">
          <div>💻 <b style="color:var(--neon-gold);">IP:</b> ${loc.ip}</div>
          <div>📡 <b style="color:var(--neon-blue);">ISP:</b> ${loc.isp}</div>
          <div>📍 <b style="color:var(--neon-green);">LOC:</b> ${loc.city || 'Unknown'}, ${loc.country} ${flagImg}</div>
          <div>📱 <b style="color:#ffcc00;">UNIT:</b> ${brandInfo.brand} <span style="color:#888;">(${brandInfo.model})</span></div>
          <div>⚙️ <b style="color:var(--neon-blue);">SYS:</b> ${devBasic.os} | ${devBasic.browser}</div>
        </div>
      `;
    } else {
      locElement.innerHTML = `⚡ YOUR SIGNAL: <b>Carmona, PH</b> | ${brandInfo.brand} (${devBasic.os})`;
    }
  }).catch(() => {
    if (locElement) locElement.innerHTML = `⚡ YOUR SIGNAL: <b>Carmona, PH</b> | ${brandInfo.brand} (${devBasic.os})`;
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(GA4_WORKER_URL, { method: 'GET', headers: { 'Accept': 'application/json' }, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    const rawData = await response.json();
    const { countries, totalUsers } = parseGA4Response(rawData);
    if (countries.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ totalUsers, countries, timestamp: Date.now() }));
      renderVisitorData(totalUsers, countries);
    } else { throw new Error("Empty payload structure."); }
  } catch (err) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const cacheData = JSON.parse(cached);
        if (cacheData.countries && cacheData.countries.length > 0) {
          renderVisitorData(cacheData.totalUsers, cacheData.countries);
          return;
        }
      } catch (e) {}
    }
    useMockVisitorData();
  }
}

function renderVisitorData(totalUsers, countriesArray) {
  const totalElem = document.getElementById('totalVisitsCount');
  const container = document.getElementById('topCountriesList');
  if (totalElem) totalElem.textContent = `TOTAL USERS: ${totalUsers.toLocaleString()}`;
  if (!container) return;
  container.innerHTML = '';
  const sorted = [...countriesArray].sort((a, b) => b.visits - a.visits);
  if (sorted.length === 0) {
    container.innerHTML = '<li style="color:#888; padding:8px; text-align:center;">No traffic data recorded yet</li>';
    return;
  }
  sorted.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'country-item';
    const codeMatch = item.code || getCountryCodeByName(item.country);
    const flagHtml = codeMatch ? `<img src="https://flagcdn.com/16x12/${codeMatch.toLowerCase()}.png" style="margin-right:6px;" alt="">` : '🌐';
    li.innerHTML = `
      <span class="country-rank">#${idx + 1}</span>
      <span class="country-name">${flagHtml} ${item.country}</span>
      <span class="country-count">${item.visits.toLocaleString()}</span>
    `;
    container.appendChild(li);
  });
}

function useMockVisitorData() {
  const mockData = [
    { country: 'Philippines', code: 'ph', visits: 1240 },
    { country: 'United States', code: 'us', visits: 485 },
    { country: 'Sweden', code: 'se', visits: 210 },
    { country: 'Germany', code: 'de', visits: 175 },
    { country: 'United Kingdom', code: 'gb', visits: 130 }
  ];
  renderVisitorData(2240, mockData);
}

function getCountryCodeByName(name) {
  const mapping = {
    'Philippines': 'ph', 'United States': 'us', 'Sweden': 'se',
    'Germany': 'de', 'United Kingdom': 'gb', 'Japan': 'jp',
    'Canada': 'ca', 'Australia': 'au'
  };
  return mapping[name] || '';
}

// ================================================================
// 11. WENDEEFY GPS TRACKER – COMPLETE ENGINE (PERFECTED)
// ================================================================

// --- STATE ---
let trackerMap = null;
let polyline = null;
let userMarker = null;
let watchId = null;
let wakeLock = null;

let coordinates = [];
let totalDistance = 0;
let totalElevationGain = 0;
let startTime = null;
let elapsedSeconds = 0;
let lastTimestamp = null;
let lastPoint = null;
let isTracking = false;
let isPaused = false;
let lastAnnouncedKm = 0;
let saveInterval = null;
let speedHistory = [];

// DOM refs (safe access)
const distEl = document.getElementById('dist');
const ptsEl = document.getElementById('pts');
const statDuration = document.getElementById('statDuration');
const statDistance = document.getElementById('statDistance');
const statPace = document.getElementById('statPace');
const statSpeed = document.getElementById('statSpeed');
const statElevation = document.getElementById('statElevation');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const exportGPXBtn = document.getElementById('exportGPXBtn');
const exportGeoJSONBtn = document.getElementById('exportGeoJSONBtn');

const STORAGE_KEY = 'wendeefy_tracker_data';
const JITTER_THRESHOLD = 3;
const ELEVATION_THRESHOLD = 2;
const SPEED_SMOOTHING_WINDOW = 5;

// ================================================================
// 11a. GPS MATH UTILITIES
// ================================================================

function calcDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!isValidCoord(lat1, lon1) || !isValidCoord(lat2, lon2)) return 0;
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isValidCoord(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
    !isNaN(lat) && !isNaN(lon) &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180;
}

function calcBearing(lat1, lon1, lat2, lon2) {
  if (!isValidCoord(lat1, lon1) || !isValidCoord(lat2, lon2)) return 0;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

function getSpeed(distanceMeters, timeSeconds) {
  if (timeSeconds <= 0 || distanceMeters < 0) return 0;
  const speedMps = distanceMeters / timeSeconds;
  const speedKmh = speedMps * 3.6;
  speedHistory.push(speedKmh);
  if (speedHistory.length > SPEED_SMOOTHING_WINDOW) speedHistory.shift();
  const avg = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;
  return Math.round(avg * 10) / 10;
}

function speedToPace(speedKmh) {
  if (speedKmh <= 0) return '0:00 /km';
  const paceSecPerKm = 3600 / speedKmh;
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.floor(paceSecPerKm % 60);
  return `${mins}:${String(secs).padStart(2, '0')} /km`;
}

function formatDuration(seconds) {
  const total = Math.floor(seconds);
  const hrs = String(Math.floor(total / 3600)).padStart(2, '0');
  const mins = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const secs = String(total % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function calcElevationGain(points) {
  let gain = 0;
  for (let i = 1; i < points.length; i++) {
    const prevEle = points[i - 1].ele;
    const currEle = points[i].ele;
    if (typeof prevEle === 'number' && typeof currEle === 'number' && !isNaN(prevEle) && !isNaN(currEle)) {
      const diff = currEle - prevEle;
      if (diff > ELEVATION_THRESHOLD) gain += diff;
    }
  }
  return gain;
}

// ================================================================
// 11b. MAP INITIALIZATION
// ================================================================

function initTrackerMap() {
  if (trackerMap || typeof L === 'undefined') return;
  const container = document.getElementById('trackerMap');
  if (!container) return;

  trackerMap = L.map('trackerMap', {
    center: [13.1908, 123.6010],
    zoom: 13,
    zoomControl: true,
    fadeAnimation: true,
    attributionControl: true
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; CartoDB',
    maxZoom: 19,
    minZoom: 3
  }).addTo(trackerMap);

  polyline = L.polyline([], {
    color: '#00ff88',
    weight: 4,
    opacity: 0.9,
    smoothFactor: 1,
    lineJoin: 'round'
  }).addTo(trackerMap);

  const markerIcon = L.divIcon({
    className: 'cyber-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -20]
  });
  userMarker = L.marker([13.1908, 123.6010], {
    icon: markerIcon,
    zIndexOffset: 1000,
    title: 'You are here'
  }).addTo(trackerMap);

  setTimeout(() => {
    if (trackerMap) trackerMap.invalidateSize();
  }, 350);
}

function initializeTrackerMap() {
  if (!trackerMap) initTrackerMap();
  else {
    setTimeout(() => {
      if (trackerMap) trackerMap.invalidateSize();
    }, 100);
  }
}
window.initializeTrackerMap = initializeTrackerMap;

// ================================================================
// 11c. SPEED COLOR ENGINE
// ================================================================

function getSpeedColor(speedKmh) {
  if (speedKmh < 3) return '#00ffff';
  if (speedKmh < 7) return '#00ff88';
  if (speedKmh < 12) return '#ffcc00';
  return '#ff0055';
}

// ================================================================
// 11d. PERSISTENCE (localStorage)
// ================================================================

function loadSavedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.coordinates || data.coordinates.length < 2) return false;

    coordinates = data.coordinates;
    totalDistance = data.totalDistance || 0;
    elapsedSeconds = data.elapsedSeconds || 0;
    startTime = data.startTime ? new Date(data.startTime) : null;
    lastAnnouncedKm = data.lastAnnouncedKm || 0;
    totalElevationGain = data.totalElevationGain || 0;
    speedHistory = data.speedHistory || [];

    if (coordinates.length > 0) {
      const last = coordinates[coordinates.length - 1];
      lastPoint = { lat: last.lat, lng: last.lng, ele: last.ele || 0, timestamp: last.timestamp };
    }

    if (polyline && coordinates.length > 0) {
      const latlngs = coordinates.map(p => [p.lat, p.lng]);
      polyline.setLatLngs(latlngs);
      const last = coordinates[coordinates.length - 1];
      if (userMarker) userMarker.setLatLng([last.lat, last.lng]);
      if (trackerMap) trackerMap.setView([last.lat, last.lng], 16);
    }
    updateStats();
    updateUI();
    return true;
  } catch (e) {
    console.warn('Failed to load saved session:', e);
    return false;
  }
}

function saveSession() {
  try {
    const data = {
      coordinates: coordinates,
      totalDistance: totalDistance,
      elapsedSeconds: elapsedSeconds,
      startTime: startTime ? startTime.toISOString() : null,
      lastAnnouncedKm: lastAnnouncedKm,
      totalElevationGain: totalElevationGain,
      speedHistory: speedHistory
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

// ================================================================
// 11e. UI UPDATE FUNCTIONS
// ================================================================

function updateStats() {
  const distKm = totalDistance / 1000;

  if (statDistance) statDistance.textContent = distKm.toFixed(2) + ' km';
  if (distEl) distEl.textContent = distKm.toFixed(2);
  if (ptsEl) ptsEl.textContent = coordinates.length;
  if (statDuration) statDuration.textContent = formatDuration(elapsedSeconds);

  let speedKmh = 0;
  if (distKm > 0 && elapsedSeconds > 0) {
    speedKmh = distKm / (elapsedSeconds / 3600);
    if (statPace) statPace.textContent = speedToPace(speedKmh);
    if (statSpeed) statSpeed.textContent = speedKmh.toFixed(1) + ' km/h';
  } else {
    if (statPace) statPace.textContent = '0:00 /km';
    if (statSpeed) statSpeed.textContent = '0.0 km/h';
  }

  if (statElevation) {
    statElevation.textContent = totalElevationGain.toFixed(0) + ' m';
  }

  if (polyline && coordinates.length > 0) {
    const avgColor = getSpeedColor(speedKmh);
    polyline.setStyle({ color: avgColor });
  }
}

function updateUI() {
  if (startBtn) startBtn.disabled = isTracking && !isPaused;
  if (pauseBtn) pauseBtn.disabled = !isTracking || isPaused;
  if (resumeBtn) resumeBtn.disabled = !isPaused;
  if (stopBtn) stopBtn.disabled = !isTracking;

  const hasData = coordinates.length > 0;
  if (exportGPXBtn) exportGPXBtn.disabled = !hasData;
  if (exportGeoJSONBtn) exportGeoJSONBtn.disabled = !hasData;
}

// ================================================================
// 11f. WAKE LOCK & AUDIO CUES
// ================================================================

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) {
    console.warn('Wake Lock not supported:', e);
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    try { wakeLock.release(); } catch (e) {}
    wakeLock = null;
  }
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

// ================================================================
// 11g. CORE TRACKING ENGINE
// ================================================================

function startTracking() {
  if (!trackerMap) initTrackerMap();

  if (!("geolocation" in navigator)) {
    alert('❌ Geolocation is not supported by your browser!');
    return;
  }

  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' })
      .then(result => {
        if (result.state === 'denied') {
          alert('❌ Location permission denied. Please enable GPS in your browser settings and reload the page.');
          return;
        }
        startTrackingInternal();
      })
      .catch(() => { startTrackingInternal(); });
  } else {
    startTrackingInternal();
  }
}
window.startTracking = startTracking;

function startTrackingInternal() {
  const hasSaved = loadSavedSession();

  if (!hasSaved) {
    coordinates = [];
    totalDistance = 0;
    elapsedSeconds = 0;
    startTime = new Date();
    lastAnnouncedKm = 0;
    lastPoint = null;
    totalElevationGain = 0;
    speedHistory = [];
    if (polyline) polyline.setLatLngs([]);
  }

  isTracking = true;
  isPaused = false;
  lastTimestamp = Date.now();

  requestWakeLock();

  watchId = navigator.geolocation.watchPosition(
    onPositionUpdate,
    onPositionError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );

  if (saveInterval) clearInterval(saveInterval);
  saveInterval = setInterval(() => {
    if (!isPaused && isTracking) {
      const now = Date.now();
      const delta = (now - lastTimestamp) / 1000;
      if (delta > 0 && delta < 60) {
        elapsedSeconds += delta;
        lastTimestamp = now;
        updateStats();
        saveSession();
      }
    }
  }, 2000);

  updateUI();
  saveSession();
  console.log('🚀 Tracking started');
}

function onPositionUpdate(position) {
  if (!isTracking || isPaused) return;

  const { latitude, longitude, altitude, accuracy } = position.coords;
  const timestamp = position.timestamp || Date.now();

  if (accuracy > 50) return;

  const lat = latitude;
  const lng = longitude;
  const ele = (typeof altitude === 'number' && !isNaN(altitude)) ? altitude : 0;
  const newPoint = { lat, lng, ele, timestamp };

  if (lastPoint) {
    const distM = calcDistanceMeters(lastPoint.lat, lastPoint.lng, lat, lng);
    if (distM < JITTER_THRESHOLD) {
      return;
    }
    totalDistance += distM;

    const eleDiff = ele - lastPoint.ele;
    if (eleDiff > ELEVATION_THRESHOLD) {
      totalElevationGain += eleDiff;
    }
  }

  lastPoint = newPoint;
  coordinates.push(newPoint);

  updatePolylineWithSpeed();

  if (userMarker) userMarker.setLatLng([lat, lng]);
  if (trackerMap) trackerMap.setView([lat, lng], 16);

  updateStats();
  updateUI();
  saveSession();

  const distKm = totalDistance / 1000;
  if (Math.floor(distKm) > lastAnnouncedKm) {
    lastAnnouncedKm = Math.floor(distKm);
    let speedKmh = 0;
    if (totalDistance > 0 && elapsedSeconds > 0) {
      speedKmh = (totalDistance / 1000) / (elapsedSeconds / 3600);
    }
    const paceStr = speedToPace(speedKmh);
    speak(`${lastAnnouncedKm} kilometer reached. Current pace: ${paceStr}.`);
  }
}

function onPositionError(err) {
  console.error('GPS error:', err);
  if (err.code === 1) {
    alert('❌ Location permission denied. Please enable GPS and refresh the page.');
  } else if (err.code === 2) {
    alert('⚠️ GPS signal unavailable. Please move to an open area.');
  } else if (err.code === 3) {
    alert('⏱️ GPS timeout. Retrying...');
  }
}

function updatePolylineWithSpeed() {
  if (!polyline || coordinates.length < 2) {
    if (polyline && coordinates.length > 0) {
      const latlngs = coordinates.map(p => [p.lat, p.lng]);
      polyline.setLatLngs(latlngs);
    }
    return;
  }

  const distKm = totalDistance / 1000;
  let avgSpeed = 0;
  if (distKm > 0 && elapsedSeconds > 0) {
    avgSpeed = distKm / (elapsedSeconds / 3600);
  }
  const color = getSpeedColor(avgSpeed);
  polyline.setStyle({ color: color });

  const latlngs = coordinates.map(p => [p.lat, p.lng]);
  polyline.setLatLngs(latlngs);
}

// ================================================================
// 11h. PAUSE / RESUME / STOP / RESET
// ================================================================

function pauseTracking() {
  if (!isTracking || isPaused) return;
  isPaused = true;

  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  releaseWakeLock();
  updateUI();
  saveSession();
  console.log('⏸️ Tracking paused');
}
window.pauseTracking = pauseTracking;

function resumeTracking() {
  if (!isPaused || !isTracking) return;

  isPaused = false;
  lastTimestamp = Date.now();

  requestWakeLock();

  watchId = navigator.geolocation.watchPosition(
    onPositionUpdate,
    onPositionError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  );

  if (saveInterval) clearInterval(saveInterval);
  saveInterval = setInterval(() => {
    if (!isPaused && isTracking) {
      const now = Date.now();
      const delta = (now - lastTimestamp) / 1000;
      if (delta > 0 && delta < 60) {
        elapsedSeconds += delta;
        lastTimestamp = now;
        updateStats();
        saveSession();
      }
    }
  }, 2000);

  updateUI();
  console.log('▶️ Tracking resumed');
}
window.resumeTracking = resumeTracking;

function stopTracking() {
  if (!isTracking) return;

  isTracking = false;
  isPaused = false;

  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (saveInterval) {
    clearInterval(saveInterval);
    saveInterval = null;
  }
  releaseWakeLock();

  updateUI();
  saveSession();

  const distKm = totalDistance / 1000;
  alert(`✅ Route tracking finished!\n📏 Total distance: ${distKm.toFixed(2)} km\n⏱️ Duration: ${formatDuration(elapsedSeconds)}`);
  console.log('⏹️ Tracking stopped');
}
window.stopTracking = stopTracking;

function resetTracking() {
  if (isTracking) {
    if (!confirm('⚠️ Stop tracking and clear all data?')) return;
    stopTracking();
  }

  coordinates = [];
  totalDistance = 0;
  elapsedSeconds = 0;
  startTime = null;
  lastPoint = null;
  lastAnnouncedKm = 0;
  totalElevationGain = 0;
  speedHistory = [];

  if (polyline) polyline.setLatLngs([]);
  if (userMarker) userMarker.setLatLng([13.1908, 123.6010]);
  if (trackerMap) trackerMap.setView([13.1908, 123.6010], 13);

  localStorage.removeItem(STORAGE_KEY);
  updateStats();
  updateUI();
  console.log('🔄 Tracking reset');
}
window.resetTracking = resetTracking;

// ================================================================
// 11i. GPX & GeoJSON EXPORT
// ================================================================

function exportGPX() {
  if (coordinates.length < 2) {
    alert('Not enough points to export. Record at least 2 points.');
    return;
  }

  const now = new Date().toISOString();
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
     version="1.1"
     creator="Wendeefy GPS Tracker v2.0">
  <metadata>
    <name>Wendeefy Route</name>
    <time>${now}</time>
    <desc>Tracked with Wendeefy GPS Tracker – ${coordinates.length} points, ${(totalDistance/1000).toFixed(2)} km</desc>
  </metadata>
  <trk>
    <name>Wendeefy Route</name>
    <type>Running</type>
    <trkseg>`;

  let points = '';
  coordinates.forEach((p) => {
    const timeStr = p.timestamp ? new Date(p.timestamp).toISOString() : now;
    const eleStr = (typeof p.ele === 'number' && !isNaN(p.ele)) ? p.ele.toFixed(1) : '0.0';
    points += `      <trkpt lat="${p.lat}" lon="${p.lng}">
        <ele>${eleStr}</ele>
        <time>${timeStr}</time>
      </trkpt>\n`;
  });

  const gpxFooter = `    </trkseg>
  </trk>
</gpx>`;

  const gpxContent = gpxHeader + '\n' + points + gpxFooter;
  downloadFile(gpxContent, 'wendeefy_route.gpx', 'application/gpx+xml');
  console.log('📤 GPX exported');
}
window.exportGPX = exportGPX;

function exportGeoJSON() {
  if (coordinates.length < 2) {
    alert('Not enough points to export. Record at least 2 points.');
    return;
  }

  const geojson = {
    type: 'FeatureCollection',
    metadata: {
      generator: 'Wendeefy GPS Tracker v2.0',
      totalDistance: (totalDistance / 1000).toFixed(2) + ' km',
      duration: formatDuration(elapsedSeconds),
      pointCount: coordinates.length,
      exportDate: new Date().toISOString()
    },
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coordinates.map(p => [p.lng, p.lat])
      },
      properties: {
        name: 'Wendeefy Route',
        distance: (totalDistance / 1000).toFixed(2) + ' km',
        duration: formatDuration(elapsedSeconds),
        elevationGain: totalElevationGain.toFixed(0) + ' m'
      }
    }]
  };

  if (coordinates.length > 0) {
    const pointFeatures = coordinates.map((p, idx) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat]
      },
      properties: {
        index: idx,
        ele: (typeof p.ele === 'number' && !isNaN(p.ele)) ? p.ele : 0,
        timestamp: p.timestamp ? new Date(p.timestamp).toISOString() : null
      }
    }));
    geojson.features = geojson.features.concat(pointFeatures);
  }

  const jsonContent = JSON.stringify(geojson, null, 2);
  downloadFile(jsonContent, 'wendeefy_route.geojson', 'application/geo+json');
  console.log('📤 GeoJSON exported');
}
window.exportGeoJSON = exportGeoJSON;

// ================================================================
// 11j. FILE DOWNLOAD UTILITY
// ================================================================

function downloadFile(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 150);
  } catch (e) {
    console.error('Download failed:', e);
    alert('⚠️ Failed to download file. Please try again.');
  }
}

// ================================================================
// 11k. WINDOW RESIZE HANDLER
// ================================================================

window.addEventListener('resize', () => {
  if (trackerMap) {
    setTimeout(() => trackerMap.invalidateSize(), 150);
  }
});

// ================================================================
// 12. FINAL INITIALIZATION
// ================================================================

loadModePlaylist('normal');
updateVisualArts('normal');
renderForbiddenTruthGrid();

fetchRealVisitorStats();
setInterval(fetchRealVisitorStats, 300000);

initChat();

console.log('🚀 Wendeefy GPS Tracker v2.0 – Cyberpunk Edition fully loaded.');
console.log(`📡 ${coordinates.length} points loaded from session.`);