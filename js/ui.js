/* ============================================================
   UI core — icons, helpers, shell, router, theme, modals, toasts
   ============================================================ */
'use strict';

const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const cssVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

const App={
  theme:localStorage.getItem('mu-theme')||'light',
  perfMode:'gpa',
  studentFilters:{q:'',dept:'',risk:'',sort:{key:'name',dir:1},page:1},
  att:{course:'CSE205',section:'A',date:'2026-03-09'},
  alertsTab:'All', notifTab:'All', setSection:'Institution',
  analytics:{year:'2025 – 2026',dept:'All'},
  asgCourse:'All',
  admin:{tab:'Overview',userQ:'',userRole:'',userDept:'',annFilter:'All',auditQ:''}
};

const ICONS={
  grid:'<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  users:'<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'clipboard-check':'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2.5h6V6H9z"/><path d="m9 13 2 2 4-4.5"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  'file-text':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  list:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2.5h6V6H9z"/><path d="M9 11h6"/><path d="M9 15h4"/>',
  chart:'<path d="M3 21h18"/><path d="M7 17v-5"/><path d="M12 17V7"/><path d="M17 17v-8"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  'alert-triangle':'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  report:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 16v-3"/><path d="M12 16v-5"/><path d="M16 16v-2"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M4.2 4.2l2.1 2.1"/><path d="M17.7 17.7l2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="M4.2 19.8l2.1-2.1"/><path d="M17.7 6.3l2.1-2.1"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4"/><path d="M12 17.2h.01"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  menu:'<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  'chev-down':'<path d="m6 9 6 6 6-6"/>','chev-right':'<path d="m9 6 6 6-6 6"/>','chev-left':'<path d="m15 6-6 6 6 6"/>',
  plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  dots:'<circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/>',
  edit:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  'trend-up':'<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  'trend-down':'<path d="m3 7 6 6 4-4 8 8"/><path d="M21 10v7h-7"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
};
ICONS.calendar='<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>';
ICONS.clock='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
ICONS.shield='<path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10z"/>';
ICONS.heart='<path d="M19 14c1.6-1.6 2-3.2 2-4.5A4.5 4.5 0 0 0 12 6.7 4.5 4.5 0 0 0 3 9.5c0 1.3.4 2.9 2 4.5l7 7z"/>';
ICONS.award='<circle cx="12" cy="9" r="6"/><path d="m9 14.5-1.5 6L12 17.7l4.5 2.8-1.5-6"/>';
ICONS.user='<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
ICONS.eye='<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>';
ICONS.trash='<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/>';
ICONS.info='<circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M12 12v5"/>';
ICONS.cap='<path d="m22 9-10-5L2 9l10 5 10-5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>';
ICONS.building='<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 11h1"/><path d="M14 11h1"/><path d="M10 21v-4h4v4"/>';
ICONS.mail='<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>';
ICONS['file-x']='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9.5 12.5 5 5"/><path d="m14.5 12.5-5 5"/>';
ICONS.target='<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>';
ICONS.lock='<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>';
ICONS.pause='<rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/>';
ICONS.send='<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>';

