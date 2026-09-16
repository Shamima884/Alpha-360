/* ============================================================
   Pages D — Admin Console (institution-wide management)
   ============================================================ */
'use strict';

const ADMIN_TABS=['Overview','Users & Access','Roles & Permissions','Departments',
  'Programs & Courses','Academic Sessions','Enrollments','Announcements','Audit Log','System Settings'];

const A_STATUS_KIND={Active:'success',Invited:'info',Suspended:'danger',Pending:'warn',
  Published:'success',Scheduled:'info',Draft:'neutral','On Hold':'warn'};
function aStatusBadge(st){const k=A_STATUS_KIND[st]||'neutral';
  return `<span class="badge b-${k}"><i class="dot"></i>${esc(st)}</span>`;}
function aSevBadge(s){const k=s==='danger'?'danger':s==='warn'?'warn':s==='success'?'success':'info';
  return `<span class="badge b-${k}" style="text-transform:capitalize">${esc(s)}</span>`;}

Pages.admin=()=>{
  const a=App.admin, tab=a.tab;
  after(()=>{});
  let panel=adminContent(tab);
  return `
  ${pageHead(tab==='Overview'?'Admin Overview':'Admin Console',
    tab==='Overview'?'Institution-wide health, activity and approvals at a glance.'
    :'Manage users, catalog, sessions, communication and system configuration.')}
  <div class="settings-grid">
    <div class="card set-nav" id="adminNav" style="padding:8px;position:sticky;top:calc(var(--topbar-h) + 20px)" aria-label="Admin sections">
      <div class="side-label">Administration</div>
      ${ADMIN_TABS.map(t=>`<button class="nav-item ${tab===t?'active':''}" onclick="App.admin.tab='${t}';renderRoute(true)">${icon(t==='Overview'?'grid':t==='Users & Access'?'users':t==='Roles & Permissions'?'lock':t==='Departments'?'building':t==='Programs & Courses'?'book':t==='Academic Sessions'?'calendar':t==='Enrollments'?'clipboard-check':t==='Announcements'?'bell':t==='Audit Log'?'report':'gear',15)}<span>${t}</span></button>`).join('')}
      <div class="side-foot" style="border-top:0;padding:10px 8px 0">
        <button class="nav-item" onclick="toast('Signed out of admin session (demo)','info')">${icon('logout',15)}<span>Exit admin</span></button>
      </div>
    </div>
    <div class="card"><div class="card-h"><h2>${esc(tab)}</h2>
      <div class="right"><span class="cell-sub">${esc(DATA.institution.name)} · ${esc(DATA.institution.semester)}</span></div></div>
      <div class="card-b" style="padding:0">${panel}</div></div>
  </div>`;
};

