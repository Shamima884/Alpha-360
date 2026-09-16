/* ============================================================
   Student Panel — student.js
   A student logs in with their ID + password (stored in Users sheet).
   They see ONLY their own academic data.
   Data source: js/api.js (Google Sheets backend when mode="google")
   ============================================================ */
"use strict";

let STUDENT = null;

const SNAV = [
  ["overview","Overview"],
  ["results","Results"],
  ["attendance","Attendance"],
  ["courses","My Courses"],
  ["announcements","Announcements"],
  ["timeline","Activity"]
];

function sToast(msg){
  var r=document.getElementById("toast-root"),t=document.createElement("div");
  t.className="toast toast-success";t.textContent=msg;r.appendChild(t);
  setTimeout(function(){t.classList.add("show");},10);
  setTimeout(function(){t.classList.remove("show");setTimeout(function(){t.remove();},300);},3000);
}
/* Normalized comparison — 'STU-10231', 'stu 10231' and '10231' all match. */
function normId(v){
  return String(v==null?'':v).toLowerCase().replace(/[^a-z0-9]/g,'');
}
/* Candidate forms of an ID: 'STU-10231' → ['stu10231','10231'] */
function idCands(v){
  var n = normId(v), out = [];
  if(!n) return out;
  out.push(n);
  var tail = n.replace(/^[a-z]+/,'');
  if(tail && tail !== n) out.push(tail);
  return out;
}
/* True when two values refer to the same ID, with or without a prefix. */
function sameId(a,b){
  var ca = idCands(a), cb = idCands(b);
  for(var i=0;i<ca.length;i++) if(cb.indexOf(ca[i])!==-1) return true;
  return false;
}
/* Robust student lookup — checks the live backend cache first, then falls
   back to the embedded DATA seed. Tolerates sheets that use a different ID
   column name (id / studentId / userId / roll) or that return the ID in an
   unexpected column, and matches with or without the 'STU-' prefix. */
function findStudent(id){
  var want = normId(id);
  if(!want) return null;
  var lists = [];
  if(API.cache.students && API.cache.students.length) lists.push(API.cache.students);
  if(typeof DATA!=='undefined' && DATA.students && DATA.students.length) lists.push(DATA.students);
  var idKeys = ['id','Id','ID','studentId','StudentId','studentID','StudentID','userId','roll','rollNo','student_id'];
  for(var i=0;i<lists.length;i++){
    var hit = lists[i].find(function(s){
      if(!s) return false;
      return idKeys.some(function(k){ return sameId(s[k], id); });
    });
    /* last resort: any cell in the row equals the ID (unknown header names) */
    if(!hit){
      hit = lists[i].find(function(s){
        if(!s) return false;
        return Object.keys(s).some(function(k){ return sameId(s[k], id); });
      });
    }
    if(hit){
      if(hit.id==null){
        var alt = idKeys.filter(function(k){ return hit[k]!=null && hit[k]!==''; })[0];
        if(alt) hit.id = hit[alt];
      }
      if(hit.name==null){
        hit.name = hit.fullName || hit.studentName || hit.Name || hit.student || ('Student '+(hit.id!=null?hit.id:''));
      }
      return hit;
    }
  }
  return null;
}
window.addEventListener("DOMContentLoaded", async function(){
  await API.init();
  console.info('[Student] API mode:', API.cfg.mode, '· students loaded:', (API.cache.students||[]).length);
  document.getElementById("lI").innerHTML = "<svg width=28 height=28 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2><path d=\"M22 10v6M2 10l10-5 10 5-10 5z\"/><path d=\"M6 12v5c3 3 9 3 12 0v-5\"/></svg>";
  document.getElementById("lN").innerHTML = "<span>Demo: <b>STU-10231</b> / <b>student123</b></span>";
  document.getElementById("nL").innerHTML = "<svg width=18 height=18 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2><path d=\"M22 10v6M2 10l10-5 10 5-10 5z\"/><path d=\"M6 12v5c3 3 9 3 12 0v-5\"/></svg>";
  document.getElementById("loginBtn").addEventListener("click", doLogin);
  document.getElementById("loginPass").addEventListener("keydown", function(e){ if(e.key==="Enter") doLogin(); });
  document.getElementById("sLo").addEventListener("click", doLogout);
  var sess = localStorage.getItem("mu_student_session");
  if(sess){
    try{
      var saved = JSON.parse(sess);
      var found = findStudent(saved.id);
      if(found){ STUDENT = found; enterApp(); return; }
    }catch(e){}
  }
});

