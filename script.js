let currentSlot = 1;
const DEFAULT_DATA = [
    {
        id: 1,
        icon: "fa-solid fa-city",
        title: "배경 설정",
        desc: "2025년 서울, 마법이 합법화되어 공공재로 사용됨. 하지만 무허가 마력 사용은 중범죄로 다스려짐. 을지로가 마법 공학의 중심지.",
        tag: "장르: 어반 판타지"
    },
    {
        id: 2,
        icon: "fa-solid fa-user-secret",
        title: "주인공: 강진혁",
        desc: "32세, 그림자 사냥꾼(불법 마법사 추적). 냉소적이나 의뢰비에는 철저함. 과거 3년 전 폭발 사고의 유일한 생존자.",
        tag: "특성: 마력 감지"
    }
];

let worldData = []; 
let GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';
let episodeHistory = JSON.parse(localStorage.getItem('episode_history')) || [];

function loadWorldData(slot) {
    const key = `world_data_slot_${slot}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        worldData = JSON.parse(saved);
    } else {
        worldData = JSON.parse(JSON.stringify(DEFAULT_DATA)); 
    }
    currentSlot = slot;
    updateSlotUI();
    renderCards();
}

function saveToLocal() {
    const key = `world_data_slot_${currentSlot}`;
    localStorage.setItem(key, JSON.stringify(worldData));
}

function switchSlot(slot) {
    loadWorldData(slot);
}

function updateSlotUI() {
    for(let i=1; i<=3; i++) {
        const btn = document.getElementById(`slot${i}`);
        if(i === currentSlot) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

loadWorldData(1); 

function switchMobileTab(tab) {
    const settingsPanel = document.getElementById('panelSettings');
    const generatePanel = document.getElementById('panelGenerate');
    const navItems = document.querySelectorAll('.nav-item');

    if (tab === 'settings') {
        settingsPanel.classList.add('active-tab');
        generatePanel.classList.remove('active-tab');
        navItems[0].classList.add('active');
        navItems[1].classList.remove('active');
    } else {
        settingsPanel.classList.remove('active-tab');
        generatePanel.classList.add('active-tab');
        navItems[0].classList.remove('active');
        navItems[1].classList.add('active');
    }
}

function showAlert(msg) {
    document.getElementById('alertMessage').innerText = msg;
    document.getElementById('alertModal').classList.add('active');
}
function closeAlert() {
    document.getElementById('alertModal').classList.remove('active');
}

function renderCards() {
    const container = document.getElementById('cardsContainer');
    if(!container) return;
    container.innerHTML = '';

    worldData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'info-card';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <i class="${item.icon}"></i> ${item.title}
                </div>
                <div class="card-actions">
                     <i class="fa-solid fa-pen action-icon edit-btn" title="수정"></i>
                     <i class="fa-solid fa-trash action-icon delete delete-btn" title="삭제"></i>
                </div>
            </div>
            <div class="card-desc">${item.desc ? item.desc.replace(/\n/g, '<br>') : ''}</div>
            ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
        `;
        
        card.addEventListener('click', (e) => {
            openModal('edit', item.id);
        });

        const editBtn = card.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            openModal('edit', item.id);
        });

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            deleteCard(item.id);
        });

        container.appendChild(card);
    });
}

function deleteCard(id) {
    if(confirm("정말 이 설정을 삭제하시겠습니까?")) {
        worldData = worldData.filter(item => item.id !== id);
        saveToLocal();
        renderCards();
    }
}

function openModal(type, id = null) {
    if (type === 'edit') {
        const modal = document.getElementById('editModal');
        const titleEl = document.getElementById('modalTitle');
        const idEl = document.getElementById('settingId');
        const iconEl = document.getElementById('settingIcon');
        const titleInputEl = document.getElementById('settingTitle');
        const descEl = document.getElementById('settingDesc');
        const tagEl = document.getElementById('settingTag');

        if (id) {
            const data = worldData.find(item => item.id === id);
            if (!data) return;
            titleEl.innerText = '설정 상세 / 수정';
            idEl.value = data.id;
            
            let iconExists = false;
            for(let i=0; i < iconEl.options.length; i++){
                if(iconEl.options[i].value === data.icon){
                    iconExists = true;
                    break;
                }
            }
            if(!iconExists) {
                let opt = document.createElement('option');
                opt.value = data.icon;
                opt.innerHTML = "✨ 기존 아이콘 (" + data.icon + ")";
                iconEl.appendChild(opt);
            }
            iconEl.value = data.icon;

            titleInputEl.value = data.title;
            descEl.value = data.desc;
            tagEl.value = data.tag;
        } else {
            titleEl.innerText = '새 설정 추가';
            idEl.value = '';
            iconEl.value = 'fa-solid fa-book';
            titleInputEl.value = '';
            descEl.value = '';
            tagEl.value = '';
        }
        modal.classList.add('active');
    } else if (type === 'api') {
        document.getElementById('apiKeyInput').value = GEMINI_API_KEY;
        document.getElementById('apiModal').classList.add('active');
    } else if (type === 'paste') {
        document.getElementById('pasteInput').value = '';
        document.getElementById('pasteModal').classList.add('active');
    } else if (type === 'history') {
        renderHistory();
        document.getElementById('historyModal').classList.add('active');
    } else if (type === 'export') {
        prepareExportSheet(); 
        document.getElementById('exportModal').classList.add('active');
    }
}

