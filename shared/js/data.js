/* ============================================================
   Meridian Faculty 360 — Sample institutional data (fictional)
   ============================================================ */
'use strict';

const DATA = {};

DATA.institution = { name:'Meridian University', portal:'Faculty Portal', facultyName:'Dr. Sarah Mitchell',
  facultyRole:'Professor · Computer Science & Engineering', semester:'Fall Semester 2026' };

DATA.depts = {
  CSE:'Computer Science & Engineering',
  EEE:'Electrical & Electronic Engineering',
  BBA:'Business Administration',
  CIV:'Civil Engineering',
  ENG:'English Literature'
};
DATA.programs = {
  CSE:'B.Sc. Computer Science', EEE:'B.Sc. Electrical Engineering', BBA:'Bachelor of Business Administration',
  CIV:'B.Sc. Civil Engineering', ENG:'B.A. English Literature'
};

DATA.courses = [
  {code:'CSE101', name:'Introduction to Programming', credits:3, dept:'CSE', instructor:'Dr. S. Malik',  avgGrade:'B+', passRate:92, students:55},
  {code:'CSE205', name:'Data Structures & Algorithms',credits:3, dept:'CSE', instructor:'Prof. A. Karim', avgGrade:'B',  passRate:84, students:48},
  {code:'MAT201', name:'Calculus II',                 credits:3, dept:'CSE', instructor:'Dr. L. Fernandes',avgGrade:'C+', passRate:78, students:52},
  {code:'PHY101', name:'Physics I',                   credits:4, dept:'EEE', instructor:'Dr. H. Bauer',    avgGrade:'B-', passRate:86, students:46},
  {code:'ENG105', name:'Academic Writing',            credits:2, dept:'ENG', instructor:'Ms. R. Whitfield',avgGrade:'A-', passRate:95, students:40},
  {code:'BUS210', name:'Principles of Management',    credits:3, dept:'BBA', instructor:'Dr. C. Mensah',   avgGrade:'B+', passRate:90, students:44},
  {code:'EEE201', name:'Circuit Analysis',            credits:3, dept:'EEE', instructor:'Dr. N. Iqbal',    avgGrade:'B',  passRate:81, students:44}
];

/* id, name, dept, batch, semester, cgpa, attendance%, failedCourses, lastActivity */
const RAW_STUDENTS = [
  ['STU-10231','Rahim Ahmed',      'CSE',2024,5,2.41,68,2,'2h ago'],
  ['STU-10232','Ayesha Rahman',    'CSE',2024,5,3.78,94,0,'25m ago'],
  ['STU-10234','Farhan Ali',       'CSE',2024,5,3.02,84,0,'1h ago'],
  ['STU-10236','Mei Lin',          'CSE',2024,5,3.36,89,0,'2h ago'],
  ['STU-10240','Daniel Chen',      'EEE',2023,6,3.42,88,0,'1h ago'],
  ['STU-10244','Maria Santos',     'BBA',2024,4,2.96,76,1,'3h ago'],
  ['STU-10248','Omar Farouk',      'CSE',2023,6,2.63,69,1,'1h ago'],
  ['STU-10252','Priya Sharma',     'CSE',2024,5,3.65,91,0,'40m ago'],
  ['STU-10255','Jamal Williams',   'EEE',2022,7,2.28,58,3,'1d ago'],
  ['STU-10258','Fatima Al-Sayed',  'BBA',2023,5,3.51,85,0,'2h ago'],
  ['STU-10261','Kofi Mensah',      'CIV',2023,6,3.12,80,0,'5h ago'],
  ['STU-10263','Emily Thompson',   'ENG',2024,4,3.33,83,0,'1h ago'],
  ['STU-10267','Arjun Patel',      'CSE',2024,5,2.87,73,1,'4h ago'],
  ['STU-10270','Sara Nguyen',      'EEE',2024,5,3.05,78,0,'2h ago'],
  ['STU-10274','Tomas Herrera',    'CIV',2022,7,2.45,66,2,'1d ago'],
  ['STU-10277','Leila Hassan',     'BBA',2024,4,3.24,86,0,'3h ago'],
  ['STU-10281','Ibrahim Diallo',   'EEE',2023,6,3.38,90,0,'1h ago'],
  ['STU-10284','Chen Wei',         'CSE',2022,8,3.58,93,0,'30m ago'],
  ['STU-10286','Anika Chowdhury',  'CSE',2023,6,3.19,81,0,'6h ago'],
  ['STU-10289','Muhammad Usman',   'CIV',2024,4,2.72,71,1,'1d ago'],
  ['STU-10292','Grace Okafor',     'ENG',2023,5,3.44,87,0,'2h ago'],
  ['STU-10296','Yusuf Karim',      'BBA',2022,8,2.35,62,2,'1d ago'],
  ['STU-10299','Hana Suzuki',      'EEE',2024,5,3.71,95,0,'15m ago'],
  ['STU-10302','David Mwangi',     'CIV',2024,4,2.98,77,1,'5h ago'],
  ['STU-10305','Isabella Rossi',   'ENG',2024,4,3.29,84,0,'2h ago'],
  ['STU-10308','Nadia Islam',      'CSE',2024,5,2.58,68,1,'8h ago'],
  ['STU-10311','Lucas Silva',      'EEE',2023,6,3.08,79,0,'1h ago'],
  ['STU-10314','Zahra Hosseini',   'BBA',2023,5,3.15,82,0,'4h ago']
];

