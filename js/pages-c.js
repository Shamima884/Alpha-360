
/* ============================================================
   Pages C — Alerts · Reports · Wellbeing · Notifications · Settings
   ============================================================ */
'use strict';

/* ---------------- Early Warning Center (Alerts) ---------------- */
Pages.alerts=()=>{
  const tab=App.alertsTab;
  const tabs=['All','Attendance','Academic','Assignment','Review Required'];
  const list=DATA.alerts.filter(a=>{
    if(tab==='All')return true;
    if(tab==='Review Required')return a.status==='Review Required';
    return a.cat===tab;
  });
  after(()=>{
    $$('#alertTabs .tab').forEach(b=>b.onclick=()=>{App.alertsTab=b.dataset.tab;renderRoute(true);});
  });
  const sevBadge=s=>s==='Critical'||s==='High'?badge('danger',s):s==='Moderate'?badge('warn',s):badge('info',s);
  const stBadge=st=>st==='Open'?badge('info','Open'):st==='Resolved'?badge('success','Resolved')
    :st==='Escalated'?badge('danger','Escalated'):badge('warn','Review Required');
  return `
  ${pageHead('Early Warning Center','Automated alerts help you intervene before small issues become big ones.',
    `<button class="btn btn-ghost" onclick="toast('Alert rules opened in Settings → Risk Rules','info')">${icon('gear',15)}Configure Rules</button>`)}
  <div class="card">
    <div class="tabs" id="alertTabs" style="padding:0 16px" role="tablist" aria-label="Alert categories">
      ${tabs.map(t=>{const c=t==='All'?DATA.alerts.length:t==='Review Required'
        ?DATA.alerts.filter(a=>a.status==='Review Required').length
        :DATA.alerts.filter(a=>a.cat===t).length;
        return `<button class="tab ${tab===t?'on':''}" data-tab="${t}" role="tab" aria-selected="${tab===t}">${t}<span class="cnt">${c}</span></button>`;}).join('')}
    </div>
    ${list.length?list.map(a=>`
      <div class="notif-row">
        <div style="display:flex;align-items:flex-start;min-width:86px">${sevBadge(a.sev)}</div>
        ${avatar(a.student,38)}
        <div class="n-body">
          <div class="n-title">${esc(a.student)} <span class="cell-sub">${a.sid} · ${a.cat}</span></div>
          <div class="n-desc">${esc(a.msg)}</div>
          <div class="n-time">${icon('clock',12)} ${esc(a.time)}</div></div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end">
          ${stBadge(a.status)}
          <button class="btn btn-soft btn-sm" onclick="toast('Review opened for ${esc(a.student)} (demo)','info')">${icon('eye',14)}Review</button>
          ${a.status!=='Resolved'?`<button class="btn btn-ghost btn-sm" onclick="this.closest('.notif-row').style.opacity=.45;toast('Alert resolved','success')">Resolve</button>`:''}
        </div>
      </div>`).join('')
    :`<div class="tbl-wrap">${emptyState('check','No alerts in this category','You are all caught up — no alerts match this filter.',
      `<button class="btn btn-soft" onclick="App.alertsTab='All';renderRoute(true)">View all alerts</button>`)}</div>`}
  </div>`;
};

