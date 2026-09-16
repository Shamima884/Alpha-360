
/* ============================================================
   Pages B — Academics · Attendance · Examinations · Assignments · Analytics
   ============================================================ */
'use strict';

/* ---------------- Academics ---------------- */
Pages.academics=()=>{
  return `
  ${pageHead('Academics','Courses you teach this semester, with live performance signals.',
    `<button class="btn btn-ghost" onclick="exportCSV('courses.csv',[['Code','Name','Instructor','Students','Avg grade','Pass rate'],...DATA.courses.map(c=>[c.code,c.name,c.instructor,c.students,c.avgGrade,c.passRate+'%'])])">${icon('download',15)}Export</button>`)}
  <div class="grid cols-3">
    ${DATA.courses.map(c=>`
      <div class="card card-hov" style="padding:20px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <span class="icon-tile ${c.dept==='CSE'?'t-primary':c.dept==='EEE'?'t-info':c.dept==='BBA'?'t-accent':'t-warn'}">${icon('book',18)}</span>
          <div style="flex:1;min-width:0"><div class="cell-main">${c.code}</div><div class="cell-sub">${esc(c.name)}</div></div>
          <span class="badge b-primary">${c.credits} cr</span></div>
        <div style="display:flex;gap:14px;margin-bottom:14px">
          <div class="stat-chip" style="flex:1;min-width:0;padding:10px 12px"><span class="sc-val" style="font-size:17px">${c.students}</span><span class="sc-lab" style="font-size:10.5px">Students</span></div>
          <div class="stat-chip" style="flex:1;min-width:0;padding:10px 12px"><span class="sc-val" style="font-size:17px">${esc(c.avgGrade)}</span><span class="sc-lab" style="font-size:10.5px">Avg grade</span></div>
          <div class="stat-chip" style="flex:1;min-width:0;padding:10px 12px"><span class="sc-val" style="font-size:17px;color:${c.passRate<80?'var(--warn)':'var(--success)'}">${c.passRate}%</span><span class="sc-lab" style="font-size:10.5px">Pass rate</span></div></div>
        ${prog(c.passRate,{val:false})}
        <div style="display:flex;align-items:center;gap:8px;margin-top:12px">
          <span class="cell-sub" style="flex:1">${icon('user',12)} ${esc(c.instructor)}</span>
          <button class="btn btn-soft btn-sm" onclick="toast('${c.code} class workspace opened (demo)','info')">Open</button></div>
      </div>`).join('')}
  </div>`;
};