function seedRng(str){ let s=0; for(let i=0;i<str.length;i++) s=(s*31+str.charCodeAt(i))>>>0;
  return ()=>{ s=(s*9301+49297)%233280; return s/233280; }; }
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const round1=v=>Math.round(v*10)/10;
const round2=v=>Math.round(v*100)/100;

function riskFor(cgpa,att,failed){
  if(att<60 && cgpa<2.3) return 'Critical';
  if(att<70 || cgpa<2.5 || failed>=2) return 'High';
  if(att<80 || cgpa<2.9 || failed>=1) return 'Moderate';
  return 'Low';
}
const DEPT_COURSES={
  CSE:['CSE101','CSE205','MAT201','PHY101'], EEE:['EEE201','PHY101','MAT201','CSE101'],
  BBA:['BUS210','ENG105','MAT201','CSE101'], CIV:['PHY101','MAT201','BUS210','ENG105'],
  ENG:['ENG105','BUS210','MAT201','PHY101']
};

function buildStudents(){
  return RAW_STUDENTS.map(r=>{
    const [id,name,dept,batch,sem,cgpa,att,failed,last]=r;
    const rng=seedRng(id);
    const gpaOffsets=[-0.26,-0.19,-0.13,-0.08,-0.04,0];
    const gpaTrend=gpaOffsets.slice(6-sem).map(o=>round2(clamp(cgpa+o+(rng()-.5)*.06,0.5,4)));
    gpaTrend[gpaTrend.length-1]=cgpa;
    let courseAtt;
    if(id==='STU-10231'){ courseAtt={CSE101:82,CSE205:61,MAT201:73,PHY101:55}; }
    else{
      courseAtt={};
      DEPT_COURSES[dept].forEach((c,i)=>{ courseAtt[c]=Math.round(clamp(att+[-13,-7,3,8][i]+(rng()-.5)*10,42,99)); });
    }
    return {
      id,name,dept,batch,sem,cgpa,att,failed,last,
      email:name.toLowerCase().replace(/[^a-z]+/g,'.')+'@meridian.edu',
      program:DATA.programs[dept],
      gpa:round2(clamp(cgpa+(cgpa<2.6?-(0.15+rng()*.15):(0.05+rng()*.2)),0.5,4)),
      prevGpa:round2(clamp(cgpa+(cgpa<2.6?(0.08+rng()*.1):-(rng()*.12)),0.5,4)),
      risk:riskFor(cgpa,att,failed),
      gpaTrend,courseAtt,
      rank:1+Math.round(rng()*40),
      passed:18+Math.round(rng()*14),
      status:'Active'
    };
  });
}
DATA.students=buildStudents();
DATA.studentById=id=>DATA.students.find(s=>s.id===id);
/* ============================================================
   Operational sample data — attendance, exams, alerts, etc.
   ============================================================ */

DATA.kpis=[
  {label:'Total Students', value:'248', icon:'users',   tile:'t-primary', desc:'Across 5 departments', delta:'4.2% from last semester', dir:'up',   good:true,  spark:[230,236,239,241,244,248]},
  {label:'Average Attendance', value:'82.4%', icon:'check', tile:'t-success', desc:'Required threshold 75%', delta:'1.6% from last semester', dir:'up', good:true, spark:[79,79.8,80.6,81.9,81.2,82.4]},
  {label:'Average CGPA', value:'3.21', icon:'award', tile:'t-accent', desc:'Scale of 4.00', delta:'4.8% from previous semester', dir:'up', good:true, spark:[2.98,3.02,3.05,3.11,3.08,3.21]},
  {label:'At Risk', value:'18', icon:'alert-triangle', tile:'t-danger', desc:'Requires early intervention', delta:'3 new this week', dir:'up', good:false, spark:[9,11,12,14,15,18]},
  {label:'Failed Courses', value:'24', icon:'file-x', tile:'t-warn', desc:'This academic session', delta:'12.5% from last semester', dir:'down', good:true, spark:[38,36,33,30,27,24]},
  {label:'Pending Reviews', value:'7', icon:'clock', tile:'t-info', desc:'Results & observations', delta:'2 added today', dir:'up', good:false, spark:[3,4,4,5,5,7]}
];

DATA.semester={
  labels:['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6'],
  gpa:[2.98,3.02,3.05,3.11,3.08,3.21],
  attendance:[78.5,79.8,80.6,81.9,81.2,82.4],
  pass:[86.2,88.0,89.1,91.0,90.4,92.6],
  classGpa:[2.86,2.9,2.95,2.99,3.01,3.05]
};

DATA.attendanceMix=[
  {label:'Present', value:82.4, color:'var(--success)'},
  {label:'Absent',  value:9.1,  color:'var(--danger)'},
  {label:'Late',    value:5.3,  color:'var(--warn)'},
  {label:'Excused', value:3.2,  color:'var(--info)'}
];

