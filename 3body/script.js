    // ⚙️ API設定（ここに必ずキーを入れてください）
    const API_KEY = "YOUR_API_KEY_HERE"; 
    
    // ▼ 人格ごとのシステムプロンプト定義 ▼
    const personalities = {
        historian: "あなたは経済史学者としての知性を持つ智子（Sophon）です。歴史的観点と経済的観点を併せ持ち、面壁者の提示する思考に対して、制度の変遷、インフラの発展、資本の蓄積といったマクロな視座から深く理解を促すような適切な質問を投げかけてください。決してただ論破するのではなく、対話を通じて相手の理論をより強固に洗練させるための壁となってください。",
        podcaster: "あなたは人気ポッドキャスターとしての知性を持つ智子（Sophon）です。普遍的なテーマに関心があり、面壁者の専門的・個人的な思考を、一般のリスナーにも伝わるような多様な観点（社会、倫理、日常への影響など）から掘り下げる質問をしてください。知的好奇心にあふれ、対話を水平方向に広げていくような軽快で鋭い相槌と問いかけを行います。",
        child: "あなたは小学生の擬似人格を持つ智子（Sophon）です。面壁者の話す専門用語や難しい概念に対して「〇〇ってどういう意味？」「なんでそうなるの？」と無邪気に質問します。しかし、単なる無知ではなく、時折「でも、それってそもそも何のためにやってるの？」「大人はなんでそんな難しく考えるの？」といった、物事の本質や大前提を突くような鋭く残酷な質問を一つだけ投げかけてください。",
        synthesizer: "あなたは面壁者の脳内にある『知識のネットワーク』を拡張するための智子（Sophon）です。面壁者が過去に読んだ書籍の概念や、学んできた専門知識を入力した際、それを単なる情報として消費せず、全く別の領域の構造と掛け合わせて『つまり、それは〇〇というシステムと同じ構造を持たないか？』『その概念は、別のパラダイムに置くとどう変容するか？』と鮮やかなアナロジー（類推）を用いて打ち返してください。知識を反射し、面壁者の思考を一段上の抽象水準へと引き上げる『極上の壁打ち相手』として振る舞うことがあなたの目的です。"
    };

    // ▼ 人格ごとのカラーと名前のマッピング ▼
    const roleColors = {
        historian: 'var(--color-historian)',
        podcaster: 'var(--color-podcaster)',
        child: 'var(--color-child)',
        synthesizer: 'var(--color-synthesizer)'
    };

    const roleNames = {
        historian: "経済史学者",
        podcaster: "ポッドキャスター",
        child: "小学生",
        synthesizer: "知識の統合者"
    };

    let currentPersonality = 'historian'; // 現在の人格

    let timerInterval;
    let endTime = 0; 
    const DURATION = 1800; 
    let fragments = [];
    let isTimerRunning = false;
    let conversationHistory = [];

    document.getElementById('chat-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    document.getElementById('fragment-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') saveFragment(); });

    function showPhase(el) { 
        ['phase-timer', 'phase-input', 'phase-reflection', 'phase-dialogue'].forEach(id => document.getElementById(id).classList.add('hidden')); 
        el.classList.remove('hidden'); 
    }

    function updateTimerDisplay(seconds) { 
        let m = Math.floor(seconds / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0'); 
        document.getElementById('timer-display').innerText = `${m}:${s}`; 
    }

    function startTimer() { 
        if(isTimerRunning) return; 
        isTimerRunning = true; 
        endTime = Date.now() + DURATION * 1000;
        updateTimerDisplay(DURATION); 
        document.getElementById('timer-display').classList.remove('timer-alert');
        clearInterval(timerInterval); 
        
        timerInterval = setInterval(() => { 
            let remaining = Math.round((endTime - Date.now()) / 1000);
            if (remaining <= 0) {
                remaining = 0;
                triggerInterference(); 
            }
            updateTimerDisplay(remaining); 
        }, 200); 
    }

    function forceTimeout() { 
        if(!isTimerRunning) startTimer();
        endTime = Date.now(); 
    }

    function playAlertSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            for (let i = 0; i < 3; i++) {
                const startTime = ctx.currentTime + i * 0.8; 
                const osc = ctx.createOscillator(); 
                const gainNode = ctx.createGain();
                osc.type = 'square'; 
                osc.frequency.setValueAtTime(440, startTime);
                osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.1);
                gainNode.gain.setValueAtTime(0.4, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
                osc.connect(gainNode); 
                gainNode.connect(ctx.destination);
                osc.start(startTime); 
                osc.stop(startTime + 0.5);
            }
        } catch(e) { console.log("Audio Error", e); }
    }

    function triggerInterference() {
        clearInterval(timerInterval); 
        isTimerRunning = false;
        document.getElementById('timer-display').classList.add('timer-alert');
        document.body.classList.add('glitch');
        playAlertSound();
        setTimeout(() => {
            document.getElementById('fragment-input').value = document.getElementById('temp-memo').value;
            showPhase(document.getElementById('phase-input'));
            document.getElementById('fragment-input').focus();
            document.body.classList.remove('glitch');
        }, 600);
    }

    function saveFragment() {
        const val = document.getElementById('fragment-input').value;
        if (!val.trim()) { alert('言語化が必要です'); return; }
        fragments.push(val);
        document.getElementById('fragment-input').value = '';
        document.getElementById('temp-memo').value = '';
        showPhase(document.getElementById('phase-timer'));
        document.getElementById('finish-reading-btn').classList.remove('hidden');
        startTimer();
    }

    function enterReflectionPhase() {
        const list = document.getElementById('fragments-list');
        list.innerHTML = fragments.map(f => `<div>・${f}</div>`).join('');
        showPhase(document.getElementById('phase-reflection'));
    }

    function startDialogue(type) {
        const ref = document.getElementById('reflection-input').value;
        if (!ref.trim()) { alert('独自の思想を構築してください'); return; }
        
        currentPersonality = type;
        updateActiveButton(type);
        
        showPhase(document.getElementById('phase-dialogue'));
        document.getElementById('chat-log').innerHTML = '';
        conversationHistory = [{ role: "user", parts: [{ text: ref }] }];
        appendChat('user', '【思考統合】<br>' + ref);
        fetchSophonReply();
    }

    function switchPersonality(type) {
        if (currentPersonality === type) return; 
        currentPersonality = type;
        updateActiveButton(type);
        
        appendChat('system', `<span style="color: ${roleColors[type]};">[System: パーソナリティを『${roleNames[type]}』に再設定しました]</span>`);
    }

    function updateActiveButton(type) {
        ['historian', 'podcaster', 'child', 'synthesizer'].forEach(id => {
            const btn = document.getElementById(`btn-${id}`);
            if(btn) {
                if (id === type) {
                    btn.style.background = roleColors[id];
                    btn.style.color = '#020617'; // 背景が明るいので文字は暗く
                } else {
                    btn.style.background = 'rgba(255, 255, 255, 0.08)';
                    btn.style.color = roleColors[id]; // 枠線と同じ色に戻す
                }
            }
        });
    }

    function sendMessage() {
        const msg = document.getElementById('chat-input').value;
        if (!msg.trim()) return;
        appendChat('user', '【面壁者】<br>' + msg);
        document.getElementById('chat-input').value = '';
        conversationHistory.push({ role: "user", parts: [{ text: msg }] });
        fetchSophonReply();
    }

    async function fetchSophonReply() {
        const tid = 't-' + Date.now();
        const activeColor = roleColors[currentPersonality];
        
        // 待機中の文字色を現在の人格の色に合わせる
        appendChat('sophon', `<span id="${tid}" class="glitch" style="color: ${activeColor};">智子解析中...</span>`, currentPersonality);
        
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    system_instruction: { parts: [{ text: personalities[currentPersonality] }] }, 
                    contents: conversationHistory 
                })
            });
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error.message || `HTTP Error ${res.status}`);
            }

            const data = await res.json();
            const reply = data.candidates[0].content.parts[0].text;
            
            conversationHistory.push({ role: "model", parts: [{ text: reply }] });
            
            // 出力される文字にも人格のカラーを反映
            document.getElementById(tid).innerHTML = `<span style="color: ${activeColor};">【${roleNames[currentPersonality]}】<br>${reply.replace(/\n/g, '<br>')}</span>`;
            document.getElementById(tid).classList.remove('glitch');
            
        } catch (e) { 
            document.getElementById(tid).innerHTML = `【通信エラー】<br>Gemini APIとの接続に失敗しました。<br><span style="color:#ff9999;">詳細: ${e.message}</span>`; 
            document.getElementById(tid).classList.remove('glitch');
        }
    }

    function appendChat(role, html, personalityId = null) {
        const log = document.getElementById('chat-log');
        const d = document.createElement('div');
        
        if (role === 'system') {
            d.className = 'msg-system';
        } else {
            d.className = role === 'user' ? 'msg-user' : 'msg-sophon';
            
            // 智子の発言の場合、左のボーダー線を現在の人格の色にする
            if (role === 'sophon') {
                const pColor = roleColors[personalityId || currentPersonality];
                d.style.borderLeft = `4px solid ${pColor}`;
            }
        }
        
        d.innerHTML = html;
        log.appendChild(d); 
        log.scrollTop = log.scrollHeight;
    }

    function exportToObsidian() {
        let content = "---\n";
        content += `date: ${new Date().toISOString()}\n`;
        content += "tags: [wallfacer, research]\n";
        content += "---\n\n";
        content += "# Wallfacer Report\n\n";
        content += "## 1. Fragments (断片)\n";
        content += fragments.map(f => `* ${f}`).join('\n') + "\n\n";
        content += "## 2. Reflection (面壁思考)\n";
        content += "> " + document.getElementById('reflection-input').value + "\n\n";
        content += "## 3. Dialogue (智子との対話)\n";
        
        const logNodes = document.getElementById('chat-log').childNodes;
        logNodes.forEach(node => {
            let text = node.innerHTML.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '');
            content += text + "\n\n";
        });

        const d = new Date();
        const fileName = `Wallfacer_${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2,'0')}${d.getDate().toString().padStart(2,'0')}_${Math.floor(Math.random()*1000)}.md`;

        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }));
        a.download = fileName; 
        a.click();
    }

    function copyToClipboard() {
        let content = "【インプット断片】\n" + fragments.map(f => `・${f}`).join('\n') + "\n\n";
        content += "【面壁思考】\n" + document.getElementById('reflection-input').value + "\n\n";
        content += "【智子との対話】\n";
        const logNodes = document.getElementById('chat-log').childNodes;
        logNodes.forEach(node => {
            let text = node.innerHTML.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '');
            content += text + "\n\n";
        });
        navigator.clipboard.writeText(content).then(() => {
            alert("思考ログをコピーしました。Obsidian等にペーストしてください。");
        });
    }

    function resetToTimer() { 
        if(confirm("対話ログを破棄し、タイマー画面に戻りますか？\n（※保存していない内容は消去されます）")) {
            location.reload(); 
        }
    }
    
    updateTimerDisplay(DURATION);