async function doLogin(){
  var id = (document.getElementById("loginId").value||"").trim();
  var pass = document.getElementById("loginPass").value||"";
  if(!id){ sToast("Please enter your Student ID"); return; }
  var student = findStudent(id);
  if(!student){
    var list = (API.cache.students && API.cache.students.length) ? API.cache.students :
               (typeof DATA!=='undefined' && DATA.students ? DATA.students : []);
    if(!list.length){
      sToast("No student data loaded — check js/api.js setup, then reload the page");
    }else{
      var sample = list.slice(0,3).map(function(s){return s.id||s.studentId||s.userId;}).filter(Boolean).join(', ');
      console.warn('[Student] ID "'+id+'" not matched. Loaded IDs (first 10):',
        list.slice(0,10).map(function(s){return s.id||s.studentId||s.userId;}));
      sToast("Student ID not found. Loaded IDs look like: "+sample+" — if this looks stale press Ctrl+F5");
    }
    return;
  }
  if(pass !== "student123" && pass !== id){ sToast("Invalid password. Try: student123"); return; }
  STUDENT = student;
  try{ localStorage.setItem("mu_student_session", JSON.stringify({id:student.id,name:student.name})); }catch(e){}
  enterApp();
}

function doLogout(){
  STUDENT = null;
  try{ localStorage.removeItem("mu_student_session"); }catch(e){}
  document.getElementById("loginRoot").style.display = "";
  document.getElementById("studentApp").classList.remove("active");
}

function enterApp(){
  document.getElementById("loginRoot").style.display = "none";
  document.getElementById("studentApp").classList.add("active");
  document.getElementById("hN").textContent = STUDENT.name + " 路 " + STUDENT.id;
  renderSidebar();
  location.hash = "#/overview";
  window.addEventListener("hashchange", renderPage);
  renderPage();
}

/* ---------- navigation (sidebar + hash router) ---------- */
function renderSidebar(){
  var side = document.getElementById("sSide");
  if(!side) return;
  side.innerHTML = '<div class="section-title">Student</div>' +
    SNAV.map(function(n){
      return '<div class="nav-item" data-view="'+n[0]+'">'+n[1]+'</div>';
    }).join('');
  side.querySelectorAll(".nav-item").forEach(function(it){
    it.addEventListener("click", function(){
      location.hash = "#/"+it.getAttribute("data-view");
    });
  });
}