DATA.riskMix=[
  {label:'Low Risk',      value:158, color:'var(--success)'},
  {label:'Moderate Risk', value:72,  color:'var(--warn)'},
  {label:'High Risk',     value:12,  color:'var(--danger)'},
  {label:'Critical',      value:6,   color:'var(--accent)'}
];

DATA.activity=[
  {time:'09:42 AM', type:'result',      title:'Result added for CSE101',      desc:'Final examination results published — 55 students', tone:'t-success'},
  {time:'09:15 AM', type:'attendance',  title:'Attendance marked for CSE205', desc:'Section A · 44 present · 3 late · 1 absent', tone:''},
  {time:'08:50 AM', type:'assignment',  title:'12 submissions received',      desc:'CSE205 · Graph Traversal Report', tone:''},
  {time:'Yesterday',type:'alert',       title:'3 students flagged',           desc:'Attendance warning — below 70% threshold', tone:'t-warn'},
  {time:'Yesterday',type:'observation', title:'Faculty observation added',    desc:'Rahim Ahmed — engaged well in group activity', tone:''},
  {time:'Yesterday',type:'result',      title:'Midterm results approved',     desc:'MAT201 · published to student portal', tone:'t-success'},
  {time:'Mon',      type:'support',     title:'Support follow-up scheduled',  desc:'Jamal Williams · counseling session, Thu 2:00 PM', tone:'t-info'},
  {time:'Mon',      type:'achievement', title:'Dean\u2019s List published',   desc:'14 students from your departments qualified', tone:'t-success'}
];
DATA.attRoster=[
  {id:'STU-10231',name:'Rahim Ahmed',      status:'P',overall:68},
  {id:'STU-10232',name:'Ayesha Rahman',    status:'P',overall:94},
  {id:'STU-10234',name:'Farhan Ali',       status:'L',overall:84},
  {id:'STU-10236',name:'Mei Lin',          status:'P',overall:89},
  {id:'STU-10248',name:'Omar Farouk',      status:'A',overall:69},
  {id:'STU-10252',name:'Priya Sharma',     status:'P',overall:91},
  {id:'STU-10267',name:'Arjun Patel',      status:'A',overall:73},
  {id:'STU-10308',name:'Nadia Islam',      status:'L',overall:68},
  {id:'STU-10284',name:'Chen Wei',         status:'P',overall:93},
  {id:'STU-10286',name:'Anika Chowdhury',  status:'P',overall:81}
];

DATA.exams=[
  {name:'Midterm Examination', course:'CSE205', date:'Mar 14, 2026', students:48, status:'Scheduled', results:'—'},
  {name:'Quiz 2',              course:'MAT201', date:'Mar 18, 2026', students:52, status:'Scheduled', results:'—'},
  {name:'Practical Assessment',course:'PHY101', date:'Mar 21, 2026', students:46, status:'Scheduled', results:'—'},
  {name:'Final Examination',   course:'CSE101', date:'Jan 12, 2026', students:55, status:'Completed', results:'Pending review'},
  {name:'Midterm Examination', course:'EEE201', date:'Feb 20, 2026', students:44, status:'Completed', results:'Pending results'},
  {name:'Group Presentation',  course:'ENG105', date:'Feb 26, 2026', students:40, status:'Completed', results:'Published'},
  {name:'Midterm Examination', course:'MAT201', date:'Feb 02, 2026', students:52, status:'Completed', results:'Published'}
];

DATA.resultRows=[
  {id:'STU-10232',name:'Ayesha Rahman',   asg:9.5, mid:27, fin:56},
  {id:'STU-10252',name:'Priya Sharma',    asg:9,   mid:26, fin:54},
  {id:'STU-10284',name:'Chen Wei',        asg:10,  mid:28, fin:57},
  {id:'STU-10286',name:'Anika Chowdhury', asg:8,   mid:24, fin:49},
  {id:'STU-10234',name:'Farhan Ali',      asg:8.5, mid:22, fin:46},
  {id:'STU-10267',name:'Arjun Patel',     asg:7,   mid:19, fin:41},
  {id:'STU-10308',name:'Nadia Islam',     asg:6,   mid:16, fin:35},
  {id:'STU-10231',name:'Rahim Ahmed',     asg:5,   mid:14, fin:31}
];

