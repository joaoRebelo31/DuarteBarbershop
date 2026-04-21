(function () {
  const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];

  const calGrid = document.getElementById('calGrid');
  const calTitle = document.getElementById('calTitle');
  const timeGrid = document.getElementById('timeGrid');
  const form = document.getElementById('bookingForm');
  const note = document.getElementById('formNote');

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedTime = null;

  function renderCalendar() {
    calTitle.textContent = `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    calGrid.innerHTML = '';

    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    // Monday = 0
    let startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const e = document.createElement('div');
      e.className = 'cal-day empty';
      calGrid.appendChild(e);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = d;

      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const isPast = date < today;
      const isSunday = date.getDay() === 0;

      if (isPast || isSunday) {
        btn.disabled = true;
        btn.title = isSunday ? 'Encerrado ao domingo' : 'Data passada';
      } else {
        btn.addEventListener('click', () => selectDate(date, btn));
      }
      if (date.getTime() === today.getTime()) btn.classList.add('today');
      if (selectedDate && date.getTime() === selectedDate.getTime()) btn.classList.add('selected');

      calGrid.appendChild(btn);
    }
  }

  function selectDate(date, btn) {
    selectedDate = date;
    selectedTime = null;
    document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    renderTimes();
  }

  function renderTimes() {
    timeGrid.innerHTML = '';
    if (!selectedDate) {
      const hint = document.createElement('p');
      hint.className = 'muted';
      hint.style.fontSize = '14px';
      hint.textContent = 'Selecione uma data para ver horários disponíveis.';
      timeGrid.appendChild(hint);
      return;
    }
    TIMES.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'time-slot';
      b.textContent = t;
      b.addEventListener('click', () => {
        selectedTime = t;
        document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
        b.classList.add('selected');
      });
      timeGrid.appendChild(b);
    });
  }

  document.getElementById('prevMonth').addEventListener('click', () => {
    const prev = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev < thisMonth) return;
    viewDate = prev;
    renderCalendar();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const service = data.get('service');
    const name = (data.get('name') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();

    if (!service) return showNote('Escolha o serviço pretendido.', 'error');
    if (!selectedDate) return showNote('Escolha a data da marcação.', 'error');
    if (!selectedTime) return showNote('Escolha a hora da marcação.', 'error');
    if (!name) return showNote('Indique o seu nome.', 'error');
    if (!/^[\d\s+]{9,}$/.test(phone)) return showNote('Indique um número de telemóvel válido.', 'error');

    const d = selectedDate;
    const dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    showNote(`Obrigado, ${name}! Marcação confirmada: ${service} a ${dateStr} às ${selectedTime}.`, 'success');
    form.reset();
    selectedDate = null; selectedTime = null;
    renderCalendar(); renderTimes();
  });

  function showNote(msg, type) {
    note.textContent = msg;
    note.className = 'form-note ' + type;
  }

  renderCalendar();
  renderTimes();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    const setOpen = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      navLinks.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
    };
    navToggle.addEventListener('click', () => {
      setOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Minimal modern map (Leaflet + CartoDB Positron)
  if (window.L && document.getElementById('map')) {
    const coords = [38.7545, -9.2345];
    const map = L.map('map', {
      center: coords,
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const icon = L.divIcon({
      className: 'duarte-pin',
      html: '<span class="pin-dot"></span><span class="pin-ring"></span>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    L.marker(coords, { icon }).addTo(map);
  }
})();