/* ---------------- Reports ---------------- */
Pages.reports=()=>{
  return `
  ${pageHead('Reports','Generate institutional reports with your chosen scope and format.',
    `<div class="seg" role="group" aria-label="Default export format">
      <button class="on" onclick="toast('PDF selected as default format','info')">PDF</button>
      <button onclick="toast('Excel selected as default format','info')">Excel</button>
      <button onclick="toast('CSV selected as default format','info')">CSV</button></div>`)}
  <div class="card" style="margin-bottom:20px">
    <div class="card-h"><span class="icon-tile t-primary">${icon('calendar',18)}</span>
      <div><h3>Report Scope</h3><span class="ch-sub">Applies to every generated report</span></div></div>
    <div class="filter-bar" style="border-bottom:0">
      <span class="filter-lbl">Date range</span>
      <input type="date" class="input" style="width:auto" value="2026-01-05" aria-label="Start date">
      <span style="color:var(--text-3)">→</span>
      <input type="date" class="input" style="width:auto" value="2026-03-09" aria-label="End date">
      <span class="filter-lbl">Department</span>
      <select class="select" style="width:auto"><option>All departments</option>${Object.values(DATA.depts).map(d=>`<option>${esc(d)}</option>`).join('')}</select>
      <span class="filter-lbl">Batch</span>
      <select class="select" style="width:auto"><option>All batches</option><option>2024</option><option>2023</option><option>2022</option></select>
      <span class="filter-lbl">Semester</span>
      <select class="select" style="width:auto"><option>All semesters</option>${[1,2,3,4,5,6,7,8].map(n=>`<option>Semester ${n}</option>`).join('')}</select>
    </div>
  </div>
  <div class="grid cols-3">
    ${DATA.reports.map(r=>`
      <div class="card card-hov" style="padding:20px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="icon-tile ${r.tile}">${icon(r.icon,19)}</span><h3>${esc(r.name)}</h3></div>
        <p style="font-size:12.5px;color:var(--text-2);flex:1">${esc(r.desc)}</p>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" style="flex:1" onclick="toast('${esc(r.name)} (PDF) queued — you will be notified when ready','info')">${icon('file-text',14)}Generate</button>
          <button class="btn btn-ghost btn-sm" data-tip="Export as Excel" aria-label="Export as Excel" onclick="toast('${esc(r.name)} (Excel) queued','info')">${icon('download',14)}</button>
          <button class="btn btn-ghost btn-sm" data-tip="Export as CSV" aria-label="Export as CSV" onclick="toast('${esc(r.name)} (CSV) queued','info')">${icon('download',14)}</button></div>
      </div>`).join('')}
  </div>
  <div class="card" style="margin-top:20px">
    <div class="card-h"><h2>Recently Generated</h2><span class="ch-sub">Last 30 days</span></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:560px">
      <thead><tr><th>Report</th><th>Generated by</th><th>Date</th><th>Format</th><th></th></tr></thead>
      <tbody>${DATA.recentReports.map(r=>`
        <tr><td><div class="cell-main">${esc(r.name)}</div></td><td><span class="cell-sub">${esc(r.by)}</span></td>
          <td><span class="cell-sub">${r.date}</span></td>
          <td>${badge(r.fmt==='PDF'?'danger':'success',r.fmt,{dot:false})}</td>
          <td class="act-cell"><button class="btn btn-ghost btn-sm" onclick="toast('Download started (demo)','info')">${icon('download',13)}Download</button></td>
        </tr>`).join('')}</tbody></table></div>
  </div>`;
};

