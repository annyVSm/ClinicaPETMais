/* shared.js - helpers comuns */
(function(){
  // atualiza anos em rodapé se ids existirem
  const y = new Date().getFullYear();
  document.getElementById('year')?.textContent = y;
  document.getElementById('year2')?.textContent = y;
  document.getElementById('year3')?.textContent = y;

  // pequenos helpers para storage
  window.storage = {
    read(key, fallback = []) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch(e){ return fallback; }
    },
    write(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  window.formatDateTime = function(dtString){
    try {
      const d = new Date(dtString);
      return d.toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' });
    } catch(e){ return dtString; }
  };

})();
