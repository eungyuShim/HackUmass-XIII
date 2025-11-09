// progress.js - grade thresholds, progress bar & strategy (optimized)
(function () {
  const gradeMap = {
    'A+': 97, 'A': 93, 'A-': 90,
    'B+': 87, 'B': 83, 'B-': 80,
    'C+': 77, 'C': 73, 'C-': 70
  };

  let currentTargetGrade = 'A';
  let ungradedItems = [];
  let totalDeductiblePoints = 0; // 감점 가능한 총 점수

  const domCache = Object.create(null);
  const maroonFilter = 'invert(13%) sepia(51%) saturate(4891%) hue-rotate(349deg) brightness(93%) contrast(93%)';
  const grayFilter = 'invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)';

  let slidersEventsBound = false;

  // ============ Helpers ============
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getEl(id) {
    if (!domCache[id]) {
      domCache[id] = document.getElementById(id);
    }
    return domCache[id];
  }

  function updateElement(id, callback) {
    const el = getEl(id);
    if (el) callback(el);
  }

  function hasScore(item) {
    return item.score !== null && item.score !== undefined && item.score !== '';
  }

  // ============ Progress Bar ============
  function updateProgressFromCategories() {
    const stats = GPCategories.calcProgressStats();
    window.dashboardStats = stats;

    const maxPct = Math.max(
      stats.minPct,
      Math.min(100, stats.minPct + stats.remainingWeight * 100)
    );

    updateElement('maxFill', el => {
      el.style.width = `${maxPct}%`;
    });
    updateElement('maxVal', el => {
      el.textContent = `${maxPct.toFixed(1)}%`;
    });

    collectUngradedItems();
    renderUngradedSliders();
  }

  // ============ Ungraded Items Collection ============
  function collectUngradedItems() {
    ungradedItems = [];

    GPCategories.get().forEach(cat => {
      const items = cat.items;
      const totalItemsInCategory = items.length;
      if (totalItemsInCategory === 0) return;

      const itemWeight = cat.weight / totalItemsInCategory;

      items.forEach(item => {
        if (!hasScore(item)) {
          ungradedItems.push({
            categoryName: cat.name,
            categoryWeight: cat.weight,
            categoryId: cat.id,
            itemName: item.name,
            itemId: item.id,
            itemWeight,
            totalItemsInCategory,
            assumedScore: 100,
            deductedPoints: 0,
            maxDeduction: 0,
            isPinned: false
          });
        }
      });
    });

    calculateTotalDeductiblePoints();
  }

  function calculateTotalDeductiblePoints() {
    const targetGrade = gradeMap[currentTargetGrade];
    const stats = window.dashboardStats || { minPct: 0, remainingWeight: 1 };

    const maxPossible = stats.minPct + (stats.remainingWeight * 100);
    totalDeductiblePoints = maxPossible - targetGrade;

    if (totalDeductiblePoints <= 0) {
      // 이미 타겟 이하이므로, 모든 미채점 항목은 100% 유지
      ungradedItems.forEach(item => {
        item.maxDeduction = 0;
        item.deductedPoints = 0;
        item.assumedScore = 100;
      });
      return;
    }

    // 각 아이템이 낼 수 있는 최대 감점은 자신의 weight
    ungradedItems.forEach(item => {
      item.maxDeduction = item.itemWeight;
    });

    const totalMaxDeduction = ungradedItems.reduce(
      (sum, item) => sum + item.maxDeduction,
      0
    );

    if (totalMaxDeduction <= 0) return;

    // 비율에 따라 감점 배분
    ungradedItems.forEach(item => {
      const share = item.itemWeight / totalMaxDeduction;
      const targetDeduction = totalDeductiblePoints * share;

      item.deductedPoints = Math.min(targetDeduction, item.maxDeduction);

      const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
      item.assumedScore = parseFloat(
        clamp(100 - scoreReduction, 0, 100).toFixed(1)
      );
    });

    // 총합이 약간 넘을 경우 스케일링
    const actualTotal = ungradedItems.reduce(
      (sum, item) => sum + item.deductedPoints,
      0
    );

    if (actualTotal > totalDeductiblePoints + 0.01) {
      const scale = totalDeductiblePoints / actualTotal;
      ungradedItems.forEach(item => {
        item.deductedPoints *= scale;
        const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
        item.assumedScore = parseFloat(
          clamp(100 - scoreReduction, 0, 100).toFixed(1)
        );
      });
    }
  }

  // ============ UI Rendering ============
  function renderUngradedSliders() {
    const container = getEl('ungradedItemsList');
    if (!container) return;

    if (ungradedItems.length === 0) {
      container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--txt-muted)">No ungraded assignments found. Great work!</div>';
      updateProjectedGrade();
      return;
    }

    container.innerHTML = '';

    const template = getEl('ungradedItemTemplate');
    if (!template || !template.content) {
      console.error('Template not found or invalid');
      return;
    }

    ungradedItems.forEach((item, idx) => {
      const clone = template.content.cloneNode(true);

      const itemName = clone.querySelector('.item-name');
      const itemCategory = clone.querySelector('.item-category');
      const pinBtn = clone.querySelector('.pin-btn');
      const pinImg = pinBtn ? pinBtn.querySelector('img') : null;
      const textInput = clone.querySelector('.slider-value-input');
      const rangeSlider = clone.querySelector('.target-slider');

      if (itemName) itemName.textContent = item.itemName;
      if (itemCategory) itemCategory.textContent = item.categoryName;

      if (pinBtn && pinImg) {
        pinBtn.dataset.index = idx;
        const pinned = item.isPinned;
        pinBtn.style.opacity = pinned ? '1' : '0.4';
        pinImg.style.filter = pinned ? maroonFilter : grayFilter;
      }

      if (textInput) {
        textInput.dataset.index = idx;
        textInput.value = item.assumedScore.toFixed(1);
      }

      if (rangeSlider) {
        rangeSlider.dataset.index = idx;
        rangeSlider.value = item.assumedScore;
        rangeSlider.disabled = item.isPinned;
      }

      container.appendChild(clone);
    });

    updateProjectedGrade();
  }

  // ============ Event Binding ============
  function bindSliderChanges() {
    const container = getEl('ungradedItemsList');
    if (!container) return;

    // 항상 최신 데이터 기준으로 렌더
    renderUngradedSliders();

    // 이벤트는 한 번만 바인딩 (이벤트 위임)
    if (slidersEventsBound) return;
    slidersEventsBound = true;

    container.addEventListener('input', handleRangeInput);
    container.addEventListener('keydown', handleTextInput);
    container.addEventListener('mousedown', handlePinClick);
    container.addEventListener('blur', handleInputBlur, true);
  }

  function handleRangeInput(e) {
    const target = e.target;
    if (!target.classList.contains('target-slider')) return;

    const idx = parseInt(target.dataset.index, 10);
    const item = ungradedItems[idx];
    if (!item || item.isPinned) return;

    const value = parseFloat(target.value);
    if (isNaN(value)) return;

    handleSliderChange(idx, value);
  }

  function handleTextInput(e) {
    if (e.key !== 'Enter') return;
    const target = e.target;
    if (!target.classList.contains('slider-value-input')) return;

    const idx = parseInt(target.dataset.index, 10);
    const item = ungradedItems[idx];
    if (!item || item.isPinned) return;

    const value = parseFloat(target.value);
    if (isNaN(value)) return;

    handleSliderChange(idx, clamp(value, 0, 100));
    target.blur();
  }

  function handlePinClick(e) {
    const pinBtn = e.target.closest('.pin-btn');
    if (!pinBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const idx = parseInt(pinBtn.dataset.index, 10);
    if (isNaN(idx)) return;
    
    const item = ungradedItems[idx];
    if (!item) return;

    item.isPinned = !item.isPinned;
    renderUngradedSliders();
  }

  function handleInputBlur(e) {
    const target = e.target;
    if (!target.classList.contains('slider-value-input')) return;

    const idx = parseInt(target.dataset.index, 10);
    const item = ungradedItems[idx];
    if (!item) return;

    target.value = item.assumedScore.toFixed(1);
  }

  // ============ Core Logic: Deduction Point System ============
  function handleSliderChange(changedIdx, newScore) {
    const item = ungradedItems[changedIdx];
    if (!item) return;

    newScore = clamp(newScore, 0, 100);

    const newDeduction = (item.itemWeight / 100) * (100 - newScore);

    if (newDeduction > item.maxDeduction + 0.01) {
      item.deductedPoints = item.maxDeduction;
      item.assumedScore = 0;
      syncUI(changedIdx, 0);
      updateProjectedGrade();
      return;
    }

    const otherDeductions = ungradedItems.reduce((sum, itm, idx) => {
      return idx === changedIdx ? sum : sum + itm.deductedPoints;
    }, 0);

    const newTotal = newDeduction + otherDeductions;

    if (newTotal > totalDeductiblePoints + 0.01) {
      const needToFree = newTotal - totalDeductiblePoints;

      if (!redistributeDeductions(changedIdx, needToFree)) {
        const maxAllowed = clamp(totalDeductiblePoints - otherDeductions, 0, item.maxDeduction);
        const maxScore = 100 - (maxAllowed * 100 / item.itemWeight);

        item.deductedPoints = maxAllowed;
        item.assumedScore = parseFloat(
          clamp(maxScore, 0, 100).toFixed(1)
        );
        syncUI(changedIdx, item.assumedScore);
        updateProjectedGrade();
        return;
      }
    }

    item.deductedPoints = newDeduction;
    item.assumedScore = parseFloat(newScore.toFixed(1));
    syncUI(changedIdx, item.assumedScore);

    updateProjectedGrade();
  }

  function redistributeDeductions(excludeIdx, needToFree) {
    const adjustableItems = ungradedItems
      .map((item, idx) => ({ item, idx }))
      .filter(({ item, idx }) => idx !== excludeIdx && !item.isPinned && item.deductedPoints > 0);

    if (adjustableItems.length === 0) return false;

    adjustableItems.sort((a, b) => b.item.deductedPoints - a.item.deductedPoints);

    let remaining = needToFree;
    const totalAdjustableMax = adjustableItems.reduce(
      (sum, { item }) => sum + item.maxDeduction,
      0
    );

    if (totalAdjustableMax > 0) {
      for (const { item, idx } of adjustableItems) {
        if (remaining <= 0.01) break;

        const share = item.maxDeduction / totalAdjustableMax;
        const targetReduction = needToFree * share;
        const canReduce = item.deductedPoints;
        const actualReduction = Math.min(canReduce, targetReduction, remaining);

        item.deductedPoints -= actualReduction;
        remaining -= actualReduction;
      }
    }

    if (remaining > 0.01) {
      for (const { item, idx } of adjustableItems) {
        if (remaining <= 0.01) break;

        const canReduce = item.deductedPoints;
        if (canReduce <= 0) continue;

        const reduction = Math.min(canReduce, remaining);
        item.deductedPoints -= reduction;
        remaining -= reduction;
      }
    }

    for (const { item, idx } of adjustableItems) {
      const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
      item.assumedScore = parseFloat(
        clamp(100 - scoreReduction, 0, 100).toFixed(1)
      );
      syncUI(idx, item.assumedScore);
    }

    return remaining <= 0.01;
  }

  // ============ Calculations ============
  function calculateProjectedGrade() {
    let total = 0;

    GPCategories.get().forEach(cat => {
      const items = cat.items;
      const totalItemsInCategory = items.length;
      if (totalItemsInCategory === 0) return;

      const itemWeight = cat.weight / totalItemsInCategory;

      items.forEach(item => {
        let itemScore = 0;

        if (hasScore(item)) {
          itemScore = parseFloat(item.score);
        } else {
          const ungraded = ungradedItems.find(
            ui => ui.itemId === item.id && ui.categoryId === cat.id
          );
          itemScore = ungraded ? ungraded.assumedScore : 0;
        }

        total += (itemWeight / 100) * itemScore;
      });
    });

    return total;
  }

  function syncUI(idx, value) {
    // index 기반으로 직접 찾는 대신, data-index를 이용해 최소 DOM 탐색
    const slider = document.querySelector(`.target-slider[data-index="${idx}"]`);
    const input = document.querySelector(`.slider-value-input[data-index="${idx}"]`);

    if (slider) slider.value = value;
    if (input) input.value = value.toFixed(1);

    updateProjectedGrade();
  }

  function updateProjectedGrade() {
    const projected = calculateProjectedGrade();
    updateElement('projectedGrade', el => {
      el.textContent = projected.toFixed(1) + '%';
      el.style.color = 'var(--accent)';
    });
  }

  // ============ Grade Pin & Selection ============
  function initGradePin() {
    const key = 'A';
    const target = gradeMap[key];

    updateElement('targetPin', el => {
      el.style.display = 'flex';
      el.style.left = `${target}%`;
    });
    updateElement('targetPinLabel', el => {
      el.textContent = key;
      el.title = `${key} ≥ ${target}%`;
    });

    const btn = document.querySelector(`.grade-btn[data-grade="${key}"]`);
    if (btn) btn.classList.add('active');

    currentTargetGrade = key;
    updateElement('strategyTitle', el => {
      el.textContent = `Strategy for ${key}`;
    });
    updateElement('targetStrategy', el => {
      el.style.display = 'block';
    });
  }

  function bindGradeSelection() {
    const options = getEl('gradeOptions');
    if (!options) return;

    options.addEventListener('click', e => {
      const btn = e.target.closest('.grade-btn');
      if (!btn) return;

      const key = btn.dataset.grade;
      const target = gradeMap[key];
      if (target == null) return;

      options.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      updateElement('targetPin', el => {
        el.style.display = 'flex';
        el.style.left = `${target}%`;
      });
      updateElement('targetPinLabel', el => {
        el.textContent = key;
        el.title = `${key} ≥ ${target}%`;
      });

      currentTargetGrade = key;
      updateElement('strategyTitle', el => {
        el.textContent = `Strategy for ${key}`;
      });
      updateElement('targetStrategy', el => {
        el.style.display = 'block';
      });

      // 새 타겟 기준으로 재계산
      collectUngradedItems();
      renderUngradedSliders();
      bindSliderChanges(); // 이벤트는 한 번만 바인딩, 이후엔 렌더만 수행
      updateProjectedGrade();
    });
  }

  function bindPinHover() {
    const pinLabel = getEl('targetPinLabel');
    if (!pinLabel) return;

    pinLabel.addEventListener('mouseenter', () => {
      const threshold = gradeMap[currentTargetGrade];
      if (threshold) {
        pinLabel.textContent = `${currentTargetGrade} ≥ ${threshold}%`;
      }
    });

    pinLabel.addEventListener('mouseleave', () => {
      if (currentTargetGrade) {
        pinLabel.textContent = currentTargetGrade;
      }
    });
  }

  // ============ Legacy Support ============
  function computeNeeds(target) {
    const stats = window.dashboardStats || { minPct: 0, remainingWeight: 1 };
    if (stats.remainingWeight <= 0) return { neededAvg: Infinity, rows: [] };

    const neededAvg = Math.max(0, (target - stats.minPct) / stats.remainingWeight);
    return {
      neededAvg,
      rows: [`<b>Overall needed average:</b> ${neededAvg.toFixed(1)}% across remaining work`]
    };
  }

  function updateStrategyResult() {
    // Placeholder for compatibility
  }

  // ============ Public API ============
  window.GPProgress = {
    updateProgressFromCategories,
    computeNeeds,
    initGradePin,
    bindGradeSelection,
    bindPinHover,
    bindSliderChanges,
    updateStrategyResult
  };
})();
