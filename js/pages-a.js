/* ============================================================
   Pages A — Dashboard · Student Directory · 360° Profile
   ============================================================ */
'use strict';

window.Pages={};

function reasonsFor(s){
  const r=[];
  if(s.att<70)r.push('Low attendance');
  if(s.failed>0)r.push(`${s.failed} failed course${s.failed>1?'s':''}`);
  if(s.gpaTrend.length>1&&s.gpaTrend[s.gpaTrend.length-1]<s.gpaTrend[0])r.push('Declining GPA');
  if(s.cgpa<2.5)r.push('GPA below 2.5');
  if(s.att<75&&s.att>=70)r.push('Below 75% threshold');
  return r.slice(0,3);
}

/* ---------------- Dashboard ---------------- */
Pages.dashboard=()=>{
  after(()=>{
    $$('#perfSeg button').forEach(b=>b.onclick=()=>{
      App.perfMode=b.dataset.mode;renderRoute(true);});
    $$('.ch-click').forEach(el=>el.onclick=()=>{
      const map={'Low Risk':'Low','Moderate Risk':'Moderate','High Risk':'High','Critical':'Critical'};
      App.studentFilters.risk=map[el.dataset.label]||'';
      App.studentFilters.page=1;
      location.hash='#/students';
    });
    const sel=$('#dashRange');
    if(sel)sel.onchange=()=>toast(`Period set to “${sel.value}” — metrics updated`,'info');
  });
  const attention=DATA.students.filter(s=>s.risk==='High'||s.risk==='Critical').slice(0,6);
  const performers=[...DATA.students].sort((a,b)=>b.cgpa-a.cgpa).slice(0,5);
  const sem=DATA.semester;
  const modeData={
    gpa:{label:'Average GPA',vals:sem.gpa,suf:'',color:cssVar('--primary')},
    attendance:{label:'Attendance %',vals:sem.attendance,suf:'%',color:cssVar('--success')},
    pass:{label:'Pass rate %',vals:sem.pass,suf:'%',color:cssVar('--accent')}
  }[App.perfMode];

  const focus=DATA.focusHint();
  const focusCard=focus?`
  <div class="focus-banner" role="status" style="margin-bottom:18px">
    <span class="icon-tile t-success" style="width:34px;height:34px">${icon('check',17)}</span>
    <div class="fb-text"><span class="fb-label">Latest admin change · ${esc(focus.label)}</span>
      <span class="fb-detail">${esc(focus.detail||'')} · saved ${esc(focus.at)}</span></div>
    <button class="fb-x" aria-label="Dismiss" onclick="DATA.clearA('last_focus');this.closest('.focus-banner').remove()">${icon('x',15)}</button>
  </div>`:'';
  const top=`
  ${pageHead('Good morning, Professor','Here\u2019s what\u2019s happening with your students today.',
    `<select id="dashRange" class="select" style="width:auto" aria-label="Date range">
      <option>This week</option><option selected>This month</option><option>This semester</option><option>Academic year</option></select>
     <button class="btn btn-ghost" onclick="toast('Dashboard snapshot exported as PDF','info')">${icon('download',15)}Export</button>`)}
  ${focusCard}
  <div class="grid cols-6" style="margin-bottom:20px">${DATA.kpis.map(kpiCard).join('')}</div>
  <div class="grid-12">
    <div class="card c8">
      <div class="card-h"><span class="icon-tile t-danger">${icon('alert-triangle',18)}</span>
        <div><h2>Students Requiring Attention</h2><span class="ch-sub">Flagged by early-warning rules · ${attention.length} shown</span></div>
        <div class="right"><a class="btn-link btn-sm" href="#/students" onclick="App.studentFilters.risk='High';App.studentFilters.page=1">View all</a></div></div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:760px">
        <thead><tr><th>Student</th><th>Department</th><th>Attendance</th><th>CGPA</th><th>Risk</th><th>Reasons</th><th></th></tr></thead>
        <tbody>${attention.map(s=>`
          <tr class="tr-click" onclick="location.hash='#/profile/${s.id}'">
            <td><div style="display:flex;align-items:center;gap:11px">${avatar(s.name,34)}
              <div><div class="cell-main">${esc(s.name)}</div><div class="cell-sub">${s.id}</div></div></div></td>
            <td><span class="cell-sub">${esc(DATA.depts[s.dept])}</span></td>
            <td>${prog(s.att)}</td>
            <td class="num" style="color:${s.cgpa<2.5?'var(--danger)':'inherit'}">${s.cgpa.toFixed(2)}</td>
            <td>${riskBadge(s.risk)}</td>
            <td><div style="display:flex;gap:4px;flex-wrap:wrap;max-width:190px">${reasonsFor(s).map(r=>`<span class="chip">${esc(r)}</span>`).join('')}</div></td>
            <td class="act-cell"><button class="btn btn-soft btn-sm" onclick="event.stopPropagation();location.hash='#/profile/${s.id}'">View Profile</button></td>
          </tr>`).join('')}</tbody></table></div>
    </div>
    <div class="card c4">
      <div class="card-h"><span class="icon-tile t-primary">${icon('clock',18)}</span><h2>Recent Activity</h2></div>
      <div class="card-b"><div class="timeline">${DATA.activity.map(a=>`
        <div class="tl-item ${a.tone}"><div class="tl-time">${esc(a.time)}</div>
          <div class="tl-title">${esc(a.title)}</div><div class="tl-desc">${esc(a.desc)}</div></div>`).join('')}</div></div>
    </div>`;
  const bottom=`
    <div class="card c8">
      <div class="card-h"><span class="icon-tile t-accent">${icon('chart',18)}</span>
        <div><h2>Academic Performance</h2><span class="ch-sub">Cohort average across ${sem.labels.length} semesters</span></div>
        <div class="right"><div class="seg" id="perfSeg" role="tablist" aria-label="Metric">
          <button data-mode="gpa" class="${App.perfMode==='gpa'?'on':''}">GPA</button>
          <button data-mode="attendance" class="${App.perfMode==='attendance'?'on':''}">Attendance</button>
          <button data-mode="pass" class="${App.perfMode==='pass'?'on':''}">Pass Rate</button></div></div></div>
      <div class="card-b">${Chart.line({labels:sem.labels,
        series:[{name:modeData.label,values:modeData.vals,color:modeData.color}],suffix:modeData.suf,height:270})}</div>
    </div>
    <div class="card c4">
      <div class="card-h"><span class="icon-tile t-success">${icon('check',18)}</span><h2>Attendance Overview</h2></div>
      <div class="card-b" style="text-align:center">
        ${Chart.donut({segments:DATA.attendanceMix,size:172,thickness:22,
          center:{value:'82.4%',label:'Average'}})}
        ${Chart.legend(DATA.attendanceMix.map(m=>({...m,value:m.value+'%'})))}
        <div style="display:flex;gap:10px;margin-top:18px;text-align:left">
          <div class="stat-chip" style="flex:1"><span class="sc-val">82.4%</span><span class="sc-lab"><i class="sc-dot" style="background:var(--success)"></i>Average attendance</span></div>
          <div class="stat-chip" style="flex:1"><span class="sc-val" style="color:var(--danger)">23</span><span class="sc-lab"><i class="sc-dot" style="background:var(--danger)"></i>Below threshold</span></div></div>
        <a class="btn btn-ghost btn-sm" style="margin-top:14px;width:100%" href="#/attendance">Open attendance workspace ${icon('chev-right',13)}</a>
      </div>
    </div>
    <div class="card c4">
      <div class="card-h"><span class="icon-tile t-warn">${icon('target',18)}</span>
        <div><h2>Student Risk Distribution</h2><span class="ch-sub">Click a segment to filter students</span></div></div>
      <div class="card-b" style="text-align:center">
        ${Chart.donut({segments:DATA.riskMix,size:172,thickness:22,clickable:true,
          center:{value:'248',label:'Students'}})}
        ${Chart.legend(DATA.riskMix)}
      </div>
    </div>
    <div class="card c4">
      <div class="card-h"><span class="icon-tile t-accent">${icon('award',18)}</span>
        <div><h2>Top Performers</h2><span class="ch-sub">Highest CGPA this semester</span></div></div>
      <div class="card-b" style="display:grid;gap:4px;padding:10px 12px">
        ${performers.map((s,i)=>`
          <div class="notif-row" style="cursor:pointer;border-radius:10px;border-bottom:1px solid var(--border)" onclick="location.hash='#/profile/${s.id}'">
            <span class="cell-sub num" style="width:18px">${i+1}</span>${avatar(s.name,34)}
            <div class="n-body"><div class="n-title">${esc(s.name)}</div><div class="n-desc">${s.id} · ${esc(DATA.depts[s.dept])}</div></div>
            <span class="badge b-primary">${s.cgpa.toFixed(2)}</span></div>`).join('')}
      </div>
    </div>
    <div class="card c4">
      <div class="card-h"><span class="icon-tile t-info">${icon('edit',18)}</span>
        <div><h2>Pending Reviews</h2><span class="ch-sub">7 items await your action</span></div></div>
      <div class="card-b" style="display:grid;gap:12px">
        ${[['Final results — CSE101','55 grades to approve','9:42 AM'],
           ['Midterm results — EEE201','44 grades to publish','Feb 20'],
           ['Observation approvals','2 observations pending','Yesterday']].map(r=>`
          <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--border);border-radius:12px">
            <div style="flex:1;min-width:0"><div class="cell-main" style="font-size:13px">${esc(r[0])}</div>
              <div class="cell-sub">${esc(r[1])} · ${esc(r[2])}</div></div>
            <button class="btn btn-soft btn-sm" onclick="toast('Review queue opened (demo)','info')">Review</button></div>`).join('')}
      </div>
    </div>
  </div>`;
  return top+bottom;
};

