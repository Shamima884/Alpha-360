/* ============================================================
   Admin Panel — separate control center
   Every mutation is logged, persisted to localStorage,
   and the changed record is scrolled into view + highlighted.
   ============================================================ */
'use strict';

const ADMIN={ tab:'overview', q:'', dept:'', risk:'', page:1, uQ:'', uRole:'', aQ:'', aStatus:'All', flash:{} };

const ATABS=[
  ['overview','Overview','grid'],
  ['students','Students','users'],
  ['users','Users & Access','user'],
  ['courses','Courses','book'],
  ['enrollments','Enrollments','clipboard-check'],
  ['announcements','Announcements','bell'],
  ['changelog','Change Log','clock'],
  ['settings','Settings','gear']
];

/* ---------- Data layer (localStorage-backed) ---------- */
function adStudents(){let s=DATA.readA('students',null);if(!s){s=DATA.students.map(x=>({...x}));DATA.writeA('students',s);}return s;}
function adUsers(){let u=DATA.readA('users',null);if(!u){u=(DATA.admin?DATA.admin.users:[]).map(x=>({...x}));DATA.writeA('users',u);}return u;}
function adCourses(){let c=DATA.readA('courses',null);if(!c){c=DATA.courses.map(x=>({...x}));DATA.writeA('courses',c);}return c;}
function adAnnounce(){let a=DATA.readA('announcements',null);if(!a){a=(DATA.admin?DATA.admin.announcements:[]).map(x=>({...x}));DATA.writeA('announcements',a);}return a;}

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded',async()=>{
  await API.init();          /* connects to Node/Excel backend when enabled */
  wireDropdowns();
  if(DATA.session()){enterApp();}else{renderLogin();}
  window.addEventListener('hashchange',()=>{ if(!DATA.session())return; adminRoute(); });
});