function icon(name,size=18){
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${ICONS[name]||''}</svg>`;
}

/* ---------- Small UI builders ---------- */
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function badge(kind,text,{dot=true,ic}={}){return `<span class="badge b-${kind}">${dot?'<i class="dot"></i>':''}${ic?icon(ic,12):''}${esc(text)}</span>`;}
const RISK_KIND={Low:'success',Moderate:'warn',High:'danger',Critical:'danger'};
function riskBadge(level){
  const k=RISK_KIND[level]||'neutral';
  return `<span class="badge b-${k}"><i class="dot"></i>${level==='Critical'||level==='High'?icon('alert-triangle',12):''}${esc(level)}</span>`;
}
function avatar(name,size=36){
  const initials=name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  let h=0;for(const c of name)h=(h*31+c.charCodeAt(0))>>>0;
  return `<span class="avatar av-${h%6}" style="width:${size}px;height:${size}px;font-size:${Math.round(size*.36)}px" aria-hidden="true">${initials}</span>`;
}
function attColor(p){return p<70?'var(--danger)':p<80?'var(--warn)':'var(--success)';}
function prog(pct,{val=true}={}){
  const c=attColor(pct);
  return `<span class="prog"><span class="prog-track"><span class="prog-fill" style="width:${pct}%;background:${c}"></span></span>${val?`<span class="prog-val">${pct}%</span>`:''}</span>`;
}
function trendChip(delta,good){
  return `<span class="kpi-trend ${good?'tr-good':'tr-bad'}">${icon(delta.startsWith('-')||delta.startsWith('−')?'trend-down':'trend-up',12)}${esc(delta)}</span>`;
}
function pageHead(title,sub,actions=''){
  return `<div class="page-head"><div class="ph-text"><h1>${title}</h1>${sub?`<p class="page-sub">${sub}</p>`:''}</div>
    <div class="ph-actions">${actions}</div></div>`;
}
function crumbs(items){
  return `<nav class="crumbs" aria-label="Breadcrumb">${items.map((it,i)=>
    i<items.length-1?`<a href="#/${it.hash||''}">${esc(it.label)}</a><span class="sep">/</span>`
    :`<span class="cur">${esc(it.label)}</span>`).join('')}</nav>`;
}
function emptyState(ic,title,text,cta=''){
  return `<div class="empty"><span class="em-icon">${icon(ic,26)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${cta}</div>`;
}
function kpiCard(k){
  return `<div class="card card-hov kpi">
    <div class="kpi-top"><span class="icon-tile ${k.tile}">${icon(k.icon,18)}</span>
      <span class="kpi-label">${esc(k.label)}</span>${k.spark?`<span class="spark">${Chart.spark(k.spark,cssVar(k.tile==='t-danger'?'--danger':k.tile==='t-warn'?'--warn':'--primary'))}</span>`:''}</div>
    <div class="kpi-val">${esc(k.value)}</div>
    <div class="kpi-desc">${esc(k.desc)}</div>
    ${trendChip(k.delta,k.good)}</div>`;
}
function toast(msg,kind='success'){
  const root=$('#toast-root');
  const el=document.createElement('div');
  el.className=`toast t-${kind}`;
  el.innerHTML=`${icon(kind==='danger'||kind==='warn'?'alert-triangle':kind==='info'?'info':'check',16)}<span>${esc(msg)}</span>`;
  root.appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),350);},3200);
}
/* ---------- Modals ---------- */
let _modalKeystack=[];
function openModal({title='',body='',footer='',wide=false,onClose}){
  const root=$('#modal-root');
  const ov=document.createElement('div');
  ov.className='modal-overlay';
  ov.innerHTML=`<div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-h"><h3>${title}</h3>
      <button class="icon-btn" style="margin-left:auto" data-x aria-label="Close dialog">${icon('x',17)}</button></div>
    <div class="modal-b">${body}</div>${footer?`<div class="modal-f">${footer}</div>`:''}</div>`;
  const close=()=>{ov.remove();_modalKeystack=_modalKeystack.filter(k=>k!==close);onClose&&onClose();};
  ov.addEventListener('mousedown',e=>{if(e.target===ov)close();});
  ov.querySelector('[data-x]').addEventListener('click',close);
  _modalKeystack.push(close);
  root.appendChild(ov);
  const f=ov.querySelector('input,select,textarea,button.btn');
  f&&f.focus();
  return {el:ov,close};
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&_modalKeystack.length)_modalKeystack[_modalKeystack.length-1]();
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#tbq')?.focus();}
});
function confirmDialog({title,message,confirmText='Confirm',danger=true,onConfirm}){
  const m=openModal({title,
    body:`<p style="color:var(--text-2);font-size:13.5px">${message}</p>`,
    footer:`<button class="btn btn-ghost" data-c>Cancel</button>
      <button class="btn ${danger?'btn-danger':'btn-primary'}" data-ok>${esc(confirmText)}</button>`});
  m.el.querySelector('[data-c]').onclick=m.close;
  m.el.querySelector('[data-ok]').onclick=()=>{m.close();onConfirm&&onConfirm();};
}

/* ---------- Dropdowns ---------- */
function wireDropdowns(){
  document.addEventListener('click',e=>{
    $$('.dd-menu').forEach(m=>{if(!m.parentElement.contains(e.target))m.remove();});
    const btn=e.target.closest('[data-dd]');
    if(btn){
      e.stopPropagation();
      const existing=btn.parentElement.querySelector('.dd-menu');
      if(existing){existing.remove();return;}
      btn.parentElement.insertAdjacentHTML('beforeend',btn.dataset.dd);
    }
  });
}
function closeDD(){$$('.dd-menu').forEach(m=>m.remove());}

/* ---------- Theme ---------- */
function applyTheme(){
  document.documentElement.dataset.theme=App.theme;
  localStorage.setItem('mu-theme',App.theme);
  const b=$('#themeBtn');
  if(b){b.innerHTML=icon(App.theme==='light'?'moon':'sun',18);
    b.dataset.tip=App.theme==='light'?'Switch to dark mode':'Switch to light mode';}
}
function toggleTheme(){App.theme=App.theme==='light'?'dark':'light';applyTheme();renderRoute(true);}

/* ---------- CSV export ---------- */
function exportCSV(filename,rows){
  const csv=rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(["\uFEFF"+csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=filename;a.click();
  URL.revokeObjectURL(a.href);
  toast(`${filename} downloaded`,'info');
}
/* ---------- Navigation ---------- */
const NAV=[
  {id:'dashboard',label:'Dashboard',icon:'grid'},
  {id:'students',label:'Students',icon:'users'},
  {id:'attendance',label:'Attendance',icon:'clipboard-check'},
  {id:'academics',label:'Academics',icon:'book'},
  {id:'exams',label:'Examinations',icon:'file-text'},
  {id:'assignments',label:'Assignments',icon:'list'},
  {id:'analytics',label:'Analytics',icon:'chart'},
  {id:'alerts',label:'Alerts',icon:'alert-triangle'},
  {id:'reports',label:'Reports',icon:'report'},
  {id:'notifications',label:'Notifications',icon:'bell'},
  {id:'wellbeing',label:'Student Wellbeing',icon:'heart'},
  {id:'settings',label:'Settings',icon:'gear'}
];
const navCount=id=>id==='alerts'?DATA.alerts.filter(a=>a.status!=='Resolved').length
  :id==='notifications'?DATA.notifications.filter(n=>n.unread).length:0;
function navBtn(n){
  const c=navCount(n.id);
  return `<button class="nav-item" data-nav="${n.id}" onclick="location.hash='#/${n.id}'">${icon(n.icon,17)}
    <span>${n.label}</span>${c?`<span class="nav-badge">${c}</span>`:''}</button>`;
}
function toggleDrawer(open){document.body.classList.toggle('side-open',open);$('#scrim').hidden=!open;}
function closeDD(){$$('.dd-menu').forEach(m=>m.remove());}

function renderShell(){
  const unread=navCount('notifications');
  $('#sidebar').innerHTML=`
    <div class="brand"><span class="brand-logo">${icon('cap',22)}</span>
      <div><div class="brand-name">${esc(DATA.institution.name)}</div><div class="brand-sub">${esc(DATA.institution.portal)}</div></div></div>
    <div class="side-scroll">
      <div class="side-label">Main</div>
      ${NAV.slice(0,7).map(n=>navBtn(n)).join('')}
      <div class="side-label">Monitor</div>
      ${NAV.slice(7,11).map(n=>navBtn(n)).join('')}
      <div class="side-label">System</div>
      ${NAV.slice(11).map(n=>navBtn(n)).join('')}
      <div class="side-label">Administration</div>
      ${navBtn({id:'admin',label:'Admin Console',icon:'shield'})}
    </div>
    <div class="side-foot">
      <button class="nav-item" onclick="window.open('admin.html')">${icon('building')}<span>Separate Admin Panel</span></button>
      <button class="nav-item" onclick="toast('Help center opens the faculty knowledge base','info')">${icon('help')}<span>Help & Support</span></button>
      <button class="side-user" onclick="location.hash='#/settings'">
        ${avatar('Sarah Mitchell',34)}
        <span style="flex:1;min-width:0"><span style="display:block;font-weight:600;font-size:13px">${esc(DATA.institution.facultyName)}</span>
        <span style="display:block;font-size:11px;color:var(--text-3)">CSE Department</span></span>
      </button>
      <button class="nav-item" onclick="toast('Signed out (demo) — refresh to return','info')">${icon('logout')}<span>Log out</span></button>
    </div>`;
  $('#topbar').innerHTML=`
    <button class="icon-btn" id="menuBtn" aria-label="Open navigation" style="display:none">${icon('menu')}</button>
    <div class="tb-search">${icon('search',16)}
      <input id="tbq" type="search" placeholder="Search student, ID, course…" aria-label="Global search" autocomplete="off">
      <span class="tb-kbd">Ctrl K</span>
      <div id="tbqPop"></div></div>
    <div class="tb-spacer"></div>
    <div class="tb-actions">
      <button class="icon-btn" id="themeBtn" onclick="toggleTheme()" aria-label="Toggle dark mode"></button>
      <button class="icon-btn" onclick="toast('Help center opens the faculty knowledge base','info')" aria-label="Help" data-tip="Help">${icon('help')}</button>
      <button class="icon-btn" onclick="location.hash='#/notifications'" aria-label="Notifications" data-tip="Notifications">${icon('bell')}${unread?'<span class="pip"></span>':''}</button>
      <span class="tb-divider"></span>
      <div class="dd">
        <button class="tb-user" data-dd='<div class="dd-menu"><div class="dd-head"><div class="dh-name">${esc(DATA.institution.facultyName)}</div><div class="dh-mail">s.mitchell@meridian.edu</div></div>
          <button class="dd-item" onclick="location.hash=&quot;#/settings&quot;;closeDD()">${icon('user',15)}My profile</button>
          <button class="dd-item" onclick="location.hash=&quot;#/admin&quot;;closeDD()">${icon('shield',15)}Admin Console</button>
          <button class="dd-item" onclick="window.open('admin.html');closeDD()">${icon('building',15)}Separate Admin Panel ↗</button>
          <button class="dd-item" onclick="toggleTheme()">${icon('moon',15)}Toggle theme</button>
          <div class="dd-sep"></div>
          <button class="dd-item danger" onclick="toast(&#39;Signed out (demo)&#39;,&#39;info&#39;);closeDD()">${icon('logout',15)}Log out</button></div>'>
          ${avatar('Sarah Mitchell',32)}
          <span><span class="tb-user-name">${esc(DATA.institution.facultyName)}</span>
          <span class="tb-user-meta" style="display:block">Professor · CSE</span></span>
          ${icon('chev-down',15)}</button>
      </div>
    </div>`;
  const mobileItems=[NAV[0],NAV[1],NAV[2],NAV[7]];
  $('#bottomnav').innerHTML=mobileItems.map(n=>
    `<button class="nav-item" data-nav="${n.id}" onclick="location.hash='#/${n.id}'">${icon(n.icon,20)}<span>${n.label}</span></button>`).join('')+
    `<button class="nav-item" onclick="toggleDrawer(true)">${icon('dots',20)}<span>More</span></button>`;
  applyTheme();
  const mq=window.matchMedia('(max-width:1024px)');
  const syncMenu=()=>{$('#menuBtn').style.display=mq.matches?'inline-grid':'none';};
  if(mq.addEventListener)mq.addEventListener('change',syncMenu);syncMenu();
  $('#menuBtn').onclick=()=>toggleDrawer(true);
  $('#scrim').onclick=()=>toggleDrawer(false);
  wireSearch();
}
/* ---------- Global search ---------- */
function wireSearch(){
  const inp=$('#tbq'),pop=$('#tbqPop');
  inp.addEventListener('input',()=>{
    const q=inp.value.trim().toLowerCase();
    if(!q){pop.innerHTML='';return;}
    const st=DATA.students.filter(s=>s.name.toLowerCase().includes(q)||s.id.toLowerCase().includes(q)
      ||DATA.depts[s.dept].toLowerCase().includes(q)).slice(0,6);
    const cs=DATA.courses.filter(c=>c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)).slice(0,3);
    if(!st.length&&!cs.length){pop.innerHTML=`<div class="search-pop"><div class="sp-head">No matches</div>
      <div style="padding:14px;color:var(--text-3);font-size:13px">Try a student name, ID or course code.</div></div>`;return;}
    pop.innerHTML=`<div class="search-pop"><div class="sp-head">Students</div>
      ${st.map(s=>`<button class="search-item" onclick="location.hash='#/profile/${s.id}';document.getElementById('tbqPop').innerHTML=''">
        ${avatar(s.name,30)}<span><span class="cell-main">${esc(s.name)}</span>
        <span class="cell-sub" style="display:block">${s.id} · ${esc(DATA.depts[s.dept])}</span></span>
        <span class="si-meta">${riskBadge(s.risk)}</span></button>`).join('')}
      ${cs.length?`<div class="sp-head">Courses</div>${cs.map(c=>
        `<button class="search-item" onclick="location.hash='#/academics';document.getElementById('tbqPop').innerHTML=''">
        <span class="icon-tile t-primary" style="width:30px;height:30px">${icon('book',14)}</span>
        <span><span class="cell-main">${c.code}</span><span class="cell-sub" style="display:block">${esc(c.name)}</span></span></button>`).join('')}`:''}
    </div>`;
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.tb-search'))pop.innerHTML='';});
}

/* ---------- Router ---------- */
let _afterFns=[];
function after(fn){_afterFns.push(fn);}
function parseHash(){
  const h=location.hash.replace(/^#\/?/,'');
  const [path,query]=h.split('?');
  const seg=(path||'dashboard').split('/');
  return {page:seg[0]||'dashboard',param:seg[1]||null,query:new URLSearchParams(query||'')};
}
function skeletonFor(){
  return `<div class="grid-12">
    <div class="c12"><div class="skel" style="height:64px"></div></div>
    ${'<div class="c4"><div class="skel" style="height:130px"></div></div>'.repeat(3)}
    <div class="c8"><div class="skel" style="height:320px"></div></div>
    <div class="c4"><div class="skel" style="height:320px"></div></div></div>`;
}
function renderRoute(silent){
  const {page,param,query}=parseHash();
  const fn=(window.Pages&&Pages[page])||Pages.dashboard;
  const main=$('#main');
  if(!silent){main.innerHTML=skeletonFor();}
  setTimeout(()=>{
    if((window.Pages&&Pages[page])){/* route exists */}
    main.innerHTML=fn(param,query);
    const fns=_afterFns;_afterFns=[];
    fns.forEach(f=>{try{f()}catch(e){console.error(e)}});
    $$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));
    toggleDrawer(false);
    window.scrollTo({top:0,behavior:'instant'});
    main.focus({preventScroll:true});
  },silent?0:260);
}
window.addEventListener('hashchange',()=>renderRoute(false));