/* ---------------- Overview ---------------- */
function adminOverview(){
  const top=`
  <div class="grid cols-6" style="padding:20px;gap:14px">
    ${DATA.admin.kpis.map(k=>`
      <div class="card kpi" style="box-shadow:none;border:1px solid var(--border)">
        <div class="kpi-top"><span class="icon-tile ${k.tile}">${icon(k.icon,18)}</span><span class="kpi-label">${esc(k.label)}</span></div>
        <div class="kpi-val">${esc(k.value)}</div><div class="kpi-desc">${esc(k.desc)}</div>
        ${trendChip(k.delta,k.good)}</div>`).join('')}
  </div>
  <div class="grid-12" style="padding:0 20px 20px">
    <div class="card c4" style="box-shadow:none">
      <div class="card-h"><span class="icon-tile t-warn">${icon('clock',17)}</span><h2>Pending Approvals</h2><span class="ch-sub">Require your action</span></div>
      <div class="card-b" style="display:grid;gap:10px">
        ${DATA.admin.pending.map(p=>`
          <div style="display:flex;align-items:center;gap:11px;padding:10px 12px;border:1px solid var(--border);border-radius:12px">
            <span class="icon-tile ${p.sev==='danger'?'t-danger':p.sev==='warn'?'t-warn':'t-info'}" style="width:32px;height:32px">${icon(p.sev==='danger'?'alert-triangle':'clock',15)}</span>
            <div style="flex:1;min-width:0"><div class="cell-main" style="font-size:12.5px">${esc(p.t)}</div>
              <div class="cell-sub">${esc(p.x)} · ${esc(p.when)}</div></div>
            <button class="btn btn-soft btn-sm" onclick="toast('Approval flow opened (demo)','info')">Review</button></div>`).join('')}
        <button class="btn btn-ghost btn-sm" style="width:100%" onclick="App.admin.tab='Enrollments';renderRoute(true)">View all requests ${icon('chev-right',13)}</button>
      </div>
    </div>`;
<div class="card c5" style="box-shadow:none">
      <div class="card-h"><span class="icon-tile t-success">${icon('shield',17)}</span><h2>System Health</h2><span class="ch-sub">Service status · updates hourly</span></div>
      <div class="card-b">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          ${DATA.admin.health.map(h=>`<div class="stat-chip" style="padding:11px 13px">
            <span class="sc-lab">${esc(h.label)}</span>
            <span class="sc-val" style="font-size:14px;font-weight:700;color:${h.level==='warn'?'var(--warn)':h.level==='good'?'var(--success)':'var(--text-2)'}">${esc(h.value)}</span></div>`).join('')}
        </div>
        ${prog(64,{val:false})}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
          <span class="cell-sub">Storage · 51 GB of 80 GB used</span>
          <button class="btn btn-soft btn-sm" onclick="toast('Backup started — you will be notified when complete','info')">${icon('clock',13)}Backup Now</button></div>
      </div>
    </div>
    <div class="card c3" style="box-shadow:none">
      <div class="card-h"><span class="icon-tile t-primary">${icon('chart',17)}</span><h2>Admin Activity</h2><span class="ch-sub">Actions this week</span></div>
      <div class="card-b">${Chart.bars({labels:DATA.admin.weekly.map(w=>w.d),values:DATA.admin.weekly.map(w=>w.v),
        color:cssVar('--primary'),height:170})}</div>
    </div>
    <div class="card c7" style="box-shadow:none">
      <div class="card-h"><span class="icon-tile t-accent">${icon('report',17)}</span><h2>Recent Admin Activity</h2>
        <div class="right"><button class="btn-link btn-sm" onclick="App.admin.tab='Audit Log';renderRoute(true)">Full audit log ${icon('chev-right',12)}</button></div></div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:540px">
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th></th></tr></thead>
        <tbody>${DATA.admin.audit.slice(0,5).map(l=>`
          <tr><td><span class="cell-sub" style="white-space:nowrap">${esc(l.time)}</span></td>
            <td><div class="cell-main" style="font-size:13px">${esc(l.user)}</div></td>
            <td><div class="cell-main" style="font-size:13px">${esc(l.action)}</div><div class="cell-sub">${esc(l.target)}</div></td>
            <td>${aSevBadge(l.sev)}</td></tr>`).join('')}</tbody></table></div>
    </div>
    <div class="card c5" style="box-shadow:none">
      <div class="card-h"><span class="icon-tile t-info">${icon('bell',17)}</span><h2>Announcements</h2>
        <div class="right"><button class="btn btn-primary btn-sm" onclick="composeAnnouncement()">${icon('plus',13)}Compose</button></div></div>
      <div class="card-b" style="display:grid;gap:10px">
        ${DATA.admin.announcements.slice(0,3).map(n=>`
          <div style="display:flex;align-items:center;gap:11px;padding:10px 12px;border:1px solid var(--border);border-radius:12px">
            <div style="flex:1;min-width:0"><div class="cell-main" style="font-size:12.5px">${esc(n.title)}</div>
              <div class="cell-sub">${esc(n.audience)} · ${esc(n.date)}</div></div>${aStatusBadge(n.status)}</div>`).join('')}
      </div>
    </div>
  </div>`;
  return top;
}
/* ---------------- Users & Access ---------------- */
function adminUsers(){
  const a=App.admin;
  const roles=[...new Set(DATA.admin.users.map(u=>u.role))];
  const depts=[...new Set(DATA.admin.users.map(u=>u.dept))];
  const list=DATA.admin.users.filter(u=>
    (!a.userQ || (u.name.toLowerCase().includes(a.userQ.toLowerCase())||u.email.toLowerCase().includes(a.userQ.toLowerCase()))) &&
    (!a.userRole || u.role===a.userRole) && (!a.userDept || u.dept===a.userDept));
  after(()=>{
    const q=$('#admQ');
    if(q)q.oninput=()=>{clearTimeout(q._t);q._t=setTimeout(()=>{a.userQ=q.value;renderRoute(true);
      const nq=$('#admQ');if(nq){nq.focus();nq.setSelectionRange(nq.value.length,nq.value.length);}},250);};
    $$('#admRole,#admDept').forEach(s=>s.onchange=()=>{a[s.id==='admRole'?'userRole':'userDept']=s.value;renderRoute(true);});
  });
  return `
  <div class="filter-bar" style="border-bottom:1px solid var(--border)">
    <input id="admQ" class="input search" type="search" placeholder="Search name or email…" value="${esc(a.userQ)}" aria-label="Search users">
    <select id="admRole" class="select" aria-label="Role"><option value="">All roles</option>${roles.map(r=>`<option ${r===a.userRole?'selected':''}>${r}</option>`).join('')}</select>
    <select id="admDept" class="select" aria-label="Department"><option value="">All departments</option>${depts.map(d=>`<option ${d===a.userDept?'selected':''}>${d}</option>`).join('')}</select>
    <span style="flex:1"></span>
    <button class="btn btn-primary btn-sm" onclick="inviteUserModal()">${icon('plus',13)}Invite User</button>
  </div>
  <div class="tbl-wrap"><table class="tbl" style="min-width:820px">
    <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Last active</th><th></th></tr></thead>
    <tbody>${list.map(u=>`
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px">${avatar(u.name,32)}
          <div><div class="cell-main">${esc(u.name)}</div><div class="cell-sub">${esc(u.email)}</div></div></div></td>
        <td>${esc(u.role)}</td><td><span class="cell-sub">${esc(u.dept)}</span></td>
        <td>${aStatusBadge(u.status)}</td><td><span class="cell-sub">${esc(u.last)}</span></td>
        <td class="act-cell"><div class="row-actions">
          <button class="btn btn-sm btn-ghost" onclick="toast('Account editor opened (demo)','info')">${icon('edit',13)}Edit</button>
          <div class="dd"><button class="icon-btn" style="width:30px;height:30px" aria-label="More" data-tip="More"
            data-dd='<div class="dd-menu"><button class="dd-item" onclick="toast(&quot;Editor opened (demo)&quot;,&#39;info&#39;)">${icon('edit',14)}Edit details</button>
            <button class="dd-item" onclick="toast(&quot;Invitation resent (demo)&quot;,&#39;info&#39;)">${icon('mail',14)}Resend invite</button>
            <button class="dd-item danger" onclick="toast(&quot;Deletion requires confirmation (demo)&quot;,&#39;warn&#39;)">${icon('trash',14)}Deactivate</button></div>'>${icon('dots',15)}</button></div>
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>
  ${!list.length?emptyState('users','No users found','No accounts match the current filters.',''):''}`;
}
function inviteUserModal(){
  const m=openModal({title:'Invite User',
    body:`<div class="field"><label>Full name <span class="req">*</span></label><input id="invName" class="input" placeholder="e.g. Dr. Ana Costa"></div>
      <div class="field"><label>Work email <span class="req">*</span></label><input id="invMail" class="input" type="email" placeholder="a.costa@meridian.edu"></div>
      <div class="form-row">
        <div class="field"><label>Role <span class="req">*</span></label><select id="invRole" class="select"><option>Professor</option><option>Lecturer</option><option>Academic Advisor</option><option>Registrar</option><option>Admin</option></select></div>
        <div class="field"><label>Department</label><select id="invDept" class="select"><option>Academic Registry</option><option>Student Affairs</option><option>ICT</option><option>Finance</option><option>Admissions</option></select></div></div>
      <div class="risk-note">${icon('info',15)}<span>The invitation email contains a secure link valid for 7 days.</span></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="invSave">${icon('mail',14)}Send Invite</button>`});
  m.el.querySelector('#invSave').onclick=()=>{
    const name=m.el.querySelector('#invName'),mail=m.el.querySelector('#invMail');
    let ok=true;
    [[name,'Name is required'],[mail,'A valid work email is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()||(el===mail&&!el.value.includes('@'))){el.classList.add('error');
        if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(ok){
      DATA.admin.users.unshift({id:'USR-0'+String(DATA.admin.users.length+1).padStart(2,'0'),
        name:name.value.trim(),role:m.el.querySelector('#invRole').value,dept:m.el.querySelector('#invDept').value,
        email:mail.value.trim(),status:'Invited',last:'Invite sent'});
      m.close();toast('Invitation sent to '+mail.value.trim());renderRoute(true);
    }
  };
}
/* ---------------- Roles & Permissions ---------------- */
function adminRoles(){
  const perms=['Manage users','Manage catalog','Edit grades & results','Mark attendance','Approve enrollments','Grant restricted access'];
  const roles=[['Admin',1,1,1,1,1,1],['Registrar',0,1,1,1,1,1],['Associate Dean',0,1,1,1,1,0],
    ['Department Head',0,0,1,1,0,0],['Professor',0,0,1,1,0,0],['Advisor',0,0,0,0,0,0]];
  const counts={Admin:6,Registrar:4,'Associate Dean':2,'Department Head':5,Professor:64,Advisor:9};
  return `
  <div class="grid" style="gap:16px;padding:20px">
    <div class="grid cols-3" style="gap:12px">
      ${roles.map(r=>`
        <div class="card card-hov" style="padding:15px 17px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span class="icon-tile ${r[3]||r[4]?'t-primary':'t-neutral'}">${icon(r[4]?'clipboard-check':'shield',16)}</span>
            <span class="cell-main">${r[0]}</span></div>
          <div class="cell-sub" style="margin-bottom:10px">${counts[r[0]]} member${counts[r[0]]!==1?'s':''}</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${r[2]?badge('primary','Catalog',{dot:false}):''}${r[3]?badge('info','Grades',{dot:false}):''}
            ${r[4]?badge('success','Attendance',{dot:false}):''}${r[5]?badge('warn','Enrollments',{dot:false}):''}
            ${r[6]?badge('danger','Restricted',{dot:false}):''}</div>
        </div>`).join('')}
    </div>
    <div class="card" style="box-shadow:none">
      <div class="card-h"><h3>Permission Matrix</h3><span class="ch-sub">Tick to grant · changes apply at next sign-in</span></div>
      <div class="tbl-wrap"><table class="matrix">
        <thead><tr><th style="text-align:left">Permission</th>${roles.map(r=>`<th>${r[0]}</th>`).join('')}</tr></thead>
        <tbody>${perms.map((p,i)=>`<tr><td>${p}</td>${roles.map(r=>`<td><input type="checkbox" class="chk" ${r[i+1]?'checked':''} aria-label="${p} for ${r[0]}"></td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>
      <div class="risk-note" style="margin:14px 20px 0">${icon('shield',15)}<span>Privileged permissions (manage users, restricted access) are logged and require a second approver.</span></div>
    </div>
  </div>`;
}
/* ---------------- Departments ---------------- */
function adminDepts(){
  return `
  <div class="grid cols-2" style="padding:20px;gap:14px">
    ${DATA.admin.deptRows.map(d=>`
      <div class="card card-hov" style="padding:18px">
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">
          <span class="icon-tile t-primary">${icon('building',17)}</span>
          <div style="flex:1"><div class="cell-main">${esc(d.name)}</div><div class="cell-sub">Code ${d.code} · ${esc(d.head)}</div></div></div>
        <div style="display:flex;gap:10px">
          <div class="stat-chip" style="flex:1;padding:10px 12px"><span class="sc-val" style="font-size:16px">${d.students}</span><span class="sc-lab">Students</span></div>
          <div class="stat-chip" style="flex:1;padding:10px 12px"><span class="sc-val" style="font-size:16px">${d.programs}</span><span class="sc-lab">Programs</span></div>
          <div class="stat-chip" style="flex:1;padding:10px 12px"><span class="sc-val" style="font-size:16px">${d.courses}</span><span class="sc-lab">Courses</span></div></div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-soft btn-sm" style="flex:1" onclick="toast('${esc(d.name)} editor opened (demo)','info')">${icon('edit',13)}Manage</button>
          <button class="btn btn-ghost btn-sm" onclick="toast('Department report queued (demo)','info')">${icon('report',13)}Report</button></div>
      </div>`).join('')}
  </div>`;
}

/* ---------------- Programs & Courses ---------------- */
function adminPrograms(){
  return `
  <div style="padding:20px;display:grid;gap:20px">
    <div class="grid cols-2" style="gap:14px">
      ${DATA.admin.programRows.map(p=>`
        <div class="card" style="padding:16px">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="icon-tile t-accent">${icon('book',16)}</span>
            <div style="flex:1"><div class="cell-main" style="font-size:13.5px">${esc(p.name)}</div>
              <div class="cell-sub">${p.code} · ${esc(p.dept)} · ${p.credits} credits</div></div>
            ${p.students>=p.seats?badge('warn','Full'):badge('success','Open')}</div>
          ${prog(Math.round(p.students/p.seats*100),{val:false})}
          <div class="cell-sub" style="margin-top:5px">${p.students} enrolled of ${p.seats} seats</div>
        </div>`).join('')}
    </div>
    <div class="card" style="box-shadow:none">
      <div class="card-h"><h3>Course Catalog</h3><span class="ch-sub">${DATA.courses.length} active courses</span>
        <div class="right"><button class="btn btn-ghost btn-sm" onclick="addCourseModal()">${icon('plus',13)}Add Course</button>
        <button class="btn btn-ghost btn-sm" onclick="exportCSV('courses-admin.csv',[['Code','Name','Credits','Instructor','Students','Pass rate'],...DATA.courses.map(c=>[c.code,c.name,c.credits,c.instructor,c.students,c.passRate])])">${icon('download',13)}Export</button></div></div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:600px">
        <thead><tr><th>Course</th><th>Credits</th><th>Instructor</th><th>Students</th><th>Pass rate</th><th></th></tr></thead>
        <tbody>${DATA.courses.map(c=>`
          <tr><td><div class="cell-main">${c.code}</div><div class="cell-sub">${esc(c.name)}</div></td>
            <td class="num">${c.credits}</td><td><span class="cell-sub">${esc(c.instructor)}</span></td>
            <td class="num">${c.students}</td><td>${prog(c.passRate,{val:false})}</td>
            <td class="act-cell"><div class="row-actions"><button class="icon-btn" style="width:30px;height:30px" aria-label="Edit" onclick="toast('Course editor opened (demo)','info')">${icon('edit',14)}</button></div></td>
          </tr>`).join('')}</tbody></table></div>
      <div style="padding:14px 20px">${emptyState('book','Draft catalog empty','Draft courses will appear here before they are published to faculty and students.','')}</div>
    </div>
  </div>`;
}
function addCourseModal(){
  const m=openModal({title:'Add Course',
    body:`<div class="form-row">
      <div class="field"><label>Course code <span class="req">*</span></label><input id="coCode" class="input" placeholder="CSE210" style="text-transform:uppercase"></div>
      <div class="field"><label>Credits</label><select class="select"><option>3</option><option>2</option><option>4</option></select></div></div>
      <div class="field"><label>Course title <span class="req">*</span></label><input id="coName" class="input" placeholder="e.g. Operating Systems"></div>
      <div class="form-row">
        <div class="field"><label>Department</label><select class="select">${Object.keys(DATA.depts).map(d=>`<option>${d}</option>`).join('')}</select></div>
        <div class="field"><label>Capacity</label><input class="input" type="number" value="50"></div></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="coSave">${icon('plus',14)}Create course</button>`});
  m.el.querySelector('#coSave').onclick=()=>{
    const code=m.el.querySelector('#coCode'),name=m.el.querySelector('#coName');
    let ok=true;
    [[code,'Course code is required'],[name,'Course title is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()){el.classList.add('error');
        if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(ok){m.close();toast(`${code.value.trim().toUpperCase()} — ${name.value.trim()} added to catalog (demo)`,'success');}
  };
}
/* ---------------- Academic Sessions ---------------- */
function adminSessions(){
  return `
  <div style="padding:20px;display:grid;gap:20px">
    <div class="grid cols-3" style="gap:14px">
      ${DATA.admin.sessions.map(s=>`
        <div class="card" style="padding:18px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <span class="icon-tile ${s.status==='active'?'t-success':'t-info'}">${icon('calendar',17)}</span>
            <div><div class="cell-main">${s.name}</div><div class="cell-sub">${s.range}</div></div>
            ${badge(s.status==='active'?'success':'info',s.status==='active'?'Active':'Upcoming')}</div>
          <div class="cell-sub" style="margin-bottom:12px">Registration · ${esc(s.registration)}</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-soft btn-sm" style="flex:1" onclick="toast('${s.name} schedule opened (demo)','info')">Manage</button>
            <button class="btn btn-ghost btn-sm" onclick="toast('${s.name} calendar view opened (demo)','info')">Calendar</button></div>
        </div>`).join('')}
      <div class="card card-hov" style="padding:18px;display:grid;place-items:center;border-style:dashed;background:var(--surface-2)">
        <button class="btn btn-ghost" onclick="toast('New session creation flow opened (demo)','info')">${icon('plus',16)}Create Session</button>
      </div>
    </div>
    <div class="card" style="box-shadow:none">
      <div class="card-h"><h3>Academic Calendar</h3><span class="ch-sub">Institution-wide events</span>
        <div class="right"><button class="btn btn-ghost btn-sm" onclick="toast('Calendar export queued (demo)','info')">${icon('download',13)}Export</button></div></div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:520px">
        <thead><tr><th>Date</th><th>Event</th><th>Type</th><th></th></tr></thead>
        <tbody>${DATA.admin.calendar.map(c=>`
          <tr><td><span class="cell-sub" style="white-space:nowrap">${esc(c.date)}</span></td>
            <td><div class="cell-main">${esc(c.event)}</div></td>
            <td>${badge(c.type==='Registration'?'info':c.type==='Holiday'?'neutral':'primary',c.type,{dot:false})}</td>
            <td class="act-cell"><button class="icon-btn" style="width:30px;height:30px" aria-label="Edit event" onclick="toast('Event editor opened (demo)','info')">${icon('edit',14)}</button></td>
          </tr>`).join('')}</tbody></table></div>
    </div>
  </div>`;
}

/* ---------------- Enrollments ---------------- */
function admApprove(id,status){
  const row=DATA.admin.enrollment.find(e=>e.id===id);
  if(row){row.status=status;toast(`${row.name} — ${status==='Active'?'enrollment approved':'enrollment held'} (demo)`,`${status==='Active'?'success':'warn'}`);}
  renderRoute(true);
}
function adminEnroll(){
  const pending=DATA.admin.enrollment.filter(e=>e.status==='Pending').length;
  const onHold=DATA.admin.enrollment.filter(e=>e.status==='On Hold').length;
  return `
  <div style="padding:20px">
    <div class="grid cols-4" style="gap:14px;margin-bottom:20px">
      ${[['Total Students','248','t-primary','users'],['Pending Approval',pending,'t-warn','clock'],
         ['On Hold',onHold,'t-accent','pause'],['New This Week','18','t-success','trend-up']].map(([l,v,t,ic])=>`
        <div class="card kpi" style="box-shadow:none"><div class="kpi-top"><span class="icon-tile ${t}">${icon(ic,17)}</span>
          <span class="kpi-label">${l}</span></div><div class="kpi-val">${v}</div></div>`).join('')}
    </div>
    <div class="card" style="box-shadow:none">
      <div class="card-h"><h3>Enrollment Queue</h3><span class="ch-sub">Applications for Spring 2026</span></div>
      <div class="tbl-wrap"><table class="tbl tbl-card" style="min-width:780px">
        <thead><tr><th>Student</th><th>Program</th><th>Batch</th><th>Sem</th><th>Applied</th><th>Status</th><th></th></tr></thead>
        <tbody>${DATA.admin.enrollment.map(e=>`
          <tr><td data-label="Student"><div style="display:flex;align-items:center;gap:10px">${avatar(e.name,32)}
            <div><div class="cell-main">${esc(e.name)}</div><div class="cell-sub">${e.id}</div></div></div></td>
          <td data-label="Program" class="cell-sub">${esc(e.program)}</td>
          <td data-label="Batch" class="num">${e.batch}</td><td data-label="Sem" class="num">${e.sem}</td>
          <td data-label="Applied" class="cell-sub">${esc(e.applied)}</td>
          <td data-label="Status">${aStatusBadge(e.status)}</td>
          <td data-label="" class="act-cell"><div class="row-actions">
            ${e.status==='Pending'?`
              <button class="btn btn-soft btn-sm" onclick="admApprove('${e.id}','Active')">${icon('check',13)}Approve</button>
              <button class="btn btn-ghost btn-sm" onclick="admApprove('${e.id}','On Hold')">Hold</button>`:''
            }<div class="dd"><button class="icon-btn" style="width:30px;height:30px" aria-label="More"
              data-dd='<div class="dd-menu"><button class="dd-item" onclick="toast(&quot;Enrollment details opened (demo)&quot;,&#39;info&#39;)">${icon('eye',14)}View application</button>
              <button class="dd-item" onclick="toast(&quot;Message sent (demo)&quot;,&#39;info&#39;)">${icon('mail',14)}Contact student</button></div>'>${icon('dots',15)}</button></div>
          </div></td></tr>`).join('')}
        </tbody></table></div>
    </div>
  </div>`;
}
/* ---------------- Announcements ---------------- */
function composeAnnouncement(){
  const m=openModal({title:'Compose Announcement',
    body:`<div class="field"><label>Audience</label>
        <select id="annAud" class="select"><option>All users</option><option>Faculty</option><option>Students</option><option>Specific students</option><option>Custom group</option></select></div>
      <div class="field"><label>Title <span class="req">*</span></label><input id="annTitle" class="input" placeholder="e.g. Campus facility update"></div>
      <div class="field"><label>Message <span class="req">*</span></label><textarea id="annBody" class="textarea" placeholder="Write a clear, concise announcement…"></textarea></div>
      <div class="form-row">
        <div class="field"><label>Priority</label><select class="select"><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
        <div class="field"><label>Send</label><select id="annWhen" class="select"><option>Now</option><option>Schedule…</option></select></div></div>
      <div class="risk-note">${icon('info',15)}<span>Announcements reach recipients via the notification center and email digest.</span></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-ghost" onclick="toast('Draft saved (demo)','info');this.closest('.modal-overlay').remove()">Save draft</button>
      <button class="btn btn-primary" id="annSend">${icon('send',14)}Send</button>`});
  m.el.querySelector('#annSend').onclick=()=>{
    const t=m.el.querySelector('#annTitle'),b=m.el.querySelector('#annBody');
    let ok=true;
    [[t,'Title is required'],[b,'Message is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()){el.classList.add('error');
        if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(ok){
      DATA.admin.announcements.unshift({id:Date.now()%10000,title:t.value.trim(),
        audience:m.el.querySelector('#annAud').value,status:m.el.querySelector('#annWhen').value==='Now'?'Published':'Scheduled',
        date:new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit'})+' · Just now',author:'Admin Console'});
      m.close();toast('Announcement sent to '+m.el.querySelector('#annAud').value);
      renderRoute(true);
    }
  };
}
function adminAnnounce(){
  const a=App.admin;
  const list=DATA.admin.announcements.filter(n=>a.annFilter==='All'||n.status===a.annFilter);
  after(()=>{
    const sel=$('#annFl');
    if(sel)sel.onchange=()=>{a.annFilter=sel.value;renderRoute(true);};
  });
  return `
  <div style="padding:20px">
    <div class="filter-bar" style="border-bottom:1px solid var(--border);padding:10px 0">
      <select id="annFl" class="select" style="width:auto" aria-label="Filter by status">
        <option value="All">All announcements</option>
        <option value="Published" ${a.annFilter==='Published'?'selected':''}>Published</option>
        <option value="Scheduled" ${a.annFilter==='Scheduled'?'selected':''}>Scheduled</option>
        <option value="Draft" ${a.annFilter==='Draft'?'selected':''}>Drafts</option></select>
      <span style="flex:1"></span>
      <button class="btn btn-primary" onclick="composeAnnouncement()">${icon('plus',14)}Compose</button>
    </div>
    ${list.map(n=>`
      <div class="notif-row" style="border-bottom:1px solid var(--border)">
        <span class="icon-tile t-info">${icon('bell',16)}</span>
        <div class="n-body">
          <div class="n-title">${esc(n.title)} <span class="chip">${esc(n.audience)}</span></div>
          <div class="n-desc">${esc(n.date)} · by ${esc(n.author)}</div></div>
        ${aStatusBadge(n.status)}
        <div class="dd"><button class="icon-btn" aria-label="More"
          data-dd='<div class="dd-menu"><button class="dd-item" onclick="toast(&quot;Editor opened (demo)&quot;,&#39;info&#39;)">${icon('edit',14)}Edit</button>
        <button class="dd-item" onclick="toast(&quot;Announcement removed (demo)&quot;,&#39;warn&#39;)">${icon('trash',14)}Delete</button></div>'>${icon('dots',15)}</button></div>
      </div>`).join('')}
    ${!list.length?emptyState('bell','No announcements','Choose a different filter or compose a new announcement.',`<button class="btn btn-soft" onclick="App.admin.annFilter='All';renderRoute(true)">Clear filter</button>`):''}
  </div>`;
}
/* ---------------- Audit Log ---------------- */
function adminAudit(){
  const a=App.admin;
  const list=DATA.admin.audit.filter(l=>!a.auditQ||(l.action.toLowerCase().includes(a.auditQ.toLowerCase())
    ||l.user.toLowerCase().includes(a.auditQ.toLowerCase())||l.target.toLowerCase().includes(a.auditQ.toLowerCase())));
  after(()=>{
    const q=$('#audQ');
    if(q)q.oninput=()=>{clearTimeout(q._t);q._t=setTimeout(()=>{a.auditQ=q.value;renderRoute(true);},250);};
  });
  return `
  <div style="padding:20px">
    <div class="filter-bar" style="border-bottom:1px solid var(--border);padding:10px 0">
      <input id="audQ" class="input search" type="search" placeholder="Search action, user or target…" value="${esc(a.auditQ)}" aria-label="Search audit log">
      <span style="flex:1"></span>
      <button class="btn btn-ghost btn-sm" onclick="exportCSV('audit-log.csv',[['Time','User','Action','Target','Severity'],...DATA.admin.audit.map(l=>[l.time,l.user,l.action,l.target,l.sev])])">${icon('download',13)}Export</button>
    </div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:760px">
      <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Target</th><th>Severity</th></tr></thead>
      <tbody>${list.map(l=>`
        <tr><td><span class="cell-sub" style="white-space:nowrap">${esc(l.time)}</span></td>
        <td><div class="cell-main" style="font-size:13px">${esc(l.user)}</div></td>
        <td><div class="cell-main" style="font-size:13px">${esc(l.action)}</div></td>
        <td><span class="cell-sub">${esc(l.target)}</span></td><td>${aSevBadge(l.sev)}</td></tr>`).join('')}
      </tbody></table></div>
    ${!list.length?emptyState('report','No log entries found','Adjust your search to see matching audit entries.',''):''}
  </div>`;
}

/* ---------------- System Settings ---------------- */
function adminSystem(){
  return `
  <div style="padding:20px;display:grid;gap:20px">
    <div class="card" style="box-shadow:none">
      <div class="card-h"><h3>Configuration</h3></div>
      <div class="card-b">
        <div class="switch-row"><div class="sw-text"><div class="sw-title">Maintenance mode</div><div class="sw-desc">Shows a notice to users while you apply updates. Scheduled maintenance: Sunday 2:00 AM.</div></div>
          <label class="switch"><input type="checkbox" aria-label="Maintenance mode"><span class="sl"></span></label></div>
        <div class="switch-row"><div class="sw-text"><div class="sw-title">Self-registration</div><div class="sw-desc">Allow new faculty accounts via institutional email verification.</div></div>
          <label class="switch"><input type="checkbox" checked aria-label="Self-registration"><span class="sl"></span></label></div>
        <div class="switch-row"><div class="sw-text"><div class="sw-title">Single sign-on (SSO)</div><div class="sw-desc">Federated sign-in with the university identity provider.</div></div>
          <label class="switch"><input type="checkbox" checked aria-label="SSO"><span class="sl"></span></label></div>
        <div class="switch-row"><div class="sw-text"><div class="sw-title">Automatic nightly backups</div><div class="sw-desc">Full backups at 1:00 AM with 30-day retention.</div></div>
          <label class="switch"><input type="checkbox" checked aria-label="Automatic backups"><span class="sl"></span></label></div>
      </div>
    </div>
    <div class="card" style="box-shadow:none">
      <div class="card-h"><h3>Danger Zone</h3></div>
      <div class="card-b">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <div style="flex:1;min-width:220px"><div class="cell-main">Reset demonstration data</div>
            <div class="cell-sub">Restores all students, results and settings to the original demo state. This cannot be undone.</div></div>
          <button class="btn btn-danger" onclick="confirmDialog({title:'Reset all demo data?',message:'Every student record, result, attendance entry and configuration change will be restored to the original demonstration state. This action cannot be undone.',confirmText:'Reset data',onConfirm:()=>{location.hash='#/admin';location.reload();}})" style="flex:none">${icon('alert-triangle',14)}Reset demo data</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------- Dispatcher ---------------- */
function adminContent(tab){
  return tab==='Overview'?adminOverview()
    :tab==='Users & Access'?adminUsers()
    :tab==='Roles & Permissions'?adminRoles()
    :tab==='Departments'?adminDepts()
    :tab==='Programs & Courses'?adminPrograms()
    :tab==='Academic Sessions'?adminSessions()
    :tab==='Enrollments'?adminEnroll()
    :tab==='Announcements'?adminAnnounce()
    :tab==='Audit Log'?adminAudit()
    :adminSystem();
}