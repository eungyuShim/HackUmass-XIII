// setup.js - course setup modal & setupCategories
(function(){
  let setupCategories = [
    {id: 1, name: 'Midterm Exam', weight: 20, count: 1},
    {id: 2, name: 'Final Exam', weight: 30, count: 1},
    {id: 3, name: 'Assignments', weight: 25, count: 5},
    {id: 4, name: 'Quizzes', weight: 25, count: 3}
  ];
  let nextSetupCategoryId = 5;

  function openSetupModal(){ document.getElementById('setupModal').style.display='flex'; document.getElementById('step1').style.display='block'; document.getElementById('step2').style.display='none'; }
  function closeSetupModal(){ document.getElementById('setupModal').style.display='none'; }
  function skipToAnalysis(){ document.getElementById('uploadStatus').textContent=''; proceedToAnalysis(); }
  function proceedToAnalysis(){ document.getElementById('step1').style.display='none'; document.getElementById('step2').style.display='block'; renderSetupCategories(); }
  function backToUpload(){ document.getElementById('step1').style.display='block'; document.getElementById('step2').style.display='none'; }
  function renderSetupCategories(){ const container=document.getElementById('setupCategoriesList'); if(!container) return; container.innerHTML=''; setupCategories.forEach(cat=>{ const wrapper=document.createElement('div'); wrapper.style.cssText='background:var(--bg-gray);border:1px solid var(--border-light);border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center'; wrapper.innerHTML=`<div style="flex:1"><input type="text" value="${cat.name}" data-setup-id="${cat.id}" data-field="name" class="setup-input-name" style="border:none;background:transparent;font-weight:600;font-size:15px;color:var(--txt);width:200px" placeholder="Category name"><div style="font-size:13px;color:var(--txt-muted);margin-top:4px"><input type="number" value="${cat.weight}" min="0" max="100" data-setup-id="${cat.id}" data-field="weight" class="setup-input-weight" style="width:60px;border:1px solid var(--border);border-radius:4px;padding:4px;font-size:13px">% | <input type="number" value="${cat.count}" min="1" data-setup-id="${cat.id}" data-field="count" class="setup-input-count" style="width:50px;border:1px solid var(--border);border-radius:4px;padding:4px;font-size:13px"> items</div></div><button class="btn btn-small btn--danger" data-setup-id="${cat.id}" data-action="delete-setup-cat">Delete</button>`; container.appendChild(wrapper); }); updateSetupTotalWeight(); }
  function updateSetupTotalWeight(){ const total=setupCategories.reduce((s,c)=>s+c.weight,0); const totalEl=document.getElementById('setupTotalWeight'); if(totalEl) totalEl.textContent=total; const warn=document.getElementById('setupWeightWarning'); if(warn) warn.style.display= total!==100?'inline':'none'; }
  function addSetupCategory(){ setupCategories.push({id: nextSetupCategoryId++, name:'New Category', weight:0, count:1}); renderSetupCategories(); }
  function confirmSetup(){ const total=setupCategories.reduce((s,c)=>s+c.weight,0); if(total!==100){ alert('Grade weights must total 100%'); return; } sessionStorage.setItem('course_setup', JSON.stringify(setupCategories)); closeSetupModal(); alert('Settings applied successfully!'); loadCategoriesFromSetup(); }
  function loadCategoriesFromSetup(){ const setupData=sessionStorage.getItem('course_setup'); if(!setupData) return; const setup=JSON.parse(setupData); const cats=[]; let id=1; setup.forEach(cat=>{ const items=[]; for(let i=1;i<=cat.count;i++){ items.push({name:`${cat.name} ${i}`, score:null}); } cats.push({id:id++, name:cat.name, weight:cat.weight, items}); }); GPCategories.set(cats); // Reset nextCategoryId loosely via bump
    while(GPCategories.nextCategoryId() < cats.length+2) GPCategories.bumpId();
    GPCategories.renderCategories(); GPStorage.save(GPCategories.get()); }

  // input change delegation
  document.addEventListener('input', e=>{
    if(e.target.matches('.setup-input-name, .setup-input-weight, .setup-input-count')){
      const id=parseInt(e.target.getAttribute('data-setup-id')); const field=e.target.getAttribute('data-field'); const cat=setupCategories.find(c=>c.id===id); if(!cat) return; if(field==='name') cat.name=e.target.value; else if(field==='weight') cat.weight=parseInt(e.target.value)||0; else if(field==='count') cat.count=parseInt(e.target.value)||1; updateSetupTotalWeight(); }
  });
  document.addEventListener('click', e=>{ const btn=e.target.closest('[data-action="delete-setup-cat"]'); if(btn){ const id=parseInt(btn.getAttribute('data-setup-id')); setupCategories=setupCategories.filter(c=>c.id!==id); renderSetupCategories(); } });

  window.GPSetup = { openSetupModal, closeSetupModal, skipToAnalysis, proceedToAnalysis, backToUpload, addSetupCategory, confirmSetup, loadCategoriesFromSetup, renderSetupCategories };
})();