/* ---------- Login ---------- */
function renderLogin(){
  $('#adminApp').hidden=true;
  const r=$('#loginRoot');r.hidden=false;
  r.innerHTML=`
  <div class="login-wrap"><div class="login-card">
    <div class="login-logo">${icon('shield',26)}</div>
    <h1>Meridian Admin</h1>
    <p class="page-sub">Institution control center. Restricted to administrators.</p>
    <div class="field"><label>Email <span class="req">*</span></label>
      <input id="lgUser" class="input" type="email" placeholder="admin@meridian.edu" autocomplete="username"></div>
    <div class="field"><label>Password <span class="req">*</span></label>
      <input id="lgPass" class="input" type="password" placeholder="••••••••" autocomplete="current-password"></div>
    <div class="risk-note" style="margin:0 0 16px">${icon('info',15)}<span>Demo credentials — <b>admin@meridian.edu</b> / <b>admin123</b></span></div>
    <button class="btn btn-primary" id="lgBtn" style="width:100%">${icon('shield',15)}Sign in to Admin</button>
    <a class="btn-link btn-sm" href="../faculty/index.html" style="margin-top:16px;width:100%;justify-content:center">← Back to Faculty Portal</a>
  </div></div>`;
  const user=$('#lgUser'),pass=$('#lgPass'),btn=$('#lgBtn');
  const rm=el=>{const e=el.parentElement.querySelector('.err-msg');if(e)e.remove();el.classList.remove('error');};
  const submit=()=>{
    let ok=true;
    if(!user.value.trim()||!user.value.includes('@')){ok=false;user.classList.add('error');
      if(!user.parentElement.querySelector('.err-msg'))user.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}Enter your administrator email</span>`);}
    else rm(user);
    if(pass.value.length<6){ok=false;pass.classList.add('error');
      if(!pass.parentElement.querySelector('.err-msg'))pass.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}Password must be at least 6 characters</span>`);}
    else rm(pass);
    if(!ok)return;
    DATA.writeA('session',{user:user.value.trim(),role:'Super Administrator',at:Date.now()});
    toast('Signed in as Super Administrator');
    enterApp();
  };
  btn.onclick=submit;
  user.addEventListener('keydown',e=>{if(e.key==='Enter')pass.focus();});
  pass.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
  user.focus();
}
function logout(){
  DATA.clearA('session');
  $('#adminApp').hidden=true;
  renderLogin();
}
/* ---------- App shell ---------- */
function enterApp(){
  const sess=DATA.readA('session',{});
  $('#loginRoot').hidden=true;
  $('#adminApp').hidden=false;
  applyTheme();
  renderASide(sess);
  renderATop(sess);
  adminRoute();
}
function renderASide(sess){
  $('#aSide').innerHTML=`
    <div class="brand"><span class="brand-logo">${icon('shield',22)}</span>
      <div><div class="brand-name">Meridian Admin</div><div class="brand-sub">Control Center</div></div></div>
    <div class="side-scroll">
      <div class="side-label">Administration</div>
      ${ATABS.map(t=>`<button class="nav-item" data-atab="${t[0]}" onclick="location.hash='#/${t[0]}'">${icon(t[2],17)}<span>${t[1]}</span></button>`).join('')}
    </div>
    <div class="side-foot">
      <button class="nav-item" onclick="window.open('../faculty/index.html')">${icon('book',17)}<span>Faculty Portal</span></button>
      <button class="side-user" onclick="location.hash='#/settings'">
        ${avatar(sess.user||'Admin',34)}
        <span style="flex:1;min-width:0"><span style="display:block;font-weight:600;font-size:13px">${esc(sess.user||'Administrator')}</span>
        <span style="display:block;font-size:11px;color:var(--text-3)">${esc(sess.role||'Super Administrator')}</span></span>
      </button>
      <button class="nav-item" onclick="logout()" style="color:var(--danger)">${icon('logout',17)}<span>Sign Out</span></button>
    </div>`;
  window.matchMedia('(max-width:1024px)').addEventListener('change',syncAMenu);syncAMenu();
  $('#aScrim').onclick=closeADrawer;
}
const syncAMenu=()=>{const b=$('#aMenuBtn');if(b)b.style.display=window.matchMedia('(max-width:1024px)').matches?'inline-grid':'none';};
const openADrawer=()=>{document.body.classList.add('side-open');$('#aScrim').hidden=false;};
const closeADrawer=()=>{document.body.classList.remove('side-open');$('#aScrim').hidden=true;};
function renderATop(sess){
  $('#aTop').innerHTML=`
    <button class="icon-btn" id="aMenuBtn" style="display:none" aria-label="Open navigation" onclick="openADrawer()">${icon('menu')}</button>
    <div class="tb-search">${icon('search',16)}
      <input id="aTopQ" type="search" placeholder="Search students, users, courses…" aria-label="Search" autocomplete="off">
      <div id="aTopPop"></div></div>
    <div class="tb-spacer"></div>
    <div class="tb-actions">
      <span class="badge b-accent">${icon('shield',12)} Admin</span>
      <button class="icon-btn" id="themeBtn" onclick="toggleAdminTheme()" aria-label="Toggle theme"></button>
      <span class="tb-divider"></span>
      <button class="tb-user" aria-label="Signed-in administrator">
        ${avatar(sess.user||'Admin',32)}
        <span><span class="tb-user-name">${esc(sess.user||'Administrator')}</span>
        <span class="tb-user-meta" style="display:block">Super Administrator</span></span>
      </button>
    </div>`;
  applyTheme();syncAMenu();
  const q=$('#aTopQ');
  q.addEventListener('input',()=>{
    const v=q.value.trim().toLowerCase(),pop=$('#aTopPop');
    if(!v){pop.innerHTML='';return;}
    const st=adStudents().filter(s=>s.name.toLowerCase().includes(v)||s.id.toLowerCase().includes(v)).slice(0,5);
    const us=adUsers().filter(u=>u.name.toLowerCase().includes(v)||u.email.toLowerCase().includes(v)).slice(0,3);
    pop.innerHTML=`<div class="search-pop"><div class="sp-head">Students</div>
      ${st.map(s=>`<button class="search-item" onclick="location.hash='#/students';adminFocus('student-${s.id}',true)">${avatar(s.name,28)}
        <span><span class="cell-main">${esc(s.name)}</span><span class="cell-sub" style="display:block">${s.id}</span></span>
        <span class="si-meta">${riskBadge(s.risk||'Low')}</span></button>`).join('')}
      <div class="sp-head">Users</div>
      ${us.map(u=>`<button class="search-item" onclick="location.hash='#/users';adminFocus('user-${u.id}',true)">${avatar(u.name,28)}
        <span><span class="cell-main">${esc(u.name)}</span><span class="cell-sub" style="display:block">${esc(u.role)}</span></span></button>`).join('')}
    </div>`;
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.tb-search'))$('#aTopPop').innerHTML='';});
}
function toggleAdminTheme(){App.theme=App.theme==='light'?'dark':'light';applyTheme();adminRoute(true);}

/* ---------- Router ---------- */
function adminRoute(silent){
  const h=(location.hash.replace(/^#\/?/,'')||'overview').split('/')[0];
  if(!ATABS.some(t=>t[0]===h)){location.hash='#/overview';return;}
  ADMIN.tab=h;
  const main=$('#aMain');
  main.scrollTop=0;
  main.innerHTML=adminPage(h);
  $$('#aSide [data-atab]').forEach(b=>b.classList.toggle('active',b.dataset.atab===h));
  closeADrawer();
  window.scrollTo({top:0});
}
/* ---------- CHANGE FOCUS SYSTEM ----------
   After any admin mutation: persist, log to change history,
   show a focus banner, and scroll + pulse-highlight the record. */
function adminFocus(id,useHash){
  const el=document.getElementById(id);
  if(el){
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.classList.remove('flash-new');void el.offsetWidth;el.classList.add('flash-new');
    const inp=el.querySelector('input,select');
    if(inp)setTimeout(()=>inp.focus({preventScroll:true}),350);
  }
  if(useHash)renderFocusBanner();
}
function renderFocusBanner(){
  const h=DATA.focusHint();if(!h)return;
  let slot=$('#bannerHost');
  if(!slot){slot=document.createElement('div');slot.id='bannerHost';$('#aMain').insertAdjacentElement('afterbegin',slot);}
  slot.innerHTML=``;
  const wrap=document.createElement('div');
  wrap.innerHTML=`
    <div class="focus-banner" role="status">
      <span class="icon-tile t-success" style="width:34px;height:34px">${icon('check',17)}</span>
      <div class="fb-text"><span class="fb-label">Change saved · ${esc(h.label)}</span>
        <span class="fb-detail">${esc(h.detail||'')}</span></div>
      ${h.kind&&h.kind!=='changelog'?`<button class="btn btn-sm btn-ghost" data-jump>${icon('target',13)}Jump to change</button>`:''}
      <button class="fb-x" aria-label="Dismiss" onclick="DATA.clearA('last_focus');this.closest('.focus-banner').remove()">${icon('x',15)}</button>
    </div>`;
  slot.appendChild(wrap.firstElementChild);
  const j=slot.querySelector('[data-jump]');
  if(j)j.onclick=()=>{location.hash='#/'+(h.kind||'overview');
    setTimeout(()=>{const el=document.getElementById(h.id||'');
      if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.remove('flash-new');void el.offsetWidth;el.classList.add('flash-new');}
      else{adminRoute();}},150);
  };
}
/*---------- flash markers helpers ---------- */
function flashAttr(id){return ADMIN.flash[id]&&Date.now()-ADMIN.flash[id]<6000?'flash-new':'';}
function doneStamp(id){return ADMIN.flash[id]&&Date.now()-ADMIN.flash[id]<30000
  ?`<span class="stamp">${icon('check',11)}Updated just now</span>`:'';}

/* ---------- Page dispatcher ---------- */
function adminPage(tab){
  return tab==='overview'?aOverview()
    :tab==='students'?aStudents()
    :tab==='users'?aUsers()
    :tab==='courses'?aCourses()
    :tab==='enrollments'?aEnroll()
    :tab==='announcements'?aAnnounce()
    :tab==='changelog'?aChangeLog()
    :aSettings();
}
/* ---------- Central commit: persist → log → focus ----------
   kind/tab: 'students'|'users'|'courses'|'announcements'|'enrollments'
   id: full element id (e.g. 'student-STU-10410') so the changed
   record can be scrolled to and pulse-highlighted. */
function commitChange({kind,label,detail,id}){
  DATA.logChange(kind,label,detail,id);
  ADMIN.flash[id||('row-'+kind)]=Date.now();
  location.hash='#/'+kind;
  adminRoute();
  setTimeout(()=>{
    const el=document.getElementById(id||'');
    if(el){el.scrollIntoView({behavior:'smooth',block:'center'});
      el.classList.remove('flash-new');void el.offsetWidth;el.classList.add('flash-new');
      const inp=el.querySelector('input,select');
      if(inp)inp.focus({preventScroll:true});}
    renderFocusBanner();
  },300);
}

/* ---------------- Overview ---------------- */
function aOverview(){
  const st=adStudents(),us=adUsers(),co=adCourses();
  const risk={Low:0,Moderate:0,High:0,Critical:0};
  st.forEach(s=>{const r=s.risk||'Low';risk[r]=(risk[r]||0)+1;});
  const pending=DATA.readA('announcements',null)&&0;
  const cl=DATA.readA('changelog',[]);
  const riskSeg=[['Low',risk.Low,'var(--success)'],['Moderate',risk.Moderate,'var(--warn)'],
    ['High',risk.High,'var(--danger)'],['Critical',risk.Critical,'var(--accent)']]
    .map(([label,value,color])=>({label,value,color}));
  return `
  ${renderBannerSlot()}
  ${pageHead('Admin Overview','Institution health, quick actions and your latest changes.',
    `<button class="btn btn-ghost" onclick="location.hash='#/changelog'">${icon('clock',15)}Change Log</button>
     <button class="btn btn-primary" onclick="location.hash='#/students'">${icon('plus',15)}Add Student</button>`)}
  <div class="grid cols-6" style="margin-bottom:20px">
    ${[
      ['Managed Students',st.length,'t-primary','users','Live from local storage','#/students'],
      ['Faculty & Staff',us.length,'t-success','user',us.length+' total accounts','#/users'],
      ['Courses',co.length,'t-accent','book','Managed catalog','#/courses'],
      ['Announcements',(DATA.readA('announcements',null)||[]).length,'t-info','bell','Published & scheduled','#/announcements'],
      ['Pending Approvals',2,'t-warn','clock','Enrollment queue','#/enrollments'],
      ['Recent Changes',cl.length,'t-primary','report','Saved to change log','#/changelog']
    ].map(k=>`
      <div class="card card-hov kpi" style="cursor:pointer" onclick="location.hash='${k[5]}'">
        <div class="kpi-top"><span class="icon-tile ${k[2]}">${icon(k[3],18)}</span><span class="kpi-label">${k[0]}</span></div>
        <div class="kpi-val">${k[1]}</div><div class="kpi-desc">${k[4]}</div></div>`).join('')}
  </div>
  <div class="grid-12">
    <div class="card c4">
      <div class="card-h"><h3>Student Risk Distribution</h3><span class="ch-sub">Managed cohort</span></div>
      <div class="card-b" style="text-align:center">
        ${Chart.donut({segments:riskSeg,size:160,thickness:21,center:{value:String(st.length),label:'Students'}})}
        ${Chart.legend(riskSeg)}</div>
    </div>
    <div class="card c5">
      <div class="card-h"><span class="icon-tile t-primary">${icon('grid',17)}</span><h3>Quick Actions</h3></div>
      <div class="card-b"><div class="a-quick">
        <button class="btn btn-soft" onclick="location.hash='#/students'">${icon('plus',15)}Add Student</button>
        <button class="btn btn-soft" onclick="location.hash='#/users'">${icon('user',15)}Invite User</button>
        <button class="btn btn-soft" onclick="location.hash='#/courses'">${icon('book',15)}Add Course</button>
        <button class="btn btn-soft" onclick="location.hash='#/announcements'">${icon('bell',15)}Announce</button>
      </div></div>
    </div>
    <div class="card c3">
      <div class="card-h"><span class="icon-tile t-success">${icon('clock',17)}</span><h3>Quick Stats</h3></div>
      <div class="card-b">
        ${[['Attendance avg','82.4%'],['Avg CGPA','3.21'],['At-risk','18'],['Open alerts','9']].map(([l,v])=>`
          <div class="switch-row"><div class="sw-text"><div class="sw-title" style="font-size:12.5px">${l}</div></div>
          <span class="kpi-val" style="font-size:17px">${v}</span></div>`).join('')}
      </div>
    </div>
    <div class="card c12">
      <div class="card-h"><span class="icon-tile t-accent">${icon('report',17)}</span><h3>Latest Admin Changes</h3>
        <div class="right"><a class="btn-link btn-sm" href="#/changelog">Full log ${icon('chev-right',13)}</a></div></div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:640px">
        <thead><tr><th>Action</th><th>Detail</th><th>When</th><th></th></tr></thead>
        <tbody>${cl.slice(0,6).map((c,i)=>`
          <tr><td><div class="cell-main" style="font-size:13px">${esc(c.label)}</div></td>
            <td><span class="cell-sub">${esc(c.detail)}</span></td>
            <td><span class="cell-sub" style="white-space:nowrap">${esc(c.at)}</span></td>
            <td class="act-cell">${badge(c.kind==='students'?'primary':c.kind==='users'?'info':c.kind==='courses'?'accent':c.kind==='enrollments'?'warn':'neutral',c.kind,{dot:false})}</td></tr>`).join('')}
        </tbody></table></div>
    </div>
  </div>`;
}
function renderBannerSlot(){return `<div id="bannerHost"></div>`;}
function aStBadge(s){const k=s==='Active'?'success':s==='Invited'?'info':s==='Suspended'?'danger':'neutral';
  return `<span class="badge b-${k}"><i class="dot"></i>${esc(s||'Active')}</span>`;}

/* ---------------- Students (managed list) ---------------- */
function aStudents(){
  const st=adStudents();
  const {q,dept,risk}=ADMIN;
  const list=st.filter(s=>
    (!q||s.name.toLowerCase().includes(q.toLowerCase())||s.id.toLowerCase().includes(q.toLowerCase()))&&
    (!dept||s.dept===dept)&&(!risk||s.risk===risk));
  const per=8,pages=Math.max(1,Math.ceil(list.length/per));
  if(ADMIN.page>pages)ADMIN.page=pages;
  const rows=list.slice((ADMIN.page-1)*per,ADMIN.page*per);
  return `
  ${renderBannerSlot()}
  ${pageHead('Students','Manage the master student list — saved changes appear in the faculty model instantly.',
    `<button class="btn btn-ghost" onclick="studentExport()">${icon('download',15)}Export</button>
     <button class="btn btn-primary" onclick="studModal()">${icon('plus',15)}Add Student</button>`)}
  <div class="card tbl-card">
    <div class="filter-bar">
      <input id="aSTq" class="input search" placeholder="Search name or ID…" value="${esc(q)}" aria-label="Search students"
        oninput="clearTimeout(window._sql);window._sql=setTimeout(()=>{ADMIN.q=this.value;ADMIN.page=1;adminRoute(true);},250)">
      <select class="select" onchange="ADMIN.dept=this.value;ADMIN.page=1;adminRoute(true)" aria-label="Department">
        <option value="">All departments</option>
        ${Object.entries(DATA.depts).map(([k,v])=>`<option ${k===dept?'selected':''} value="${k}">${esc(v)}</option>`).join('')}</select>
      <select class="select" onchange="ADMIN.risk=this.value;ADMIN.page=1;adminRoute(true)" aria-label="Risk">
        <option value="">Any risk</option>
        ${['Low','Moderate','High','Critical'].map(r=>`<option ${r===risk?'selected':''}>${r}</option>`).join('')}</select>
    </div>
    ${rows.length?`
    <div class="tbl-wrap"><table class="tbl" style="min-width:1020px">
      <thead><tr><th>Student</th><th>ID</th><th>Dept</th><th>Batch</th><th>CGPA</th><th>Attendance</th><th>Risk</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map(s=>`
        <tr id="student-${s.id}" class="${flashAttr('student-'+s.id)}">
          <td><div style="display:flex;align-items:center;gap:10px">${avatar(s.name,32)}
            <div><div class="cell-main">${esc(s.name)}</div><div class="cell-sub">${esc(s.email||'')}</div></div></div></td>
          <td class="num">${s.id}</td><td><span class="chip">${s.dept}</span></td><td class="num">${s.batch}</td>
          <td class="num">${(s.cgpa??0).toFixed(2)}</td>
          <td>${prog(s.att||0)}</td>
          <td>${riskBadge(s.risk||'Low')}${doneStamp('student-'+s.id)}</td>
          <td>${aStBadge(s.status||'Active')}</td>
          <td class="act-cell"><div class="row-actions">
            <button class="btn btn-sm btn-ghost" onclick="studModal('${s.id}')">${icon('edit',13)}Edit</button>
            <button class="btn btn-sm btn-danger-soft" aria-label="Remove student"
              onclick="confirmDialog({title:'Remove ${esc(s.name)}?',message:'This removes the student from the managed list and records the action in the change log.',confirmText:'Remove',onConfirm:()=>delStudent('${s.id}')})">${icon('trash',13)}</button>
          </div></td></tr>`).join('')}
      </tbody></table></div>
    <div class="pagi">
      <span class="pg-info">Showing ${(ADMIN.page-1)*per+1}–${Math.min(ADMIN.page*per,list.length)} of ${list.length}</span>
      <button class="pg-btn" ${ADMIN.page<=1?'disabled':''} onclick="ADMIN.page--;adminRoute(true)">${icon('chev-left',14)}</button>
      ${Array.from({length:pages},(_,i)=>`<button class="pg-btn ${ADMIN.page===i+1?'on':''}" onclick="ADMIN.page=${i+1};adminRoute(true)">${i+1}</button>`).join('')}
      <button class="pg-btn" ${ADMIN.page>=pages?'disabled':''} onclick="ADMIN.page++;adminRoute(true)">${icon('chev-right',14)}</button>
    </div>`
    :`<div class="tbl-wrap">${emptyState('users','No students found','Adjust the search or filters to see students.','')}</div>`}
  </div>`;
}
function studentExport(){
  exportCSV('managed-students.csv',[['Name','ID','Email','Department','Batch','Semester','CGPA','Attendance','Risk','Status'],
    ...adStudents().map(s=>[s.name,s.id,s.email,DATA.depts[s.dept]||s.dept,s.batch,s.sem,s.cgpa,s.att+'%',s.risk,s.status])]);
}
function studModal(id){
  const existing=id?adStudents().find(s=>s.id===id):null;
  const deps=Object.entries(DATA.depts).map(([k,v])=>`<option value="${k}" ${existing&&existing.dept===k?'selected':''}>${esc(v)}</option>`).join('');
  const m=openModal({title:existing?`Edit Student — ${esc(existing.name)}`:'Add Student',
    body:`
      <div class="form-row">
        <div class="field"><label>Full name <span class="req">*</span></label><input id="sName" class="input" value="${esc(existing?.name||'')}" placeholder="e.g. Amina Yusuf"></div>
        <div class="field"><label>Student ID <span class="req">*</span></label><input id="sId" class="input" value="${esc(existing?.id||'')}" placeholder="STU-10500" ${existing?'readonly style="background:var(--surface-3)"':''}></div></div>
      <div class="form-row">
        <div class="field"><label>Email</label><input id="sMail" class="input" type="email" value="${esc(existing?.email||'')}" placeholder="name@meridian.edu"></div>
        <div class="field"><label>Department</label><select id="sDept" class="select">${deps}</select></div></div>
      <div class="form-row">
        <div class="field"><label>Batch</label><select id="sBatch" class="select">${[2026,2025,2024,2023,2022].map(b=>`<option ${existing&&existing.batch===b?'selected':''}>${b}</option>`).join('')}</select></div>
        <div class="field"><label>Semester</label><select id="sSem" class="select">${[1,2,3,4,5,6,7,8].map(n=>`<option ${existing&&existing.sem===n?'selected':''}>${n}</option>`).join('')}</select></div></div>
      <div class="form-row">
        <div class="field"><label>CGPA</label><input id="sCgpa" class="input" type="number" step="0.01" min="0" max="4" value="${existing?.cgpa??0}"></div>
        <div class="field"><label>Attendance %</label><input id="sAtt" class="input" type="number" min="0" max="100" value="${existing?.att??100}"></div></div>
      <div class="form-row">
        <div class="field"><label>Failed courses</label><input id="sFail" class="input" type="number" min="0" value="${existing?.failed??0}"></div>
        <div class="field"><label>Status</label><select id="sStatus" class="select">
          ${['Active','Invited','Suspended'].map(s=>`<option ${existing&&existing.status===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
      <div class="risk-note">${icon('info',15)}<span>Risk level recalculates automatically from CGPA, attendance and failed courses. Saved changes are highlighted after saving.</span></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="sSave">${icon('check',14)}${existing?'Save Changes':'Create Student'}</button>`});
  const save=()=>{
    const name=$('#sName'),sid=$('#sId');
    let ok=true;
    [[name,'Full name is required'],[sid,'Student ID is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()){el.classList.add('error');if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(!ok)return;
    const list=adStudents();
    const nid=sid.value.trim().toUpperCase();
    const cg=Math.max(0,Math.min(4,parseFloat($('#sCgpa').value)||0));
    const att=Math.max(0,Math.min(100,parseInt($('#sAtt').value)||100));
    const failed=Math.max(0,parseInt($('#sFail').value)||0);
    const dept=$('#sDept').value;
    const row={
      id:nid,name:name.value.trim(),dept,batch:parseInt($('#sBatch').value),sem:parseInt($('#sSem').value),
      cgpa:cg,att,failed,email:$('#sMail').value.trim()||(name.value.trim().toLowerCase().replace(/[^a-z]+/g,'.')+'@meridian.edu'),
      program:DATA.programs[dept]||'',gpa:cg,prevGpa:cg,risk:riskFor(cg,att,failed),
      gpaTrend:(existing&&existing.gpaTrend)||[cg],courseAtt:(existing&&existing.courseAtt)||{},
      rank:(existing&&existing.rank)||'—',passed:(existing&&existing.passed)||0,status:$('#sStatus').value,last:'Just now'
    };
    let label;
    if(existing){const i=list.findIndex(x=>x.id===existing.id);list.splice(i,1,row);label='Updated student';}
    else{list.push(row);label='Added student';}
    DATA.writeA('students',list);
    m.close();
    commitChange({kind:'students',label,detail:`${row.name} · ${row.id} · ${DATA.depts[dept]||dept}`,id:'student-'+row.id});
    toast(`${label}: ${row.name} to focused list`,existing?'info':'success');
  };
  $('#sSave').onclick=save;
  $('#sName').addEventListener('keydown',e=>{if(e.key==='Enter')save();});
  $('#sName').focus();
}
function delStudent(id){
  const list=adStudents().filter(s=>s.id!==id);
  DATA.writeA('students',list);
  commitChange({kind:'students',label:'Removed student',detail:`Student ID ${id} removed from the managed list`,id:null});
  toast('Student removed from managed list','warn');
}
/* ---------------- Users & Access ---------------- */
function aUsers(){
  const us=adUsers();
  const {uQ,uRole}=ADMIN;
  const list=us.filter(u=>(!uQ||u.name.toLowerCase().includes(uQ.toLowerCase())||u.email.toLowerCase().includes(uQ.toLowerCase()))&&(!uRole||u.role===uRole));
  return `
  ${renderBannerSlot()}
  ${pageHead('Users & Access','Manage faculty and staff accounts.',
    `<button class="btn btn-primary" onclick="userModal()">${icon('plus',15)}Invite User</button>`)}
  <div class="card tbl-card">
    <div class="filter-bar">
      <input class="input search" placeholder="Search name or email…" value="${esc(uQ)}" aria-label="Search users"
        oninput="clearTimeout(window._uql);window._uql=setTimeout(()=>{ADMIN.uQ=this.value;adminRoute(true);},250)">
      <select class="select" onchange="ADMIN.uRole=this.value;adminRoute(true)" aria-label="Role">
        <option value="">All roles</option>
        ${[...new Set(us.map(u=>u.role))].map(r=>`<option ${r===uRole?'selected':''}>${r}</option>`).join('')}</select>
      <span style="flex:1"></span>
      <button class="btn btn-ghost btn-sm" onclick="exportCSV('managed-users.csv',[['Name','Email','Role','Dept','Status'],...adUsers().map(u=>[u.name,u.email,u.role,u.dept,u.status])])">${icon('download',13)}Export</button>
    </div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:820px">
      <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Last active</th><th></th></tr></thead>
      <tbody>${list.map(u=>`
        <tr id="user-${u.id}" class="${flashAttr('user-'+u.id)}">
          <td><div style="display:flex;align-items:center;gap:10px">${avatar(u.name,32)}
            <div><div class="cell-main">${esc(u.name)}</div><div class="cell-sub">${esc(u.email)}</div></div></div></td>
          <td>${esc(u.role)}</td><td><span class="cell-sub">${esc(u.dept)}</span></td>
          <td>${aStBadge(u.status)}${doneStamp('user-'+u.id)}</td>
          <td><span class="cell-sub">${esc(u.last)}</span></td>
          <td class="act-cell"><div class="row-actions">
            <button class="btn btn-sm btn-ghost" onclick="userModal('${u.id}')">${icon('edit',13)}Edit</button>
          </div></td></tr>`).join('')}
      </tbody></table></div>
    ${!list.length?emptyState('users','No users found','No accounts match the current filters.',''):''}
  </div>`;
}
function userModal(id){
  const existing=id?adUsers().find(u=>u.id===id):null;
  const m=openModal({title:existing?`Edit User — ${esc(existing.name)}`:'Invite User',
    body:`
      <div class="field"><label>Full name <span class="req">*</span></label><input id="uName" class="input" value="${esc(existing?.name||'')}" placeholder="e.g. Dr. Ana Costa"></div>
      <div class="field"><label>Work email <span class="req">*</span></label><input id="uMail" class="input" type="email" value="${esc(existing?.email||'')}" placeholder="a.costa@meridian.edu"></div>
      <div class="form-row">
        <div class="field"><label>Role</label><select id="uRole" class="select">
          ${['Professor','Lecturer','Academic Advisor','Registrar','Admin','Department Head'].map(r=>`<option ${existing&&existing.role===r?'selected':''}>${r}</option>`).join('')}</select></div>
        <div class="field"><label>Department</label><select id="uDept" class="select">
          ${Object.values(DATA.depts).map(d=>`<option ${existing&&existing.dept===d?'selected':''}>${esc(d)}</option>`).join('')}
          <option>Academic Registry</option><option>Student Affairs</option><option>ICT</option><option>Finance</option></select></div></div>
      ${existing?`<div class="field"><label>Status</label><select id="uStatus" class="select">
        ${['Active','Invited','Suspended'].map(s=>`<option ${existing.status===s?'selected':''}>${s}</option>`).join('')}</select></div>`:''}`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="uSave">${icon('check',14)}${existing?'Save Changes':'Send Invite'}</button>`});
  const save=()=>{
    const name=$('#uName'),mail=$('#uMail');
    let ok=true;
    [[name,'Name is required'],[mail,'A valid work email is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()||(el===mail&&!el.value.includes('@'))){el.classList.add('error');
        if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(!ok)return;
    const list=adUsers();
    const row={id:existing?existing.id:'USR-'+(1001+list.length),name:name.value.trim(),email:mail.value.trim(),
      role:$('#uRole').value,dept:$('#uDept').value,status:existing?($('#uStatus')).value:'Invited',last:existing?existing.last:'Invite sent'};
    let label;
    if(existing){const i=list.findIndex(x=>x.id===existing.id);list.splice(i,1,row);label='Updated user';}
    else{list.unshift(row);label='Invited user';}
    DATA.writeA('users',list);
    m.close();
    commitChange({kind:'users',label,detail:`${row.name} · ${row.email}`,id:'user-'+row.id});
    toast(`${label}: ${row.name}`,existing?'info':'success');
  };
  $('#uSave').onclick=save;
  $('#uName').focus();
}
/* ---------------- Courses ---------------- */
function aCourses(){
  const co=adCourses();
  return `
  ${renderBannerSlot()}
  ${pageHead('Courses','Manage the course catalog that powers all teaching screens.',
    `<button class="btn btn-primary" onclick="courseModal()">${icon('plus',15)}Add Course</button>`)}
  <div class="card tbl-card">
    <div class="tbl-wrap"><table class="tbl" style="min-width:780px">
      <thead><tr><th>Course</th><th>Credits</th><th>Dept</th><th>Instructor</th><th>Students</th><th>Pass rate</th><th></th></tr></thead>
      <tbody>${co.map(c=>`
        <tr id="course-${c.code}" class="${flashAttr('course-'+c.code)}">
          <td><div class="cell-main">${c.code}</div><div class="cell-sub">${esc(c.name)}</div></td>
          <td class="num">${c.credits}</td><td><span class="chip">${c.dept}</span></td>
          <td><span class="cell-sub">${esc(c.instructor||'—')}</span></td>
          <td class="num">${c.students}</td><td>${prog(c.passRate||0,{val:false})}</td>
          <td class="act-cell"><div class="row-actions">
            <button class="btn btn-sm btn-ghost" onclick="courseModal('${c.code}')">${icon('edit',13)}Edit</button>
          </div></td></tr>`).join('')}
      </tbody></table></div>
  </div>`;
}
function courseModal(id){
  const existing=id?adCourses().find(c=>c.code===id):null;
  const m=openModal({title:existing?`Edit Course — ${esc(existing.code)}`:'Add Course',
    body:`
      <div class="form-row">
        <div class="field"><label>Course code <span class="req">*</span></label><input id="cCode" class="input" value="${esc(existing?.code||'')}" placeholder="CSE210" style="text-transform:uppercase"></div>
        <div class="field"><label>Credits</label><select id="cCredits" class="select">${[3,2,4].map(n=>`<option ${existing&&existing.credits===n?'selected':''}>${n}</option>`).join('')}</select></div></div>
      <div class="field"><label>Course title <span class="req">*</span></label><input id="cName" class="input" value="${esc(existing?.name||'')}" placeholder="e.g. Operating Systems"></div>
      <div class="form-row">
        <div class="field"><label>Department</label><select id="cDept" class="select">${Object.keys(DATA.depts).map(d=>`<option ${existing&&existing.dept===d?'selected':''}>${d}</option>`).join('')}</select></div>
        <div class="field"><label>Instructor</label><input id="cInstr" class="input" value="${esc(existing?.instructor||'')}" placeholder="e.g. Dr. S. Malik"></div></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="cSave">${icon('check',14)}${existing?'Save Changes':'Create Course'}</button>`});
  const save=()=>{
    const code=$('#cCode'),name=$('#cName');
    let ok=true;
    [[code,'Course code is required'],[name,'Course title is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()){el.classList.add('error');if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(!ok)return;
    const list=adCourses();
    const row={code:code.value.trim().toUpperCase(),name:name.value.trim(),credits:parseInt($('#cCredits').value),
      dept:$('#cDept').value,instructor:$('#cInstr').value.trim()||'—',students:existing?existing.students:0,
      passRate:existing?existing.passRate:88,avgGrade:existing?existing.avgGrade:'—'};
    let label;
    if(existing){const i=list.findIndex(c=>c.code===existing.code);list.splice(i,1,row);label='Updated course';}
    else{list.push(row);label='Added course';}
    DATA.writeA('courses',list);
    m.close();
    commitChange({kind:'courses',label,detail:`${row.code} · ${row.name}`,id:'course-'+row.code});
    toast(`${label}: ${row.code}`,existing?'info':'success');
  };
  $('#cSave').onclick=save;
}
/* ---------------- Enrollments ---------------- */
function aEnroll(){
  let en=DATA.readA('enrollments',null);
  if(!en){en=(DATA.admin?DATA.admin.enrollment:[]).map(x=>({...x}));}
  const pending=en.filter(e=>e.status==='Pending');
  return `
  ${renderBannerSlot()}
  ${pageHead('Enrollments','Approve or hold admission requests — actions are logged and highlighted.',
    `<button class="btn btn-ghost" onclick="toast('Enrollment summary exported (demo)','info')">${icon('download',15)}Export</button>`)}
  <div class="grid cols-3" style="margin-bottom:20px">
    ${[['Total Applications',en.length,'t-primary'],['Pending Approval',pending.length,'t-warn'],['Approved',en.filter(e=>e.status==='Active').length,'t-success']].map(([l,v,t])=>`
      <div class="card kpi"><div class="kpi-top"><span class="icon-tile ${t}">${icon('clipboard-check',18)}</span>
        <span class="kpi-label">${l}</span></div><div class="kpi-val">${v}</div></div>`).join('')}
  </div>
  <div class="card tbl-card">
    <div class="card-h"><h2>Enrollment Queue</h2><span class="ch-sub">Spring 2026 applications</span></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:820px">
      <thead><tr><th>Student</th><th>Program</th><th>Batch</th><th>Applied</th><th>Status</th><th></th></tr></thead>
      <tbody>${en.map(e=>`
        <tr id="enr-${e.id}" class="${flashAttr('enr-'+e.id)}">
          <td><div style="display:flex;align-items:center;gap:10px">${avatar(e.name,32)}
            <div><div class="cell-main">${esc(e.name)}</div><div class="cell-sub">${e.id}</div></div>${doneStamp('enr-'+e.id)}</div></td>
          <td class="cell-sub">${esc(e.program)}</td><td class="num">${e.batch}</td>
          <td><span class="cell-sub">${esc(e.applied)}</span></td>
          <td>${aStBadge(e.status)}</td>
          <td class="act-cell"><div class="row-actions">
            ${e.status==='Pending'?`
              <button class="btn btn-soft btn-sm" onclick="enAction('${e.id}','Active')">${icon('check',13)}Approve</button>
              <button class="btn btn-ghost btn-sm" onclick="enAction('${e.id}','On Hold')">Hold</button>`:''}
          </div></td></tr>`).join('')}
      </tbody></table></div>
    ${!en.length?emptyState('clipboard-check','No enrollments yet','New applications will appear here.',''):''}
  </div>`;
}
function enAction(id,status){
  let en=DATA.readA('enrollments',null);
  if(!en){en=(DATA.admin?DATA.admin.enrollment:[]).map(x=>({...x}));}
  const row=en.find(e=>e.id===id);
  if(!row)return;
  row.status=status;
  DATA.writeA('enrollments',en);
  const yes=status==='Active';
  commitChange({kind:'enrollments',label:yes?'Enrollment approved':'Enrollment placed on hold',
    detail:`${row.name} · ${row.id} → ${status}`,id:'enr-'+row.id});
  toast(`${row.name} ${yes?'approved':'held'}`,yes?'success':'warn');
}
/* ---------------- Announcements ---------------- */
function aAnnounce(){
  const an=adAnnounce();
  const {aStatus}=ADMIN;
  const list=an.filter(n=>aStatus==='All'||n.status===aStatus);
  return `
  ${renderBannerSlot()}
  ${pageHead('Announcements','Publish institution-wide updates — you decide the audience and timing.',
    `<button class="btn btn-primary" onclick="annModal()">${icon('plus',15)}Compose</button>`)}
  <div class="card">
    <div class="filter-bar">
      <select class="select" style="width:auto" onchange="ADMIN.aStatus=this.value;adminRoute(true)" aria-label="Filter by status">
        <option value="All">All announcements</option>
        ${['Published','Scheduled','Draft'].map(s=>`<option ${s===aStatus?'selected':''}>${s}</option>`).join('')}</select>
      <span style="flex:1"></span>
      <button class="btn btn-ghost btn-sm" onclick="exportCSV('announcements.csv',[['Title','Audience','Status'],...adAnnounce().map(n=>[n.title,n.audience,n.status])])">${icon('download',13)}Export</button>
    </div>
    ${list.length?list.map(n=>`
      <div class="notif-row ${flashAttr('ann-'+n.id)}" id="ann-${n.id}" style="border-bottom:1px solid var(--border)">
        <span class="icon-tile t-info">${icon('bell',16)}</span>
        <div class="n-body">
          <div class="n-title">${esc(n.title)} <span class="chip">${esc(n.audience)}</span>${doneStamp('ann-'+n.id)}</div>
          <div class="n-desc">${esc(n.date||'')} · by ${esc(n.author||'Admin Console')}</div></div>
        ${aStBadge(n.status)}
        <button class="icon-btn" aria-label="Delete" onclick="annDel(${n.id})">${icon('trash',14)}</button>
      </div>`).join('')
    :emptyState('bell','No announcements','Choose a different filter or compose a new announcement.','')}
  </div>`;
}
function annModal(){
  const m=openModal({title:'Compose Announcement',
    body:`
      <div class="field"><label>Audience</label><select id="annAud" class="select">
        <option>All users</option><option>Faculty</option><option>Students</option><option>Specific students</option></select></div>
      <div class="field"><label>Title <span class="req">*</span></label><input id="annTitle" class="input" placeholder="e.g. Campus facility update"></div>
      <div class="field"><label>Message <span class="req">*</span></label><textarea id="annBody" class="textarea" placeholder="Write a clear, concise announcement…"></textarea></div>
      <div class="form-row">
        <div class="field"><label>Priority</label><select class="select"><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
        <div class="field"><label>Send</label><select id="annWhen" class="select"><option>Now</option><option>Schedule…</option></select></div></div>
      <div class="risk-note">${icon('info',15)}<span>Recipients get this in the notification center and email digest.</span></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="annSave">${icon('send',14)}Publish</button>`});
  const save=()=>{
    const t=$('#annTitle'),b=$('#annBody');
    let ok=true;
    [[t,'Title is required'],[b,'Message is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()){el.classList.add('error');if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(!ok)return;
    const list=adAnnounce();
    const id=Date.now();
    const row={id,title:t.value.trim(),audience:$('#annAud').value,status:$('#annWhen').value==='Now'?'Published':'Scheduled',
      date:new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit'})+' · Just now',author:'Admin Console'};
    list.unshift(row);
    DATA.writeA('announcements',list);
    m.close();
    commitChange({kind:'announcements',label:'Announcement published',detail:`${row.title} → ${row.audience}`,id:'ann-'+id});
    toast('Announcement published');
  };
  $('#annSave').onclick=save;
  $('#annTitle').focus();
}
function annDel(id){
  confirmDialog({title:'Delete this announcement?',message:'Recipients will no longer see it. This action is recorded in the change log.',confirmText:'Delete',onConfirm:()=>{
    const list=adAnnounce().filter(n=>n.id!==id);
    DATA.writeA('announcements',list);
    commitChange({kind:'announcements',label:'Announcement deleted',detail:'Announcement #'+id+' removed',id:null});
    toast('Announcement deleted','warn');
  }});
}
/* ---------------- Change Log ---------------- */
function aChangeLog(){
  const cl=DATA.readA('changelog',[]);
  const kinds={students:['Students','primary'],users:['Users','info'],courses:['Courses','accent'],
    enrollments:['Enrollments','warn'],announcements:['Announcements','neutral']};
  return `
  ${renderBannerSlot()}
  ${pageHead('Change Log','Every action you take is recorded here — the proof trail of all admin edits.',
    `<button class="btn btn-ghost" onclick="exportCSV('admin-changes.csv',[['Action','Detail','Section','When'],...DATA.readA('changelog',[]).map(c=>[c.label,c.detail,c.kind,c.at])])">${icon('download',15)}Export</button>`)}
  ${cl.length?`
  <div class="card">
    <div class="card-h"><span class="icon-tile t-primary">${icon('clock',17)}</span>
      <div><h2>Recent Admin Changes</h2><span class="ch-sub">Newest first · kept locally in your browser</span></div></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:720px">
      <thead><tr><th>Section</th><th>Action</th><th>Detail</th><th>When</th></tr></thead>
      <tbody>${cl.map(c=>`
        <tr><td>${badge(kinds[c.kind]?kinds[c.kind][1]:'neutral',kinds[c.kind]?kinds[c.kind][0]:c.kind,{dot:false})}</td>
          <td><div class="cell-main" style="font-size:13px">${esc(c.label)}</div></td>
          <td><span class="cell-sub">${esc(c.detail)}</span></td>
          <td><span class="cell-sub" style="white-space:nowrap">${esc(c.at)}</span></td></tr>`).join('')}
      </tbody></table></div>
  </div>`
  :emptyState('clock','No changes recorded yet','Save a student, invite a user or publish an announcement and it will appear here.','')}
  ${cl.length?`<div style="margin-top:14px;display:flex;justify-content:flex-end">
      <button class="btn btn-danger-soft btn-sm" onclick="confirmDialog({title:'Clear the change log?',message:'This deletes the local record of admin actions. Student, user and course data is not affected.',confirmText:'Clear log',onConfirm:()=>{DATA.writeA('changelog',[]);DATA.clearA('last_focus');toast('Change log cleared','warn');adminRoute(true);}})">${icon('trash',13)}Clear Log</button>
    </div>`:''}`;
}

/* ---------------- Settings ---------------- */
function aSettings(){
  const sess=DATA.readA('session',{});
  return `
  ${renderBannerSlot()}
  ${pageHead('Settings','Admin panel preferences, session and data controls.')}
  <div class="grid-12">
    <div class="card c6">
      <div class="card-h"><span class="icon-tile t-info">${icon('user',17)}</span><h2>Signed-in Administrator</h2></div>
      <div class="card-b">
        <div class="set-item"><div class="si-main"><div class="si-title">${esc(sess.user||'Administrator')}</div>
          <div class="si-desc">${esc(sess.role||'Super Administrator')} · session started ${new Date(sess.at||Date.now()).toLocaleString()}</div></div>
          ${aStBadge('Active')}</div>
        <div class="switch-row"><div class="sw-text"><div class="sw-title">Stay signed in on this device</div>
          <div class="sw-desc">Keeps this session active across page reloads.</div></div>
          <label class="switch"><input type="checkbox" checked aria-label="Stay signed in" onchange="this.checked?DATA.writeA('session',${JSON.stringify(sess)}):DATA.clearA('session')"><span class="sl"></span></label></div>
        <div style="margin-top:14px"><button class="btn btn-danger-soft" onclick="confirmDialog({title:'Sign out of admin?',message:'You will be returned to the admin sign-in screen.',confirmText:'Sign out',onConfirm:logout})">${icon('logout',14)}Sign Out</button></div>
      </div>
    </div>
    <div class="card c6">
      <div class="card-h"><span class="icon-tile t-primary">${icon('gear',17)}</span><h2>Appearance</h2></div>
      <div class="card-b">
        <div class="switch-row"><div class="sw-text"><div class="sw-title">Dark mode</div>
          <div class="sw-desc">Shared with the faculty portal.</div></div>
          <label class="switch"><input type="checkbox" ${App.theme==='dark'?'checked':''} aria-label="Dark mode" onchange="App.theme=this.checked?'dark':'light';applyTheme()"><span class="sl"></span></label></div>
        <div class="risk-note" style="margin-top:14px">${icon('info',15)}<span>Changes made by the admin are stored in this browser and are requested to be reviewed for institutional use.</span></div>
      </div>
    </div>
    <div class="card c6" style="border-color:var(--danger)">
      <div class="card-h" style="background:var(--danger-soft)"><span class="icon-tile t-danger">${icon('alert-triangle',17)}</span><h2>Danger Zone</h2></div>
      <div class="card-b">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <div style="flex:1;min-width:200px"><div class="cell-main">Reset all admin-managed data</div>
            <div class="cell-sub">Deletes managed students, users, courses, announcements, enrollments and the change log. Restores the original demo dataset. Cannot be undone.</div></div>
          <button class="btn btn-danger" onclick="confirmDialog({title:'Reset ALL admin data?',message:'This permanently clears every admin-managed record stored in this browser and restores the original demonstration dataset. This cannot be undone.',confirmText:'Reset everything',onConfirm:()=>{['students','users','courses','announcements','enrollments','changelog','last_focus'].forEach(k=>DATA.clearA(k));toast('Admin data reset — returning to demo dataset','warn');adminRoute(true);}})">${icon('alert-triangle',14)}Reset All Data</button>
        </div>
      </div>
    </div>
  </div>`;
}
/*==AD-CONT==*/