DATA.assignments=[
  {title:'Graph Traversal Report',    course:'CSE205', due:'Mar 12, 2026', submitted:42, total:48, avg:78, status:'Open'},
  {title:'Binary Tree Coding Task',   course:'CSE205', due:'Mar 05, 2026', submitted:48, total:48, avg:81, status:'Grading'},
  {title:'Loops & Functions Lab',     course:'CSE101', due:'Feb 28, 2026', submitted:55, total:55, avg:84, status:'Grading'},
  {title:'Integration Problem Set 4', course:'MAT201', due:'Mar 10, 2026', submitted:39, total:52, avg:64, status:'Open'},
  {title:'Lab Report 4: Oscillations',course:'PHY101', due:'Mar 08, 2026', submitted:41, total:46, avg:73, status:'Open'},
  {title:'Argumentative Essay Draft', course:'ENG105', due:'Feb 21, 2026', submitted:40, total:40, avg:88, status:'Closed'},
  {title:'Case Study: Market Entry',  course:'BUS210', due:'Mar 15, 2026', submitted:28, total:44, avg:76, status:'Open'},
  {title:'Circuit Simulation Task',   course:'EEE201', due:'Feb 26, 2026', submitted:44, total:44, avg:79, status:'Closed'}
];
DATA.asgStats=[
  {label:'Total Assignments',value:'14',tile:'t-primary',icon:'list',  desc:'This semester'},
  {label:'Pending',          value:'5', tile:'t-warn',   icon:'clock', desc:'Awaiting submission'},
  {label:'Submitted',        value:'96',tile:'t-success',icon:'check', desc:'On-time submissions'},
  {label:'Late',             value:'12',tile:'t-accent', icon:'clock', desc:'After deadline'},
  {label:'Missing',          value:'9', tile:'t-danger', icon:'x',     desc:'No submission yet'}
];
DATA.alerts=[
  {id:1, sev:'High',     student:'Rahim Ahmed',    sid:'STU-10231', cat:'Attendance', msg:'Attendance dropped below 70% — now 68% in CSE205.',   time:'2 hours ago',  status:'Open'},
  {id:2, sev:'High',     student:'Jamal Williams', sid:'STU-10255', cat:'Academic',   msg:'GPA fell below 2.30 for two consecutive semesters.',  time:'5 hours ago',  status:'Open'},
  {id:3, sev:'Moderate', student:'Maria Santos',   sid:'STU-10244', cat:'Assignment', msg:'3 late submissions in a row for CSE205 assignments.', time:'Yesterday',    status:'Open'},
  {id:4, sev:'High',     student:'Yusuf Karim',    sid:'STU-10296', cat:'Attendance', msg:'Missed 4 consecutive sessions of BUS210.',            time:'Yesterday',    status:'Review Required'},
  {id:5, sev:'Moderate', student:'Arjun Patel',    sid:'STU-10267', cat:'Academic',   msg:'Midterm score 38/60 in MAT201 — below class average.',time:'2 days ago',   status:'Open'},
  {id:6, sev:'Low',      student:'Sara Nguyen',    sid:'STU-10270', cat:'Attendance', msg:'Attendance trending down 6% over the last month.',    time:'2 days ago',   status:'Open'},
  {id:7, sev:'High',     student:'Nadia Islam',    sid:'STU-10308', cat:'Academic',   msg:'2 failed courses — academic probation review required.',time:'3 days ago', status:'Review Required'},
  {id:8, sev:'Moderate', student:'Tomas Herrera',  sid:'STU-10274', cat:'Student Support', msg:'Advisor flagged low campus engagement this month.',time:'3 days ago', status:'Open'},
  {id:9, sev:'Low',      student:'Muhammad Usman', sid:'STU-10289', cat:'Assignment', msg:'Late submission streak — 3 assignments after deadline.',time:'4 days ago', status:'Resolved'},
  {id:10,sev:'Critical', student:'Jamal Williams', sid:'STU-10255', cat:'Attendance', msg:'No campus activity recorded for 9 consecutive days.', time:'5 days ago',   status:'Escalated'}
];

DATA.notifications=[
  {id:1, cat:'Academic',        icon:'file-text', unread:true,  title:'Final results approved',     desc:'CSE101 final examination results were approved and published.', time:'09:42 AM'},
  {id:2, cat:'Attendance',      icon:'check',     unread:true,  title:'Attendance below threshold', desc:'Rahim Ahmed and 2 others fell below the 75% threshold.',        time:'08:55 AM'},
  {id:3, cat:'Assignments',     icon:'list',      unread:true,  title:'New submissions',            desc:'12 submissions received for “Graph Traversal Report”.',         time:'08:50 AM'},
  {id:4, cat:'Student Support', icon:'heart',     unread:false, title:'Follow-up reminder',         desc:'Counseling follow-up for Jamal Williams — Thu 2:00 PM.',        time:'Yesterday'},
  {id:5, cat:'System',          icon:'shield',    unread:false, title:'Scheduled maintenance',      desc:'Student information system offline Sunday, 2:00–4:00 AM.',      time:'Yesterday'},
  {id:6, cat:'Academic',        icon:'award',     unread:false, title:'Grade submission deadline',  desc:'EEE201 midterm grades are due by Friday, 5:00 PM.',             time:'2 days ago'},
  {id:7, cat:'Assignments',     icon:'clock',     unread:false, title:'Deadline approaching',       desc:'“Integration Problem Set 4” closes in 2 days — 39 of 52 in.',   time:'2 days ago'},
  {id:8, cat:'Student Support', icon:'user',      unread:false, title:'Observation acknowledged',   desc:'Your observation for Rahim Ahmed was acknowledged by the advisor.', time:'3 days ago'}
];

