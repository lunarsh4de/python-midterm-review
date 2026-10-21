(function () {
  'use strict';
  const answerKeys = {"names-strings": {"truth": true, "expected": ["True"]}, "range-slice": {"truth": false, "expected": ["[1, 2]"]}, "collections-sort": {"truth": false, "expected": ["None"]}, "functions-return": {"truth": true, "expected": ["8"]}, "numpy-create": {"truth": false, "expected": ["(2, 3)"]}, "axis-defaults": {"truth": false, "expected": ["[6, 15]"]}, "numpy-index": {"truth": false, "expected": ["[2, 4]"]}, "matplotlib": {"truth": false, "expected": ["[(0, 4), (2, 2)]"]}, "scipy": {"truth": true, "expected": ["4"]}, "pandas-index": {"truth": false, "expected": ["21"]}, "pandas-analysis": {"truth": true, "expected": ["[80, 90]"]}, "ai-problem": {"truth": false, "expected": ["11"]}, "bfs-dfs": {"truth": false, "expected": ["B"]}, "ucs": {"truth": false, "expected": ["B"]}, "astar": {"truth": true, "expected": ["A"]}, "expert-architecture": {"truth": true, "expected": ["True"]}, "chaining": {"truth": false, "expected": ["True"]}, "pyke-family": {"truth": false, "expected": ["('bruce', 'david', ())"]}, "pyke-weather": {"truth": false, "expected": ["2"]}, "ml-data": {"truth": false, "expected": ["3"]}, "ml-regression": {"truth": true, "expected": ["1.0", "1"]}, "ml-metrics": {"truth": false, "expected": ["1"]}, "ml-trees": {"truth": false, "expected": ["1"]}, "ml-bayes": {"truth": false, "expected": ["0.6", "0.60"]}, "ml-knn-svm": {"truth": true, "expected": ["cat"]}};
  const storeKey = 'idat7215-dialogue-lessons-v1';
  const modules = [...document.querySelectorAll('[data-lesson]')];
  if (!modules.length) return;
  const select = document.querySelector('#lesson-select');
  const focusButton = document.querySelector('[data-focus]');
  const prevButton = document.querySelector('[data-prev]');
  const nextButton = document.querySelector('[data-next]');
  const progress = document.querySelector('[data-study-progress]');
  const reminder = document.querySelector('[data-review-reminder]');
  const storageNotice = document.querySelector('[data-storage-notice]');
  const states = Object.create(null);
  let storage = null;
  let lastReminder = 0;
  let focused = true;
  let current = 0;
  const validIds = new Set(modules.map(module => module.dataset.lesson));
  const labels = {
    unseen: '尚未学习', pending: '已读／作答，掌握待验证',
    explain: '听过但不会解释', exercise: '会解释但不会做题',
    english: '会做题但英语表达不清楚', passed: '三项通过（含解释与英语自评）'
  };
  function cleanState(value) {
    const item = value && typeof value === 'object' ? value : {};
    const short = v => typeof v === 'string' ? v.slice(0, 5000) : '';
    return {
      read: item.read === true, attempted: item.attempted === true,
      truth: ['true', 'false'].includes(item.truth) ? item.truth : '',
      output: short(item.output), english: short(item.english),
      explain: ['yes', 'no'].includes(item.explain) ? item.explain : '',
      language: ['yes', 'no'].includes(item.language) ? item.language : '',
      graded: item.graded === true
    };
  }
  try {
    storage = window.localStorage;
    const saved = JSON.parse(storage.getItem(storeKey) || '{}');
    if (saved && saved.version === 1 && saved.lessons && typeof saved.lessons === 'object') {
      for (const id of validIds) states[id] = cleanState(saved.lessons[id]);
      lastReminder = Number.isInteger(saved.lastReminder) ? saved.lastReminder : 0;
    }
    storage.setItem(storeKey + '-probe', '1');
    storage.removeItem(storeKey + '-probe');
  } catch (error) {
    storage = null;
    storageNotice.textContent = '当前浏览器无法保存本地记录。本次仍可学习和检查，刷新后记录可能丢失。';
  }
  for (const id of validIds) states[id] = cleanState(states[id]);
  function save() {
    if (!storage) return;
    try { storage.setItem(storeKey, JSON.stringify({version: 1, lessons: states, lastReminder})); }
    catch (error) {
      storage = null;
      storageNotice.textContent = '本地保存失败；当前记录仍在本次页面中，请勿依赖刷新后恢复。';
    }
  }
  function normalize(value) {
    return String(value).trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
      .replace(/"/g, "'").replace(/\s+/g, '').replace(/，/g, ',');
  }
  function grades(id) {
    const state = states[id];
    const key = answerKeys[id];
    return {
      truth: state.truth === String(key.truth),
      output: key.expected.some(value => normalize(value) === normalize(state.output))
    };
  }
  function status(id) {
    const item = states[id];
    if (!item.read && !item.attempted) return 'unseen';
    if (item.explain === 'no') return 'explain';
    const result = grades(id);
    if (item.explain === 'yes' && item.graded && (!result.truth || !result.output)) return 'exercise';
    if (item.explain === 'yes' && item.graded && result.truth && result.output) {
      if (item.language === 'no') return 'english';
      if (item.language === 'yes') return 'passed';
    }
    return 'pending';
  }
  function renderFeedback(module) {
    const id = module.dataset.lesson;
    const state = states[id];
    const solution = module.querySelector('.check-solution');
    const feedback = module.querySelector('.check-feedback');
    solution.hidden = !state.graded;
    if (!state.graded) { feedback.textContent = ''; return; }
    const result = grades(id);
    feedback.textContent = '判断题：' + (result.truth ? '正确' : '需要复查') + '；输出题：' +
      (result.output ? '正确' : '需要复查（也请核对输出格式）') + '。英语语义请对照参考句自评。';
  }
  function update() {
    const groups = Object.fromEntries(Object.keys(labels).map(key => [key, []]));
    modules.forEach((module, index) => {
      const id = module.dataset.lesson;
      const code = status(id);
      module.querySelector('[data-status]').textContent = labels[code];
      groups[code].push({module, index});
    });
    const read = Object.values(states).filter(item => item.read).length;
    const submitted = Object.values(states).filter(item => item.attempted).length;
    progress.textContent = '已读 ' + read + ' / ' + modules.length + ' · 已做检查 ' + submitted +
      ' · 三项通过（含自评） ' + groups.passed.length + '。已读不等于已掌握。';
    const gapCount = groups.explain.length + groups.exercise.length + groups.english.length;
    const milestone = Math.floor(submitted / 3);
    if (milestone > lastReminder) {
      lastReminder = milestone;
      reminder.textContent = '已完成 ' + submitted + ' 个不同模块的检查。' + (gapCount
        ? '先回顾下面 ' + gapCount + ' 个已确认遗漏，再继续下一模块。'
        : '暂未记录明确遗漏；尚未完成的解释与英语自评仍保留待验证。');
    }
    const summary = document.querySelector('[data-gap-summary]');
    summary.replaceChildren();
    const counts = document.createElement('div'); counts.className = 'gap-counts';
    for (const key of ['explain','exercise','english','pending','unseen','passed']) {
      const chip = document.createElement('span'); chip.textContent = labels[key] + ' ' + groups[key].length;
      counts.appendChild(chip);
    }
    summary.appendChild(counts);
    const list = document.querySelector('[data-gap-items]'); list.replaceChildren();
    for (const key of ['explain','exercise','english','pending','unseen']) {
      if (!groups[key].length) continue;
      const li = document.createElement('li');
      const details = document.createElement('details');
      details.open = ['explain','exercise','english'].includes(key);
      const title = document.createElement('summary'); title.textContent = labels[key] + ' · ' + groups[key].length;
      details.appendChild(title);
      const links = document.createElement('ul');
      groups[key].forEach(({module, index}) => {
        const row = document.createElement('li'); const link = document.createElement('a');
        link.href = '#' + module.id;
        link.textContent = module.querySelector('h2').textContent;
        link.addEventListener('click', event => {event.preventDefault();show(index, true);});
        row.appendChild(link); links.appendChild(row);
      });
      details.appendChild(links); li.appendChild(details); list.appendChild(li);
    }
  }
  function show(index, moveFocus) {
    current = Math.max(0, Math.min(modules.length - 1, index));
    modules.forEach((module, n) => { module.hidden = focused && n !== current; });
    select.value = modules[current].id;
    prevButton.disabled = current === 0;
    nextButton.disabled = current === modules.length - 1;
    focusButton.setAttribute('aria-pressed', String(focused));
    focusButton.textContent = focused ? '显示全部模块' : '一次只看一个模块';
    const hash = '#' + modules[current].id;
    try { history.replaceState(null, '', hash); } catch (error) { /* Static-file views may restrict history. */ }
    if (moveFocus) {
      modules[current].querySelector('h2').focus({preventScroll: true});
      modules[current].scrollIntoView({block: 'start'});
    }
  }
  modules.forEach(module => {
    const id = module.dataset.lesson; const item = states[id];
    const form = module.querySelector('form');
    if (item.truth) form.querySelector('input[name=truth][value="' + item.truth + '"]').checked = true;
    form.elements.output.value = item.output; form.elements.english.value = item.english;
    module.querySelector('[data-self=explain]').value = item.explain;
    module.querySelector('[data-self=language]').value = item.language;
    form.addEventListener('input', () => {
      item.truth = form.querySelector('input[name=truth]:checked')?.value || '';
      item.output = form.elements.output.value; item.english = form.elements.english.value;
      item.graded = false;
      renderFeedback(module); update(); save();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!form.elements.output.value.trim() || !form.elements.english.value.trim()) {
        module.querySelector('.check-feedback').textContent = '请先写下输出预测和一句英语，再查看解析。'; return;
      }
      item.truth = form.querySelector('input[name=truth]:checked').value;
      item.output = form.elements.output.value; item.english = form.elements.english.value;
      item.read = true; item.attempted = true; item.graded = true;
      renderFeedback(module); update(); save();
    });
    module.querySelectorAll('[data-self]').forEach(control => {
      control.addEventListener('change', () => {
        item[control.dataset.self] = control.value; item.read = true; update(); save();
      });
    });
    module.querySelector('[data-read]').addEventListener('click', () => { item.read = true; update(); save(); });
    renderFeedback(module);
  });
  select.addEventListener('change', () => show(modules.findIndex(module => module.id === select.value), true));
  prevButton.addEventListener('click', () => show(current - 1, true));
  nextButton.addEventListener('click', () => show(current + 1, true));
  focusButton.addEventListener('click', () => {focused = !focused; show(current, false);});
  document.querySelector('[data-open-gaps]').addEventListener('click', () => {
    document.querySelector('#gap-heading').focus();
    document.querySelector('#gap-list').scrollIntoView({block: 'start'});
  });
  window.addEventListener('hashchange', () => {
    const index = modules.findIndex(module => module.id === location.hash.slice(1));
    if (index >= 0) show(index, true);
  });
  const initial = modules.findIndex(module => module.id === location.hash.slice(1));
  update(); show(initial >= 0 ? initial : 0, false);
})();
