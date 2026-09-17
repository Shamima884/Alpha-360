/* ============================================================
   API adapter — the single switch between data sources.

   THREE MODES (js/api.js → API.cfg.mode):
     'local'  → localStorage only (current default, zero setup)
     'node'   → Node.js + Excel backend  (backend/server.js)
     'google' → Google Sheets backend    (google-apps-script/Code.gs)
                 set googleUrl to your deployed Web App URL (/exec)

   Design: cache-first. On boot the full snapshot is pulled into
   memory; reads stay synchronous (no refactor needed); writes update
   the cache, mirror to localStorage (offline safety) and push to the
   backend (fire-and-forget). If a backend is unreachable the app
   automatically falls back to local mode.
   ============================================================ */
'use strict';

const API = {
  cfg: {
        mode: 'local',                            /* 'local' | 'node' | 'google' */
    base: 'http://localhost:3000/api',         /* node backend base URL */
    googleUrl: 'https://script.google.com/macros/s/AKfycbwMbpf57jcZsDBbY6F2fdii-o09RLQhn88k-lWBDDqP0vLpan234KdFsxdV7lN0-GU/exec',
    timeout: 8000
  },
  cache: {},
  syncedKeys: ['students','users','courses','announcements','enrollments','results','changelog'],

  get enabled(){ return this.cfg.mode !== 'local'; },

  /* ---------- boot ---------- */
  async init(){
    /* Always guarantee the cache has data BEFORE any login is attempted.
     * If the backend is unreachable we fall back to the local snapshot,
     * so 'Student ID not found' can never happen due to an empty cache. */
    if(this.cfg.mode === 'local'){ this.loadLocalCache(); return; }
    try{
      let snap;
      if(this.cfg.mode === 'node'){
        const res = await this.request('/all',{method:'GET'});
        snap = res.data || res;
      }else{
        if(!/^https?:\/\//.test(this.cfg.googleUrl || '')){
          throw new Error('googleUrl is not set (js/api.js → API.cfg.googleUrl)');
        }
        snap = await this.gGet('all');
        snap = snap.data || snap;
      }
      /* A reachable backend can still report an application error (bad
         deployment, wrong code pasted, permission denied…). Treat that as
         unreachable so we always fall back to the local snapshot. */
      if(snap && snap.ok === false){
        throw new Error(snap.error || 'backend returned ok:false');
      }
      this.syncedKeys.forEach(k=>{ if(Array.isArray(snap[k])) this.cache[k]=snap[k]; });
      this.syncedKeys.forEach(k=>this.mirror(k,this.cache[k]));
      if(this.cfg.mode==='google') await this.autoSeedIfBlank(snap);
      console.info('[API] connected · mode = '+this.cfg.mode);
    }catch(err){
      this.cfg.mode = 'local';
      console.warn('[API] backend unreachable — falling back to local storage.',err.message);
    }
    /* Fill any missing cache collection from localStorage mirrors or the
       embedded DATA seed so login + panels always work. */
    this.loadLocalCache();
  },

  /* Populate empty cache collections from localSnapshot() — reads
     localStorage mirrors (mu_admin_*) then DATA seed. Never clobbers
     data that was successfully pulled from the backend. */
  loadLocalCache(){
    const snap = this.localSnapshot();
    this.syncedKeys.forEach(k=>{
      const has = Array.isArray(this.cache[k]) && this.cache[k].length>0;
      if(has) return;
      const fb = snap[k];
      if(Array.isArray(fb) && fb.length){
        this.cache[k] = fb;
        this.mirror(k, fb);
      }else if(!Array.isArray(this.cache[k])){
        this.cache[k] = [];
      }
    });
  },

  /* ---------- Google Sheets auto-seed ----------
     If the spreadsheet is empty on first contact (fresh deployment),
     push the embedded demo dataset once so the admin panel is never
     blank. Fires only when every collection is empty AND this browser
     hasn't seeded before. */
  async autoSeedIfBlank(snap){
    snap = snap.data || snap;
    try{ if(localStorage.getItem('mu_api_seeded')) return; }catch(e){ return; }
    const blank = this.syncedKeys.every(k=> !Array.isArray(snap[k]) || snap[k].length === 0);
    if(!blank) return;
    const seed = this.localSnapshot();
    let sent = 0;
    for(const k of this.syncedKeys){
      if(Array.isArray(seed[k]) && seed[k].length){
        await this.gRequest({action:'save', collection:k, rows:seed[k]});
        this.cache[k] = seed[k];
        this.mirror(k, seed[k]);
        sent += seed[k].length;
      }
    }
    try{ localStorage.setItem('mu_api_seeded','1'); }catch(e){}
    console.info('[API] auto-seeded Google Sheets · '+sent+' records');
  },

  localSnapshot(){
    const jread = k=>{ try{ const v=localStorage.getItem(k); return v? JSON.parse(v): null; }catch(e){ return null; } };
    const has = typeof DATA !== 'undefined';
    const out = { students:[], users:[], courses:[], announcements:[], enrollments:[], results:[], changelog:[] };
    out.students = jread('mu_admin_students') ||
      (has ? DATA.students.map(r=>({...r})) : []);
    out.users = jread('mu_admin_users') ||
      (has && DATA.admin ? DATA.admin.users.map(r=>({...r})) : []);
    out.courses = jread('mu_admin_courses') ||
      (has ? DATA.courses.map(r=>({...r})) : []);
    out.announcements = jread('mu_admin_announcements') ||
      (has && DATA.admin ? DATA.admin.announcements.map(r=>({...r})) : []);
    out.enrollments = jread('mu_admin_enrollments') ||
      (has && DATA.admin ? DATA.admin.enrollment.map(r=>({...r})) : []);
    out.results = jread('mu_admin_results') || (has ? (DATA.results || []).map(r=>({...r})) : []);
    return out;
  },

  /* ---------- cache-first seam (sync, used by DATA.readA/writeA) ---------- */
  cacheGet(k,def){
    return Object.prototype.hasOwnProperty.call(this.cache,k) ? this.cache[k] : def;
  },
  cacheSet(k,v){
    this.cache[k]=v;
    this.mirror(k,v);
    if(this.syncedKeys.includes(k)) this.push(k,v);
  },
  cacheDel(k){
    delete this.cache[k];
    try{ localStorage.removeItem('mu_api_'+k); }catch(e){}
  },
  mirror(k,v){
    try{ localStorage.setItem('mu_api_'+k, JSON.stringify(v)); }catch(e){}
  },

  /* ---------- server push (collection-level replace) ---------- */
  push(k,v){
    if(this.cfg.mode === 'node'){
      this.request('/collection/'+k,{method:'PUT',body:v})
        .catch(err=>console.warn('[API] push failed for "'+k+'":',err.message));
    }else{
      this.gRequest({action:'save',collection:k,rows:v})
        .catch(err=>console.warn('[API] push failed for "'+k+'":',err.message));
    }
  },

  /* ---------- helpers ---------- */
  async login(email,password){
    if(this.cfg.mode === 'google'){
      return await this.gRequest({action:'login',email,password});
    }
    return await this.request('/auth/login',{method:'POST',body:{email,password}});
  },

  async getStudent(id){
    if(this.cfg.mode === 'google'){
      const students = this.cache.students || [];
      const norm = v=>String(v==null?'':v).toLowerCase().replace(/[^a-z0-9]/g,'');
      const want = norm(id), wantNum = want.replace(/^stu/,'');
      const student = students.find(s=>!s ? false :
        Object.keys(s).some(k=>{
          const v = norm(s[k]);
          return v===want || (wantNum && v===wantNum);
        }));
      return { ok: !!student, student };
    }
    return await this.request('/student/'+id,{method:'GET'});
  },

  /* ---------- Google Apps Script transport ----------
     POSTs are sent WITHOUT a JSON content-type (text/plain) so the
     browser skips the CORS preflight — Apps Script handles it fine. */
  gRequest(payload){
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),this.cfg.timeout);
    return fetch(this.cfg.googleUrl,{
      method:'POST',
      body: JSON.stringify(payload),
      signal: ctrl.signal
    }).then(r=>{
      if(!r.ok) throw new Error('HTTP '+r.status+' '+r.statusText);
      return r.json();
    }).finally(()=>clearTimeout(t));
  },
  gGet(action,extra){
    extra = extra || {};
    const qs = Object.keys(extra).map(k=>k+'='+encodeURIComponent(extra[k])).join('&');
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),this.cfg.timeout);
    return fetch(this.cfg.googleUrl+'?action='+encodeURIComponent(action)+(qs?'&'+qs:''),{
      signal: ctrl.signal
    }).then(r=>{
      if(!r.ok) throw new Error('HTTP '+r.status+' '+r.statusText);
      return r.json();
    }).finally(()=>clearTimeout(t));
  },

  /* ---------- low-level fetch (node mode) ---------- */
  async request(path,{method='GET',body=null}={}){
    const ctrl=new AbortController();
    const t=setTimeout(()=>ctrl.abort(),this.cfg.timeout);
    try{
      const res=await fetch(this.cfg.base+path,{
        method,
        headers:{'Content-Type':'application/json'},
        body: body?JSON.stringify(body):undefined,
        signal:ctrl.signal
      });
      if(!res.ok) throw new Error('HTTP '+res.status+' '+res.statusText);
      return await res.json();
    } finally { clearTimeout(t); }
  },

  /* ---------- helpers ---------- */
  status(){
    return this.cfg.mode==='local' ? 'Local mode (localStorage)'
      : this.cfg.mode==='google'  ? 'Google Sheets mode → '+this.cfg.googleUrl
      : 'Node/Excel mode → '+this.cfg.base;
  }
};