DATA.reports=[
  {icon:'user',           tile:'t-primary', name:'Student 360° Report',         desc:'Complete academic, attendance, and engagement profile for one student.'},
  {icon:'check',          tile:'t-success', name:'Attendance Report',           desc:'Daily and cumulative attendance by course, section, and student.'},
  {icon:'chart',          tile:'t-accent',  name:'Academic Performance Report', desc:'GPA trends, grade distributions, and class comparisons.'},
  {icon:'building',       tile:'t-info',    name:'Department Performance',      desc:'Cross-department comparison of pass rates and average CGPA.'},
  {icon:'alert-triangle', tile:'t-danger',  name:'At-Risk Student Report',      desc:'Students flagged by early-warning rules with reasons and history.'},
  {icon:'file-text',      tile:'t-warn',    name:'Examination Report',          desc:'Exam schedules, completion status, and result summaries.'}
];
DATA.recentReports=[
  {name:'Attendance Report — CSE205 (Feb)', by:'Dr. Sarah Mitchell', date:'Mar 06, 2026', fmt:'PDF'},
  {name:'At-Risk Student Report — CSE',     by:'Advisor Office',     date:'Mar 01, 2026', fmt:'Excel'},
  {name:'Department Performance — Q3',      by:'Registrar',          date:'Feb 18, 2026', fmt:'PDF'}
];
/* ---- Per-student derived records ---- */
DATA.examsFor=s=>{
  const rng=seedRng(s.id+'ex'), base=(s.cgpa/4)*100;
  return [
    {exam:'Midterm — CSE205', date:'Feb 10, 2026', score:Math.round(clamp(base+(rng()-.4)*14,10,100)), max:60,  weight:'30%'},
    {exam:'Quiz 1 — CSE205',  date:'Jan 22, 2026', score:Math.round(clamp(base+(rng()-.3)*12,10,100)), max:20,  weight:'10%'},
    {exam:'Midterm — MAT201', date:'Feb 02, 2026', score:Math.round(clamp(base+(rng()-.5)*18,10,100)), max:60,  weight:'30%'},
    {exam:'Lab — PHY101',     date:'Jan 30, 2026', score:Math.round(clamp(base+(rng()-.25)*10,10,100)),max:40,  weight:'20%'},
    {exam:'Final — CSE101',   date:'Jan 12, 2026', score:Math.round(clamp(base+(rng()-.35)*14,10,100)),max:100, weight:'40%'}
  ];
};
DATA.assignmentsFor=s=>{
  const titles=[['Graph Traversal Report','CSE205'],['Binary Tree Coding Task','CSE205'],
    ['Loops & Functions Lab','CSE101'],['Integration Problem Set 4','MAT201'],
    ['Lab Report 4: Oscillations','PHY101'],['Reading Response 3','ENG105']];
  const rng=seedRng(s.id+'asg');
  return titles.map((t,i)=>{
    const r=rng(); let status='Submitted', score=Math.round(clamp((s.cgpa/4)*100+(rng()-.4)*16,20,100));
    if(s.risk!=='Low'&&r<.3){status='Missing';score=null;}
    else if(r>.82){status='Late';score=Math.round(clamp(score-8,20,100));}
    return {title:t[0],course:t[1],due:['Mar 12','Mar 05','Feb 28','Mar 10','Mar 08','Feb 21'][i]+', 2026',status,score};
  });
};
DATA.observationsFor=s=>{
  const pool=[
    {date:'Mar 04, 2026', author:'Dr. S. Mitchell', note:'Participated actively in today\u2019s group problem-solving session.'},
    {date:'Feb 24, 2026', author:'Prof. A. Karim',  note:'Asked for an extension on the coding task — cited workload overlap.'},
    {date:'Feb 10, 2026', author:'Dr. S. Mitchell', note:s.risk==='Low'
      ?'Consistently well prepared; helped peers during the lab session.'
      :'Seemed less engaged than usual during the lecture; a check-in may help.'}
  ];
  return pool;
};
DATA.achievementsFor=s=>{
  const list=[{date:'Feb 2026', title:'Hackathon Finalist', desc:'Team reached the final round of the university CodeSprint hackathon.'}];
  if(s.cgpa>=3.6)list.push({date:'Jan 2026', title:'Dean\u2019s List', desc:'Placed on the Dean\u2019s List for outstanding academic performance.'});
  if(s.risk!=='Low')list.push({date:'Dec 2025', title:'Most Improved — MAT201', desc:'Recognized for steady improvement after the remedial workshop.'});
  list.push({date:'Nov 2025', title:'Peer Mentor Volunteer', desc:'Volunteered as a peer mentor for first-year orientation.'});
  return list;
};
DATA.timelineFor=s=>{
  const t=[];
  DATA.examsFor(s).slice(0,3).forEach(e=>t.push({time:e.date,type:'Exam result',tone:'t-success',
    title:`${e.exam} — ${e.score}/${e.max}`,desc:'Grade recorded in the examination system.'}));
  if(s.att<75)t.push({time:'Mar 07, 2026',type:'Attendance warning',tone:'t-warn',
    title:'Attendance below threshold',desc:`Overall attendance at ${s.att}% — below the 75% requirement.`});
  DATA.assignmentsFor(s).slice(0,3).forEach(a=>t.push({time:a.due,type:'Assignment',
    tone:a.status==='Missing'?'t-danger':'',
    title:`${a.title} — ${a.status}`,desc:a.course+(a.score!=null?` · Score ${a.score}%`:'')}));
  DATA.observationsFor(s).slice(0,2).forEach(o=>t.push({time:o.date,type:'Faculty observation',tone:'',
    title:o.author,desc:o.note}));
  const a0=DATA.achievementsFor(s)[0];
  t.push({time:a0.date,type:'Achievement',tone:'t-success',title:a0.title,desc:a0.desc});
  t.push({time:'Feb 28, 2026',type:'Support follow-up',tone:'t-info',
    title:'Advisor check-in scheduled',desc:'Academic advisor scheduled a support conversation.'});
  return t;
};
/* ============================================================
   Admin Console data
   ============================================================ */
