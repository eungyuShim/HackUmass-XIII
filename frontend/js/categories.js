// categories.js - category state, rendering & CRUD
(function(){
  const DEFAULT_CATEGORIES = [
    {id: 1, name: 'Midterm Exam', weight: 20, items: [{name: 'Midterm 1', score: 85}]},
    {id: 2, name: 'Final Exam', weight: 30, items: [{name: 'Final', score: null}]},
    {id: 3, name: 'Assignments', weight: 25, items: [
      {name: 'Assignment 1', score: 90},
      {name: 'Assignment 2', score: 88},
      {name: 'Assignment 3', score: null},
      {name: 'Assignment 4', score: null}
    ]},
    {id: 4, name: 'Quizzes', weight: 25, items: [
      {name: 'Quiz 1', score: 95},
      {name: 'Quiz 2', score: null}
    ]}
  ];

  let categories = DEFAULT_CATEGORIES;
  let nextCategoryId = 5;

  function el(tag, attrs = {}, children = []){
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==='class') node.className=v; else if(k==='text') node.textContent=v; else node.setAttribute(k,v);
    });
    children.forEach(ch=>node.appendChild(typeof ch==='string'?document.createTextNode(ch):ch));
    return node;
  }

  // Render category name (editable or display mode)
  function renderCategoryName(cat){
    if(cat._editingName){
      const nameInput = el('input',{
        type:'text', 
        id:`cat-name-${cat.id}`, 
        value:cat.name||'', 
        class:'category-name-input',
        placeholder:'Category name'
      });
      setTimeout(() => { nameInput.focus(); nameInput.select(); }, 0);
      return nameInput;
    } else {
      return el('span',{
        class:'category-name',
        'data-action':'dblclick-name',
        'data-id':String(cat.id)
      },[document.createTextNode(cat.name)]);
    }
  }

  // Render category weight (editable or display mode)
  function renderCategoryWeight(cat){
    if(cat._editingWeight){
      const weightInput = el('input',{
        type:'text',
        id:`cat-weight-${cat.id}`,
        value:String(cat.weight??0),
        class:'category-weight-input',
        placeholder:'0'
      });
      setTimeout(() => { weightInput.focus(); weightInput.select(); }, 0);
      return el('div',{class:'category-weight category-weight-editing'},[
        document.createTextNode('Weight: '),
        weightInput,
        document.createTextNode('%')
      ]);
    } else {
      return el('div',{
        class:'category-weight',
        'data-action':'dblclick-weight',
        'data-id':String(cat.id)
      },[document.createTextNode(`Weight: ${cat.weight}%`)]);
    }
  }

  // Render category header (name, weight, actions)
  function renderCategoryHeader(cat){
    const headerDiv = el('div',{class:'category-header'});
    const infoDiv = el('div',{class:'category-info'});
    
    infoDiv.appendChild(renderCategoryName(cat));
    
    // Calculate and display current average
    const graded = cat.items.filter(it=>it.score!==null);
    const avg = graded.length ? graded.reduce((s,it)=>s+it.score,0)/graded.length : 0;
    const avgText = graded.length > 0 ? `Current Average: ${avg.toFixed(1)}%` : 'No grades yet';
    const avgDiv = el('div',{class:'category-average'},[document.createTextNode(avgText)]);
    infoDiv.appendChild(avgDiv);
    
    headerDiv.appendChild(infoDiv);
    
    // Actions (Weight, Items button and Delete button)
    const actions = el('div',{class:'category-actions'});
    actions.appendChild(renderCategoryWeight(cat));
    
    // Items button with list icon
    const itemsBtn = el('button',{
      class:'btn btn-small btn-icon',
      'data-action':'toggle-items',
      'data-id':String(cat.id),
      title:`Items (${cat.items.length})`
    });
    const listIcon = el('img',{
      src:'../icons/list.svg',
      alt:'Items',
      class:'btn-icon-img'
    });
    itemsBtn.appendChild(listIcon);
    actions.appendChild(itemsBtn);
    
    // Delete button with trash icon
    const deleteBtn = el('button',{
      class:'btn btn-small btn-icon btn-icon--danger',
      'data-action':'delete-category',
      'data-id':String(cat.id),
      title:'Delete category'
    });
    const trashIcon = el('img',{
      src:'../icons/trash.svg',
      alt:'Delete',
      class:'btn-icon-img'
    });
    deleteBtn.appendChild(trashIcon);
    actions.appendChild(deleteBtn);
    
    headerDiv.appendChild(actions);
    return headerDiv;
  }

  // Render item name (editable or display mode)
  function renderItemName(item, catId, idx){
    if(item._editingName){
      const nameInput = el('input',{
        type:'text',
        class:'item-name-input',
        value:item.name||'',
        placeholder:'Item name',
        'data-cat':String(catId),
        'data-idx':String(idx)
      });
      setTimeout(() => { nameInput.focus(); nameInput.select(); }, 0);
      return nameInput;
    } else {
      return el('div',{
        class:'item-name',
        'data-action':'dblclick-item-name',
        'data-cat':String(catId),
        'data-idx':String(idx)
      },[document.createTextNode(item.name)]);
    }
  }

  // Render item score (editable or display mode)
  function renderItemScore(item, catId, idx){
    if(item._editingScore){
      const scoreInput = el('input',{
        type:'text',
        class:'item-score-input',
        value:(item.score!=null?String(item.score):''),
        placeholder:'Score',
        'data-cat':String(catId),
        'data-idx':String(idx)
      });
      setTimeout(() => { scoreInput.focus(); scoreInput.select(); }, 0);
      return el('div',{class:'item-score-edit'},[
        scoreInput,
        document.createTextNode('%')
      ]);
    } else {
      return el('div',{
        class:'item-score',
        'data-action':'dblclick-item-score',
        'data-cat':String(catId),
        'data-idx':String(idx)
      },[document.createTextNode(item.score!==null?`${item.score}%`:'Not graded')]);
    }
  }

  // Render single item card
  function renderItemCard(item, catId, idx){
    const itemCard = el('div',{class:'item-card', 'data-cat':String(catId), 'data-idx':String(idx)});
    
    itemCard.appendChild(renderItemName(item, catId, idx));
    itemCard.appendChild(renderItemScore(item, catId, idx));
    
    // Delete button
    const deleteBtn = el('button',{
      class:'btn btn-small btn--danger item-delete-btn',
      'data-action':'delete-item',
      'data-cat':String(catId),
      'data-idx':String(idx)
    },[document.createTextNode('Delete')]);
    itemCard.appendChild(deleteBtn);
    
    return itemCard;
  }

  // Render items container for a category
  function renderItemsContainer(cat){
    if(!cat._open) return null;
    
    const itemsContainer = el('div',{id:`items-${cat.id}`, class:'items-container'});
    
    // Add Item button at the top
    const addBtnWrapper = el('div',{class:'item-add-wrapper'},[
      el('button',{
        class:'btn btn-small btn--primary',
        'data-action':'add-item',
        'data-cat':String(cat.id)
      },[document.createTextNode('+ Add Item')])
    ]);
    itemsContainer.appendChild(addBtnWrapper);
    
    // Render all items
    cat.items.forEach((item, idx) => {
      itemsContainer.appendChild(renderItemCard(item, cat.id, idx));
    });
    
    return itemsContainer;
  }

  // Render single category card
  function renderCategoryCard(cat){
    const catDiv = el('div',{class:'category-card', 'data-id':String(cat.id)});
    
    catDiv.appendChild(renderCategoryHeader(cat));
    
    const itemsContainer = renderItemsContainer(cat);
    if(itemsContainer) {
      catDiv.appendChild(itemsContainer);
    }
    
    return catDiv;
  }

  // Main render function
  function renderCategories(){
    const container = document.getElementById('categoriesList');
    if(!container) return;
    
    container.innerHTML='';
    categories.forEach(cat => {
      container.appendChild(renderCategoryCard(cat));
    });
    
    updateTotalWeight();
    renderSummary();
    
    // Update progress bar after rendering categories
    if(window.GPProgress && typeof GPProgress.updateProgressFromCategories==='function'){
      GPProgress.updateProgressFromCategories();
    }
  }

  function updateTotalWeight(){
    const total = categories.reduce((s,c)=>s+c.weight,0);
    const elTot = document.getElementById('totalWeight'); if(elTot) elTot.textContent=total;
    const warn = document.getElementById('weightWarning'); if(warn) warn.style.display = total!==100?'inline':'none';
  }

  function renderSummary(){
    const sumBody = document.getElementById('sumBody'); if(!sumBody) return; sumBody.innerHTML='';
    categories.forEach(cat=>{
      const graded = cat.items.filter(it=>it.score!==null);
      const avg = graded.length? graded.reduce((s,it)=>s+it.score,0)/graded.length : 0;
      const tr = document.createElement('tr'); tr.style.borderBottom='1px solid var(--border-light)';
      tr.innerHTML=`<td style="padding:12px">${cat.name}</td><td style="padding:12px">${avg.toFixed(1)}%</td><td style="padding:12px">${cat.weight}%</td>`;
      sumBody.appendChild(tr);
    });
  }

  function toggleCategoryDetails(id){
    const cat=categories.find(c=>c.id===id); if(!cat) return; cat._open = !cat._open; renderCategories();
  }

  function addCategory(){
    categories.push({id: nextCategoryId++, name:'New Category', weight:0, items:[], _editingName:true});
    renderCategories();
  }
  
  // Category name editing
  function startEditCategoryName(id){ 
    const cat=categories.find(c=>c.id===id); 
    if(!cat) return; 
    cat._editingName=true; 
    renderCategories(); 
  }
  
  function saveCategoryName(id){ 
    const cat=categories.find(c=>c.id===id); 
    if(!cat) return; 
    const nameEl=document.getElementById(`cat-name-${id}`); 
    const newName=nameEl?nameEl.value.trim():cat.name; 
    if(!newName){ alert('Please enter a category name'); return; } 
    cat.name=newName; 
    delete cat._editingName; 
    renderCategories(); 
    GPStorage.save(categories); 
  }
  
  // Category weight editing
  function startEditCategoryWeight(id){ 
    const cat=categories.find(c=>c.id===id); 
    if(!cat) return; 
    cat._editingWeight=true; 
    renderCategories(); 
  }
  
  function saveCategoryWeight(id){ 
    const cat=categories.find(c=>c.id===id); 
    if(!cat) return; 
    const weightEl=document.getElementById(`cat-weight-${id}`); 
    const newWeight=weightEl?parseInt(weightEl.value):cat.weight; 
    if(isNaN(newWeight)||newWeight<0||newWeight>100){ alert('Weight must be between 0 and 100'); return; } 
    cat.weight=newWeight; 
    delete cat._editingWeight; 
    renderCategories(); 
    GPStorage.save(categories); 
  }
  
  function deleteCategory(id){ 
    categories = categories.filter(c=>c.id!==id); 
    renderCategories(); 
    GPStorage.save(categories); 
  }
  
  // Item name editing
  function startEditItemName(catId, idx){ 
    const cat=categories.find(c=>c.id===catId); 
    if(!cat) return; 
    const item=cat.items[idx]; 
    if(!item) return; 
    item._editingName=true; 
    renderCategories(); 
  }
  
  function saveItemName(catId, idx){ 
    const cat=categories.find(c=>c.id===catId); 
    if(!cat) return; 
    const item=cat.items[idx]; 
    if(!item) return; 
    const input=document.querySelector(`.item-name-input[data-cat="${catId}"][data-idx="${idx}"]`);
    const newName=input?input.value.trim():item.name; 
    if(!newName){ alert('Enter item name'); return; } 
    item.name=newName; 
    delete item._editingName; 
    renderCategories(); 
    GPStorage.save(categories); 
  }
  
  // Item score editing
  function startEditItemScore(catId, idx){ 
    const cat=categories.find(c=>c.id===catId); 
    if(!cat) return; 
    const item=cat.items[idx]; 
    if(!item) return; 
    item._editingScore=true; 
    renderCategories(); 
  }
  
  function saveItemScore(catId, idx){ 
    const cat=categories.find(c=>c.id===catId); 
    if(!cat) return; 
    const item=cat.items[idx]; 
    if(!item) return; 
    const input=document.querySelector(`.item-score-input[data-cat="${catId}"][data-idx="${idx}"]`);
    let newScore=input?input.value.trim():''; 
    if(newScore===''){ 
      item.score=null; 
    } else { 
      const s=parseFloat(newScore); 
      if(isNaN(s) || s<0 || s>100){ alert('Score must be between 0 and 100'); return; }
      item.score=s; 
    }
    delete item._editingScore; 
    renderCategories(); 
    GPStorage.save(categories); 
  }
  
  function addItem(catId){ 
    const cat=categories.find(c=>c.id===catId); 
    if(!cat) return; 
    cat._open = true; 
    cat.items.push({name:'New Item', score:null, _editingName:true}); 
    renderCategories(); 
  }
  
  function deleteItem(catId, idx){ 
    const cat=categories.find(c=>c.id===catId); 
    if(!cat) return; 
    cat.items.splice(idx,1); 
    renderCategories(); 
    GPStorage.save(categories); 
  }

  function calcProgressStats(){ let earnedPct=0, remainingWeight=0; categories.forEach(cat=>{ const n=cat.items.length; if(n===0){remainingWeight+=cat.weight/100; return;} const graded=cat.items.filter(it=>it.score!==null); const gradedCount=graded.length; const gradedFraction=gradedCount/n; const avgGraded=gradedCount? graded.reduce((s,it)=>s+it.score,0)/gradedCount:0; earnedPct += (avgGraded/100)*cat.weight*gradedFraction; remainingWeight += (cat.weight/100)*(1-gradedFraction); }); return { minPct: Math.max(0, Math.min(100, earnedPct)), remainingWeight: Math.max(0, Math.min(1, remainingWeight)) }; }

  // expose globals
  window.GPCategories = { 
    get:()=>categories, 
    set:(c)=>{categories=c;}, 
    renderCategories, 
    addCategory, 
    startEditCategoryName,
    saveCategoryName,
    startEditCategoryWeight,
    saveCategoryWeight,
    deleteCategory, 
    startEditItemName,
    saveItemName,
    startEditItemScore,
    saveItemScore,
    addItem, 
    deleteItem, 
    toggleCategoryDetails, 
    calcProgressStats, 
    DEFAULT_CATEGORIES, 
    nextCategoryId:()=>nextCategoryId, 
    bumpId:()=>++nextCategoryId 
  };
})();