/* ---------------- Attendance ---------------- */
Pages.attendance=()=>{
  if(!App.attRoster)App.attRoster=DATA.attRoster.map(r=>({...r}));
  const roster=App.attRoster;
  const counts=st=>roster.filter(r=>r.status===st).length;
  const below=roster.filter(r=>r.overall<75).length;
  after(()=>{
    $$('.att-btn').forEach(b=>b.onclick=()=>{
      const r=roster.find(x=>x.id===b.dataset.id);
      r.status=b.dataset.st;
      $$('.att-btn[data-id="'+r.id+'"]').forEach(x=>{x.classList.toggle('on',x.dataset.st===r.status);
        x.setAttribute('aria-pressed',x.dataset.st===r.status);});
      updateAttSummary();
    });
  });
  const statusBtn=(r,st,label,cls)=>`<button class="att-btn btn btn-sm ${r.status===st?'on '+cls:'btn-ghost'}"
    data-id="${r.id}" data-st="${st}" aria-pressed="${r.status===st}" style="min-width:34px" aria-label="Mark ${label}">${label}</button>`;
  return `
  ${pageHead('Attendance','Mark and review session attendance.',
    `<button class="btn btn-ghost" onclick="toast('Attendance history import started (demo)','info')">${icon('upload',15)}Import Attendance</button>
     <button class="btn btn-primary" onclick="toast('Attendance saved for ${App.att.course} · ${App.att.date}','success')">${icon('check',15)}Mark Attendance</button>`)}
  <div class="card" style="margin-bottom:20px">
    <div class="filter-bar" style="border-bottom:0">
      <span class="filter-lbl">Course</span>
      <select class="select" style="width:auto" onchange="App.att.course=this.value.slice(0,7);toast('Roster reloaded for '+this.value,'info')">
        ${DATA.courses.map(c=>`<option ${c.code===App.att.course?'selected':''}>${c.code} — ${esc(c.name)}</option>`).join('')}</select>
      <span class="filter-lbl">Section</span>
      <select class="select" style="width:auto" onchange="App.att.section=this.value;toast('Section '+this.value+' loaded','info')">
        <option ${App.att.section==='A'?'selected':''}>A</option><option ${App.att.section==='B'?'selected':''}>B</option></select>
      <span class="filter-lbl">Date</span>
      <input type="date" class="input" style="width:auto" value="${App.att.date}" onchange="App.att.date=this.value;toast('Session date set to '+this.value,'info')" aria-label="Session date">
      <span class="filter-lbl">Semester</span>
      <select class="select" style="width:auto"><option selected>Semester 5</option><option>Semester 4</option></select>
    </div>
  </div>
  <div class="grid cols-5" style="margin-bottom:20px" id="attSummary">
    <div class="stat-chip"><span class="sc-val">${roster.length}</span><span class="sc-lab"><i class="sc-dot" style="background:var(--primary)"></i>Total Students</span></div>
    <div class="stat-chip"><span class="sc-val" style="color:var(--success)">${counts('P')}</span><span class="sc-lab"><i class="sc-dot" style="background:var(--success)"></i>Present</span></div>
    <div class="stat-chip"><span class="sc-val" style="color:var(--danger)">${counts('A')}</span><span class="sc-lab"><i class="sc-dot" style="background:var(--danger)"></i>Absent</span></div>
    <div class="stat-chip"><span class="sc-val" style="color:var(--warn)">${counts('L')}</span><span class="sc-lab"><i class="sc-dot" style="background:var(--warn)"></i>Late</span></div>
    <div class="stat-chip"><span class="sc-val" style="color:var(--danger)">${below}</span><span class="sc-lab"><i class="sc-dot" style="background:var(--danger)"></i>Below Threshold</span></div>
  </div>
  <div class="card tbl-card">
    <div class="card-h"><h2>Session Roster</h2><span class="ch-sub">${App.att.course} · Section ${App.att.section} · ${App.att.date}</span>
      <div class="right"><span class="chip">${icon('info',12)}Tap a status to mark</span></div></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:760px">
      <thead><tr><th>Student</th><th>Student ID</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Attendance %</th></tr></thead>
      <tbody>${roster.map(r=>`
        <tr><td><div style="display:flex;align-items:center;gap:11px">${avatar(r.name,32)}
          <span class="cell-main">${esc(r.name)}</span></div></td>
          <td class="num">${r.id}</td>
          <td>${statusBtn(r,'P','Present','p-success')}</td>
          <td>${statusBtn(r,'A','Absent','p-danger')}</td>
          <td>${statusBtn(r,'L','Late','p-warn')}</td>
          <td>${statusBtn(r,'E','Excused','p-primary')}</td>
          <td>${prog(r.overall)}</td></tr>`).join('')}
      </tbody></table></div>
  </div>`;
};
function updateAttSummary(){
  const roster=App.attRoster;
  const vals=[roster.length,roster.filter(r=>r.status==='P').length,roster.filter(r=>r.status==='A').length,
    roster.filter(r=>r.status==='L').length,roster.filter(r=>r.overall<75).length];
  $$('#attSummary .sc-val').forEach((el,i)=>{el.textContent=vals[i];});
}