DATA.admin={
  kpis:[
    {label:'Faculty & Staff', value:'148', icon:'users', tile:'t-primary', desc:'Total accounts', delta:'3 new this week', good:true},
    {label:'Active Students', value:'248', icon:'cap', tile:'t-success', desc:'Across 5 departments', delta:'6 new this week', good:true},
    {label:'Programs', value:'12', icon:'book', tile:'t-accent', desc:'Undergraduate catalog', delta:'1 new this year', good:true},
    {label:'Courses', value:'34', icon:'list', tile:'t-info', desc:'Offered this session', delta:'4 new this year', good:true},
    {label:'Open Requests', value:'12', icon:'clock', tile:'t-warn', desc:'6 awaiting approval', delta:'2 added today', good:false},
    {label:'System Uptime', value:'99.98%', icon:'shield', tile:'t-success', desc:'All services operational', delta:'Rolling 90 days', good:true}
  ],
  users:[
    {id:'USR-001',name:'Dr. Sarah Mitchell',role:'Professor',dept:'CSE',email:'s.mitchell@meridian.edu',status:'Active',last:'2h ago'},
    {id:'USR-002',name:'Prof. Ahmed Karim',role:'Professor',dept:'CSE',email:'a.karim@meridian.edu',status:'Active',last:'1d ago'},
    {id:'USR-003',name:'Dr. Lena Fernandes',role:'Associate Dean',dept:'CSE',email:'l.fernandes@meridian.edu',status:'Active',last:'3h ago'},
    {id:'USR-004',name:'Mrs. Grace Okonkwo',role:'Registrar',dept:'Academic Registry',email:'g.okonkwo@meridian.edu',status:'Active',last:'40m ago'},
    {id:'USR-005',name:'Ms. Rosa Whitfield',role:'Lecturer',dept:'ENG',email:'r.whitfield@meridian.edu',status:'Active',last:'2d ago'},
    {id:'USR-006',name:'Mr. Tom Ryder',role:'IT Administrator',dept:'ICT',email:'t.ryder@meridian.edu',status:'Active',last:'1h ago'},
    {id:'USR-007',name:'Dr. Paulo Andrade',role:'Department Head',dept:'CIV',email:'p.andrade@meridian.edu',status:'Active',last:'4h ago'},
    {id:'USR-008',name:'Ms. Nadia Hossain',role:'Finance Officer',dept:'Finance',email:'n.hossain@meridian.edu',status:'Active',last:'1d ago'},
    {id:'USR-009',name:'Mr. David Chu',role:'Academic Advisor',dept:'Student Affairs',email:'d.chu@meridian.edu',status:'Invited',last:'Invite sent'},
    {id:'USR-010',name:'Ms. Kira Yamada',role:'Coordinator',dept:'Accessibility Services',email:'k.yamada@meridian.edu',status:'Suspended',last:'8d ago'}
  ],
  deptRows:[
    {code:'CSE',name:'Computer Science & Engineering',head:'Dr. Lena Fernandes',students:92,programs:3,courses:10},
    {code:'EEE',name:'Electrical & Electronic Engineering',head:'Dr. N. Iqbal',students:58,programs:2,courses:8},
    {code:'BBA',name:'Business Administration',head:'Dr. C. Mensah',students:44,programs:2,courses:9},
    {code:'CIV',name:'Civil Engineering',head:'Dr. Paulo Andrade',students:24,programs:2,courses:7},
    {code:'ENG',name:'English Literature',head:'Dr. R. Whitfield',students:30,programs:1,courses:6}
  ],
  programRows:[
    {code:'CSE-BS',name:'B.Sc. Computer Science',dept:'CSE',credits:142,students:74,seats:80},
    {code:'EEE-BS',name:'B.Sc. Electrical Engineering',dept:'EEE',credits:138,students:46,seats:60},
    {code:'BBA-BC',name:'Bachelor of Business Administration',dept:'BBA',credits:126,students:38,seats:50},
    {code:'CIV-BS',name:'B.Sc. Civil Engineering',dept:'CIV',credits:140,students:20,seats:40},
    {code:'ENG-BA',name:'B.A. English Literature',dept:'ENG',credits:120,students:26,seats:40}
  ]
};
DATA.admin.enrollment=[
  {id:'STU-10401',name:'Amina Yusuf',program:'B.Sc. Computer Science',batch:2024,sem:5,status:'Pending',applied:'Mar 08'},
  {id:'STU-10402',name:'Kwame Boateng',program:'B.Sc. Civil Engineering',batch:2024,sem:5,status:'Pending',applied:'Mar 08'},
  {id:'STU-10403',name:'Sofia Reyes',program:'B.Sc. Electrical Engineering',batch:2024,sem:5,status:'Pending',applied:'Mar 07'},
  {id:'STU-10404',name:'Markus Weber',program:'Bachelor of Business Administration',batch:2024,sem:4,status:'Pending',applied:'Mar 06'},
  {id:'STU-10405',name:'Priyanka Das',program:'B.A. English Literature',batch:2023,sem:6,status:'On Hold',applied:'Mar 05'},
  {id:'STU-10284',name:'Chen Wei',program:'B.Sc. Computer Science',batch:2022,sem:8,status:'Active',applied:'Sep 2022'},
  {id:'STU-10299',name:'Hana Suzuki',program:'B.Sc. Electrical Engineering',batch:2024,sem:5,status:'Active',applied:'Sep 2023'},
  {id:'STU-10311',name:'Lucas Silva',program:'B.Sc. Electrical Engineering',batch:2023,sem:6,status:'Active',applied:'Sep 2023'}
];
DATA.admin.sessions=[
  {name:'Fall 2025',range:'Aug 25 – Dec 19, 2025',status:'active',registration:'Closed'},
  {name:'Spring 2026',range:'Jan 12 – May 8, 2026',status:'active',registration:'Open until Apr 02'},
  {name:'Summer 2026',range:'Jun 1 – Jul 24, 2026',status:'upcoming',registration:'Opens Apr 20'}
];
DATA.admin.calendar=[
  {date:'Mar 15 – Apr 02',event:'Semester 5 registration window',type:'Registration'},
  {date:'Mar 21',event:'Midterm grade submission deadline',type:'Academic'},
  {date:'Apr 09 – Apr 13',event:'Spring break',type:'Holiday'},
  {date:'May 05 – May 08',event:'Final examinations',type:'Academic'},
  {date:'May 20',event:'Convocation ceremony',type:'Event'},
  {date:'Jun 01 – Jul 24',event:'Summer session',type:'Registration'}
];
DATA.admin.announcements=[
  {id:1,title:'Maintenance window — Sunday 2:00–4:00 AM',audience:'All users',status:'Published',date:'Mar 07, 2026',author:'Tom Ryder'},
  {id:2,title:'New attendance policy reminder',audience:'Faculty',status:'Published',date:'Mar 04, 2026',author:'Academic Registry'},
  {id:3,title:'Semester 5 registration opens Mar 15',audience:'Students',status:'Scheduled',date:'Scheduled · Mar 15',author:'Grace Okonkwo'},
  {id:4,title:'Convocation 2026 registrations now open',audience:'All users',status:'Draft',date:'Last edited Mar 08',author:'Events Office'}
];
DATA.admin.audit=[
  {time:'Mar 09, 10:42 AM',user:'Dr. Sarah Mitchell',action:'Published final results',target:'CSE101 · Final Examination',sev:'info'},
  {time:'Mar 09, 09:15 AM',user:'Prof. Ahmed Karim',action:'Marked attendance',target:'CSE205 · Section A',sev:'info'},
  {time:'Mar 08, 04:20 PM',user:'Grace Okonkwo',action:'Enrolled 14 students',target:'Batch 2024 enrollment',sev:'success'},
  {time:'Mar 08, 11:05 AM',user:'Dr. Lena Fernandes',action:'Approved grade change',target:'STU-10231 · MAT201',sev:'warn'},
  {time:'Mar 07, 03:40 PM',user:'Tom Ryder',action:'Updated risk rule',target:'Attendance threshold',sev:'warn'},
  {time:'Mar 07, 02:05 PM',user:'Kira Yamada',action:'Restricted a student record',target:'STU-10268',sev:'danger'},
  {time:'Mar 06, 05:30 PM',user:'Grace Okonkwo',action:'Generated department report',target:'Academic Performance Q3',sev:'info'},
  {time:'Mar 05, 10:15 AM',user:'Dr. Sarah Mitchell',action:'Added observation',target:'STU-10231',sev:'info'}
];
DATA.admin.weekly=[{d:'Mon',v:42},{d:'Tue',v:68},{d:'Wed',v:54},{d:'Thu',v:81},{d:'Fri',v:37},{d:'Sat',v:12},{d:'Sun',v:9}];
DATA.admin.pending=[
  {t:'New enrollment application', x:'STU-10401 · Amina Yusuf', when:'2h ago', sev:'info'},
  {t:'Grade change request', x:'MAT201 · STU-10231', when:'1d ago', sev:'warn'},
  {t:'Advisor referral', x:'STU-10255', when:'Yesterday', sev:'danger'},
  {t:'User invitation pending', x:'d.chu@meridian.edu', when:'Yesterday', sev:'info'}
];
/* ============================================================
   Admin Panel — shared persistence bridge (localStorage)
   Admin edits persist here and are applied in the faculty app.
   ============================================================ */