/* ---------------- Wellbeing & Support ---------------- */
Pages.wellbeing=()=>{
  const flagged=DATA.students.filter(s=>s.risk!=='Low');
  return `
  ${pageHead('Student Wellbeing & Support','A neutral, support-first view of student engagement and follow-ups.',
    `<button class="btn btn-ghost" onclick="toast('Support handbook opened (demo)','info')">${icon('book',15)}Support Handbook</button>`)}
  <div class="well-banner">${icon('info',17)}<span><b>How to read this page.</b> Indicators here describe <b>academic engagement and workload signals only</b>. They are written in neutral language, never imply medical or psychological diagnoses, and sensitive notes carry restricted access. For health concerns, always refer to the counseling office.</span></div>
  <div class="grid cols-4" style="margin-bottom:20px">
    ${[['Engagement Index','78%','cohort average this month','var(--success)'],
       ['Academic Stress Indicator','9 students','elevated — workload signals','var(--warn)'],
       ['Support Status','14 active plans','advisor-led check-ins','var(--info)'],
       ['Follow-ups Required','5 this week','scheduled conversations','var(--text)']].map(([l,v,d,c])=>`
      <div class="card gauge-card"><div class="gauge-val" style="font-size:20px;color:${c}">${v}</div>
        <div class="gauge-lab">${l}</div><div class="cell-sub" style="margin-top:4px">${d}</div></div>`).join('')}
  </div>
  <div class="grid-12">
    <div class="card c7">
      <div class="card-h"><span class="icon-tile t-warn">${icon('heart',18)}</span>
        <div><h2>Faculty Concerns</h2><span class="ch-sub">Neutral observations awaiting follow-up</span></div></div>
      <div class="card-b" style="display:grid;gap:12px">
        ${flagged.slice(0,4).map(s=>`
          <div style="border:1px solid var(--border);border-radius:12px;padding:14px 16px">
            <div style="display:flex;align-items:center;gap:11px;margin-bottom:8px">
              ${avatar(s.name,34)}
              <div style="flex:1"><div class="cell-main">${esc(s.name)}</div><div class="cell-sub">${s.id} · ${esc(DATA.depts[s.dept])}</div></div>
              <span class="restricted">${icon('lock',12)}Restricted Access</span></div>
            <p style="font-size:13px;color:var(--text-2)">“Student appears less engaged than usual in recent sessions. A brief follow-up conversation is recommended to understand workload and any course-related difficulties.”</p>
            <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
              <a class="btn btn-soft btn-sm" href="#/profile/${s.id}">${icon('eye',13)}View Profile</a>
              <button class="btn btn-ghost btn-sm" onclick="toast('Follow-up scheduled (demo)','success')">${icon('calendar',13)}Schedule Follow-up</button></div>
          </div>`).join('')}
      </div>
    </div>
    <div class="card c5">
      <div class="card-h"><span class="icon-tile t-info">${icon('target',18)}</span>
        <div><h2>Support Directory</h2><span class="ch-sub">Refer with one click</span></div></div>
      <div class="card-b" style="padding-top:6px">
        ${[['Academic Advising','Course planning and probation support','Dr. L. Fernandes'],
           ['Counseling Office','Personal and stress-related support','Ms. J. Osei'],
           ['Writing & Math Center','Subject tutoring and workshops','Mr. P. Andrade'],
           ['Accessibility Services','Accommodations and equity support','Dr. K. Yamada']].map(([t,d,p])=>`
          <div class="set-item"><span class="icon-tile t-primary">${icon('user',16)}</span>
            <div class="si-main"><div class="si-title">${t}</div><div class="si-desc">${d} · ${p}</div></div>
            <button class="btn btn-soft btn-sm" onclick="toast('Referral sent to ${t} (demo)','success')">Refer</button></div>`).join('')}
        <div class="risk-note" style="margin-top:14px">${icon('shield',15)}<span>Referrals are confidential. You will be notified when a support office accepts a referral — never about its contents.</span></div>
      </div>
    </div>
  </div>`;
};