function closeModal(type) {
    if (type === 'edit') document.getElementById('editModal').classList.remove('active');
    if (type === 'api') document.getElementById('apiModal').classList.remove('active');
    if (type === 'paste') document.getElementById('pasteModal').classList.remove('active');
    if (type === 'history') document.getElementById('historyModal').classList.remove('active');
    if (type === 'export') document.getElementById('exportModal').classList.remove('active');
}

function prepareExportSheet() {
    let synopsis = [];
    let characters = [];
    let items = [];
    let genre = "";

    worldData.forEach(item => {
        const title = item.title;
        const desc = item.desc;
        const tag = (item.tag || '').toLowerCase();
        const icon = item.icon;
        
        const entry = `[${title}]\n${desc}`;

        if (tag.includes('인물') || tag.includes('character') || title.includes('주인공') || icon.includes('user')) {
            characters.push(`### ${title}\n${desc}`);
        } else if (tag.includes('배경') || tag.includes('location') || tag.includes('setting') || icon.includes('city') || icon.includes('map')) {
            synopsis.push(entry);
        } else if (tag.includes('장르') || tag.includes('genre')) {
            genre = desc; 
        } else {
            items.push(entry); 
        }
    });

    document.getElementById('sheetGenre').value = genre || "";
    document.getElementById('sheetSynopsis').value = synopsis.join('\n\n');
    document.getElementById('sheetCharacters').value = characters.join('\n\n----------------\n\n');
    document.getElementById('sheetItems').value = items.join('\n\n');
}

async function refineSheetWithAI() {
    if (!GEMINI_API_KEY) {
        showAlert("AI 연결이 필요합니다.\n설정에서 API Key를 입력해주세요.");
        return;
    }

    const loading = document.getElementById('exportLoading');
    loading.style.display = 'flex';

    const contextData = JSON.stringify(worldData);

    try {
        const response = await fetch('/api/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': GEMINI_API_KEY },
            body: JSON.stringify({ contextData })
        });

        const data = await response.json();
        if(data.error) throw new Error(data.error);

        const result = data;

        function formatValue(value) {
            if (!value) return "";
            if (typeof value === 'string') return value.replace(/\*\*|__|`/g, '');
            if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                    return value.map(v => {
                        const parts = [];
                        const title = v.name || v.title || '';
                        const desc = v.desc || v.description || v.role || '';
                        if(title) parts.push(`[${title}]`);
                        if(desc) parts.push(desc);
                        return parts.join(' ');
                    }).join('\n\n');
                }
                return value.join(', ');
            }
            if (typeof value === 'object') {
                return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n');
            }
            return String(value).replace(/\*\*|__|`/g, '');
        }

        document.getElementById('sheetTitle').value = formatValue(result.title);
        document.getElementById('sheetGenre').value = formatValue(result.genre);
        document.getElementById('sheetLogline').value = formatValue(result.logline);
        document.getElementById('sheetKeywords').value = formatValue(result.keywords);
        document.getElementById('sheetIntention').value = formatValue(result.intention);
        document.getElementById('sheetElements').value = formatValue(result.elements); 
        document.getElementById('sheetSynopsis').value = formatValue(result.synopsis);
        document.getElementById('sheetCharacters').value = formatValue(result.characters);
        document.getElementById('sheetItems').value = formatValue(result.items);

        showAlert("AI가 기획서를 다듬었습니다!");

    } catch (e) {
        showAlert(`AI 생성 중 오류 발생: ${e.message}`);
        console.error(e);
    } finally {
        loading.style.display = 'none';
    }
}

function printSheet() {
    const textareas = document.querySelectorAll('.sheet-textarea, .sheet-field-input');
    textareas.forEach(ta => {
        ta.style.height = 'auto'; 
        ta.style.height = (ta.scrollHeight + 5) + 'px'; 
    });
    window.print();
}

