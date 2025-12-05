/* agendamento.js */
(function(){
  const KEY = 'clinicapetmais_agendamentos_v1';
  let agendamentos = storage.read(KEY, []);

  const form = document.getElementById('appointmentForm');
  const listNode = document.getElementById('appointmentsList');

  function save(){
    storage.write(KEY, agendamentos);
  }

  function render(){
    listNode.innerHTML = '';
    if (!agendamentos.length) {
      listNode.innerHTML = '<li class="muted">Nenhum agendamento encontrado.</li>';
      return;
    }

    const sorted = agendamentos.slice().sort((a,b)=> new Date(a.dateTime) - new Date(b.dateTime));
    sorted.forEach(item => {
      const li = document.createElement('li');
      li.className = 'appointment-item';
      li.innerHTML = `
        <div>
          <strong>${escapeHtml(item.petName)}</strong>
          <div class="small">${escapeHtml(item.service)} • ${escapeHtml(item.species)}</div>
          <div class="small">${formatDateTime(item.dateTime)}</div>
          <div class="small">${escapeHtml(item.ownerName)} • ${escapeHtml(item.phone)}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn" data-action="toggle" data-id="${item.id}">${item.done ? 'Atendido' : 'Concluir'}</button>
          <button class="btn btn-outline" data-action="edit" data-id="${item.id}">Editar</button>
          <button class="btn btn-outline" data-action="delete" data-id="${item.id}">Excluir</button>
        </div>
      `;
      listNode.appendChild(li);
    });
  }

  function add(data){
    data.id = Date.now();
    data.done = false;
    agendamentos.push(data);
    save();
    render();
  }

  function toggleDone(id){
    const a = agendamentos.find(x=>x.id==id);
    if (!a) return;
    a.done = !a.done;
    save();
    render();
  }

  function edit(id){
    const a = agendamentos.find(x=>x.id==id);
    if (!a) return;
    document.getElementById('ownerName').value = a.ownerName;
    document.getElementById('phone').value = a.phone;
    document.getElementById('petName').value = a.petName;
    document.getElementById('species').value = a.species;
    document.getElementById('service').value = a.service;
    document.getElementById('dateTime').value = a.dateTime;

    // remove original; after submit, new será criado (simples)
    agendamentos = agendamentos.filter(x=>x.id !== id);
    save();
    render();
  }

  function remove(id){
    if (!confirm('Confirmar exclusão do agendamento?')) return;
    agendamentos = agendamentos.filter(x=>x.id !== id);
    save();
    render();
  }

  function escapeHtml(text){
    if (!text) return '';
    return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                       .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  // form submit
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = {
      ownerName: document.getElementById('ownerName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      petName: document.getElementById('petName').value.trim(),
      species: document.getElementById('species').value,
      service: document.getElementById('service').value,
      dateTime: document.getElementById('dateTime').value
    };

    // valida simples
    if (Object.values(data).some(v => v === '' || v === null || v === undefined)) {
      alert('Preencha todos os campos.');
      return;
    }

    // evitar datas no passado
    if (new Date(data.dateTime) < new Date()) {
      if (!confirm('A data/hora está no passado. Deseja continuar?')) return;
    }

    add(data);
    form.reset();
    window.scrollTo({top:0,behavior:'smooth'});
  });

  // delegação de eventos na lista
  listNode?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'toggle') toggleDone(id);
    if (action === 'edit') edit(Number(id));
    if (action === 'delete') remove(Number(id));
  });

  // inicial
  render();
})();