/* ---------------- Notifications ---------------- */
Pages.notifications=()=>{
  const tab=App.notifTab;
  const cats=['All','Academic','Attendance','Assignments','System','Student Support'];
  const list=DATA.notifications.filter(n=>tab==='All'||n.cat===tab);
  const unread=DATA.notifications.filter(n=>n.unread).length;
  after(()=>{
    $$('#notifTabs .tab').forEach(b=>b.onclick=()=>{App.notifTab=b.dataset.tab;renderRoute(true);});
    $$('.notif-row[data-nid]').forEach(row=>row.onclick=()=>{
      const item=DATA.notifications.find(x=>String(x.id)===row.dataset.nid);
      if(item&&item.unread){item.unread=false;toast('Marked as read','info');renderRoute(true);}
    });
  });
  const catKind=c=>c==='Academic'?'t-primary':c==='Attendance'?'t-success':c==='Assignments'?'t-warn'
    :c==='System'?'t-info':'t-accent';
  return `
  ${pageHead('Notification Center','Everything that needs your attention, in one stream.',
    `<button class="btn btn-ghost" onclick="markAllRead()" ${unread?'':'disabled'}>${icon('check',15)}Mark all as read</button>`)}
  <div class="card">
    <div class="tabs" id="notifTabs" style="padding:0 16px" role="tablist" aria-label="Notification categories">
      ${cats.map(c=>{const n=c==='All'?DATA.notifications.length:DATA.notifications.filter(x=>x.cat===c).length;
        return `<button class="tab ${tab===c?'on':''}" data-tab="${c}" role="tab" aria-selected="${tab===c}">${c}<span class="cnt">${n}</span></button>`;}).join('')}
    </div>
    ${list.length?list.map(n=>`
      <div class="notif-row ${n.unread?'unread':''}" data-nid="${n.id}" role="button" tabindex="0" style="cursor:pointer">
        <span class="icon-tile ${catKind(n.cat)}">${icon(n.icon,17)}</span>
        <div class="n-body">
          <div class="n-title">${esc(n.title)} <span class="chip">${esc(n.cat)}</span></div>
          <div class="n-desc">${esc(n.desc)}</div>
          <div class="n-time">${esc(n.time)}</div></div>
        ${n.unread?'<span class="unread-dot" title="Unread"></span>':''}
      </div>`).join('')
    :`<div class="tbl-wrap">${emptyState('bell','No notifications','Nothing new in this category right now.','')}</div>`}
  </div>`;
};
function markAllRead(){DATA.notifications.forEach(n=>n.unread=false);toast('All notifications marked as read');renderRoute(true);}

/* ---------------- Settings ---------------- */
const SET_SECTIONS=['Institution','Users','Roles & Permissions','Departments','Programs','Courses',
  'Academic Sessions','Grading System','Attendance Rules','Risk Rules','Notifications','Security'];