/* ---------------- Examinations ---------------- */
function gradeFor(t){
  if(t>=93)return['A','4.00'];if(t>=90)return['A-','3.70'];if(t>=87)return['B+','3.30'];
  if(t>=83)return['B','3.00'];if(t>=80)return['B-','2.70'];if(t>=77)return['C+','2.30'];
  if(t>=73)return['C','2.00'];if(t>=70)return['C-','1.70'];if(t>=67)return['D+','1.30'];
  if(t>=60)return['D','1.00'];return['F','0.00'];
}
function recalcResult(inp){
  const tr=inp.closest('tr');
  const get=n=>parseFloat(tr.querySelector(`[data-f="${n}"]`).value)||0;
  const total=get('asg')+get('mid')+get('fin');
  const [g,pt]=gradeFor(total);
  tr.querySelector('[data-c="total"]').textContent=total.toFixed(1);
  tr.querySelector('[data-c="grade"]').textContent=g;
  tr.querySelector('[data-c="gpa"]').textContent=pt;
  const st=tr.querySelector('[data-c="status"]');
  st.textContent=total>=40?'Pass':'Fail';
  st.className='badge '+(total>=40?'b-success':'b-danger');
}
function createExamModal(){
  const m=openModal({title:'Create Examination',
    body:`<div class="field"><label>Exam title <span class="req">*</span></label><input id="exT" class="input" placeholder="e.g. Final Examination"></div>
      <div class="form-row">
        <div class="field"><label>Course <span class="req">*</span></label>
          <select id="exC" class="select">${DATA.courses.map(c=>`<option>${c.code}</option>`).join('')}</select></div>
        <div class="field"><label>Date</label><input id="exD" class="input" type="date"></div></div>
      <div class="form-row">
        <div class="field"><label>Total marks</label><input id="exM" class="input" type="number" value="100"></div>
        <div class="field"><label>Weight</label>
          <select class="select"><option>40%</option><option>30%</option><option>20%</option><option>10%</option></select></div></div>`,
    footer:`<button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" id="exSave">${icon('plus',14)}Create Exam</button>`});
  m.el.querySelector('#exSave').onclick=()=>{
    const t=m.el.querySelector('#exT');
    if(!t.value.trim()){t.classList.add('error');t.focus();return;}
    DATA.exams.unshift({name:t.value.trim(),course:m.el.querySelector('#exC').value,
      date:new Date(m.el.querySelector('#exD').value||Date.now()).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}),
      students:48,status:'Scheduled',results:'—'});
    m.close();toast('Examination created and scheduled');renderRoute(true);
  };
}

