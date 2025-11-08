// progress.js - grade thresholds, progress bar & strategy
(function(){
  const gradeMap={'A+':97,'A':93,'A-':90,'B+':87,'B':83,'B-':80,'C+':77,'C':73,'C-':70};
  function updateProgressFromCategories(){
    const stats = GPCategories.calcProgressStats();
    window.dashboardStats = stats;
    const maxPct = Math.max(stats.minPct, Math.min(100, stats.minPct + stats.remainingWeight*100));
    const maxFill=document.getElementById('maxFill'); const maxVal=document.getElementById('maxVal');
    if(maxFill) maxFill.style.width = maxPct+'%';
    if(maxVal) maxVal.textContent = maxPct.toFixed(1)+'%';
  }
  function computeNeeds(target){
    const stats = window.dashboardStats || { minPct:0, remainingWeight:1 };
    if(stats.remainingWeight<=0) return {neededAvg:Infinity, rows:[]};
    const neededAvg = Math.max(0,(target-stats.minPct)/stats.remainingWeight);
    return {neededAvg, rows:[`<b>Overall needed average:</b> ${neededAvg.toFixed(1)}% across remaining work`]};
  }
  function initGradePin(){
    const key='A'; const target=gradeMap[key]; const pin=document.getElementById('targetPin'); const pinLabel=document.getElementById('targetPinLabel');
    if(pin && pinLabel){ pin.style.display='flex'; pin.style.left=target+'%'; pinLabel.textContent=key; pinLabel.title=`${key} ≥ ${target}%`; }
    const btn=document.querySelector(`.grade-btn[data-grade="${key}"]`); if(btn) btn.classList.add('active'); window.activeGradeLetter=key;
  }
  function bindGradeSelection(){
    const options=document.getElementById('gradeOptions'); if(!options) return;
    options.addEventListener('click', e=>{ const btn=e.target.closest('.grade-btn'); if(!btn) return; options.querySelectorAll('.grade-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const key=btn.dataset.grade; const target=gradeMap[key]; if(target==null) return; const pin=document.getElementById('targetPin'); const pinLabel=document.getElementById('targetPinLabel'); if(pin&&pinLabel){ pin.style.display='flex'; pin.style.left=target+'%'; pinLabel.textContent=key; pinLabel.title=`${key} ≥ ${target}%`; } window.activeGradeLetter=key; const {rows}=computeNeeds(target); const titleEl=document.getElementById('strategyTitle'); const needsEl=document.getElementById('needs'); const card=document.getElementById('targetStrategy'); if(titleEl) titleEl.textContent=`Strategy for ${key}`; if(needsEl) needsEl.innerHTML=rows.map(r=>`<li>${r}</li>`).join(''); if(card) card.style.display='block'; });
  }
  function bindPinHover(){ const pinLabel=document.getElementById('targetPinLabel'); if(!pinLabel) return; pinLabel.addEventListener('mouseenter',()=>{ const g=window.activeGradeLetter; if(!g) return; const threshold=gradeMap[g]; pinLabel.textContent=`${g} ≥ ${threshold}%`; }); pinLabel.addEventListener('mouseleave',()=>{ const g=window.activeGradeLetter; if(!g) return; pinLabel.textContent=g; }); }
  window.GPProgress = { updateProgressFromCategories, computeNeeds, initGradePin, bindGradeSelection, bindPinHover };
})();