Pages.settings=()=>{
  const sec=App.setSection;
  after(()=>{
    $$('#setNav .nav-item').forEach(b=>b.onclick=()=>{App.setSection=b.dataset.sec;renderRoute(true);});
  });
  let panel='';
  if(sec==='Institution'){
    panel=`<div class="form-row">
      <div class="field"><label>Institution name</label><input class="input" value="Meridian University"></div>
      <div class="field"><label>Portal name</label><input class="input" value="Faculty Portal"></div></div>
    <div class="form-row">
      <div class="field"><label>Brand color</label><input class="input" type="color" value="#1d4ed8" style="height:38px;padding:4px"></div>
      <div class="field"><label>Timezone</label><select class="select"><option>UTC−05:00 · Eastern Time</option><option>UTC+00:00 · London</option><option>UTC+06:00 · Dhaka</option></select></div></div>
    <div class="field"><label>Default landing page for faculty</label>
      <select class="select"><option>Dashboard</option><option>My schedule</option><option>Attendance</option></select></div>
    <button class="btn btn-primary" onclick="toast('Institution settings saved','success')">${icon('check',14)}Save Changes</button>`;
  }
  else if(sec==='Users'){
    panel=`<div style="display:flex;margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="toast('User invitation form opened (demo)','info')">${icon('plus',13)}Invite User</button></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:560px">
      <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td><div style="display:flex;gap:10px;align-items:center">${avatar('Sarah Mitchell',30)}<span class="cell-main">Dr. Sarah Mitchell</span></div></td><td>Professor</td><td>CSE</td><td>${badge('success','Active')}</td></tr>
        <tr><td><div style="display:flex;gap:10px;align-items:center">${avatar('Ahmed Karim',30)}<span class="cell-main">Prof. Ahmed Karim</span></div></td><td>Professor</td><td>CSE</td><td>${badge('success','Active')}</td></tr>
        <tr><td><div style="display:flex;gap:10px;align-items:center">${avatar('Rosa Whitfield',30)}<span class="cell-main">Ms. Rosa Whitfield</span></div></td><td>Lecturer</td><td>ENG</td><td>${badge('success','Active')}</td></tr>
        <tr><td><div style="display:flex;gap:10px;align-items:center">${avatar('David Chu',30)}<span class="cell-main">Mr. David Chu</span></div></td><td>Advisor</td><td>Registrar</td><td>${badge('warn','Invited')}</td></tr>
      </tbody></table></div>`;
  }
  else if(sec==='Roles & Permissions'){
    const perms=['View students','Edit grades','Mark attendance','Generate reports','Manage users'];
    const roles=['Professor','Lecturer','Advisor','Admin'];
    const matrix=[[1,1,1,1],[1,0,1,1],[0,0,1,1],[1,1,1,1],[0,0,0,1]];
    panel=`<div class="tbl-wrap"><table class="matrix"><thead><tr><th>Permission</th>${roles.map(r=>`<th>${r}</th>`).join('')}</tr></thead>
      <tbody>${perms.map((p,i)=>`<tr><td>${p}</td>${matrix[i].map((v,j)=>`<td><input type="checkbox" class="chk" ${v?'checked':''} aria-label="${p} for ${roles[j]}"></td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="risk-note" style="margin-top:14px">${icon('shield',15)}<span>Role changes take effect at next sign-in and are recorded in the audit trail.</span></div>`;
  }
  else if(sec==='Departments'||sec==='Programs'){
    const items=sec==='Departments'?Object.entries(DATA.depts):Object.entries(DATA.programs);
    panel=`<div style="display:flex;margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="toast('${sec} creation form opened (demo)','info')">${icon('plus',13)}Add ${sec==='Departments'?'Department':'Program'}</button></div>
      ${items.map(([k,v])=>`<div class="set-item"><span class="icon-tile t-primary">${icon(sec==='Departments'?'building':'book',16)}</span>
        <div class="si-main"><div class="si-title">${esc(v)}</div><div class="si-desc">Code: ${k}</div></div>
        <button class="icon-btn" aria-label="Edit" onclick="toast('Editor opened (demo)','info')">${icon('edit',15)}</button></div>`).join('')}`;
  }
  else if(sec==='Courses'){
    panel=`<div class="tbl-wrap"><table class="tbl" style="min-width:620px">
      <thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Instructor</th><th></th></tr></thead>
      <tbody>${DATA.courses.map(c=>`<tr><td class="num">${c.code}</td><td><div class="cell-main">${esc(c.name)}</div></td>
        <td class="num">${c.credits}</td><td><span class="cell-sub">${esc(c.instructor)}</span></td>
        <td class="act-cell"><button class="icon-btn" style="width:30px;height:30px" aria-label="Edit course" onclick="toast('Course editor opened (demo)','info')">${icon('edit',14)}</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  else if(sec==='Academic Sessions'){
    panel=`<div class="grid cols-2" style="margin-bottom:16px">
      ${[['Fall 2025','Aug 25 – Dec 19, 2025','active'],['Spring 2026','Jan 12 – May 8, 2026','active'],['Summer 2026','Jun 1 – Jul 24, 2026','upcoming']].map(([t,d,s])=>`
        <div class="card" style="padding:18px"><div style="display:flex;align-items:center;gap:10px">
          <span class="icon-tile ${s==='active'?'t-success':'t-info'}">${icon('calendar',17)}</span>
          <div style="flex:1"><div class="cell-main">${t}</div><div class="cell-sub">${d}</div></div>
          ${badge(s==='active'?'success':'info',s==='active'?'Active':'Upcoming')}</div></div>`).join('')}
    </div>
    <div class="switch-row"><div class="sw-text"><div class="sw-title">Auto-roll students forward</div>
      <div class="sw-desc">Advance all eligible students when a session closes.</div></div>
      <label class="switch"><input type="checkbox" checked aria-label="Auto-roll students"><span class="sl"></span></label></div>`;
  }
  else if(sec==='Grading System'){
    const scale=[['A','93 – 100','4.00'],['A-','90 – 92','3.70'],['B+','87 – 89','3.30'],['B','83 – 86','3.00'],
      ['B-','80 – 82','2.70'],['C+','77 – 79','2.30'],['C','73 – 76','2.00'],['C-','70 – 72','1.70'],
      ['D','60 – 66','1.00'],['F','0 – 59','0.00']];
    panel=`<div class="risk-note" style="margin-bottom:14px">${icon('info',15)}<span>This scale drives automatic GPA calculations in result entry and analytics.</span></div>
      ${scale.map(([g,r,p])=>`<div class="grade-row"><span class="grade-badge" style="background:${g==='F'?'var(--danger-soft);color:var(--danger)':g[0]==='A'?'var(--success-soft);color:var(--success)':'var(--primary-soft);color:var(--primary)'}">${g}</span>
        <span class="cell-sub">Marks ${r}</span><span class="num">GPA ${p}</span><span></span></div>`).join('')}`;
  }
  else if(sec==='Attendance Rules'){
    panel=`<div class="form-row">
      <div class="field"><label>Required attendance threshold</label><input class="input" value="75%"><span class="hint">Students below this value are flagged for review.</span></div>
      <div class="field"><label>Late arrival grace period</label><input class="input" value="10 minutes"></div></div>
    <div class="form-row">
      <div class="field"><label>Excused absence categories</label><input class="input" value="Medical, Official duty, Family emergency"></div>
      <div class="field"><label>Early-warning line</label><input class="input" value="70%"><span class="hint">Below this, an alert is raised immediately.</span></div></div>
    <div class="switch-row"><div class="sw-text"><div class="sw-title">Notify students automatically</div>
      <div class="sw-desc">Send a portal notification when a student crosses the threshold.</div></div>
      <label class="switch"><input type="checkbox" checked aria-label="Notify students"><span class="sl"></span></label></div>
    <div class="switch-row"><div class="sw-text"><div class="sw-title">Weekly digest to advisors</div>
      <div class="sw-desc">Summary of attendance changes every Monday morning.</div></div>
      <label class="switch"><input type="checkbox" aria-label="Weekly digest"><span class="sl"></span></label></div>`;
  }
  else if(sec==='Risk Rules'){
    panel=`<div class="risk-note" style="margin-bottom:14px">${icon('info',15)}<span>These rules power the early-warning engine. Risk levels are analytical signals for support — never disciplinary records.</span></div>
    ${[['High risk — attendance below 70%',true],['High risk — CGPA below 2.50',true],
       ['High risk — 2 or more failed courses',true],['Critical — attendance below 60% and CGPA below 2.30',true],
       ['Moderate risk — attendance below 80%',false],['Moderate risk — late assignment streak (3+)',true]].map(([t,on])=>`
      <div class="switch-row"><div class="sw-text"><div class="sw-title">${t}</div><div class="sw-desc">Applied nightly to all active students.</div></div>
        <label class="switch"><input type="checkbox" ${on?'checked':''} aria-label="${t}"><span class="sl"></span></label></div>`).join('')}`;
  }
  else if(sec==='Notifications'){
    panel=`${[['Exam & result alerts','Publish, approve and grade-deadline events',true],
      ['Attendance warnings','When your students cross thresholds',true],
      ['Assignment activity','Submissions, lateness and missing work',false],
      ['Student support updates','Referrals and follow-up reminders',true],
      ['System announcements','Maintenance and release notes',true]].map(([t,d,on])=>`
      <div class="switch-row"><div class="sw-text"><div class="sw-title">${t}</div><div class="sw-desc">${d}</div></div>
        <label class="switch"><input type="checkbox" ${on?'checked':''} aria-label="${t}"><span class="sl"></span></label></div>`).join('')}
    <div class="switch-row"><div class="sw-text"><div class="sw-title">Email me a daily summary</div>
      <div class="sw-desc">A single digest email at 7:00 AM instead of individual emails.</div></div>
      <label class="switch"><input type="checkbox" checked aria-label="Daily summary"><span class="sl"></span></label></div>`;
  }
  else if(sec==='Security'){
    panel=`<div class="switch-row"><div class="sw-text"><div class="sw-title">Two-factor authentication</div>
      <div class="sw-desc">Require an authenticator code at every sign-in.</div></div>
      <label class="switch"><input type="checkbox" checked aria-label="Two-factor authentication"><span class="sl"></span></label></div>
    <div class="switch-row"><div class="sw-text"><div class="sw-title">Sign-in alerts</div>
      <div class="sw-desc">Email me when a sign-in occurs from a new device.</div></div>
      <label class="switch"><input type="checkbox" checked aria-label="Sign-in alerts"><span class="sl"></span></label></div>
    <div class="switch-row"><div class="sw-text"><div class="sw-title">Auto sign-out</div>
      <div class="sw-desc">End inactive sessions after 30 minutes on shared machines.</div></div>
      <label class="switch"><input type="checkbox" aria-label="Auto sign-out"><span class="sl"></span></label></div>
    <h3 style="margin:18px 0 8px">Active sessions</h3>
    <div class="tbl-wrap"><table class="tbl" style="min-width:520px">
      <thead><tr><th>Device</th><th>Location</th><th>Last active</th><th></th></tr></thead>
      <tbody>
        <tr><td><div class="cell-main">Chrome · Windows</div><div class="cell-sub">This device</div></td><td>Campus, Building C</td><td><span class="cell-sub">Now</span></td><td>${badge('success','Current',{dot:false})}</td></tr>
        <tr><td><div class="cell-main">Safari · iPad</div></td><td>Home office</td><td><span class="cell-sub">Yesterday, 9:12 PM</span></td>
          <td class="act-cell"><button class="btn btn-danger-soft btn-sm" onclick="confirmDialog({title:'Sign out this session?',message:'The iPad session will be signed out immediately. Any unsaved drafts on that device will be lost.',confirmText:'Sign out',onConfirm:()=>toast('Session revoked (demo)','warn')})">Revoke</button></td></tr>
      </tbody></table></div>`;
  }
  return `
  ${pageHead('Settings','Configure the platform for your institution and role.')}
  <div class="settings-grid">
    <div class="card set-nav" id="setNav" style="padding:8px" aria-label="Settings sections">
      <div class="side-label">Organization</div>
      ${SET_SECTIONS.slice(0,7).map(s=>`<button class="nav-item ${sec===s?'active':''}" data-sec="${s}">${icon('gear',15)}<span>${s}</span></button>`).join('')}
      <div class="side-label">Policies</div>
      ${SET_SECTIONS.slice(7).map(s=>`<button class="nav-item ${sec===s?'active':''}" data-sec="${s}">${icon('shield',15)}<span>${s}</span></button>`).join('')}
    </div>
    <div class="card"><div class="card-h"><h2>${esc(sec)}</h2>
      <div class="right"><span class="cell-sub">Changes save per-section</span></div></div>
      <div class="card-b">${panel||emptyState('gear','Nothing to configure','This section has no configurable options yet.','')}</div></div>
  </div>`;
};

/* ---------------- Boot ---------------- */
window.addEventListener('DOMContentLoaded',async()=>{
  await API.init();             /* connects to Node/Excel backend when enabled */
  DATA.applyAdminData();        /* admin-managed students & courses */
  renderShell();
  wireDropdowns();
  renderRoute(false);
  /* Live cross-tab sync: edits saved in the Admin Panel (admin.html or the
     Google Sheets backend) appear instantly here, so admin changes are
     always focused. In API mode the snapshot is re-pulled to refresh the
     in-memory cache before re-rendering. */
  window.addEventListener('storage',e=>{
    if(!e.key||!String(e.key).startsWith('mu_admin_'))return;
    (async()=>{
      if(typeof API!=='undefined'&&API.enabled) await API.init();
      DATA.applyAdminData();
      renderRoute(true);
      const h=DATA.focusHint();
      if(h)toast(`Admin change · ${h.label}`,'info');
    })();
  });
});
