// events.js - bind top-level UI events (excluding grade & setup handled elsewhere)
(function(){
  function bindCore(){
    document.getElementById('openSetupBtn')?.addEventListener('click', GPSetup.openSetupModal);
    document.getElementById('uploadSyllabusArea')?.addEventListener('click', ()=>document.getElementById('syllabusFileUpload')?.click());
    document.getElementById('cancelSetupBtn')?.addEventListener('click', GPSetup.closeSetupModal);
    document.getElementById('skipUploadBtn')?.addEventListener('click', GPSetup.skipToAnalysis);
    document.getElementById('proceedBtn')?.addEventListener('click', GPSetup.proceedToAnalysis);
    document.getElementById('backToUploadBtn')?.addEventListener('click', GPSetup.backToUpload);
    document.getElementById('confirmSetupBtn')?.addEventListener('click', GPSetup.confirmSetup);
    document.getElementById('addSetupCategoryBtn')?.addEventListener('click', GPSetup.addSetupCategory);
    document.getElementById('addCategoryBtn')?.addEventListener('click', GPCategories.addCategory);
    
    // Category delegation - click and dblclick
    const categoriesList = document.getElementById('categoriesList');
    
    categoriesList?.addEventListener('dblclick', e=>{
      const target = e.target;
      const action = target.getAttribute('data-action');
      const id = parseInt(target.getAttribute('data-id'));
      const catId = parseInt(target.getAttribute('data-cat'));
      const idx = parseInt(target.getAttribute('data-idx'));
      
      if(action === 'dblclick-name'){
        GPCategories.startEditCategoryName(id);
      } else if(action === 'dblclick-weight'){
        GPCategories.startEditCategoryWeight(id);
      } else if(action === 'dblclick-item-name'){
        GPCategories.startEditItemName(catId, idx);
      } else if(action === 'dblclick-item-score'){
        GPCategories.startEditItemScore(catId, idx);
      }
    });
    
    categoriesList?.addEventListener('click', e=>{
      const btn=e.target.closest('button'); 
      if(!btn) return; 
      const action=btn.getAttribute('data-action'); 
      if(!action) return; 
      const id=parseInt(btn.getAttribute('data-id'));
      const catId=parseInt(btn.getAttribute('data-cat'));
      const idx=parseInt(btn.getAttribute('data-idx'));
      
      switch(action){
        case 'toggle-items': GPCategories.toggleCategoryDetails(id); break;
        case 'delete-category': GPCategories.deleteCategory(id); break;
        case 'delete-item': GPCategories.deleteItem(catId, idx); break;
        case 'add-item': GPCategories.addItem(catId); break;
      }
    });
    
    // Handle Enter key and blur for inline editing
    categoriesList?.addEventListener('keydown', e=>{
      if(e.key === 'Enter'){
        const target = e.target;
        if(target.id && target.id.startsWith('cat-name-')){
          const id = parseInt(target.id.replace('cat-name-', ''));
          GPCategories.saveCategoryName(id);
        } else if(target.id && target.id.startsWith('cat-weight-')){
          const id = parseInt(target.id.replace('cat-weight-', ''));
          GPCategories.saveCategoryWeight(id);
        } else if(target.classList.contains('item-name-input')){
          const catId = parseInt(target.getAttribute('data-cat'));
          const idx = parseInt(target.getAttribute('data-idx'));
          GPCategories.saveItemName(catId, idx);
        } else if(target.classList.contains('item-score-input')){
          const catId = parseInt(target.getAttribute('data-cat'));
          const idx = parseInt(target.getAttribute('data-idx'));
          GPCategories.saveItemScore(catId, idx);
        }
      }
    });
    
    categoriesList?.addEventListener('blur', e=>{
      const target = e.target;
      if(target.id && target.id.startsWith('cat-name-')){
        const id = parseInt(target.id.replace('cat-name-', ''));
        GPCategories.saveCategoryName(id);
      } else if(target.id && target.id.startsWith('cat-weight-')){
        const id = parseInt(target.id.replace('cat-weight-', ''));
        GPCategories.saveCategoryWeight(id);
      } else if(target.classList.contains('item-name-input')){
        const catId = parseInt(target.getAttribute('data-cat'));
        const idx = parseInt(target.getAttribute('data-idx'));
        GPCategories.saveItemName(catId, idx);
      } else if(target.classList.contains('item-score-input')){
        const catId = parseInt(target.getAttribute('data-cat'));
        const idx = parseInt(target.getAttribute('data-idx'));
        GPCategories.saveItemScore(catId, idx);
      }
    }, true);
    
    // File upload status
    document.getElementById('syllabusFileUpload')?.addEventListener('change', e=>{ if(e.target.files.length>0){ const fileName=e.target.files[0].name; const status=document.getElementById('uploadStatus'); if(status){ status.textContent='✓ File selected: '+fileName; status.style.color='var(--success)'; } const proceed=document.getElementById('proceedBtn'); if(proceed) proceed.disabled=false; } });
  }
  window.GPEvents = { bindCore };
})();