function saveSetting() {
    const id = document.getElementById('settingId').value;
    const icon = document.getElementById('settingIcon').value;
    const title = document.getElementById('settingTitle').value;
    const desc = document.getElementById('settingDesc').value;
    const tag = document.getElementById('settingTag').value;

    if (!title || !desc) {
        showAlert('제목과 내용을 입력해주세요.');
        return;
    }

    if (id) {
        const index = worldData.findIndex(item => item.id == id);
        if (index !== -1) worldData[index] = { id: parseInt(id), icon, title, desc, tag };
    } else {
        const newId = worldData.length > 0 ? Math.max(...worldData.map(d => d.id)) + 1 : 1;
        worldData.push({ id: newId, icon, title, desc, tag });
    }
    saveToLocal(); 
    renderCards();
    closeModal('edit');
}

function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (!key) {
        showAlert('API 키를 입력해주세요.');
        return;
    }
    GEMINI_API_KEY = key;
    localStorage.setItem('gemini_api_key', key);
    showAlert('API 키가 저장되었습니다.\n이제 AI 기능을 사용할 수 있습니다.');
    closeModal('api');
}

function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (!GEMINI_API_KEY) {
        showAlert("AI 연결이 필요합니다.\n우측 상단의 톱니바퀴 버튼을 눌러\nAPI Key를 먼저 등록해주세요.");
        input.value = ''; 
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        analyzeAndImportSettings(content);
    };
    reader.onerror = function(e) {
        showAlert("파일 읽기 실패. 권한 문제일 수 있습니다.\n[붙여넣기] 기능을 사용해보세요.");
    }
    reader.readAsText(file);
}

function handlePasteAnalysis() {
    const text = document.getElementById('pasteInput').value;
    if(!text.trim()) {
        showAlert("내용을 입력해주세요.");
        return;
    }
    if (!GEMINI_API_KEY) {
        showAlert("AI 연결이 필요합니다.\nAPI Key를 먼저 등록해주세요.");
        return;
    }
    closeModal('paste');
    analyzeAndImportSettings(text);
}

async function reflectToSettings() {
    const rawText = document.getElementById('rawEpisodeText').value;
    if(!rawText) {
        showAlert("반영할 에피소드 내용이 없습니다.");
        return;
    }
    if (!GEMINI_API_KEY) {
        showAlert("AI 연결이 필요합니다.");
        return;
    }

    const loading = document.getElementById('leftLoading');
    document.getElementById('leftLoadingText').innerText = "에피소드 분석 및 반영 중...";
    loading.style.display = 'flex';

    const existingTitles = worldData.map(d => d.title).join(", ");

    try {
        const response = await fetch('/api/reflect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': GEMINI_API_KEY },
            body: JSON.stringify({ rawText, existingTitles })
        });

        const data = await response.json();
        if(data.error) throw new Error(data.error);

        const items = data.settings || data;

        let updatedCount = 0;
        let newCount = 0;

        items.forEach(newItem => {
            const index = worldData.findIndex(d => d.title === newItem.title);
            if(index !== -1) {
                const existing = worldData[index];
                if(!existing.desc.includes(newItem.desc)) {
                    existing.desc += `\n\n[추가됨]: ${newItem.desc}`;
                    updatedCount++;
                }
            } else {
                let newId = worldData.length > 0 ? Math.max(...worldData.map(d => d.id)) + 1 : 1;
                while(worldData.find(d => d.id === newId)) newId++;
                
                newItem.id = newId;
                worldData.push(newItem);
                newCount++;
            }
        });

        saveToLocal();
        renderCards();
        showAlert(`반영 완료!\n- 새로운 설정: ${newCount}개\n- 업데이트된 설정: ${updatedCount}개`);

    } catch (e) {
        showAlert(`반영 중 오류 발생: ${e.message}`);
        console.error(e);
    } finally {
        loading.style.display = 'none';
        document.getElementById('leftLoadingText').innerText = "데이터 분석 중...";
    }
}

async function analyzeAndImportSettings(fileContent) {
    const loading = document.getElementById('leftLoading');
    loading.style.display = 'flex';

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': GEMINI_API_KEY },
            body: JSON.stringify({ fileContent })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const newSettings = data.settings || data;

        let currentId = worldData.length > 0 ? Math.max(...worldData.map(d => d.id)) : 0;
        newSettings.forEach(item => {
            currentId++;
            item.id = currentId;
            worldData.push(item);
        });

        saveToLocal();
        renderCards();
        showAlert(`${newSettings.length}개의 설정이 추가되었습니다!`);

    } catch (error) {
        showAlert(`오류가 발생했습니다:\n${error.message}`);
    } finally {
        loading.style.display = 'none';
        document.getElementById('fileUpload').value = ''; 
    }
}