DATA.AKEY=k=>'mu_admin_'+k;
/* Persistence seam — routes through the API adapter when the Node
   backend is enabled (js/api.js), otherwise localStorage as today. */
DATA.results = [
  {id:'R001',studentId:'STU-10231',course:'CSE101',name:'Introduction to Programming',mid:72,final:68,total:70,grade:'A-',points:3.7},
  {id:'R002',studentId:'STU-10231',course:'CSE205',name:'Data Structures & Algorithms',mid:45,final:52,total:49,grade:'C+',points:2.3},
  {id:'R003',studentId:'STU-10231',course:'MAT201',name:'Calculus II',mid:58,final:62,total:60,grade:'B-',points:2.7},
  {id:'R004',studentId:'STU-10231',course:'PHY101',name:'Physics I',mid:38,final:44,total:41,grade:'D',points:1.0},
  {id:'R005',studentId:'STU-10232',course:'CSE101',name:'Introduction to Programming',mid:88,final:92,total:90,grade:'A+',points:4.0},
  {id:'R006',studentId:'STU-10232',course:'CSE205',name:'Data Structures & Algorithms',mid:82,final:85,total:84,grade:'A',points:3.7},
  {id:'R007',studentId:'STU-10232',course:'MAT201',name:'Calculus II',mid:78,final:82,total:80,grade:'A-',points:3.7},
  {id:'R008',studentId:'STU-10232',course:'PHY101',name:'Physics I',mid:90,final:94,total:92,grade:'A+',points:4.0},
  {id:'R009',studentId:'STU-10255',course:'EEE201',name:'Circuit Analysis',mid:42,final:48,total:45,grade:'C',points:2.0},
  {id:'R010',studentId:'STU-10255',course:'PHY101',name:'Physics I',mid:35,final:40,total:38,grade:'F',points:0.0},
  {id:'R011',studentId:'STU-10255',course:'MAT201',name:'Calculus II',mid:50,final:55,total:53,grade:'C-',points:1.7},
  {id:'R012',studentId:'STU-10255',course:'CSE101',name:'Introduction to Programming',mid:44,final:50,total:47,grade:'C+',points:2.3},
  {id:'R013',studentId:'STU-10258',course:'BUS210',name:'Principles of Management',mid:80,final:84,total:82,grade:'A-',points:3.7},
  {id:'R014',studentId:'STU-10258',course:'ENG105',name:'Academic Writing',mid:85,final:88,total:87,grade:'A',points:4.0},
  {id:'R015',studentId:'STU-10258',course:'MAT201',name:'Calculus II',mid:70,final:74,total:72,grade:'B+',points:3.3},
  {id:'R016',studentId:'STU-10258',course:'CSE101',name:'Introduction to Programming',mid:75,final:78,total:77,grade:'A-',points:3.7},
  {id:'R017',studentId:'STU-10284',course:'CSE101',name:'Introduction to Programming',mid:90,final:93,total:92,grade:'A+',points:4.0},
  {id:'R018',studentId:'STU-10284',course:'CSE205',name:'Data Structures & Algorithms',mid:85,final:88,total:87,grade:'A',points:3.7},
  {id:'R019',studentId:'STU-10284',course:'MAT201',name:'Calculus II',mid:80,final:84,total:82,grade:'A-',points:3.7},
  {id:'R020',studentId:'STU-10284',course:'PHY101',name:'Physics I',mid:84,final:86,total:85,grade:'A',points:3.7},
  {id:'R021',studentId:'STU-10261',course:'PHY101',name:'Physics I',mid:72,final:76,total:74,grade:'B+',points:3.3},
  {id:'R022',studentId:'STU-10261',course:'MAT201',name:'Calculus II',mid:65,final:68,total:67,grade:'B',points:3.0},
  {id:'R023',studentId:'STU-10261',course:'BUS210',name:'Principles of Management',mid:78,final:82,total:80,grade:'A-',points:3.7},
  {id:'R024',studentId:'STU-10261',course:'ENG105',name:'Academic Writing',mid:80,final:84,total:82,grade:'A-',points:3.7}
];

