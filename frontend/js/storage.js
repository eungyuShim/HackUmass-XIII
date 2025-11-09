// storage.js - persistence and course context
window.GPStorage = (function(){
  const courseName = sessionStorage.getItem('current_course_name') || 'Selected Course';
  const STORAGE_KEY_PREFIX = 'grade_planner:';
  const COURSE_KEY = STORAGE_KEY_PREFIX + courseName;

  function save(categories){
    try { localStorage.setItem(COURSE_KEY, JSON.stringify({ categories })); }
    catch(e){ console.warn('Failed to save state', e); }
  }

  function load(){
    try {
      const raw = localStorage.getItem(COURSE_KEY);
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(data && Array.isArray(data.categories)) return data.categories;
    } catch(e){ console.warn('Failed to load state', e); }
    return null;
  }

  return { courseName, COURSE_KEY, save, load };
})();