async function generateEpisode() {
    const inputVal = document.getElementById('eventInput').value;
    const placeholder = document.getElementById('placeholder');
    const loading = document.getElementById('loading');
    const result = document.getElementById('resultContent');

    if (!inputVal) {
        showAlert("사건 내용을 입력해주세요!");
        return;
    }
    if (!GEMINI_API_KEY) {
        showAlert("AI 연결 설정에서 API Key를 먼저 등록해주세요!");
        openModal('api');
        return;
    }

    placeholder.style.display = 'none';
    result.style.display = 'none';
    loading.style.display = 'flex';

    const worldContext = worldData.map(item => 
        `[${item.title}] (${item.tag || '설정'}): ${item.desc}`
    ).join('\n\n');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': GEMINI_API_KEY },
            body: JSON.stringify({ worldContext, eventInput: inputVal })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const generatedText = data.text;

        saveToHistory(inputVal, generatedText);

        loading.style.display = 'none';
        result.innerHTML = formatOutput(generatedText, inputVal);
        result.style.display = 'block';

    } catch (error) {
        loading.style.display = 'none';
        showAlert(`오류가 발생했습니다: ${error.message}`);
    }
}

function formatOutput(text, eventName) {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const rawText = text.replace(/\*\*/g, '');
    const safeEventName = eventName.replace(/'/g, "\\'");
    
    return `
        <h3><i class="fa-solid fa-clapperboard"></i> 생성된 에피소드</h3>
        <p style="color: var(--text-sub); font-size: 0.9rem; margin-bottom: 20px;">
            분석된 사건: <span style="color: white;">${eventName}</span>
        </p>
        <div id="episodeText" class="chat-bubble">
            ${formatted.replace(/\n/g, '<br>')}
        </div>
        
        <div class="result-actions">
            <button class="action-btn secondary reflect" onclick="reflectToSettings()">
                <i class="fa-solid fa-retweet"></i> 월드세팅에 반영 (분석 & 추가)
            </button>
            <button class="action-btn secondary" onclick="copyToClipboard()">
                <i class="fa-regular fa-copy"></i> 클립보드 복사
            </button>
            <button class="action-btn secondary" onclick="downloadEpisode('${safeEventName}')">
                <i class="fa-solid fa-download"></i> 텍스트 저장 (.txt)
            </button>
        </div>
        <textarea id="rawEpisodeText" style="display:none;">${rawText}</textarea>
    `;
}

function downloadEpisode(eventName) {
    const rawText = document.getElementById('rawEpisodeText').value;
    const title = `Episode_${eventName.substring(0, 10).replace(/\s/g, '_')}.txt`;
    
    const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    const anchor = document.createElement("a");
    
    anchor.href = URL.createObjectURL(blob);
    anchor.download = title;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

function copyToClipboard() {
    const rawText = document.getElementById('rawEpisodeText').value;
    
    const el = document.createElement('textarea');
    el.value = rawText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    showAlert("클립보드에 복사되었습니다.\n구글 문서나 메모장에 붙여넣기(Ctrl+V) 하세요.");
}

function saveToHistory(event, content) {
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        event: event,
        content: content
    };
    episodeHistory.unshift(newEntry);
    localStorage.setItem('episode_history', JSON.stringify(episodeHistory));
}

function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';

    if (episodeHistory.length === 0) {
        list.innerHTML = '<div class="empty-history"><i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom:12px;"></i><br>저장된 히스토리가 없습니다.</div>';
        return;
    }

    episodeHistory.forEach(item => {
        const preview = item.content.substring(0, 100) + '...';
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        itemDiv.innerHTML = `
            <div class="history-meta">
                <span>${item.date}</span>
            </div>
            <div class="history-event">${item.event}</div>
            <div class="history-preview">${preview}</div>
            <div class="history-actions">
                <button class="history-btn" onclick="loadHistory(${item.id})">
                    <i class="fa-solid fa-folder-open"></i> 불러오기
                </button>
                <button class="history-btn delete" onclick="deleteHistory(${item.id})">
                    <i class="fa-solid fa-trash"></i> 삭제
                </button>
            </div>
        `;
        list.appendChild(itemDiv);
    });
}

function loadHistory(id) {
    const item = episodeHistory.find(entry => entry.id === id);
    if (item) {
        document.getElementById('eventInput').value = item.event;
        const result = document.getElementById('resultContent');
        document.getElementById('placeholder').style.display = 'none';
        result.innerHTML = formatOutput(item.content, item.event);
        result.style.display = 'block';
        closeModal('history');
    }
}

function deleteHistory(id) {
    if(confirm("정말 이 기록을 삭제하시겠습니까?")) {
        episodeHistory = episodeHistory.filter(entry => entry.id !== id);
        localStorage.setItem('episode_history', JSON.stringify(episodeHistory));
        renderHistory();
    }
}

renderCards();