/* ---------------- Student Directory ---------------- */
const PAGE_SIZE=8;
function filteredStudents(){
  const f=App.studentFilters;
  let list=DATA.students.filter(s=>{
    if(f.q){const q=f.q.toLowerCase();
      if(!(s.name.toLowerCase().includes(q)||s.id.toLowerCase().includes(q)||s.email.toLowerCase().includes(q)))return false;}
    if(f.dept&&s.dept!==f.dept)return false;
    if(f.risk&&s.risk!==f.risk)return false;
    if(f.batch&&String(s.batch)!==f.batch)return false;
    if(f.sem&&String(s.sem)!==f.sem)return false;
    if(f.att==='lt70'&&s.att>=70)return false;
    if(f.att==='lt75'&&s.att>=75)return false;
    if(f.att==='lt80'&&s.att>=80)return false;
    if(f.cgpa==='lt25'&&s.cgpa>=2.5)return false;
    if(f.cgpa==='lt30'&&s.cgpa>=3.0)return false;
    if(f.cgpa==='gt35'&&s.cgpa<=3.5)return false;
    return true;
  });
  const {key,dir}=f.sort;
  list.sort((a,b)=>{
    const va=key==='name'?a.name:key==='risk'?['Low','Moderate','High','Critical'].indexOf(a.risk):a[key];
    const vb=key==='name'?b.name:key==='risk'?['Low','Moderate','High','Critical'].indexOf(b.risk):b[key];
    return (va>vb?1:va<vb?-1:0)*dir;
  });
  return list;
}
function setF(k,v){App.studentFilters[k]=v;App.studentFilters.page=1;renderRoute(true);}
function sortStudents(k){
  const f=App.studentFilters;
  f.sort=f.sort.key===k?{key:k,dir:-f.sort.dir}:{key:k,dir:1};
  renderRoute(true);
}
function addStudentModal(step=1){
  const depts=Object.entries(DATA.depts).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('');
  const body1=`
    <div class="form-row">
      <div class="field"><label>Full name <span class="req">*</span></label>
        <input id="nsName" class="input" placeholder="e.g. Amina Yusuf"></div>
      <div class="field"><label>Student ID <span class="req">*</span></label>
        <input id="nsId" class="input" placeholder="STU-10400"></div></div>
    <div class="field"><label>Email</label><input id="nsMail" class="input" type="email" placeholder="name@meridian.edu">
      <span class="hint">Institution email is used for portal notifications.</span></div>
    <div class="field"><label>Department <span class="req">*</span></label>
      <select id="nsDept" class="select">${depts}</select></div>`;
  const body2=`
    <div class="form-row">
      <div class="field"><label>Program</label>
        <select class="select"><option>B.Sc. Computer Science</option><option>B.Sc. Electrical Engineering</option>
        <option>BBA</option><option>B.Sc. Civil Engineering</option><option>B.A. English Literature</option></select></div>
      <div class="field"><label>Batch</label><select class="select"><option>2026</option><option selected>2024</option><option>2023</option><option>2022</option></select></div></div>
    <div class="form-row">
      <div class="field"><label>Semester</label><select class="select">${[1,2,3,4,5,6,7,8].map(n=>`<option ${n===5?'selected':''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>Section</label><select class="select"><option>A</option><option>B</option></select></div></div>
    <div class="field"><label>Initial CGPA</label><input class="input" value="0.00" placeholder="0.00">
      <span class="hint">Leave 0.00 for transfer students pending transcript evaluation.</span></div>`;
  const m=openModal({title:`Add Student <span class="step-dots" style="vertical-align:middle">
      <span class="step-dot ${step===1?'on':''}"></span><span class="step-dot ${step===2?'on':''}"></span></span>`,
    body:step===1?body1:body2,
    footer:`${step===2?`<button class="btn btn-ghost" onclick="addStudentModal(1)" style="margin-right:auto">${icon('chev-left',14)}Back</button>`:''}
      <button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      ${step===1
        ?`<button class="btn btn-primary" id="nsNext">Continue ${icon('chev-right',14)}</button>`
        :`<button class="btn btn-primary" id="nsSave">${icon('check',15)}Create Student</button>`}`});
  const next=m.el.querySelector('#nsNext');
  if(next)next.onclick=()=>{
    const name=m.el.querySelector('#nsName'),id=m.el.querySelector('#nsId');
    let ok=true;
    [[name,'Student name is required'],[id,'Student ID is required']].forEach(([el,msg])=>{
      const err=el.parentElement.querySelector('.err-msg');
      if(!el.value.trim()){el.classList.add('error');
        if(!err)el.insertAdjacentHTML('afterend',`<span class="err-msg">${icon('info',12)}${msg}</span>`);ok=false;}
      else{el.classList.remove('error');err&&err.remove();}
    });
    if(ok)addStudentModal(2);
  };
  const save=m.el.querySelector('#nsSave');
  if(save)save.onclick=()=>{
    DATA.students.unshift({id:m.el.querySelector('#nsId').value||'STU-10400',
      name:m.el.querySelector('#nsName').value||'New Student',
      dept:m.el.querySelector('#nsDept').value||'CSE',batch:2024,sem:5,
      cgpa:0,att:100,failed:0,last:'Just now',email:'new@meridian.edu',
      program:DATA.programs.CSE,gpa:0,prevGpa:0,risk:'Moderate',gpaTrend:[0],courseAtt:{},rank:'—',passed:0,status:'Active'});
    m.close();toast('Student created — profile ready to complete');renderRoute(true);
  };
}
Pages._sel=new Set();

Pages.students=()=>{
  const f=App.studentFilters;
  const list=filteredStudents();
  const pages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));
  if(f.page>pages)f.page=pages;
  const rows=list.slice((f.page-1)*PAGE_SIZE,f.page*PAGE_SIZE);
  const sel=Pages._sel;
  after(()=>{
    const q=$('#stq');
    if(q){q.oninput=()=>{clearTimeout(q._t);q._t=setTimeout(()=>{f.q=q.value;f.page=1;renderRoute(true);
      const nq=$('#stq');if(nq){nq.focus();nq.setSelectionRange(nq.value.length,nq.value.length);}},250);};}
    $$('[data-chk]').forEach(c=>c.onchange=()=>{
      if(c.dataset.all==='1'){$$('[data-chk]:not([data-all])').forEach(x=>{x.checked=c.checked;
        c.checked?sel.add(x.dataset.chk):sel.delete(x.dataset.chk);});}
      else c.checked?sel.add(c.dataset.chk):sel.delete(c.dataset.chk);
      renderRoute(true);
    });
  });
  const th=(label,key)=>`<th class="sortable" onclick="sortStudents('${key}')" aria-label="Sort by ${label}">${label}
    <span class="sort-ic">${f.sort.key===key?(f.sort.dir===1?'▲':'▼'):'⇅'}</span></th>`;
  const selOpts=(cur,items)=>items.map(([v,l])=>`<option value="${v}" ${String(cur)===String(v)?'selected':''}>${l}</option>`).join('');
  const head=`
  ${pageHead('Students','Manage and monitor your students.',
    `<button class="btn btn-ghost" onclick="exportCSV('students.csv',[['Name','ID','Department','Batch','Semester','CGPA','Attendance','Risk'],...filteredStudents().map(s=>[s.name,s.id,DATA.depts[s.dept],s.batch,s.sem,s.cgpa,s.att+'%',s.risk])])">${icon('download',15)}Export</button>
     <button class="btn btn-ghost" onclick="importStudentsModal()">${icon('upload',15)}Import</button>
     <button class="btn btn-primary" onclick="addStudentModal(1)">${icon('plus',15)}Add Student</button>`)}
  <div class="card tbl-card">
    <div class="filter-bar" role="search">
      <input id="stq" class="input search" type="search" placeholder="Search by name, student ID or email" value="${esc(f.q)}" aria-label="Search students">
      <select class="select" aria-label="Department" onchange="setF('dept',this.value)">
        <option value="">All departments</option>${selOpts(f.dept,Object.entries(DATA.depts))}</select>
      <select class="select" aria-label="Batch" onchange="setF('batch',this.value)">
        <option value="">All batches</option>${selOpts(f.batch,[2022,2023,2024].map(b=>[b,'Batch '+b]))}</select>
      <select class="select" aria-label="Semester" onchange="setF('sem',this.value)">
        <option value="">All semesters</option>${selOpts(f.sem,[1,2,3,4,5,6,7,8].map(n=>[n,'Semester '+n]))}</select>
      <select class="select" aria-label="Attendance" onchange="setF('att',this.value)">
        <option value="">Any attendance</option>${selOpts(f.att,[['lt70','Below 70%'],['lt75','Below 75%'],['lt80','Below 80%']])}</select>
      <select class="select" aria-label="CGPA" onchange="setF('cgpa',this.value)">
        <option value="">Any CGPA</option>${selOpts(f.cgpa,[['lt25','Below 2.5'],['lt30','Below 3.0'],['gt35','Above 3.5']])}</select>
      <select class="select" aria-label="Risk level" onchange="setF('risk',this.value)">
        <option value="">Any risk</option>${selOpts(f.risk,['Low','Moderate','High','Critical'].map(r=>[r,r+' risk']))}</select>
      ${(f.q||f.dept||f.risk||f.batch||f.sem||f.att||f.cgpa)?`<button class="btn btn-soft btn-sm" onclick="resetStudentFilters()">${icon('x',13)}Clear</button>`:''}
    </div>
    ${sel.size?`<div class="sel-bar">${icon('check',15)}${sel.size} selected
      <span class="grow"></span>
      <button class="btn btn-sm btn-soft" onclick="toast('Message draft opened for selected students (demo)','info')">${icon('mail',13)}Message</button>
      <button class="btn btn-sm btn-soft" onclick="exportCSV('selected-students.csv',[['Name','ID'],...[...Pages._sel].map(id=>{const s=DATA.studentById(id);return [s.name,s.id];})])">${icon('download',13)}Export</button>
      <button class="btn btn-sm btn-danger-soft" onclick="confirmDialog({title:'Remove selected students?',message:'This will deactivate ${sel.size} student record(s) and remove them from active rosters. Deactivated records can be restored from Settings → Users within 30 days.',confirmText:'Remove',onConfirm:()=>{Pages._sel.clear();toast('Students deactivated (demo)','warn');renderRoute(true);}})">${icon('trash',13)}Remove</button>
      <button class="btn btn-sm btn-ghost" onclick="Pages._sel.clear();renderRoute(true)">Clear</button></div>`:''}`;
  return head+studentTable(rows,f,pages,list)+`</div>`;
};
function resetStudentFilters(){App.studentFilters={q:'',dept:'',risk:'',batch:'',sem:'',att:'',cgpa:'',sort:{key:'name',dir:1},page:1};renderRoute(true);}
function importStudentsModal(){
  const m=openModal({title:'Import Students',
    body:`<div class="field"><label>Upload CSV file</label><input type="file" class="input" style="padding:8px" accept=".csv"></div>
      <div class="risk-note">${icon('info',15)}<span>Expected columns: <b>Name, ID, Email, Department, Batch, Semester</b>. Existing students are matched by ID and updated, not duplicated.</span></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove();toast('Import queued — 3 rows detected (demo)','info')">${icon('upload',14)}Import</button>`});
  return m;
}

function studentTable(rows,f,pages,list){
  const th=(label,key)=>`<th class="sortable" onclick="sortStudents('${key}')" aria-label="Sort by ${label}">${label}
    <span class="sort-ic">${f.sort.key===key?(f.sort.dir===1?'▲':'▼'):'⇅'}</span></th>`;
  if(!rows.length)return `<div class="tbl-wrap">${emptyState('users','No students found',
    'No students match the current filters. Try adjusting your search or clearing filters.',
    `<button class="btn btn-soft" onclick="resetStudentFilters()">Clear all filters</button>`)}</div>`;
  return `
    <div class="tbl-wrap"><table class="tbl" style="min-width:1080px">
      <thead><tr><th style="width:36px"><input type="checkbox" class="chk" data-chk data-all="1" aria-label="Select all"></th>
        ${th('Student','name')}<th>Student ID</th><th>Department</th><th>Batch</th><th>Sem</th>
        ${th('CGPA','cgpa')}${th('Attendance','att')}<th>Failed</th>${th('Risk','risk')}<th>Last Activity</th><th></th></tr></thead>
      <tbody>${rows.map(s=>`
        <tr class="tr-click" onclick="location.hash='#/profile/${s.id}'">
          <td><input type="checkbox" class="chk" data-chk="${s.id}" ${Pages._sel.has(s.id)?'checked':''} aria-label="Select ${esc(s.name)}" onclick="event.stopPropagation()"></td>
          <td><div style="display:flex;align-items:center;gap:11px">${avatar(s.name,34)}
            <div><div class="cell-main">${esc(s.name)}</div><div class="cell-sub">${esc(s.email)}</div></div></div></td>
          <td class="num">${s.id}</td>
          <td><span class="cell-sub">${esc(DATA.depts[s.dept])}</span></td>
          <td class="num">${s.batch}</td><td class="num">${s.sem}</td>
          <td class="num" style="color:${s.cgpa<2.5?'var(--danger)':s.cgpa>=3.5?'var(--success)':'inherit'}">${s.cgpa.toFixed(2)}</td>
          <td>${prog(s.att)}</td>
          <td class="num" style="${s.failed?'color:var(--danger);font-weight:700':''}">${s.failed}</td>
          <td>${riskBadge(s.risk)}</td>
          <td><span class="cell-sub">${esc(s.last)}</span></td>
          <td class="act-cell"><div class="row-actions" onclick="event.stopPropagation()">
            <button class="icon-btn" style="width:30px;height:30px" aria-label="View profile" data-tip="View profile" onclick="location.hash='#/profile/${s.id}'">${icon('eye',15)}</button>
            <div class="dd"><button class="icon-btn" style="width:30px;height:30px" aria-label="More actions" data-tip="More"
              data-dd='<div class="dd-menu"><button class="dd-item" onclick="location.hash=&quot;#/profile/${s.id}&quot;">${icon('eye',14)}View 360° profile</button>
              <button class="dd-item" onclick="toast(&quot;Observation form opened (demo)&quot;,&#39;info&#39;)">${icon('edit',14)}Add observation</button>
              <button class="dd-item" onclick="toast(&quot;Message composer opened (demo)&quot;,&#39;info&#39;)">${icon('mail',14)}Message student</button>
              <div class="dd-sep"></div>
              <button class="dd-item danger" onclick="toast(&quot;Deletion requires advisor approval (demo)&quot;,&#39;warn&#39;)">${icon('trash',14)}Deactivate</button></div>'>${icon('dots',15)}</button></div>
          </div></td>
        </tr>`).join('')}</tbody></table></div>
    <div class="pagi"><span class="pg-info">Showing ${(f.page-1)*PAGE_SIZE+1}–${Math.min(f.page*PAGE_SIZE,list.length)} of ${list.length} students</span>
      <button class="pg-btn" ${f.page<=1?'disabled':''} onclick="App.studentFilters.page--;renderRoute(true)" aria-label="Previous page">${icon('chev-left',14)}</button>
      ${Array.from({length:pages},(_,i)=>`<button class="pg-btn ${f.page===i+1?'on':''}" onclick="App.studentFilters.page=${i+1};renderRoute(true)">${i+1}</button>`).join('')}
      <button class="pg-btn" ${f.page>=pages?'disabled':''} onclick="App.studentFilters.page++;renderRoute(true)" aria-label="Next page">${icon('chev-right',14)}</button></div>`;
}

/* ---------------- Student 360° Profile ---------------- */
const PROF_TABS=['Overview','Academic','Attendance','Examinations','Assignments','Behavior','Achievements','Wellbeing','Timeline'];
function riskReasons(s){
  const r=[];
  if(s.att<70)r.push(['Attendance below 70%',`Overall attendance is ${s.att}%, under the 70% early-warning line.`]);
  else if(s.att<75)r.push(['Attendance below 75% threshold',`Overall attendance is ${s.att}% — the institution requires 75%.`]);
  if(s.gpaTrend.length>2&&s.gpaTrend[s.gpaTrend.length-1]<s.gpaTrend[0])
    r.push(['GPA declined across the semester',`Trend moved from ${s.gpaTrend[0].toFixed(2)} to ${s.gpaTrend[s.gpaTrend.length-1].toFixed(2)}.`]);
  if(s.failed>0)r.push([`${s.failed} failed course${s.failed>1?'s':''}`,'Retake or remedial plan recommended before the next registration window.']);
  if(s.cgpa<2.5)r.push(['CGPA below 2.5',`Current CGPA is ${s.cgpa.toFixed(2)} — approaching academic probation limits.`]);
  if(!r.length)r.push(['No active risk factors','This student is currently meeting all monitored thresholds.']);
  return r;
}
Pages.profile=(id)=>{
  const s=DATA.studentById(id)||DATA.students[0];
  App.profTab=App.profTab||'Overview';
  const tab=App.profTab;
  after(()=>{
    $$('#profTabs .tab').forEach(b=>b.onclick=()=>{App.profTab=b.dataset.tab;renderRoute(true);});
  });
  const exams=DATA.examsFor(s),asgs=DATA.assignmentsFor(s),obs=DATA.observationsFor(s),
        ach=DATA.achievementsFor(s),tl=DATA.timelineFor(s);
  const semesterLabels=(Array.isArray(s.gpaTrend)?s.gpaTrend:[0]).map((_,i)=>`Sem ${i+1}`);
  const classAvg=s.gpaTrend.map(v=>round2(clamp(v-0.18,0.5,4)));

  const header=`
  ${crumbs([{label:'Students',hash:'students'},{label:s.name}])}
  <div class="card" style="overflow:hidden;margin-bottom:20px">
    <div class="prof-cover"></div>
    <div class="prof-head">
      ${avatar(s.name,88).replace('class="avatar','class="avatar prof-avatar')}
      <div class="prof-id">
        <h1>${esc(s.name)} ${badge('success','Active')}</h1>
        <div class="prof-meta"><b>${s.id}</b><span class="sep">·</span>${esc(DATA.depts[s.dept])}
          <span class="sep">·</span>${esc(s.program)}<span class="sep">·</span>Batch ${s.batch}
          <span class="sep">·</span>Semester ${s.sem}</div>
      </div>
      <div class="prof-actions">
        <button class="btn btn-ghost" onclick="toast('Profile edit form opened (demo)','info')">${icon('edit',15)}Edit Profile</button>
        <button class="btn btn-ghost" onclick="toast('Student 360° report generation started — you will be notified','info')">${icon('report',15)}Generate Report</button>
        <div class="dd"><button class="btn btn-ghost" data-dd='<div class="dd-menu">
          <button class="dd-item" onclick="toast(&quot;Message composer opened (demo)&quot;,&#39;info&#39;)">${icon('mail',14)}Message student</button>
          <button class="dd-item" onclick="toast(&quot;Observation form opened (demo)&quot;,&#39;info&#39;)">${icon('edit',14)}Add observation</button>
          <button class="dd-item" onclick="window.print()">${icon('file-text',14)}Print profile</button></div>'>More ${icon('chev-down',14)}</button></div>
      </div>
    </div>
  </div>
  <div class="grid cols-6" style="margin-bottom:20px">
    <div class="card stat-card"><span class="sc-label">${icon('award',13)}CGPA</span>
      <div class="sc-num">${s.cgpa.toFixed(2)}</div><div class="sc-foot">Scale of 4.00 · Rank ${s.rank}</div></div>
    <div class="card stat-card"><span class="sc-label">${icon('check',13)}Attendance</span>
      <div class="sc-num" style="color:${attColor(s.att)}">${s.att}%</div><div class="sc-foot">${s.att<75?'Below 75% requirement':'Meets requirement'}</div></div>
    <div class="card stat-card"><span class="sc-label">${icon('chart',13)}Current GPA</span>
      <div class="sc-num">${s.gpa.toFixed(2)}</div><div class="sc-foot">Previous semester ${s.prevGpa.toFixed(2)}</div></div>
    <div class="card stat-card"><span class="sc-label">${icon('check',13)}Passed Courses</span>
      <div class="sc-num">${s.passed}</div><div class="sc-foot">Since enrollment</div></div>
    <div class="card stat-card"><span class="sc-label">${icon('file-x',13)}Failed Courses</span>
      <div class="sc-num" style="color:${s.failed?'var(--danger)':'inherit'}">${s.failed}</div><div class="sc-foot">${s.failed?'Retake plan needed':'None on record'}</div></div>
    <div class="card stat-card"><span class="sc-label">${icon('alert-triangle',13)}Risk</span>
      <div style="margin-top:9px">${riskBadge(s.risk)}</div><div class="sc-foot">Updated 2h ago</div></div>
  </div>
  <div class="card" style="margin-bottom:20px">
    <div class="tabs" id="profTabs" role="tablist" aria-label="Student sections">
      ${PROF_TABS.map(t=>`<button class="tab ${tab===t?'on':''}" data-tab="${t}" role="tab" aria-selected="${tab===t}">${t}</button>`).join('')}
    </div>`;
  window._profCtx={s,tab,exams,asgs,obs,ach,tl,semesterLabels,classAvg,header};
  return profBody();
};

function profBody(){
  const {s,tab,exams,asgs,obs,ach,tl,semesterLabels,classAvg,header}=window._profCtx;
  let body='';
  if(tab==='Overview'){
    const rr=riskReasons(s);
    body=`<div class="card-b"><div class="grid-12">
      <div class="c8">
        <div class="risk-card ${s.risk==='High'||s.risk==='Critical'?'r-high':''}">
          <div class="risk-h ${s.risk==='Moderate'?'r-mod':''}">${icon('alert-triangle',19)}
            <h3>Why is this student ${s.risk==='Low'?'on the watchlist':'flagged'}?</h3>
            <span class="right">${riskBadge(s.risk)}</span></div>
          <div class="risk-body">
            ${rr.map(([t,d])=>`<div class="risk-reason">${icon('alert-triangle',15)}
              <span><b style="color:var(--text)">${esc(t)}</b><br><span style="font-size:12.5px">${esc(d)}</span></span></div>`).join('')}
            <div class="risk-note">${icon('info',15)}<span>This is an <b>analytical early-warning based on attendance, grades and submission data</b> — not a judgment of the student. Review the full record before any intervention.</span></div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="toast('Review checklist opened — notes, interventions, advisor referral (demo)','info')">${icon('eye',15)}Review Student</button>
              <button class="btn btn-ghost" onclick="toast('Advisor referral drafted (demo)','info')">Refer to Advisor</button></div>
          </div>
        </div>
        <div class="card" style="margin-top:20px">
          <div class="card-h"><h3>Academic Performance</h3><span class="ch-sub">GPA by semester</span></div>
          <div class="card-b">${Chart.groupBars({labels:semesterLabels,height:235,
            series:[{name:'Student GPA',values:s.gpaTrend,color:cssVar('--primary')},
                    {name:'Class average',values:classAvg,color:cssVar('--border-2')}]})}</div>
        </div>
      </div>
      <div class="c4">
        <div class="card" style="margin-bottom:20px">
          <div class="card-h"><h3>Attendance</h3><span class="right"><span class="badge ${s.att<75?'b-danger':'b-success'}">${s.att}%</span></span></div>
          <div class="card-b" style="text-align:center">
            <div class="gauge-val" style="color:${attColor(s.att)}">${s.att}%</div>
            <div class="gauge-lab">${s.att<75?'Below required threshold':'Meeting requirement'}</div>
            <div class="gauge-bar"><span style="display:block;height:100%;width:${s.att}%;border-radius:99px;background:${attColor(s.att)}"></span></div>
            <div style="text-align:left;margin-top:16px">${Chart.hbars(Object.entries(s.courseAtt).map(([c,v])=>({label:c,value:v})))}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-h"><h3>Recent Activity</h3></div>
          <div class="card-b"><div class="timeline">${tl.slice(0,5).map(t=>`
            <div class="tl-item ${t.tone}"><div class="tl-time">${esc(t.time)}</div>
              <div class="tl-title">${esc(t.title)}</div><div class="tl-desc">${esc(t.type)}</div></div>`).join('')}</div></div>
        </div>
      </div>
    </div></div>`;
  }
  else if(tab==='Academic'){
    body=`<div class="card-b"><div class="grid-12">
      <div class="c4"><div class="grid" style="gap:14px">
        ${[['Current GPA',s.gpa.toFixed(2),`vs class avg ${DATA.semester.gpa[5].toFixed(2)}`],
           ['Previous GPA',s.prevGpa.toFixed(2),s.gpa>=s.prevGpa?'Improved this semester':'Declined this semester'],
           ['CGPA',s.cgpa.toFixed(2),'Cumulative since Sem 1'],
           ['Class average',DATA.semester.gpa[5].toFixed(2),'Cohort of 248 students'],
           ['Rank',String(s.rank),'Within department cohort']].map(([l,v,f])=>`
          <div class="stat-chip"><span class="sc-val">${v}</span><span class="sc-lab">${esc(l)}</span><span class="cell-sub">${esc(f)}</span></div>`).join('')}
      </div></div>
      <div class="c8">
        <div class="card">
          <div class="card-h"><h3>Student vs Class Average</h3><span class="ch-sub">GPA comparison by semester</span></div>
          <div class="card-b">${Chart.groupBars({labels:semesterLabels,height:240,
            series:[{name:'Student',values:s.gpaTrend,color:cssVar('--primary')},
                    {name:'Class average',values:classAvg,color:cssVar('--border-2')}]})}
          ${Chart.legend([{label:'Student',value:'',color:cssVar('--primary')},{label:'Class average',value:'',color:cssVar('--border-2')}])}</div>
        </div>
        <div class="card" style="margin-top:20px">
          <div class="card-h"><h3>Course Grades</h3><span class="ch-sub">Current semester results</span></div>
          <div class="tbl-wrap"><table class="tbl" style="min-width:520px">
            <thead><tr><th>Course</th><th>Credits</th><th>Score</th><th>Grade</th><th>Status</th></tr></thead>
            <tbody>${exams.map(e=>{const pct=Math.round(e.score/e.max*100);
              return `<tr><td><div class="cell-main">${esc(e.exam)}</div></td><td class="num">3</td>
              <td class="num">${e.score}/${e.max}</td>
              <td><span class="badge ${pct>=83?'b-success':pct>=70?'b-warn':'b-danger'}">${pct>=93?'A':pct>=87?'B+':pct>=80?'B':pct>=73?'C+':pct>=65?'D':'F'}</span></td>
              <td>${badge(pct>=60?'success':'danger',pct>=60?'Passed':'Failed')}</td></tr>`;}).join('')}
            </tbody></table></div>
        </div>
      </div>
    </div></div>`;
  }
  else if(tab==='Attendance'){
    body=`<div class="card-b"><div class="grid-12">
      <div class="c4"><div class="grid" style="gap:14px">
        <div class="stat-chip"><span class="sc-val" style="color:${attColor(s.att)}">${s.att}%</span><span class="sc-lab">Overall attendance</span>
          <span class="cell-sub">${s.att<75?'Below the 75% requirement':'Meets the 75% requirement'}</span></div>
        <div class="stat-chip"><span class="sc-val">4</span><span class="sc-lab">Courses this semester</span></div>
        <div class="stat-chip"><span class="sc-val" style="color:var(--danger)">${Object.values(s.courseAtt).filter(v=>v<75).length}</span><span class="sc-lab">Courses below 75%</span></div>
        <div class="risk-note">${icon('info',15)}<span>Attendance below 75% triggers an early-warning review with the academic advisor.</span></div>
      </div></div>
      <div class="c8">
        <div class="card">
          <div class="card-h"><h3>Course-wise Attendance</h3></div>
          <div class="card-b">${Chart.hbars(Object.entries(s.courseAtt).map(([c,v])=>({label:c,value:v})))}</div>
        </div>
        <div class="card" style="margin-top:20px">
          <div class="card-h"><h3>Monthly Trend</h3><span class="ch-sub">Present rate by month</span></div>
          <div class="card-b">${Chart.bars({labels:['Oct','Nov','Dec','Jan','Feb','Mar'],
            values:[Math.min(s.att+6,99),s.att+3,s.att+1,s.att-2,s.att-1,s.att],max:100,suffix:'%',highlightBelow:75,height:220})}</div>
        </div>
      </div>
    </div></div>`;
  }
  else if(tab==='Examinations'){
    body=`<div class="card-b">
      <div class="tbl-wrap"><table class="tbl" style="min-width:640px">
        <thead><tr><th>Examination</th><th>Date</th><th>Score</th><th>Weight</th><th>Percentage</th><th>Outcome</th></tr></thead>
        <tbody>${exams.map(e=>{const pct=Math.round(e.score/e.max*100);
          return `<tr><td><div class="cell-main">${esc(e.exam)}</div></td><td><span class="cell-sub">${e.date}</span></td>
          <td class="num">${e.score}/${e.max}</td><td class="num">${e.weight}</td>
          <td>${prog(pct)}</td><td>${badge(pct>=60?'success':'danger',pct>=60?'Passed':'Failed')}</td></tr>`;}).join('')}
        </tbody></table></div></div>`;
  }
  else if(tab==='Assignments'){
    body=`<div class="card-b">
      <div class="tbl-wrap"><table class="tbl" style="min-width:640px">
        <thead><tr><th>Assignment</th><th>Course</th><th>Deadline</th><th>Score</th><th>Status</th></tr></thead>
        <tbody>${asgs.map(a=>`<tr><td><div class="cell-main">${esc(a.title)}</div></td>
          <td><span class="chip">${a.course}</span></td><td><span class="cell-sub">${a.due}</span></td>
          <td class="num">${a.score!=null?a.score+'%':'—'}</td>
          <td>${a.status==='Submitted'?badge('success','Submitted'):a.status==='Late'?badge('warn','Late'):badge('danger','Missing')}</td></tr>`).join('')}
        </tbody></table></div></div>`;
  }
  else if(tab==='Behavior'){
    body=`<div class="card-b">
      <div class="risk-note" style="margin-bottom:16px">${icon('info',15)}<span>Observations are factual classroom notes shared with the academic advisor. They inform support conversations, not disciplinary action.</span></div>
      <div style="display:flex;gap:10px;margin-bottom:18px">
        <button class="btn btn-primary btn-sm" onclick="toast('New observation form opened (demo)','info')">${icon('plus',14)}Add Observation</button></div>
      <div class="timeline" style="max-width:620px">${obs.map(o=>`
        <div class="tl-item"><div class="tl-time">${esc(o.date)} · ${esc(o.author)}</div>
          <div class="tl-title">${esc(o.note)}</div>
          <div class="tl-desc">Faculty observation · visible to advisor and support staff</div></div>`).join('')}</div></div>`;
  }
  else if(tab==='Achievements'){
    body=`<div class="card-b"><div class="grid cols-3">
      ${ach.map(a=>`<div class="card card-hov" style="padding:18px">
        <span class="icon-tile t-success">${icon('award',18)}</span>
        <h3 style="margin-top:10px">${esc(a.title)}</h3>
        <p style="font-size:12.5px;color:var(--text-2);margin-top:4px">${esc(a.desc)}</p>
        <span class="cell-sub" style="display:block;margin-top:8px">${esc(a.date)}</span></div>`).join('')}
    </div></div>`;
  }
  else if(tab==='Wellbeing'){
    body=`<div class="card-b">
      <div class="well-banner">${icon('info',17)}<span><b>A note on this section.</b> These indicators describe <b>academic engagement only</b>, in neutral language. They never imply medical or psychological diagnoses. Access to notes is restricted.</span></div>
      <div class="grid cols-4" style="margin-bottom:20px">
        ${(s.risk==='Low'
          ?[['Engagement','86%','var(--success)'],['Academic Stress Indicator','Low','var(--success)'],['Support Status','None needed','var(--info)'],['Follow-ups Required','0','var(--text)']]
          :[['Engagement','64%','var(--warn)'],['Academic Stress Indicator','Elevated','var(--warn)'],['Support Status','Advisor check-in active','var(--info)'],['Follow-ups Required',s.risk==='Moderate'?'1':'2','var(--text)']]
        ).map(([l,v,c])=>`
          <div class="card gauge-card"><div class="gauge-val" style="font-size:22px;color:${c}">${v}</div>
            <div class="gauge-lab">${l}</div></div>`).join('')}
      </div>
      <div class="card" style="box-shadow:none">
        <div class="card-h"><h3>Faculty Concern</h3><span class="right"><span class="restricted">${icon('lock',12)}Restricted Access</span></span></div>
        <div class="card-b">
          <p style="font-size:13.5px;color:var(--text-2)">“Student appears less engaged than usual over the past three weeks. A brief follow-up conversation is recommended to understand workload and any course-related difficulties.”</p>
          <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;align-items:center">
            <span class="cell-sub">Logged by Dr. S. Mitchell · Mar 04, 2026</span>
            <span style="flex:1"></span>
            <button class="btn btn-soft btn-sm" onclick="toast('Follow-up scheduled with advisor office (demo)','info')">${icon('calendar',14)}Schedule Follow-up</button></div>
        </div>
      </div>
    </div>`;
  }
  else if(tab==='Timeline'){
    body=`<div class="card-b"><div class="timeline" style="max-width:640px">${tl.map(t=>`
      <div class="tl-item ${t.tone}"><div class="tl-time">${esc(t.time)}</div>
        <div class="tl-title">${esc(t.title)}</div>
        <div class="tl-desc"><span class="chip" style="margin-right:6px">${esc(t.type)}</span>${esc(t.desc)}</div></div>`).join('')}</div></div>`;
  }
  return header+body+`</div>`;
}
