// ================================================================
// app3.js – DIVINE TOOLS (PART 3)
// Code Shield: CSS Minifier & JS Obfuscator
// ================================================================

(function() {
  'use strict';

  // ================================================================
  // 1. INITIALIZATION – ROBUST VERSION
  // ================================================================

  function initApp3() {
    console.log('🛡️ Code Shield Engine initializing...');
    // Try to setup immediately
    if (!setupCodeShield()) {
      // If failed, try again after DOM is ready
      console.log('🛡️ Container not found, will retry on DOM ready...');
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function retry() {
          setupCodeShield();
        });
      } else {
        // If DOM is already loaded, try again with a small delay
        setTimeout(setupCodeShield, 100);
      }
    }
  }

  // ================================================================
  // 2. SETUP CODE SHIELD – WITH FALLBACKS
  // ================================================================

  function setupCodeShield() {
    // Try multiple ways to find the container
    let container = document.getElementById('codeshield-container');
    
    // If not found, try to find the panel and look inside
    if (!container) {
      const panel = document.getElementById('tool-codeshield');
      if (panel) {
        container = panel.querySelector('.divine-tool-card');
        // If still not found, create the container inside the panel
        if (!container) {
          container = document.createElement('div');
          container.className = 'divine-tool-card';
          container.id = 'codeshield-container';
          panel.appendChild(container);
          console.log('🛡️ Created container inside panel.');
        }
      }
    }

    if (!container) {
      console.warn('🛡️ Code Shield container not found. Will retry...');
      return false;
    }

    console.log('🛡️ Container found, rendering UI...');
    renderCodeShieldUI(container);
    bindCodeShieldEvents();
    return true;
  }

  // ================================================================
  // 3. RENDER UI
  // ================================================================

  function renderCodeShieldUI(container) {
    container.innerHTML = `
      <h3><i class="fas fa-shield-halved"></i> Code Shield <span class="badge">CSS Minifier</span> <span class="badge" style="background:var(--neon-red);">JS Obfuscator</span></h3>
      <p class="tool-desc" style="border-left-color:var(--neon-gold);">
        <b>⚡ CSS Minifier:</b> Bumabawas ng whitespaces, linebreaks, comments, at nag-o-optimize ng colors.<br>
        <b>🔒 JS Obfuscator:</b> Nag-e-encode ng strings sa Hex, minify lines, at nag-wrap sa IIFE para hindi agad mabasa ang logic.
      </p>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
        <button class="divine-btn" id="csModeCss" style="background:var(--neon-blue);"><i class="fas fa-css3"></i> CSS Minifier</button>
        <button class="divine-btn" id="csModeJs" style="background:var(--neon-red);"><i class="fas fa-js"></i> JS Obfuscator</button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; min-height:300px;">
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="color:#88aabb; font-size:0.8rem; display:flex; justify-content:space-between;">
            <span><i class="fas fa-code"></i> Input</span>
            <span id="csInputStats" style="color:#666; font-size:0.7rem;">0 chars</span>
          </div>
          <textarea id="csInput" style="flex:1; background:rgba(0,0,0,0.7); border:1px solid var(--border-color); border-radius:6px; color:#d0e5e0; font-family:'Share Tech Mono',monospace; padding:12px; font-size:0.8rem; resize:vertical; min-height:300px; line-height:1.6; tab-size:2;" placeholder="Paste your CSS or JavaScript here..."></textarea>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="color:#88aabb; font-size:0.8rem; display:flex; justify-content:space-between;">
            <span><i class="fas fa-shield"></i> Output</span>
            <span id="csOutputStats" style="color:#666; font-size:0.7rem;">0 chars</span>
          </div>
          <textarea id="csOutput" style="flex:1; background:rgba(0,0,0,0.7); border:1px solid var(--neon-green); border-radius:6px; color:var(--neon-green); font-family:'Share Tech Mono',monospace; padding:12px; font-size:0.8rem; resize:vertical; min-height:300px; line-height:1.6; tab-size:2;" readonly placeholder="Processed output will appear here..."></textarea>
        </div>
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; align-items:center;">
        <button class="divine-btn" id="csProcessBtn"><i class="fas fa-bolt"></i> Process</button>
        <button class="divine-btn" id="csCopyBtn" style="background:var(--neon-blue);"><i class="fas fa-copy"></i> Copy Output</button>
        <button class="divine-btn" id="csDownloadBtn" style="background:var(--neon-gold); color:#000;"><i class="fas fa-download"></i> Download .min</button>
        <button class="divine-btn" id="csClearBtn" style="background:#666;"><i class="fas fa-trash"></i> Clear</button>
      </div>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:12px; background:rgba(0,0,0,0.3); padding:12px 16px; border-radius:6px; border:1px solid var(--border-color);">
        <div style="text-align:center;">
          <div style="color:#666; font-size:0.65rem;">ORIGINAL</div>
          <div id="csOriginalSize" style="color:#fff; font-size:1rem; font-family:'Share Tech Mono',monospace;">0 B</div>
        </div>
        <div style="text-align:center;">
          <div style="color:#666; font-size:0.65rem;">PROCESSED</div>
          <div id="csProcessedSize" style="color:var(--neon-green); font-size:1rem; font-family:'Share Tech Mono',monospace;">0 B</div>
        </div>
        <div style="text-align:center;">
          <div style="color:#666; font-size:0.65rem;">COMPRESSION</div>
          <div id="csCompression" style="color:var(--neon-gold); font-size:1rem; font-family:'Share Tech Mono',monospace;">0%</div>
        </div>
        <div style="text-align:center;">
          <div style="color:#666; font-size:0.65rem;">STATUS</div>
          <div id="csStatus" style="color:var(--neon-cyan); font-size:0.8rem;">Ready</div>
        </div>
      </div>
    `;
  }

  // ================================================================
  // 4. BIND EVENTS – WITH NULL CHECKS
  // ================================================================

  let currentMode = 'css';

  function bindCodeShieldEvents() {
    const modeCss = document.getElementById('csModeCss');
    const modeJs = document.getElementById('csModeJs');
    const processBtn = document.getElementById('csProcessBtn');
    const copyBtn = document.getElementById('csCopyBtn');
    const downloadBtn = document.getElementById('csDownloadBtn');
    const clearBtn = document.getElementById('csClearBtn');
    const input = document.getElementById('csInput');
    const output = document.getElementById('csOutput');

    if (modeCss) {
      modeCss.addEventListener('click', function() {
        currentMode = 'css';
        this.style.background = 'var(--neon-blue)';
        this.style.color = '#000';
        if (modeJs) {
          modeJs.style.background = 'var(--neon-red)';
          modeJs.style.color = '#fff';
        }
        updateStatus('CSS Minifier mode');
        if (input && input.value.trim()) processCode();
      });
    }

    if (modeJs) {
      modeJs.addEventListener('click', function() {
        currentMode = 'js';
        this.style.background = 'var(--neon-red)';
        this.style.color = '#fff';
        if (modeCss) {
          modeCss.style.background = '';
          modeCss.style.color = '#000';
        }
        updateStatus('JS Obfuscator mode');
        if (input && input.value.trim()) processCode();
      });
    }

    if (processBtn) processBtn.addEventListener('click', processCode);

    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        if (!output || !output.value) { alert('Walang output na kopyahin.'); return; }
        navigator.clipboard.writeText(output.value).then(() => {
          const orig = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check"></i> Copied!';
          this.style.background = 'var(--neon-green)';
          setTimeout(() => { this.innerHTML = orig; this.style.background = 'var(--neon-blue)'; }, 2000);
        }).catch(() => {
          output.select();
          document.execCommand('copy');
          alert('📋 Output copied to clipboard!');
        });
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', function() {
        if (!output || !output.value) { alert('Walang output na ida-download.'); return; }
        const ext = currentMode === 'css' ? 'css' : 'js';
        const filename = `minified.${ext}`;
        const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        updateStatus(`Downloaded ${filename}`);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        if (input) input.value = '';
        if (output) output.value = '';
        updateStats('', '');
        updateStatus('Cleared');
        const origSize = document.getElementById('csOriginalSize');
        const procSize = document.getElementById('csProcessedSize');
        const comp = document.getElementById('csCompression');
        if (origSize) origSize.textContent = '0 B';
        if (procSize) procSize.textContent = '0 B';
        if (comp) comp.textContent = '0%';
      });
    }

    let debounceTimer;
    if (input) {
      input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (this.value.trim()) processCode();
          else { if (output) output.value = ''; updateStats('', ''); updateStatus('Waiting for input...'); }
        }, 600);
      });
      input.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); processCode(); }
      });
    }

    updateStatus('Ready. Paste your code and click Process or use Ctrl+Enter.');
  }

  // ================================================================
  // 5. CSS MINIFIER ENGINE
  // ================================================================

  function minifyCSS(css) {
    try {
      let min = css;
      min = min.replace(/\/\*[\s\S]*?\*\//g, '');
      min = min.replace(/\s*([{}:;,])\s*/g, '$1');
      min = min.replace(/\s{2,}/g, ' ');
      min = min.replace(/\n/g, '');
      min = min.replace(/\r/g, '');
      min = min.replace(/;}/g, '}');
      min = min.replace(/#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3/gi, '#$1$2$3');
      min = min.replace(/[^{}]+{}\s*/g, '');
      return min.trim();
    } catch (err) {
      console.error('CSS Minification Error:', err);
      return css;
    }
  }

  // ================================================================
  // 6. JS OBFUSCATOR ENGINE
  // ================================================================

  function obfuscateJS(code) {
    try {
      let obfuscated = code;
      obfuscated = obfuscated.replace(/\/\/.*$/gm, '');
      obfuscated = obfuscated.replace(/\/\*[\s\S]*?\*\//g, '');
      obfuscated = obfuscated.replace(/\s{2,}/g, ' ');
      obfuscated = obfuscated.replace(/\n/g, '');
      obfuscated = obfuscated.replace(/\r/g, '');
      obfuscated = obfuscated.replace(/;\s*/g, ';');
      obfuscated = obfuscated.replace(/{\s*/g, '{');
      obfuscated = obfuscated.replace(/}\s*/g, '}');
      obfuscated = obfuscated.replace(/\(\s*/g, '(');
      obfuscated = obfuscated.replace(/\s*\)/g, ')');
      obfuscated = obfuscated.replace(/,\s*/g, ',');
      obfuscated = obfuscated.replace(/:\s*/g, ':');

      const stringRegex = /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')/g;
      obfuscated = obfuscated.replace(stringRegex, function(match) {
        const content = match.slice(1, -1);
        let hex = '';
        for (let i = 0; i < content.length; i++) {
          hex += '\\x' + content.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return '"' + hex + '"';
      });

      obfuscated = obfuscated.replace(/;}/g, '}');
      const trimmed = obfuscated.trim();
      if (trimmed.length > 0 && !trimmed.startsWith('(function') && !trimmed.startsWith('!function') && trimmed.length > 10) {
        obfuscated = `!function(){${obfuscated}}();`;
      }
      return obfuscated;
    } catch (err) {
      console.error('JS Obfuscation Error:', err);
      return code;
    }
  }

  // ================================================================
  // 7. MAIN PROCESS FUNCTION
  // ================================================================

  function processCode() {
    const input = document.getElementById('csInput');
    const output = document.getElementById('csOutput');
    if (!input || !output) return;

    const raw = input.value;
    if (!raw.trim()) { output.value = ''; updateStats('', ''); updateStatus('No input to process.'); return; }

    let result = '';
    let modeLabel = '';

    try {
      if (currentMode === 'css') {
        result = minifyCSS(raw);
        modeLabel = 'CSS Minified';
      } else {
        result = obfuscateJS(raw);
        modeLabel = 'JS Obfuscated';
      }
      output.value = result;
      updateStats(raw, result);
      updateStatus(`✅ ${modeLabel} successfully!`);
      output.style.borderColor = 'var(--neon-gold)';
      setTimeout(() => { output.style.borderColor = 'var(--neon-green)'; }, 500);
    } catch (err) {
      output.value = '⚠️ Error processing: ' + err.message;
      updateStatus('❌ Error: ' + err.message);
      console.error('Processing Error:', err);
    }
  }

  // ================================================================
  // 8. STATS UPDATE
  // ================================================================

  function updateStats(original, processed) {
    const origSize = document.getElementById('csOriginalSize');
    const procSize = document.getElementById('csProcessedSize');
    const comp = document.getElementById('csCompression');
    const inputStats = document.getElementById('csInputStats');
    const outputStats = document.getElementById('csOutputStats');

    const origBytes = new Blob([original]).size;
    const procBytes = new Blob([processed]).size;

    if (origSize) origSize.textContent = formatBytes(origBytes);
    if (procSize) procSize.textContent = formatBytes(procBytes);
    if (comp) {
      if (origBytes > 0) {
        const saved = ((origBytes - procBytes) / origBytes) * 100;
        const pct = Math.max(0, Math.round(saved));
        comp.textContent = pct + '%';
        comp.style.color = pct > 50 ? 'var(--neon-green)' : pct > 20 ? 'var(--neon-gold)' : 'var(--neon-red)';
      } else { comp.textContent = '0%'; }
    }
    if (inputStats) inputStats.textContent = origBytes + ' B';
    if (outputStats) outputStats.textContent = procBytes + ' B';
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function updateStatus(msg) {
    const status = document.getElementById('csStatus');
    if (status) {
      status.textContent = msg;
      status.style.color = msg.includes('✅') || msg.includes('Ready') ? 'var(--neon-green)' :
        msg.includes('❌') || msg.includes('Error') ? 'var(--neon-red)' : 'var(--neon-cyan)';
    }
  }

  // ================================================================
  // 9. EXPOSE TO GLOBAL
  // ================================================================

  window.processCodeShield = processCode;
  window.minifyCSS = minifyCSS;
  window.obfuscateJS = obfuscateJS;

  // ================================================================
  // 10. START INITIALIZATION – WITH MULTIPLE ATTEMPTS
  // ================================================================

  console.log('🛡️ Code Shield script loaded.');

  // Try to init immediately
  let initAttempts = 0;
  const maxAttempts = 10;

  function attemptInit() {
    initAttempts++;
    console.log(`🛡️ Init attempt ${initAttempts}...`);
    if (setupCodeShield()) {
      console.log('🛡️ Code Shield initialized successfully!');
      return;
    }
    if (initAttempts < maxAttempts) {
      setTimeout(attemptInit, 200);
    } else {
      console.warn('🛡️ Failed to initialize Code Shield after ' + maxAttempts + ' attempts.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attemptInit);
  } else {
    attemptInit();
  }

  // Also try after window load for safety
  window.addEventListener('load', function() {
    if (initAttempts > 0 && !document.getElementById('codeshield-container')?.querySelector('#csInput')) {
      console.log('🛡️ Retrying on window load...');
      setupCodeShield();
    }
  });

})();
