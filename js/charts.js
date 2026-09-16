/* ============================================================
   Chart engine — dependency-free SVG (line / donut / bars)
   Colors are read from CSS variables so dark mode stays correct.
   ============================================================ */
'use strict';

const Chart=(()=>{
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const uid=()=>'c'+Math.random().toString(36).slice(2,8);
  const fmtY=(v,suf)=>(Math.abs(v)>=100?Math.round(v):Math.round(v*10)/10)+(suf||'');

  function axisY(yMin,yMax,h,padT,padB,suf){
    let out=''; const rows=4;
    for(let i=0;i<=rows;i++){
      const v=yMin+(yMax-yMin)*(i/rows), y=padT+(h-padT-padB)*(1-i/rows);
      out+=`<line x1="40" x2="98%" y1="${y}" y2="${y}" class="ch-grid"/>
            <text x="34" y="${y+3.5}" text-anchor="end" class="ch-lab">${fmtY(v,suf)}</text>`;
    }
    return out;
  }

  /* line({labels, series:[{name,values,color,area}], height, suffix, yMin, yMax}) */
  function line(o){
    const w=680,h=o.height||260,pL=44,pR=14,pT=16,pB=30,n=o.labels.length;
    const vals=o.series.flatMap(s=>s.values);
    let yMin=o.yMin??Math.min(...vals), yMax=o.yMax??Math.max(...vals);
    if(yMin===yMax){yMin-=1;yMax+=1;}
    const pad=(yMax-yMin)*.18; yMin-=pad; yMax+=pad;
    const X=i=>pL+(n<2?(w-pL-pR)/2:i*(w-pL-pR)/(n-1));
    const Y=v=>pT+(h-pT-pB)*(1-(v-yMin)/(yMax-yMin));
    let body=axisY(yMin,yMax,h,pT,pB,o.suffix);
    o.labels.forEach((lb,i)=>{
      body+=`<text x="${X(i)}" y="${h-8}" text-anchor="middle" class="ch-lab">${esc(lb)}</text>`;
    });
    o.series.forEach(s=>{
      const pts=s.values.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`);
      const id=uid();
      if(s.area!==false){
        body+=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${s.color}" stop-opacity=".22"/>
          <stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs>
          <path d="M${pts.join(' L')} L${X(n-1)},${h-pB} L${X(0)},${h-pB} Z" fill="url(#${id})" stroke="none"/>`;
      }
      body+=`<polyline points="${pts.join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round"/>`;
      s.values.forEach((v,i)=>{
        body+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4" fill="var(--surface)"
               stroke="${s.color}" stroke-width="2" class="ch-dot">
               <title>${esc(s.name)} · ${esc(o.labels[i])}: ${fmtY(v,o.suffix)}</title></circle>`;
      });
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img"
            aria-label="Line chart: ${esc(o.series.map(s=>s.name).join(', '))}">${body}</svg>`;
  }

  /* sparkline(values,color) — tiny trend for KPI cards */
  function spark(values,color){
    const w=88,h=30,p=3;
    const min=Math.min(...values),max=Math.max(...values),sp=(max-min)||1;
    const pts=values.map((v,i)=>`${(p+i*(w-2*p)/(values.length-1)).toFixed(1)},${(h-p-(v-min)/sp*(h-2*p)).toFixed(1)}`);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
      <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" opacity=".9"/></svg>`;
  }
  /* donut({segments:[{label,value,color}], thickness, center:{value,label}, size, clickable, unit}) */
  function donut(o){
    const size=o.size||190, th=o.thickness||24, r=(size-th)/2, C=2*Math.PI*r;
    const total=o.segments.reduce((a,s)=>a+s.value,0)||1;
    let off=0, arcs='';
    o.segments.forEach(s=>{
      const frac=s.value/total;
      arcs+=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${s.color}"
        stroke-width="${th}" stroke-dasharray="${(frac*C).toFixed(2)} ${C.toFixed(2)}"
        stroke-dashoffset="${(-off*C).toFixed(2)}" transform="rotate(-90 ${size/2} ${size/2})"
        class="ch-seg ${o.clickable?'ch-click':''}" ${o.clickable?`data-label="${esc(s.label)}" tabindex="0" role="button" aria-label="Filter by ${esc(s.label)}"`:''}>
        <title>${esc(s.label)}: ${s.value}${o.unit||''} (${Math.round(frac*100)}%)</title></circle>`;
      off+=frac;
    });
    const c=o.center||{};
    return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img"
      aria-label="Donut chart">${arcs}</svg>
      <div class="donut-center"><strong>${esc(c.value??'')}</strong><span>${esc(c.label??'')}</span></div></div>`;
  }

  function legend(items){
    return `<div class="legend">${items.map(i=>`<span class="lg-item">
      <i style="background:${i.color}"></i>${esc(i.label)}<b>${i.value}${i.unit||''}</b></span>`).join('')}</div>`;
  }

  /* bars({labels, values, color, height, suffix, max, highlightBelow}) */
  function bars(o){
    const w=680,h=o.height||230,pL=40,pR=10,pT=14,pB=30,n=o.labels.length;
    const max=o.max??Math.max(...o.values)*1.15;
    const bw=Math.min(34,(w-pL-pR)/n*0.55);
    let body=axisY(0,max,h,pT,pB,o.suffix);
    o.values.forEach((v,i)=>{
      const x=pL+(i+0.5)*(w-pL-pR)/n, bh=(h-pT-pB)*(v/max), y=h-pB-bh;
      const hot=o.highlightBelow!=null&&v<o.highlightBelow;
      body+=`<rect x="${(x-bw/2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${Math.max(bh,1).toFixed(1)}"
        rx="6" fill="${hot?'var(--danger)':(o.color||'var(--primary)')}" opacity=".92" class="ch-bar">
        <title>${esc(o.labels[i])}: ${fmtY(v,o.suffix)}</title></rect>
        <text x="${x.toFixed(1)}" y="${h-8}" text-anchor="middle" class="ch-lab">${esc(o.labels[i])}</text>
        <text x="${x.toFixed(1)}" y="${(y-6).toFixed(1)}" text-anchor="middle" class="ch-val">${fmtY(v,o.suffix)}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Bar chart">${body}</svg>`;
  }

  /* groupBars({labels, series:[{name,values,color}], suffix}) */
  function groupBars(o){
    const w=680,h=o.height||250,pL=40,pR=10,pT=14,pB=32,n=o.labels.length,gn=o.series.length;
    const max=Math.max(...o.series.flatMap(s=>s.values))*1.15;
    const slot=(w-pL-pR)/n, bw=Math.min(20,slot/gn*0.6);
    let body=axisY(0,max,h,pT,pB,o.suffix);
    o.labels.forEach((lb,i)=>{
      const cx=pL+(i+0.5)*slot;
      body+=`<text x="${cx.toFixed(1)}" y="${h-8}" text-anchor="middle" class="ch-lab">${esc(lb)}</text>`;
      o.series.forEach((s,j)=>{
        const v=s.values[i], bh=(h-pT-pB)*(v/max);
        const x=cx-slot*gn/4+j*bw*1.25;
        body+=`<rect x="${x.toFixed(1)}" y="${(h-pB-bh).toFixed(1)}" width="${bw}" height="${Math.max(bh,1).toFixed(1)}"
          rx="5" fill="${s.color}" class="ch-bar"><title>${esc(s.name)} · ${esc(lb)}: ${fmtY(v,o.suffix)}</title></rect>`;
      });
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Grouped bar chart">${body}</svg>`;
  }

  /* horizontal bars — rows:[{label,value,suffix,color}] */
  function hbars(rows){
    return `<div class="hbars">${rows.map(r=>`
      <div class="hb-row">
        <span class="hb-lab">${esc(r.label)}</span>
        <span class="hb-track"><span class="hb-fill" style="width:${r.value}%;background:${r.color||(r.value<70?'var(--danger)':r.value<80?'var(--warn)':'var(--success)')}"></span></span>
        <span class="hb-val">${r.value}${r.suffix||'%'}</span>
      </div>`).join('')}</div>`;
  }
  return {line,spark,donut,legend,bars,groupBars,hbars};
})();

