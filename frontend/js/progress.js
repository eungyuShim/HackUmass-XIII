// progress.js - grade thresholds, progress bar & strategy
(function(){
  const gradeMap={'A+':97,'A':93,'A-':90,'B+':87,'B':83,'B-':80,'C+':77,'C':73,'C-':70};
  let currentTargetGrade = 'A';
  let ungradedItems = [];
  let totalDeductiblePoints = 0; // 감점 가능한 총 점수
  
  // ============ Progress Bar ============
  function updateProgressFromCategories(){
    const stats = GPCategories.calcProgressStats();
    window.dashboardStats = stats;
    const maxPct = Math.max(stats.minPct, Math.min(100, stats.minPct + stats.remainingWeight*100));
    
    updateElement('maxFill', el => el.style.width = maxPct+'%');
    updateElement('maxVal', el => el.textContent = maxPct.toFixed(1)+'%');
    
    collectUngradedItems();
    renderUngradedSliders();
  }
  
  // ============ Ungraded Items Collection ============
  function collectUngradedItems(){
    ungradedItems = [];
    
    // First, collect all ungraded items and calculate their individual weights
    GPCategories.get().forEach(cat => {
      const categoryItems = cat.items;
      const totalItemsInCategory = categoryItems.length;
      
      if(totalItemsInCategory === 0) return;
      
      // Each item in this category gets: categoryWeight / total items in category
      // This is the weight regardless of whether items are graded or not
      const itemWeight = cat.weight / totalItemsInCategory;
      
      categoryItems.forEach(item => {
        if(!hasScore(item)){
          ungradedItems.push({
            categoryName: cat.name,
            categoryWeight: cat.weight,
            categoryId: cat.id,
            itemName: item.name,
            itemId: item.id,
            itemWeight: itemWeight, // 이 아이템의 실제 가중치 (전체 성적 기준 %)
            totalItemsInCategory: totalItemsInCategory, // 카테고리 내 총 아이템 수
            assumedScore: 100, // Start at 100
            deductedPoints: 0, // 전체 성적에 미치는 감점 (%)
            isPinned: false    // 핀 고정 여부
          });
        }
      });
    });
    
    // Calculate total deductible points
    calculateTotalDeductiblePoints();
  }
  
  function calculateTotalDeductiblePoints(){
    const targetGrade = gradeMap[currentTargetGrade];
    const stats = window.dashboardStats || {minPct: 0, remainingWeight: 1};
    
    // Maximum possible grade with all 100s
    const maxPossible = stats.minPct + (stats.remainingWeight * 100);
    
    // Total points we can deduct while staying AT OR ABOVE target
    totalDeductiblePoints = maxPossible - targetGrade;
    
    // Calculate each item's maximum possible deduction
    // Each item can contribute at most (itemWeight/100) * 100 = itemWeight to overall grade
    // So maximum deduction is itemWeight (if item gets 0%)
    ungradedItems.forEach(item => {
      item.maxDeduction = item.itemWeight;
    });
    
    // Calculate total weight of all ungraded items
    const totalUngradedWeight = ungradedItems.reduce((sum, item) => sum + item.itemWeight, 0);
    
    // Distribute deductions to maintain: maxPossible - totalDeductions >= targetGrade
    if(totalUngradedWeight > 0 && totalDeductiblePoints > 0){
      ungradedItems.forEach(item => {
        // Each item gets a proportional share of the deductible budget
        const weightRatio = item.itemWeight / totalUngradedWeight;
        const deductForThisItem = totalDeductiblePoints * weightRatio;
        
        // But cannot exceed the item's maximum deduction
        item.deductedPoints = Math.min(deductForThisItem, item.maxDeduction);
        
        // Convert deduction to item score
        // Overall grade contribution from this item = (itemWeight/100) * itemScore
        // If we deduct X from overall grade, then: X = (itemWeight/100) * (100 - itemScore)
        // So: itemScore = 100 - (X * 100 / itemWeight)
        const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
        item.assumedScore = parseFloat(Math.max(0, 100 - scoreReduction).toFixed(1));
      });
      
      // Verify total doesn't exceed budget
      const actualTotal = ungradedItems.reduce((sum, item) => sum + item.deductedPoints, 0);
      
      if(actualTotal > totalDeductiblePoints + 0.01){
        // Scale down proportionally to fit budget
        const scale = totalDeductiblePoints / actualTotal;
        ungradedItems.forEach(item => {
          item.deductedPoints *= scale;
          const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
          item.assumedScore = parseFloat(Math.max(0, 100 - scoreReduction).toFixed(1));
        });
      }
    } else if(totalDeductiblePoints <= 0){
      // Target grade is already at or above max possible - all items must be 100%
      ungradedItems.forEach(item => {
        item.deductedPoints = 0;
        item.assumedScore = 100;
      });
    }
  }
  
  // ============ UI Rendering ============
  function renderUngradedSliders(){
    const container = document.getElementById('ungradedItemsList');
    if(!container) return;
    
    if(ungradedItems.length === 0){
      container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--txt-muted)">No ungraded assignments found. Great work!</div>';
      return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Get template
    const template = document.getElementById('ungradedItemTemplate');
    if(!template) {
      console.error('Template not found');
      return;
    }
    
    // UMass maroon color filter for SVG
    const maroonFilter = 'invert(13%) sepia(51%) saturate(4891%) hue-rotate(349deg) brightness(93%) contrast(93%)';
    const grayFilter = 'invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)';
    
    // Create elements from template
    ungradedItems.forEach((item, idx) => {
      const clone = template.content.cloneNode(true);
      
      // Get elements
      const sliderContainer = clone.querySelector('.ungraded-item-slider');
      const itemName = clone.querySelector('.item-name');
      const itemCategory = clone.querySelector('.item-category');
      const pinBtn = clone.querySelector('.pin-btn');
      const pinImg = pinBtn.querySelector('img');
      const textInput = clone.querySelector('.slider-value-input');
      const rangeSlider = clone.querySelector('.target-slider');
      
      // Set data
      itemName.textContent = item.itemName;
      itemCategory.textContent = item.categoryName;
      
      // Set pin state
      pinBtn.dataset.index = idx;
      pinBtn.style.opacity = item.isPinned ? '1' : '0.4';
      pinImg.style.filter = item.isPinned ? maroonFilter : grayFilter;
      
      // Set input values
      textInput.dataset.index = idx;
      textInput.value = item.assumedScore.toFixed(1);
      
      rangeSlider.dataset.index = idx;
      rangeSlider.value = item.assumedScore;
      rangeSlider.disabled = item.isPinned;
      
      container.appendChild(clone);
    });
    
    // Update projected grade after rendering
    updateProjectedGrade();
  }
  
  // ============ Event Binding ============
  function bindSliderChanges(){
    const container = document.getElementById('ungradedItemsList');
    if(!container) return;
    
    // Remove old listeners by cloning (clean slate)
    const newContainer = container.cloneNode(false);
    container.parentNode.replaceChild(newContainer, container);
    
    // Re-render with new container reference
    renderUngradedSliders();
    
    // Get new container reference
    const activeContainer = document.getElementById('ungradedItemsList');
    
    // Range slider input (실시간)
    activeContainer.addEventListener('input', handleRangeInput);
    
    // Text input - keydown for Enter key
    activeContainer.addEventListener('keydown', handleTextInput);
    
    // Pin button click - use mousedown for better responsiveness
    activeContainer.addEventListener('mousedown', handlePinClick);
    
    // Restore value on blur if invalid
    activeContainer.addEventListener('blur', handleInputBlur, true);
  }
  
  function handleRangeInput(e){
    if(!e.target.classList.contains('target-slider')) return;
    
    const idx = parseInt(e.target.dataset.index);
    if(isNaN(idx) || ungradedItems[idx]?.isPinned) return;
    
    const value = parseFloat(e.target.value);
    if(isNaN(value)) return;
    
    handleSliderChange(idx, value);
  }
  
  function handleTextInput(e){
    if(!e.target.classList.contains('slider-value-input') || e.key !== 'Enter') return;
    
    const idx = parseInt(e.target.dataset.index);
    if(isNaN(idx) || ungradedItems[idx]?.isPinned) return;
    
    const value = parseFloat(e.target.value);
    if(isNaN(value)) return;
    
    handleSliderChange(idx, Math.max(0, Math.min(100, value)));
    e.target.blur();
  }
  
  function handlePinClick(e){
    const pinBtn = e.target.closest('.pin-btn');
    if(!pinBtn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const idx = parseInt(pinBtn.dataset.index);
    if(!isNaN(idx)){
      togglePin(idx);
    }
  }
  
  function handleInputBlur(e){
    if(!e.target.classList.contains('slider-value-input')) return;
    
    const idx = parseInt(e.target.dataset.index);
    if(!isNaN(idx) && ungradedItems[idx]){
      e.target.value = ungradedItems[idx].assumedScore.toFixed(1);
    }
  }
  
  // ============ Core Logic: Deduction Point System ============
  function handleSliderChange(changedIdx, newScore){
    const item = ungradedItems[changedIdx];
    
    // Clamp score to valid range
    newScore = Math.max(0, Math.min(100, newScore));
    
    // Calculate new deduction for this item
    // Deduction = contribution at 100% - contribution at newScore
    // Contribution = (itemWeight/100) * score
    // So deduction = (itemWeight/100) * (100 - newScore) = itemWeight * (100 - newScore) / 100
    const newDeduction = (item.itemWeight * (100 - newScore)) / 100;
    
    // Cannot exceed item's max deduction
    if(newDeduction > item.maxDeduction + 0.01){
      item.deductedPoints = item.maxDeduction;
      item.assumedScore = 0;
      syncUI(changedIdx, 0);
      validateTotalDeductions();
      return;
    }
    
    // Calculate how much deduction changed
    const deductionDelta = newDeduction - item.deductedPoints;
    
    // Calculate total deduction from all other items
    const otherDeductions = ungradedItems
      .filter((_, idx) => idx !== changedIdx)
      .reduce((sum, itm) => sum + itm.deductedPoints, 0);
    
    // Check if total would exceed budget
    const newTotal = newDeduction + otherDeductions;
    
    if(newTotal > totalDeductiblePoints + 0.01){
      // Need to free up space by reducing deductions from other items
      const needToFree = newTotal - totalDeductiblePoints;
      
      if(!redistributeDeductions(changedIdx, needToFree)){
        // Cannot redistribute enough - limit this item's deduction
        const maxAllowed = totalDeductiblePoints - otherDeductions;
        const maxScore = 100 - (maxAllowed * 100 / item.itemWeight);
        
        item.deductedPoints = Math.max(0, maxAllowed);
        item.assumedScore = parseFloat(Math.max(0, Math.min(100, maxScore)).toFixed(1));
        syncUI(changedIdx, item.assumedScore);
        validateTotalDeductions();
        return;
      }
    }
    
    // Update this item
    item.deductedPoints = newDeduction;
    item.assumedScore = parseFloat(newScore.toFixed(1));
    syncUI(changedIdx, item.assumedScore);
    
    validateTotalDeductions();
  }
  
  function redistributeDeductions(excludeIdx, needToFree){
    // Get non-pinned items that can be adjusted (excluding the changed item)
    const adjustableItems = ungradedItems
      .map((item, idx) => ({item, idx}))
      .filter(({item, idx}) => idx !== excludeIdx && !item.isPinned && item.deductedPoints > 0);
    
    if(adjustableItems.length === 0) return false;
    
    // Sort by deduction amount (highest first) - take from items with most deduction
    adjustableItems.sort((a, b) => b.item.deductedPoints - a.item.deductedPoints);
    
    let remaining = needToFree;
    
    // Phase 1: Try proportional reduction by weight
    const totalAdjustableWeight = adjustableItems.reduce((sum, {item}) => sum + item.itemWeight, 0);
    
    if(totalAdjustableWeight > 0){
      for(const {item, idx} of adjustableItems){
        if(remaining <= 0.01) break;
        
        const weightRatio = item.itemWeight / totalAdjustableWeight;
        const targetReduction = needToFree * weightRatio;
        const canReduce = item.deductedPoints;
        const actualReduction = Math.min(canReduce, targetReduction, remaining);
        
        item.deductedPoints -= actualReduction;
        
        // Convert back to score
        const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
        item.assumedScore = parseFloat(Math.max(0, 100 - scoreReduction).toFixed(1));
        
        syncUI(idx, item.assumedScore);
        remaining -= actualReduction;
      }
    }
    
    // Phase 2: If still need more, take from highest deductions
    if(remaining > 0.01){
      for(const {item, idx} of adjustableItems){
        if(remaining <= 0.01) break;
        
        const canReduce = item.deductedPoints;
        if(canReduce <= 0) continue;
        
        const reduction = Math.min(canReduce, remaining);
        
        item.deductedPoints -= reduction;
        
        const scoreReduction = (item.deductedPoints * 100) / item.itemWeight;
        item.assumedScore = parseFloat(Math.max(0, 100 - scoreReduction).toFixed(1));
        
        syncUI(idx, item.assumedScore);
        remaining -= reduction;
      }
    }
    
    return remaining <= 0.01;
  }
  
  function validateTotalDeductions(){
    const totalUsed = ungradedItems.reduce((sum, item) => sum + item.deductedPoints, 0);
    const diff = Math.abs(totalUsed - totalDeductiblePoints);
    
    // Verify projected grade is at or above target
    const projected = calculateProjectedGrade();
    const target = gradeMap[currentTargetGrade];
    
    if(diff > 0.1){
      console.warn(`Deduction mismatch: used=${totalUsed.toFixed(4)}%, budget=${totalDeductiblePoints.toFixed(4)}%, diff=${diff.toFixed(4)}%`);
    }
    
    if(projected < target - 0.1){
      console.warn(`Projected grade ${projected.toFixed(2)}% is below target ${target}%`);
    }
  }
  
  function togglePin(idx){
    if(!ungradedItems[idx]) return;
    
    const item = ungradedItems[idx];
    const wasPinned = item.isPinned;
    item.isPinned = !wasPinned;
    
    // Re-render to update UI
    renderUngradedSliders();
  }
  
  // ============ Calculations ============
  function calculateProjectedGrade(){
    let total = 0;
    
    GPCategories.get().forEach(cat => {
      const totalItemsInCategory = cat.items.length;
      if(totalItemsInCategory === 0) return;
      
      // Each item contributes: (categoryWeight / totalItems) * itemScore / 100
      const itemWeight = cat.weight / totalItemsInCategory;
      
      cat.items.forEach(item => {
        let itemScore = 0;
        
        if(hasScore(item)){
          // Item has a graded score
          itemScore = parseFloat(item.score);
        } else {
          // Item is ungraded - use assumed score
          const ungraded = ungradedItems.find(ui => ui.itemId === item.id && ui.categoryId === cat.id);
          if(ungraded){
            itemScore = ungraded.assumedScore;
          } else {
            // Not in ungraded list (shouldn't happen, but default to 0)
            itemScore = 0;
          }
        }
        
        // Contribution to overall grade = (itemWeight / 100) * itemScore
        total += (itemWeight / 100) * itemScore;
      });
    });
    
    return total;
  }
  
  // ============ Utilities ============
  function hasScore(item){
    return item.score !== null && item.score !== undefined && item.score !== '';
  }
  
  function syncUI(idx, value){
    const sliders = document.querySelectorAll('.target-slider');
    const inputs = document.querySelectorAll('.slider-value-input');
    if(sliders[idx]) sliders[idx].value = value;
    if(inputs[idx]) inputs[idx].value = value.toFixed(1);
    
    // Update projected grade
    updateProjectedGrade();
  }
  
  function updateProjectedGrade(){
    const projected = calculateProjectedGrade();
    updateElement('projectedGrade', el => {
      el.textContent = projected.toFixed(1) + '%';
      el.style.color = 'var(--accent)';
    });
  }
  
  function updateElement(id, callback){
    const el = document.getElementById(id);
    if(el) callback(el);
  }
  
  // ============ Grade Pin & Selection ============
  function initGradePin(){
    const key = 'A';
    const target = gradeMap[key];
    
    updateElement('targetPin', el => {
      el.style.display = 'flex';
      el.style.left = target + '%';
    });
    updateElement('targetPinLabel', el => {
      el.textContent = key;
      el.title = `${key} ≥ ${target}%`;
    });
    
    const btn = document.querySelector(`.grade-btn[data-grade="${key}"]`);
    if(btn) btn.classList.add('active');
    
    currentTargetGrade = key;
    updateElement('strategyTitle', el => el.textContent = `Strategy for ${key}`);
    updateElement('targetStrategy', el => el.style.display = 'block');
  }
  
  function bindGradeSelection(){
    const options = document.getElementById('gradeOptions');
    if(!options) return;
    
    options.addEventListener('click', e => {
      const btn = e.target.closest('.grade-btn');
      if(!btn) return;
      
      const key = btn.dataset.grade;
      const target = gradeMap[key];
      if(target == null) return;
      
      options.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      updateElement('targetPin', el => {
        el.style.display = 'flex';
        el.style.left = target + '%';
      });
      updateElement('targetPinLabel', el => {
        el.textContent = key;
        el.title = `${key} ≥ ${target}%`;
      });
      
      currentTargetGrade = key;
      updateElement('strategyTitle', el => el.textContent = `Strategy for ${key}`);
      updateElement('targetStrategy', el => el.style.display = 'block');
      
      // Recalculate with new target
      collectUngradedItems();
      renderUngradedSliders();
      bindSliderChanges();
      updateProjectedGrade();
    });
  }
  
  function bindPinHover(){
    const pinLabel = document.getElementById('targetPinLabel');
    if(!pinLabel) return;
    
    pinLabel.addEventListener('mouseenter', () => {
      const threshold = gradeMap[currentTargetGrade];
      if(threshold) pinLabel.textContent = `${currentTargetGrade} ≥ ${threshold}%`;
    });
    
    pinLabel.addEventListener('mouseleave', () => {
      if(currentTargetGrade) pinLabel.textContent = currentTargetGrade;
    });
  }
  
  // ============ Legacy Support ============
  function computeNeeds(target){
    const stats = window.dashboardStats || {minPct:0, remainingWeight:1};
    if(stats.remainingWeight <= 0) return {neededAvg: Infinity, rows: []};
    const neededAvg = Math.max(0, (target - stats.minPct) / stats.remainingWeight);
    return {neededAvg, rows: [`<b>Overall needed average:</b> ${neededAvg.toFixed(1)}% across remaining work`]};
  }
  
  function updateStrategyResult(){
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
