// bootstrap.js - orchestrate initial load
(function(){
  function init(){
    const courseEl=document.getElementById('course'); if(courseEl) courseEl.textContent = GPStorage.courseName;
    const stored = GPStorage.load(); if(stored) GPCategories.set(stored);
    GPCategories.renderCategories();
    // Ensure progress is computed on first render
    if(window.GPProgress && typeof GPProgress.updateProgressFromCategories==='function'){
      GPProgress.updateProgressFromCategories();
    }
    GPProgress.initGradePin();
    GPProgress.bindGradeSelection();
    GPProgress.bindPinHover();
    GPProgress.bindSliderChanges();
    GPEvents.bindCore();
    // first visit
    if(!sessionStorage.getItem('dashboard_visited')){ GPSetup.openSetupModal(); sessionStorage.setItem('dashboard_visited','true'); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
