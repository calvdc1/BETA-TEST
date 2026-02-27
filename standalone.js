(() => {
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else {
        node.setAttribute(k, v);
      }
    });
    children.flat().forEach((c) => {
      if (c == null) return;
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    });
    return node;
  }

  const logos = {
    MAIN: '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#0ea5e9"/><circle cx="20" cy="20" r="10" fill="white"/></svg>',
    MARAWI: '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#22c55e"/><rect x="10" y="10" width="20" height="20" fill="white"/></svg>',
    ILIGAN: '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#a78bfa"/><polygon points="20,8 32,32 8,32" fill="white"/></svg>',
    TAWITAWI: '<svg width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#f59e0b"/><path d="M20 10 L28 30 L12 30 Z" fill="white"/></svg>'
  };
  const campusOptions = [
    { value: 'MAIN', label: 'MSU Main' },
    { value: 'MARAWI', label: 'MSU Marawi' },
    { value: 'ILIGAN', label: 'MSU Iligan' },
    { value: 'TAWITAWI', label: 'MSU Tawi-Tawi' }
  ];
  const storageKeys = {
    campus: 'MSU_CAMPUS',
    name: 'CHAT_NAME',
    key: 'GEMINI_API_KEY',
    chats: (campus) => `CHAT_${campus}`
  };

  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('onemsu-chat') : null;

  function loadMessages(campus) {
    try {
      const raw = localStorage.getItem(storageKeys.chats(campus)) || '[]';
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  function saveMessages(campus, arr) {
    localStorage.setItem(storageKeys.chats(campus), JSON.stringify(arr.slice(-200)));
  }
  function now() {
    const d = new Date();
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }

  function render() {
    const root = document.getElementById('root');
    root.innerHTML = '';

    let campus = localStorage.getItem(storageKeys.campus) || 'MAIN';
    let displayName = localStorage.getItem(storageKeys.name) || '';
    let apiKey = localStorage.getItem(storageKeys.key) || '';
    let activeTab = 'chat';
    let messages = loadMessages(campus);

    function setCampus(v) {
      campus = v;
      localStorage.setItem(storageKeys.campus, campus);
      messages = loadMessages(campus);
      logo.innerHTML = logos[campus] || '';
      renderMessages();
      if (bc) bc.postMessage({ type: 'campus-change', campus });
    }
    function setName(n) {
      displayName = n;
      localStorage.setItem(storageKeys.name, displayName);
    }
    function setKey(k) {
      apiKey = k;
      if (apiKey && apiKey.trim()) localStorage.setItem(storageKeys.key, apiKey);
      else localStorage.removeItem(storageKeys.key);
      status.className = 'status ' + (apiKey && apiKey.trim() ? 'ok' : 'bad');
      status.textContent = apiKey && apiKey.trim() ? 'Service ready: API key detected.' : 'Service unavailable: missing GEMINI_API_KEY.';
    }
    function addMessage(text) {
      const msg = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        campus,
        name: displayName || 'Anonymous',
        text: String(text || '').slice(0, 500),
        ts: now()
      };
      messages.push(msg);
      saveMessages(campus, messages);
      renderMessages();
      if (bc) bc.postMessage({ type: 'chat', campus, msg });
    }
    function renderMessages() {
      msgs.innerHTML = '';
      messages.forEach((m) => {
        const item = el('div', { className: 'msg' },
          el('div', { className: 'meta' }, m.name, '•', m.ts),
          el('div', {}, m.text)
        );
        msgs.appendChild(item);
      });
      msgs.scrollTop = msgs.scrollHeight;
    }
    if (bc) {
      bc.onmessage = (ev) => {
        const d = ev.data || {};
        if (d.type === 'chat' && d.campus === campus) {
          messages.push(d.msg);
          saveMessages(campus, messages);
          renderMessages();
        }
      };
    }

    const shell = el('div', { className: 'shell' });
    const header = el('div', { className: 'header' });
    const logo = el('div', { className: 'logo' });
    logo.innerHTML = logos[campus] || '';
    const brand = el('div', { className: 'brand', text: 'ONEMSU' });
    const campusSel = el('select', { className: 'select' }, ...campusOptions.map(o => {
      const opt = el('option', { value: o.value, text: o.label });
      if (o.value === campus) opt.selected = true;
      return opt;
    }));
    campusSel.addEventListener('change', (e) => setCampus(e.target.value));
    const nameInput = el('input', { className: 'input', placeholder: 'Display name', value: displayName });
    nameInput.addEventListener('input', (e) => setName(e.target.value));
    header.append(logo, brand, campusSel, nameInput);

    const tabs = el('div', { className: 'tabs' });
    const tabChat = el('div', { className: 'tab active', text: 'Chat' });
    const tabSettings = el('div', { className: 'tab', text: 'Settings' });
    tabs.append(tabChat, tabSettings);

    const content = el('div', { className: 'content' });

    const status = el('div', { className: 'status ' + (apiKey && apiKey.trim() ? 'ok' : 'bad') });
    status.textContent = apiKey && apiKey.trim() ? 'Service ready: API key detected.' : 'Service unavailable: missing GEMINI_API_KEY.';

    const chatCard = el('div', { className: 'card' });
    chatCard.append(el('div', { className: 'title', text: 'Campus Chat' }), el('div', { className: 'muted', text: 'Chat is scoped to the selected campus.' }));
    const chat = el('div', { className: 'chat' });
    const msgs = el('div', { className: 'msgs', id: 'msgs' });
    const composer = el('div', { className: 'composer' });
    const msgInput = el('input', { className: 'input', placeholder: 'Write a message…' });
    const sendBtn = el('button', { className: 'btn btn-primary', text: 'Send' });
    sendBtn.addEventListener('click', () => {
      if (!msgInput.value.trim()) return;
      addMessage(msgInput.value.trim());
      msgInput.value = '';
    });
    msgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendBtn.click();
      }
    });
    composer.append(msgInput, sendBtn);
    chat.append(msgs, composer);
    chatCard.append(chat);

    const settingsCard = el('div', { className: 'card' });
    settingsCard.append(el('div', { className: 'title', text: 'Settings' }));
    const keyRow = el('div', { className: 'row' },
      el('span', { className: 'muted', text: 'GEMINI_API_KEY' }),
      el('input', { className: 'input', type: 'password', value: apiKey, placeholder: 'Enter API key' }),
      el('button', { className: 'btn btn-primary', text: 'Save' })
    );
    const keyInput = keyRow.children[1];
    keyRow.children[2].addEventListener('click', () => setKey(keyInput.value));
    const info = el('div', { className: 'muted' },
      'When running with Vite on your machine:',
      el('ol', {},
        el('li', {}, 'Create a .env.local file in the project root.'),
        el('li', {}, 'Add GEMINI_API_KEY=your_api_key_here'),
        el('li', {}, 'Run npm install and npm run dev.')
      )
    );
    settingsCard.append(keyRow, info);

    function selectTab(t) {
      activeTab = t;
      tabChat.classList.toggle('active', t === 'chat');
      tabSettings.classList.toggle('active', t === 'settings');
      content.innerHTML = '';
      content.append(status);
      if (t === 'chat') content.append(chatCard);
      else content.append(settingsCard);
    }
    tabChat.addEventListener('click', () => selectTab('chat'));
    tabSettings.addEventListener('click', () => selectTab('settings'));

    shell.append(header, tabs, content, el('div', { className: 'footer', text: 'ONEMSU • Campus-scoped chat • Local demo' }));
    root.appendChild(el('div', { className: 'app' }, shell));

    renderMessages();
    selectTab('chat');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
