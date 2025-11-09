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
  
  function el(tag, attrs = {}, children = []){
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==='class') node.className=v; else node.setAttribute(k,v);
    });
    children.forEach(ch=>node.appendChild(typeof ch==='string'?document.createTextNode(ch):ch));
    return node;
  }
  
  function renderSetupCategories(){ 
    const container=document.getElementById('setupCategoriesList'); 
    if(!container) return; 
    container.innerHTML=''; 
    
    setupCategories.forEach(cat=>{
      // Category card
      const catCard = el('div', {class: 'setup-category-card'});
      
      // Header
      const header = el('div', {class: 'setup-category-header'});
      const info = el('div', {class: 'setup-category-info'});
      
      // Name input
      const nameInput = el('input', {
        type: 'text',
        value: cat.name,
        'data-setup-id': String(cat.id),
        'data-field': 'name',
        class: 'setup-input-name',
        placeholder: 'Category name'
      });
      info.appendChild(nameInput);
      
      // Count info
      const countInfo = el('div', {class: 'setup-category-count'}, [
        document.createTextNode('Items: '),
        el('input', {
          type: 'number',
          value: String(cat.count),
          min: '1',
          'data-setup-id': String(cat.id),
          'data-field': 'count',
          class: 'setup-input-count'
        })
      ]);
      info.appendChild(countInfo);
      
      header.appendChild(info);
      
      // Actions (Weight and Delete)
      const actions = el('div', {class: 'setup-category-actions'});
      
      // Weight badge
      const weightBadge = el('div', {class: 'setup-weight-badge'}, [
        document.createTextNode('Weight: '),
        el('input', {
          type: 'text',
          value: String(cat.weight),
          'data-setup-id': String(cat.id),
          'data-field': 'weight',
          class: 'setup-input-weight',
          placeholder: '0'
        }),
        document.createTextNode('%')
      ]);
      actions.appendChild(weightBadge);
      
      // Delete button with trash icon
      const deleteBtn = el('button', {
        class: 'btn btn-small btn-icon btn-icon--danger',
        'data-setup-id': String(cat.id),
        'data-action': 'delete-setup-cat',
        title: 'Delete category'
      });
      const trashIcon = el('img', {
        src: '../icons/trash.svg',
        alt: 'Delete',
        class: 'btn-icon-img'
      });
      deleteBtn.appendChild(trashIcon);
      actions.appendChild(deleteBtn);
      
      header.appendChild(actions);
      catCard.appendChild(header);
      container.appendChild(catCard);
    });
    
    updateSetupTotalWeight(); 
  }
  
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