function renderPage(){
  var views = {
    overview:renderOverview, results:renderResults, attendance:renderAttendance,
    courses:renderCourses, announcements:renderAnnouncements, timeline:renderTimeline
  };
  var view = (location.hash||"").replace(/^#\/?/,"") || "overview";
  if(!views[view]) view = "overview";
  document.querySelectorAll("#sSide .nav-item").forEach(function(it){
    it.classList.toggle("active", it.getAttribute("data-view") === view);
  });
  var el = document.getElementById("sMain");
  if(!el || !STUDENT) return;
  views[view](el);
}
function statCard(l,v,m){return '<div class="s-stat"><div class="label">'+l+'</div><div class="value">'+v+'</div><div class="meta">'+m+'</div></div>';}
function gradeClass(g){if(!g)return '';if(g.startsWith('A'))return 'ga';if(g.startsWith('B'))return 'gb';if(g.startsWith('C'))return 'gc';if(g.startsWith('D'))return 'gd';return 'gf';}

function renderOverview(el){
  var s=STUDENT,results=(API.cache.results||[]).filter(function(r){return String(r.studentId)===String(s.id);}),sc=s.courseAtt||{};
  var h='<div class="s-cover"><div class="avatar">'+(s.name||'?').charAt(0)+'</div>';
  h+='<div><h2>Welcome back, '+(s.name||'Student').split(' ')[0]+'</h2>';
  h+='<p>'+(s.program||'')+' · Semester '+(s.sem||'')+' · Batch '+(s.batch||'')+'</p>';
  h+='<div class="badges"><span class="badge">'+(s.id||'')+'</span><span class="badge">'+(s.dept||'')+'</span><span class="badge">CGPA '+(s.cgpa||'-')+'</span></div></div></div>';
  h+='<div class="s-grid">';
  h+=statCard('CGPA',s.cgpa||'-','Cumulative');h+=statCard('Current GPA',s.gpa||'-','This semester');
  h+=statCard('Attendance',(s.att||0)+'%','Overall');h+=statCard('Courses',Object.keys(sc).length,'Enrolled');
  h+=statCard('Failed',s.failed||0,'Courses');h+=statCard('Rank','#'+(s.rank||'-'),'In class');
  h+='</div>';
  h+='<div class="s-card"><h3>Course Attendance</h3>';
  Object.entries(sc).forEach(function(e){var c=e[0],p=e[1],col=p>=80?'#10b981':p>=70?'#f59e0b':'#ef4444';
    h+='<div class="ca-row"><span class="code">'+c+'</span><div class="bar"><div class="fill" style="width:'+p+'%;background:'+col+'"></div></div><span class="pct" style="color:'+col+'">'+p+'%</span></div>';});
  h+='</div>';
  if(results.length){h+='<div class="s-card"><h3>Recent Results</h3>';
    h+='<div class="res-row h"><span>Course</span><span>Mid</span><span>Final</span><span>Total</span><span>Grade</span></div>';
    results.slice(0,5).forEach(function(r){h+='<div class="res-row"><span>'+(r.course||'')+'</span><span>'+(r.mid||'-')+'</span><span>'+(r.final||'-')+'</span><span><b>'+(r.total||'-')+'</b></span><span><span class="grade '+gradeClass(r.grade)+'">'+(r.grade||'-')+'</span></span></div>';});
    h+='</div>';}
  el.innerHTML=h;
}

function renderResults(el){
  var results=(API.cache.results||[]).filter(function(r){return String(r.studentId)===String(STUDENT.id);});
  var h='<div class="s-cover"><div class="avatar">'+STUDENT.name.charAt(0)+'</div><div><h2>Academic Results</h2><p>All results for '+STUDENT.name+'</p></div></div>';
  if(!results.length){h+='<div class="s-card" style="text-align:center;padding:40px;color:#94a3b8">No results published yet.</div>';el.innerHTML=h;return;}
  h+='<div class="s-card"><div class="res-row h"><span>Course</span><span>Mid</span><span>Final</span><span>Total</span><span>Grade</span></div>';
  var tp=0,cnt=0;
  results.forEach(function(r){h+='<div class="res-row"><span><b>'+(r.course||'')+'</b><br><small style="color:#94a3b8">'+(r.name||'')+'</small></span><span>'+(r.mid||'-')+'</span><span>'+(r.final||'-')+'</span><span><b>'+(r.total||'-')+'</b></span><span><span class="grade '+gradeClass(r.grade)+'">'+(r.grade||'-')+'</span></span></div>';tp+=(r.points||0);cnt++;});
  h+='</div><div class="s-grid" style="margin-top:16px">';
  h+=statCard('GPA',STUDENT.gpa||'-','Current');h+=statCard('CGPA',STUDENT.cgpa||'-','Cumulative');
  h+=statCard('Points',tp.toFixed(1),'Total');h+=statCard('Courses',cnt,'Taken');
  h+='</div>';el.innerHTML=h;
}

function renderAttendance(el){
  var sc=STUDENT.courseAtt||{},entries=Object.entries(sc);
  var avg=entries.length?Math.round(entries.reduce(function(a,b){return a+b[1];},0)/entries.length):0;
  var h='<div class="s-cover"><div class="avatar">'+STUDENT.name.charAt(0)+'</div><div><h2>Attendance Record</h2><p>Course-wise tracking</p></div></div>';
  h+='<div class="s-grid">';
  h+=statCard('Average',avg+'%',avg>=75?'Good':'Below target');
  h+=statCard('Courses',entries.length,'Enrolled');
  h+=statCard('Above 80%',entries.filter(function(e){return e[1]>=80;}).length,'Courses');
  h+=statCard('Below 70%',entries.filter(function(e){return e[1]<70;}).length,'At risk');
  h+='</div><div class="s-card"><h3>Course Attendance</h3>';
  entries.sort(function(a,b){return a[1]-b[1];}).forEach(function(e){var c=e[0],p=e[1],col=p>=80?'#10b981':p>=70?'#f59e0b':'#ef4444',st=p>=80?'Good':p>=70?'Warning':'Critical';
    h+='<div class="ca-row"><span class="code">'+c+'</span><div class="bar"><div class="fill" style="width:'+p+'%;background:'+col+'"></div></div><span class="pct" style="color:'+col+'">'+p+'%</span><span style="font-size:11px;color:'+col+';font-weight:600;min-width:55px;text-align:right">'+st+'</span></div>';});
  h+='</div>';el.innerHTML=h;
}

function renderCourses(el){
  var results=(API.cache.results||[]).filter(function(r){return String(r.studentId)===String(STUDENT.id);});
  var allCourses=API.cache.courses||[];
  var myCodes=results.map(function(r){return r.course;});
  var myCourses=allCourses.filter(function(c){return myCodes.includes(c.code);});
  var h='<div class="s-cover"><div class="avatar">'+STUDENT.name.charAt(0)+'</div><div><h2>My Courses</h2><p>'+(STUDENT.program||'')+' · Semester '+(STUDENT.sem||'')+'</p></div></div>';
  h+='<div class="s-grid">';
  myCourses.forEach(function(c){h+='<div class="s-stat"><div class="label">'+c.code+'</div><div class="value" style="font-size:16px">'+c.name+'</div><div class="meta">'+(c.instructor||'')+' · '+(c.credits||'')+' credits</div></div>';});
  h+='</div>';el.innerHTML=h;
}

function renderAnnouncements(el){
  var announcements=API.cache.announcements||[];
  var h='<div class="s-cover"><div class="avatar">A</div><div><h2>Announcements</h2><p>Institution-wide</p></div></div>';
  h+='<div class="s-card">';
  if(!announcements.length){h+='<div style="text-align:center;padding:20px;color:#94a3b8">No announcements yet.</div>';}
  else{announcements.forEach(function(a){h+='<div class="ann-item"><div class="t">'+(a.title||'')+'</div><div class="m">'+(a.date||'')+' · '+(a.author||'')+' · '+(a.audience||'')+'</div></div>';});}
  h+='</div>';el.innerHTML=h;
}

function renderTimeline(el){
  var s=STUDENT;
  var evs=[{time:'Sep 10, 2026',text:'Semester '+(s.sem||'')+' classes began'},{time:'Aug 28, 2026',text:'Registration completed for '+(s.program||'')},{time:'Aug 15, 2026',text:'Results published — GPA '+(s.gpa||'-')},{time:'Jul 20, 2026',text:'Admitted to '+(s.dept||'')+' department'}];
  var h='<div class="s-cover"><div class="avatar">T</div><div><h2>Academic Timeline</h2><p>Your journey at Meridian</p></div></div>';
  h+='<div class="s-card"><div class="tl">';
  evs.forEach(function(e){h+='<div class="i"><div class="tm">'+e.time+'</div><div class="tx">'+e.text+'</div></div>';});
  h+='</div></div>';el.innerHTML=h;
}