Pages.exams=()=>{
  const list=DATA.exams;
  const upcoming=list.filter(e=>e.status==='Scheduled').length;
  const completed=list.filter(e=>e.status==='Completed').length;
  const pending=list.filter(e=>e.results!=='Published'&&e.results!=='—').length;
  const statusBadge=e=>e.status==='Scheduled'?badge('info','Scheduled')
    :e.results==='Published'?badge('success','Published')
    :badge('warn',e.results==='—'?'Completed':e.results);
  return `
  ${pageHead('Examinations','Schedule exams and publish results.',
    `<button class="btn btn-ghost" onclick="exportCSV('exams.csv',[['Exam','Course','Date','Students','Status','Results'],...DATA.exams.map(e=>[e.name,e.course,e.date,e.students,e.status,e.results])])">${icon('download',15)}Export</button>
     <button class="btn btn-primary" onclick="createExamModal()">${icon('plus',15)}Create Exam</button>`)}
  <div class="grid cols-3" style="margin-bottom:20px">
    ${[['Upcoming Exams',upcoming,'t-info','calendar','Scheduled this month'],
       ['Completed Exams',completed,'t-success','check','This semester'],
       ['Pending Results',pending,'t-warn','clock','Awaiting publication']].map(([l,v,t,ic,d])=>`
      <div class="card kpi"><div class="kpi-top"><span class="icon-tile ${t}">${icon(ic,18)}</span>
        <span class="kpi-label">${l}</span></div><div class="kpi-val">${v}</div><div class="kpi-desc">${d}</div></div>`).join('')}
  </div>
  <div class="card tbl-card" style="margin-bottom:20px">
    <div class="card-h"><h2>Exam Schedule</h2><span class="ch-sub">${list.length} examinations</span></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:760px">
      <thead><tr><th>Exam</th><th>Course</th><th>Date</th><th>Students</th><th>Status</th><th>Results</th><th></th></tr></thead>
      <tbody>${list.map(e=>`
        <tr><td><div class="cell-main">${esc(e.name)}</div></td><td><span class="chip">${e.course}</span></td>
          <td><span class="cell-sub">${e.date}</span></td><td class="num">${e.students}</td>
          <td>${statusBadge(e)}</td><td><span class="cell-sub">${esc(e.results)}</span></td>
          <td class="act-cell"><div class="row-actions">
            <button class="btn btn-soft btn-sm" onclick="toast('Opening exam workspace (demo)','info')">${e.results==='Pending results'||e.results==='Pending review'?'Enter Results':'View'}</button></div></td>
        </tr>`).join('')}</tbody></table></div>
  </div>
  <div class="card tbl-card">
    <div class="card-h"><span class="icon-tile t-primary">${icon('edit',18)}</span>
      <div><h2>Result Entry — CSE101 Final Examination</h2><span class="ch-sub">Inline editing · totals, grades and GPA calculate automatically</span></div>
      <div class="right"><button class="btn btn-primary btn-sm" onclick="toast('Results validated and published to student portal','success')">${icon('check',14)}Publish Results</button></div></div>
    <div class="tbl-wrap"><table class="tbl" style="min-width:880px">
      <thead><tr><th>Student</th><th>Student ID</th><th>Assignment /10</th><th>Midterm /30</th><th>Final /60</th><th>Total /100</th><th>Grade</th><th>GPA</th><th>Status</th></tr></thead>
      <tbody>${DATA.resultRows.map(r=>{const total=r.asg+r.mid+r.fin;const[g,pt]=gradeFor(total);
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:10px">${avatar(r.name,30)}<span class="cell-main">${esc(r.name)}</span></div></td>
          <td class="num">${r.id}</td>
          <td><input class="input" style="width:76px;height:32px" type="number" step="0.5" min="0" max="10" value="${r.asg}" data-f="asg" oninput="recalcResult(this)" aria-label="Assignment score for ${esc(r.name)}"></td>
          <td><input class="input" style="width:76px;height:32px" type="number" min="0" max="30" value="${r.mid}" data-f="mid" oninput="recalcResult(this)" aria-label="Midterm score for ${esc(r.name)}"></td>
          <td><input class="input" style="width:76px;height:32px" type="number" min="0" max="60" value="${r.fin}" data-f="fin" oninput="recalcResult(this)" aria-label="Final score for ${esc(r.name)}"></td>
          <td class="num" data-c="total" style="font-weight:700">${total.toFixed(1)}</td>
          <td><span class="badge ${total>=60?'b-success':total>=40?'b-warn':'b-danger'}" data-c="grade">${g}</span></td>
          <td class="num" data-c="gpa">${pt}</td>
          <td><span class="badge ${total>=40?'b-success':'b-danger'}" data-c="status">${total>=40?'Pass':'Fail'}</span></td>
        </tr>`;}).join('')}
      </tbody></table></div>
  </div>`;
};

/* ---------------- Assignments ---------------- */
Pages.assignments=()=>{
  const list=App.asgCourse==='All'?DATA.assignments:DATA.assignments.filter(a=>a.course===App.asgCourse);
  return `
  ${pageHead('Assignments','Track submissions, grading and completion.',
    `<button class="btn btn-ghost" onclick="exportCSV('assignments.csv',[['Assignment','Course','Deadline','Submitted','Total','Avg score','Status'],...DATA.assignments.map(a=>[a.title,a.course,a.due,a.submitted,a.total,a.avg+'%',a.status])])">${icon('download',15)}Export</button>
     <button class="btn btn-primary" onclick="toast('Assignment builder opened (demo)','info')">${icon('plus',15)}New Assignment</button>`)}
  <div class="grid cols-5" style="margin-bottom:20px">
    ${DATA.asgStats.map(s=>`
      <div class="card kpi"><div class="kpi-top"><span class="icon-tile ${s.tile}">${icon(s.icon,18)}</span>
        <span class="kpi-label">${s.label}</span></div><div class="kpi-val">${s.value}</div><div class="kpi-desc">${s.desc}</div></div>`).join('')}
  </div>
  <div class="card tbl-card">
    <div class="card-h"><h2>All Assignments</h2>
      <div class="right"><select class="select" style="width:auto" aria-label="Filter by course" onchange="App.asgCourse=this.value;renderRoute(true)">
        <option ${App.asgCourse==='All'?'selected':''}>All</option>
        ${[...new Set(DATA.assignments.map(a=>a.course))].map(c=>`<option ${App.asgCourse===c?'selected':''}>${c}</option>`).join('')}</select></div></div>
    ${list.length?`
    <div class="tbl-wrap"><table class="tbl" style="min-width:820px">
      <thead><tr><th>Assignment</th><th>Course</th><th>Deadline</th><th>Submissions</th><th>Average Score</th><th>Status</th><th></th></tr></thead>
      <tbody>${list.map(a=>`
        <tr><td><div class="cell-main">${esc(a.title)}</div></td><td><span class="chip">${a.course}</span></td>
          <td><span class="cell-sub">${a.due}</span></td>
          <td><div style="min-width:150px">${prog(Math.round(a.submitted/a.total*100),{val:false})}
            <span class="cell-sub">${a.submitted}/${a.total}</span></div></td>
          <td class="num" style="color:${a.avg<70?'var(--danger)':'inherit'}">${a.avg}%</td>
          <td>${a.status==='Open'?badge('info','Open'):a.status==='Grading'?badge('warn','Grading'):badge('success','Closed')}</td>
          <td class="act-cell"><div class="row-actions">
            <button class="icon-btn" style="width:30px;height:30px" aria-label="Review submissions" data-tip="Review submissions" onclick="toast('Submission viewer opened (demo)','info')">${icon('eye',15)}</button></div></td>
        </tr>`).join('')}</tbody></table></div>`
    :`<div class="tbl-wrap">${emptyState('list','No assignments found','No assignments match this course filter.','')}</div>`}
  </div>`;
};

/* ---------------- Analytics ---------------- */
Pages.analytics=()=>{
  const f=App.analytics;
  after(()=>{
    $$('#anFilters select').forEach(sel=>sel.onchange=()=>{
      f[sel.dataset.k]=sel.value;
      toast('Filters applied — charts updated','info');
      renderRoute(true);
    });
    $$('.ch-click').forEach(el=>el.onclick=()=>{
      const map={'Low Risk':'Low','Moderate Risk':'Moderate','High Risk':'High','Critical':'Critical'};
      App.studentFilters.risk=map[el.dataset.label]||'';
      App.studentFilters.page=1;
      location.hash='#/students';
    });
  });
  const deptJitter=f.dept==='All'?0:({CSE:0.06,EEE:-0.04,BBA:0.03,CIV:-0.07,ENG:0.09}[f.dept]||0);
  const adj=arr=>arr.map(v=>round1(v*(1+deptJitter)));
  const sem=DATA.semester;
  const labels=sem.labels;
  const gpa=adj(sem.gpa), att=adj(sem.attendance), pass=adj(sem.pass);
  const passRate=round1(92.6*(1+deptJitter)), failRate=round1(100-passRate);
  const risk=[Math.round(158*(1+deptJitter*2)),Math.round(72*(1-deptJitter)),Math.round(12*(1-deptJitter)),6];
  const kpis=[
    ['Average GPA',gpa[5].toFixed(2),'t-primary','award','Up 4.8% vs last year',true,'+'],
    ['Average Attendance',att[5]+'%','t-success','check','Up 1.6% vs last year',true,'+'],
    ['Pass Rate',passRate+'%','t-info','target','Up 2.2% vs last year',true,'+'],
    ['Failure Rate',failRate+'%','t-warn','file-x',deptJitter>0?'Improved this year':'Monitor closely',deptJitter<=0,'-'],
    ['At-Risk Students',String(risk.slice(2).reduce((a,b)=>a+b,0)),'t-danger','alert-triangle','3 new this week',false,'+']
  ];
  const top=`
  ${pageHead('Academic Analytics','Institution-wide performance intelligence for your departments.')}
  <div class="card" style="margin-bottom:20px" id="anFilters">
    <div class="filter-bar" style="border-bottom:0">
      <span class="filter-lbl">Academic Year</span>
      <select class="select" style="width:auto" data-k="year">
        ${['2025 – 2026','2024 – 2025','2023 – 2024'].map(y=>`<option ${f.year===y?'selected':''}>${y}</option>`).join('')}</select>
      <span class="filter-lbl">Department</span>
      <select class="select" style="width:auto" data-k="dept">
        <option ${f.dept==='All'?'selected':''}>All</option>
        ${Object.keys(DATA.depts).map(k=>`<option ${f.dept===k?'selected':''}>${k}</option>`).join('')}</select>
      <span class="filter-lbl">Program</span>
      <select class="select" style="width:auto"><option>All programs</option>${Object.values(DATA.programs).map(p=>`<option>${esc(p)}</option>`).join('')}</select>
      <span class="filter-lbl">Batch</span>
      <select class="select" style="width:auto"><option>All batches</option><option>2024</option><option>2023</option><option>2022</option></select>
      <span class="filter-lbl">Semester</span>
      <select class="select" style="width:auto"><option>All semesters</option>${[1,2,3,4,5,6,7,8].map(n=>`<option>Semester ${n}</option>`).join('')}</select>
    </div>
  </div>
  <div class="grid cols-5" style="margin-bottom:20px">
    ${kpis.map(([l,v,t,ic,d,good,dir])=>`
      <div class="card kpi"><div class="kpi-top"><span class="icon-tile ${t}">${icon(ic,18)}</span>
        <span class="kpi-label">${l}</span></div><div class="kpi-val">${v}</div>
        <div class="kpi-desc">${d}</div>${trendChip(dir==='+'?'+0.0':d,good)}</div>`).join('')}
  </div>`;
  window._anCtx={f,deptJitter,sem,labels,gpa,att,pass,passRate,failRate,risk,top};
  return analyticsCharts();
};

function analyticsCharts(){
  const {f,deptJitter,sem,labels,gpa,att,pass,passRate,failRate,risk,top}=window._anCtx;
  const coursePerf=DATA.courses.map(c=>({label:c.code,value:Math.round(c.passRate*(1+deptJitter))}));
  const deptComp=[['CSE',3.24,84],['EEE',3.11,81],['BBA',3.18,86],['CIV',2.97,79],['ENG',3.35,91]];
  const asgComp=DATA.courses.map(c=>({label:c.code,value:Math.round(70+(c.passRate-78)*1.4)}));
  return top+`
  <div class="grid-12">
    <div class="card c6">
      <div class="card-h"><h3>GPA Trend</h3><span class="ch-sub">Average GPA per semester</span></div>
      <div class="card-b">${Chart.line({labels,series:[{name:'Average GPA',values:gpa,color:cssVar('--primary')}],height:220})}</div>
    </div>
    <div class="card c6">
      <div class="card-h"><h3>Attendance Trend</h3><span class="ch-sub">Average attendance %</span></div>
      <div class="card-b">${Chart.line({labels,series:[{name:'Attendance',values:att,color:cssVar('--success')}],suffix:'%',height:220})}</div>
    </div>
    <div class="card c4">
      <div class="card-h"><h3>Pass / Fail Ratio</h3><span class="ch-sub">Current semester</span></div>
      <div class="card-b" style="text-align:center">
        ${Chart.donut({segments:[{label:'Pass',value:passRate,color:'var(--success)'},{label:'Fail',value:failRate,color:'var(--danger)'}],
          size:160,thickness:21,center:{value:passRate+'%',label:'Pass'}})}
        ${Chart.legend([{label:'Pass',value:passRate+'%',color:'var(--success)'},{label:'Fail',value:failRate+'%',color:'var(--danger)'}])}
      </div>
    </div>
    <div class="card c8">
      <div class="card-h"><h3>Course Performance</h3><span class="ch-sub">Pass rate by course${f.dept!=='All'?' · '+f.dept:''}</span></div>
      <div class="card-b">${Chart.bars({labels:coursePerf.map(c=>c.label),values:coursePerf.map(c=>c.value),
        suffix:'%',highlightBelow:80,height:225})}</div>
    </div>
    <div class="card c6">
      <div class="card-h"><h3>Department Comparison</h3><span class="ch-sub">Average CGPA and attendance</span></div>
      <div class="card-b">${Chart.groupBars({labels:deptComp.map(d=>d[0]),height:225,
        series:[{name:'Avg CGPA ×100',values:deptComp.map(d=>round1(d[1]*(1+deptJitter)*100)),color:cssVar('--primary')},
                {name:'Attendance %',values:deptComp.map(d=>d[2]),color:cssVar('--success')}]})}
      ${Chart.legend([{label:'Avg CGPA (×100)',value:'',color:cssVar('--primary')},{label:'Attendance %',value:'',color:cssVar('--success')}])}</div>
    </div>
    <div class="card c6">
      <div class="card-h"><h3>Risk Distribution</h3><span class="ch-sub">Students by risk category</span></div>
      <div class="card-b" style="text-align:center">
        ${Chart.donut({segments:DATA.riskMix.map((m,i)=>({...m,value:risk[i]})),size:160,thickness:21,clickable:true,
          center:{value:String(risk.reduce((a,b)=>a+b,0)),label:'Students'}})}
        ${Chart.legend(DATA.riskMix.map((m,i)=>({...m,value:risk[i]})))}
      </div>
    </div>
    <div class="card c12">
      <div class="card-h"><h3>Assignment Completion</h3><span class="ch-sub">Average completion rate by course</span></div>
      <div class="card-b">${Chart.bars({labels:asgComp.map(c=>c.label),values:asgComp.map(c=>c.value),
        suffix:'%',color:cssVar('--accent'),height:210})}</div>
    </div>
  </div>`;
}