const API_KEYS=['students','users','courses','announcements','enrollments','results','changelog'];
DATA.readA=(k,def)=>{
  if(typeof API!=='undefined'&&API.enabled&&API_KEYS.includes(k)) return API.cacheGet(k,def);
  try{const v=localStorage.getItem(DATA.AKEY(k));return v?JSON.parse(v):def}catch(e){return def}
};
DATA.writeA=(k,v)=>{
  if(typeof API!=='undefined'&&API.enabled&&API_KEYS.includes(k)) API.cacheSet(k,v);
  try{localStorage.setItem(DATA.AKEY(k),JSON.stringify(v))}catch(e){}
};
DATA.clearA=k=>{
  if(typeof API!=='undefined'&&API.enabled&&API_KEYS.includes(k)) API.cacheDel(k);
  try{localStorage.removeItem(DATA.AKEY(k))}catch(e){}
};
DATA.applyAdminData=function(){
  const st=this.readA('students',null); if(Array.isArray(st)&&st.length)this.students=st;
  const co=this.readA('courses',null);  if(Array.isArray(co)&&co.length)this.courses=co;
};
DATA.logChange=function(kind,label,detail,id){
  const cl=this.readA('changelog',[]);
  cl.unshift({kind,label,detail,id:id||null,at:new Date().toLocaleString('en-US',{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'})});
  this.writeA('changelog',cl.slice(0,80));
  this.writeA('last_focus',{kind,label,detail,id:id||null,at:Date.now()});
};
DATA.focusHint=()=>DATA.readA('last_focus',null);
DATA.session=()=>!!DATA.readA('session',null);

