/* Dashboard ก5 — กระบวนการไต่สวน (Activity 5)
   แก้ขยะ: อยู่ใน #staffApp, เพิ่ม esc, กราฟมีสเกล/รวมกลาง, แผนที่ invalidateSize, เซ็ต render delay
*/
(() => {
  'use strict';
  const THAI_MONTHS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  function daysRemaining(dateStr){ if(!dateStr) return null; const ts=Date.parse(String(dateStr)); if(isNaN(ts)) return null; return Math.ceil((ts - Date.now())/86400000); }
  function esc(s){ const d=document.createElement('div'); d.textContent=String(s??''); return d.innerHTML; }
  const PRELIM_STAGES=['a5-prelim','a5-prelim-review','a7-213'];
  const INQUIRY_STAGES=['a5-inquiry','a5-inquiry-review','a7-644'];
  function trackOf(stage){
    if(PRELIM_STAGES.includes(stage)) return '213';
    if(INQUIRY_STAGES.includes(stage)) return '644';
    if(['a5-outcome','a5-prosecutor','closed'].includes(stage)) return 'done';
    return 'intake'; // a5-intake: รับสำนวนแล้วแต่ยังไม่เข้าเฟส 213/644
  }

  const urlParams=new URLSearchParams(location.search);
  const urlRegion=urlParams.get('region')||'';
  const REGIONS_ALL=['ส่วนกลาง','เขต 1','เขต 2','เขต 3','เขต 4','เขต 5','เขต 6','เขต 7','เขต 8','เขต 9'];
  const isRegionalRole=(urlParams.get('role')||'').startsWith('regional-');
  const SCOPED_REGION=(isRegionalRole && REGIONS_ALL.includes(urlRegion)) ? urlRegion : null;

  const STAGE_LABELS_A5={
    th:{'a5-intake':'รอรับสำนวน/มอบหมาย','a5-prelim':'ไต่สวนเบื้องต้น (213)','a5-prelim-review':'เสนอ 213 ตามลำดับชั้น','a7-213':'คกก. พิจารณา 213','a5-inquiry':'ไต่สวนชี้มูล (644)','a5-inquiry-review':'เสนอ 644 ตามลำดับชั้น','a7-644':'คกก. พิจารณา 644','a5-outcome':'ดำเนินการตามมติ','a5-prosecutor':'อัยการสั่งการ','closed':'ปิดสำนวน'},
    en:{'a5-intake':'Awaiting assignment','a5-prelim':'Preliminary inquiry (213)','a5-prelim-review':'213 under review','a7-213':'Committee review 213','a5-inquiry':'Fact-finding inquiry (644)','a5-inquiry-review':'644 under review','a7-644':'Committee review 644','a5-outcome':'Acting on resolution','a5-prosecutor':'Prosecutor order','closed':'Closed'}
  };
  const STAGE_ORDER_A5=['a5-intake','a5-prelim','a5-prelim-review','a7-213','a5-inquiry','a5-inquiry-review','a7-644','a5-outcome','a5-prosecutor','closed'];

  const I18N={
    th:{},
    en:{
      pageTitle:'New Module 5 — Preliminary & Fact-Finding Inquiry Performance Statistics System',
      pageSub:'Two parallel case tracks — preliminary inquiry (213) and fact-finding inquiry (644) — with deadline status and extension usage.',
      filterRegion:'Region', filterTrack:'Track', btnClear:'Clear', btnList:'Case list', btnPrint:'Print',
      tabOverview:'Overview', tabTracks:'213 / 644', tabWatch:'Watchlist', tabCharts:'Charts', tabMap:'Map',
      statTotal:'Total inquiry cases', statTotalSub:'All phases combined', hintList:'View list', hintDetail:'View detail',
      stat213:'Preliminary (213)', stat213Sub:'Max 2 extension rounds',
      stat644:'Fact-finding (644)', stat644Sub:'Max 4 extension rounds',
      statOverdue:'Overdue', statOverdueSub:'Past deadline', statOverdueHint:'Needs follow-up',
      track213Title:'Preliminary Inquiry (213)', track644Title:'Fact-Finding Inquiry (644)',
      onTrack:'On track', watch:'Due soon', overdue:'Overdue',
      thCase:'Case No.', thStage:'Phase', thDeadline:'Deadline / status', thExt:'Extensions', thSubject:'Subject', thRegion:'Region',
      stageFunnel:'Cases by phase (both tracks)',
      watchHeader:'Watchlist — inquiry deadlines', watchHeaderHint:'≤30 days = watch • <0 = overdue',
      watchWarn5:'Watch (≤30 days)', thRemaining:'Remaining',
      donutLegend:'Normal / Due soon / Urgent / Overdue',
      chartRegion:'By region', chartTrend12:'12-month trend', chartMap:'Map — density by province',
      legendLow:'Low', legendMid:'Medium', legendHigh:'High', legendHint5:'Bigger circle = more cases • click for count',
    }
  };
  let lang='th';
  function applyLang(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n;
      if(lang==='th'){ if(el.dataset.i18nTh) el.textContent=el.dataset.i18nTh; }
      else{ const v=I18N.en[key]; if(v){ if(!el.dataset.i18nTh) el.dataset.i18nTh=el.textContent; el.textContent=v; } }
    });
  }

  function deadlineBucket(d){ if(d===null) return 'none'; if(d<0) return 'overdue'; if(d<=30) return 'watch'; return 'onTrack'; }
  function rankList(container, rows, onClick){
    if(!container) return;
    const max=Math.max(1,...rows.map(r=>r.value));
    container.innerHTML = rows.map(r=>`
      <button type="button" class="rank-row"><span class="rank-label" title="${esc(r.label)}">${esc(r.label)}</span>
      <span class="rank-track"><span class="rank-fill" style="width:${Math.max(3,r.value/max*100)}%;background:${r.color||'#082b50'}"></span></span>
      <span class="rank-val">${esc(r.display!==undefined?r.display:r.value)}</span></button>`).join('');
    [...container.querySelectorAll('.rank-row')].forEach((el,i)=>{ el.onclick=()=>onClick&&onClick(rows[i],i); });
  }
  function funnelChart(container, rows, onClick){
    if(!container) return;
    const max=Math.max(1,...rows.map(r=>r.value));
    container.innerHTML = rows.map(r=>`
      <button type="button" class="funnel-row"><span class="rank-label">${esc(r.label)}</span>
      <span class="funnel-bar-wrap"><span class="funnel-bar" style="width:${Math.max(6,r.value/max*100)}%"></span></span>
      <span class="funnel-n">${r.value}</span></button>`).join('');
    [...container.querySelectorAll('.funnel-row')].forEach((el,i)=>{ el.onclick=()=>onClick&&onClick(rows[i],i); });
  }
  const drillOverlay=()=>document.getElementById('drillOverlay');
  function openDrill(title, cases){
    const ov=drillOverlay(); if(!ov) return;
    document.getElementById('drillTitle').textContent=title;
    document.getElementById('drillRows').innerHTML = cases.length ? cases.map(c=>`
      <tr><td class="id">${esc(c.id)}</td><td>${esc(c.subject||'-')}</td><td>${esc(c.region||'-')}</td><td>${esc((STAGE_LABELS_A5[lang]||STAGE_LABELS_A5.th)[c.stage]||c.stage||'-')}</td></tr>`).join('')
      : `<tr><td colspan="4" class="text-center text-muted py-3">${lang==='th'?'ไม่พบสำนวนตามเงื่อนไข':'No matching cases'}</td></tr>`;
    ov.classList.add('open');
  }
  function wireDrillClose(){
    const ov=drillOverlay(); if(!ov) return;
    document.getElementById('drillClose')?.addEventListener('click',()=>ov.classList.remove('open'));
    ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.remove('open'); });
  }

  function renderTrackPanels(cases){
    function fillTrack(track, prefix){
      const rows=cases.filter(c=>c.docType===track);
      const nEl=document.getElementById(prefix+'n'); if(nEl) nEl.textContent=rows.length;
      const buckets={onTrack:0,watch:0,overdue:0};
      rows.forEach(c=>{ const b=deadlineBucket(daysRemaining(c.deadline)); if(buckets[b]!==undefined) buckets[b]++; });
      const setTxt=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
      setTxt(prefix+'OnTrack',buckets.onTrack); setTxt(prefix+'Watch',buckets.watch); setTxt(prefix+'Over',buckets.overdue);
      const tbody=document.getElementById(prefix+'Rows'); if(!tbody) return;
      tbody.innerHTML = rows.length ? rows.map(c=>{
        const d=daysRemaining(c.deadline); const b=deadlineBucket(d);
        const pillClass=b==='overdue'?'critical':b==='watch'?'warning':b==='onTrack'?'good':'muted';
        const pillText = b==='overdue' ? (lang==='th'?`เกิน ${Math.abs(d)} วัน`:`${Math.abs(d)}d overdue`)
          : b==='watch' ? (lang==='th'?`เหลือ ${d} วัน`:`${d}d left`)
          : b==='onTrack' && d!==null ? (lang==='th'?`เหลือ ${d} วัน`:`${d}d left`)
          : (lang==='th'?'ยังไม่ถึงเฟสนี้':'not started');
        return `<tr><td class="fw-semibold">${esc(c.id)}</td><td>${esc((STAGE_LABELS_A5[lang]||STAGE_LABELS_A5.th)[c.stage]||c.stage)}</td>
          <td><span class="status-pill ${pillClass}">${pillText}</span></td>
          <td>${c.extensionCount>0?`<span class="status-pill warning">${c.extensionCount}×</span>`:'—'}</td></tr>`;
      }).join('') : `<tr><td colspan="4" class="text-center text-muted py-3">${lang==='th'?'ไม่มีสำนวนในสายนี้':'No cases in this track'}</td></tr>`;
    }
    fillTrack('213','db5t213');
    fillTrack('644','db5t644');
  }
  function renderStageFunnel(cases){
    const byStage={}; cases.forEach(c=>{ byStage[c.stage]=(byStage[c.stage]||0)+1; });
    const rows=STAGE_ORDER_A5.filter(s=>byStage[s]).map(s=>({key:s,label:(STAGE_LABELS_A5[lang]||STAGE_LABELS_A5.th)[s]||s,value:byStage[s]}));
    funnelChart(document.getElementById('db5Funnel'), rows, (row)=> openDrill((STAGE_LABELS_A5[lang]||STAGE_LABELS_A5.th)[row.key]||row.key, cases.filter(c=>c.stage===row.key)));
  }
  function loadA5(){
    let cases=[];
    try{
      const raw=localStorage.getItem('ecmis-a4-workspace-v3');
      const isInquiry=window.ECMISCasePartition?.isInquiryCase||(()=>false);
      if(raw){ const store=JSON.parse(raw); Object.values(store).forEach(st=>{
        if(!isInquiry(st)) return; // ไม่ใช่สำนวนไต่สวน (ก4) — ข้าม กันนับซ้ำ
        const c=st.caseData||st; const w=st.workflow||{}; const insp=st.inquiry||{};
        const track=trackOf(w.stage||'');
        const deadline = track==='644' ? (insp.inquiry644?.deadlineAt||'') : (insp.prelim?.deadlineAt||'');
        const extensions = (track==='644' ? insp.inquiry644?.extensionHistory : insp.prelim?.extensionHistory) || [];
        cases.push({
          id:c.id||'?', subject:c.subject||'-', region:c.region||'ส่วนกลาง', province:c.province||'-',
          channel:c.channel||'-',
          stage: w.stage||'a5-intake', deadline,
          receivedAt: insp.intake?.receivedFirstAt || c.receivedFirstAt || c.receivedAt || null,
          extensionCount: extensions.filter(h=>h.status==='APPROVED').length,
          investigator: insp.intake?.investigator || insp.inquiry644?.investigator || '',
          docType: track,
        });
      });}
    }catch(_e){}
    // หมายเหตุ: ไม่มี fallback ข้อมูลจำลองในไฟล์นี้อีกต่อไป — A5_SEED_CASES ใน
    // activity5-workspace.js เป็นผู้ seed ข้อมูลตัวอย่างลง localStorage ให้แล้ว
    // (ดู readStore() ที่นั่น) ดังนั้น store จะไม่ว่างเปล่าในทางปฏิบัติ
    return cases;
  }
  function filterCases(cases){
    const r=document.getElementById('db5Region')?.value||'';
    const t=document.getElementById('db5Type')?.value||'';
    return cases.filter(c=>{
      if(r && c.region!==r) return false;
      if(t && c.docType!==t) return false;
      return true;
    });
  }
  const PROV_COORDS={'กรุงเทพมหานคร':[13.7563,100.5018],'นนทบุรี':[13.8591,100.5210],'ชลบุรี':[13.3611,100.9847],'นครราชสีมา':[14.9799,102.0977],'ขอนแก่น':[16.4322,102.8236],'เชียงใหม่':[18.7883,98.9853],'พิษณุโลก':[16.8246,100.2589],'ราชบุรี':[13.5285,99.8134],'สุราษฎร์ธานี':[9.1382,99.3215],'สงขลา':[7.1756,100.4106]};
  let charts={}, leafletMap=null, markers=[];
  function destroyCharts(){ Object.values(charts).forEach(c=>{try{c.destroy();}catch(_e){}}); charts={}; }
  function render(){
    const all=loadA5();
    const cases=filterCases(all);
    const prelim=cases.filter(c=>c.docType==='213').length;
    const verdict=cases.filter(c=>c.docType==='644').length;
    const total=cases.length;
    const overdue=cases.filter(c=> c.docType!=='done' && daysRemaining(c.deadline)!==null && daysRemaining(c.deadline)<0).length;
    document.getElementById('db5Total').textContent=total.toLocaleString('th-TH');
    document.getElementById('db5Prelim').textContent=prelim.toLocaleString('th-TH');
    document.getElementById('db5Verdict').textContent=verdict.toLocaleString('th-TH');
    document.getElementById('db5Overdue').textContent=overdue.toLocaleString('th-TH');

    const watch=cases.filter(c=>{ if(c.docType==='done') return false; const d=daysRemaining(c.deadline); return d!==null && d>=0 && d<=30; });
    const over=cases.filter(c=>{ if(c.docType==='done') return false; const d=daysRemaining(c.deadline); return d!==null && d<0; });
    document.getElementById('db5WatchCount').textContent=watch.length;
    document.getElementById('db5OverCount').textContent=over.length;
    const overdueStat=document.getElementById('db5Overdue')?.closest('.db-stat');
    if(overdueStat){ overdueStat.style.cursor='pointer'; overdueStat.onclick=()=> openDrill(lang==='th'?'เกินกำหนด':'Overdue', over); }
    document.getElementById('db5WatchBody').innerHTML = watch.length? watch.slice(0,10).map(c=>`<tr><td class="fw-semibold" style="white-space:nowrap">${esc(c.id)}</td><td style="max-width:360px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(c.subject)}">${esc(c.subject)}</td><td style="white-space:nowrap"><span class="badge bg-warning text-dark">${Math.max(0,daysRemaining(c.deadline))} วัน</span></td><td style="white-space:nowrap">${esc(c.region)}</td></tr>`).join('') : `<tr><td colspan="4" class="text-center text-muted py-3">— ไม่มีเฝ้าระวัง —</td></tr>`;
    document.getElementById('db5OverBody').innerHTML = over.length? over.slice(0,10).map(c=>`<tr class="table-danger"><td class="fw-semibold" style="white-space:nowrap">${esc(c.id)}</td><td style="max-width:360px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(c.subject)}">${esc(c.subject)}</td><td style="white-space:nowrap"><span class="badge bg-danger">เกิน ${Math.abs(daysRemaining(c.deadline))} วัน</span></td><td style="white-space:nowrap">${esc(c.region)}</td></tr>`).join('') : `<tr><td colspan="4" class="text-center text-muted py-3">— ไม่มีเกินกำหนด —</td></tr>`;

    renderTrackPanels(cases);
    renderStageFunnel(cases);

    destroyCharts();
    const prelimCases=cases.filter(c=>c.docType==='213');
    const verdictCases=cases.filter(c=>c.docType==='644');
    function donutData(list){
      const normal=list.filter(c=>{const d=daysRemaining(c.deadline);return d===null||d>30;}).length;
      const warn=list.filter(c=>{const d=daysRemaining(c.deadline);return d!==null&&d>=16&&d<=30;}).length;
      const urg=list.filter(c=>{const d=daysRemaining(c.deadline);return d!==null&&d>=0&&d<=15;}).length;
      const od=list.filter(c=>{const d=daysRemaining(c.deadline);return d!==null&&d<0;}).length;
      return [normal,warn,urg,od];
    }
    const unitWord=lang==='th'?'สำนวน':'cases';
    const donutLabels5=lang==='th'?['ปกติ','ใกล้ครบ','เร่งด่วน','เกินกำหนด']:['Normal','Due soon','Urgent','Overdue'];
    const el1=document.getElementById('db5DonutPrelim');
    if(el1) charts.d1=new Chart(el1,{type:'doughnut',data:{labels:donutLabels5,datasets:[{data:donutData(prelimCases),backgroundColor:['#198754','#ffc107','#fd7e14','#dc3545'],borderWidth:2,hoverOffset:4}]},options:{cutout:'64%',plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${ctx.raw} ${unitWord}`}}},animation:false}});
    const el2=document.getElementById('db5DonutVerdict');
    if(el2) charts.d2=new Chart(el2,{type:'doughnut',data:{labels:donutLabels5,datasets:[{data:donutData(verdictCases),backgroundColor:['#198754','#ffc107','#fd7e14','#dc3545'],borderWidth:2,hoverOffset:4}]},options:{cutout:'64%',plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${ctx.raw} ${unitWord}`}}},animation:false}});

    const regs=['ส่วนกลาง','เขต 1','เขต 2','เขต 3','เขต 4','เขต 5','เขต 6','เขต 7','เขต 8','เขต 9'];
    const barVals=regs.map(r=> cases.filter(c=>c.region===r).length);
    const barEl=document.getElementById('db5BarRegion');
    if(barEl) charts.bar=new Chart(barEl,{type:'bar',data:{labels:regs,datasets:[{label:unitWord,data:barVals,backgroundColor:'rgba(102,16,242,.85)',borderRadius:6,borderSkipped:false}]},options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.raw} ${unitWord}`}}},scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:'rgba(148,163,184,.2)'}},y:{grid:{display:false}}},animation:false}});

    const trendLabels=[], trendVals=[];
    for(let i=11;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); trendLabels.push(THAI_MONTHS[d.getMonth()]+' '+(d.getFullYear()+543)); trendVals.push(cases.filter(c=>{ if(!c.receivedAt) return false; const rd=new Date(c.receivedAt); return !isNaN(rd) && rd.getFullYear()===d.getFullYear()&&rd.getMonth()===d.getMonth(); }).length); }
    const tr=document.getElementById('db5Trend');
    if(tr) charts.trend=new Chart(tr,{type:'line',data:{labels:trendLabels,datasets:[{label:(lang==='th'?'รับสำนวน':'Received'),data:trendVals,borderColor:'#6610f2',backgroundColor:'rgba(102,16,242,.08)',fill:true,tension:.35,pointRadius:4,pointHoverRadius:6,borderWidth:2}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.raw} ${unitWord}`}}},scales:{y:{beginAtZero:true,ticks:{precision:0},grid:{color:'rgba(148,163,184,.18)'}},x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:12}}},animation:false}});

    const months=[]; for(let i=11;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); months.push(d); }
    const regs2=['ส่วนกลาง','เขต 1','เขต 2','เขต 3','เขต 4','เขต 5','เขต 6','เขต 7','เขต 8','เขต 9'];
    let html='<thead><tr><th style="min-width:110px">เขตพื้นที่</th>'+months.map(d=>`<th class="text-center" style="font-size:11px;white-space:nowrap">${THAI_MONTHS[d.getMonth()]}</th>`).join('')+'<th class="text-center">รวม</th></tr></thead><tbody>';
    regs2.forEach(r=>{
      const counts=months.map(md=> cases.filter(c=> c.region===r && c.receivedAt && !isNaN(new Date(c.receivedAt)) && new Date(c.receivedAt).getFullYear()===md.getFullYear() && new Date(c.receivedAt).getMonth()===md.getMonth()).length);
      const max=Math.max(1,...counts);
      html+='<tr><td class="fw-semibold" style="white-space:nowrap">'+esc(r)+'</td>'+counts.map(cnt=>{ const lv=cnt===0?0:Math.min(7,Math.ceil(cnt/(max/7))); return `<td class="text-center p-1"><span class="heatmap-cell heat-${lv}" title="${cnt} สำนวน">${cnt||''}</span></td>`; }).join('')+`<td class="text-center fw-bold">${counts.reduce((a,b)=>a+b,0)}</td></tr>`;
    });
    html+='</tbody>';
    const ht=document.getElementById('db5HeatTable');
    if(ht) ht.innerHTML=html;

    renderMap(cases);
  }
  function renderMap(cases){
    const el=document.getElementById('db5Map'); if(!el) return;
    if(!leafletMap){ leafletMap=L.map('db5Map',{scrollWheelZoom:false}).setView([13.8,100.9],5.8); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:17}).addTo(leafletMap); }
    markers.forEach(m=>leafletMap.removeLayer(m)); markers=[];
    const byProv={}; cases.forEach(c=>{ const p=c.province||'ไม่ระบุ'; byProv[p]=(byProv[p]||0)+1; });
    const max=Math.max(1,...Object.values(byProv));
    Object.entries(byProv).forEach(([prov,cnt])=>{
      const coord=PROV_COORDS[prov]; if(!coord) return;
      const r=9+(cnt/max)*16;
      const color=cnt/max>0.66?'#dc3545':cnt/max>0.33?'#fd7e14':'#198754';
      const m=L.circleMarker(coord,{radius:r,fillColor:color,color:'#fff',weight:2,fillOpacity:.88}).addTo(leafletMap);
      m.bindPopup(`<b>${esc(prov)}</b><br>${cnt} สำนวน`);
      markers.push(m);
    });
    const note=document.getElementById('db5MapNote');
    if(note) note.textContent=`แสดง ${cases.length} สำนวน ตามจังหวัดเกิดเหตุ • วงกลมใหญ่ = สำนวนเยอะ`;
    setTimeout(()=>{ try{ leafletMap.invalidateSize(); }catch(_e){} }, 240);
  }
  function init(){
    if(SCOPED_REGION){
      const sel=document.getElementById('db5Region');
      if(sel){ sel.value=SCOPED_REGION; sel.disabled=true; }
      const banner=document.getElementById('db5ScopeBanner'), bannerText=document.getElementById('db5ScopeBannerText');
      if(banner&&bannerText){ banner.style.display='flex'; bannerText.textContent=(lang==='th'?'กำลังดูเฉพาะพื้นที่: ':'Showing only: ')+SCOPED_REGION; }
    }
    ['db5Region','db5Type'].forEach(id=> document.getElementById(id)?.addEventListener('change',render));
    document.getElementById('db5Print')?.addEventListener('click',()=>window.print());
    document.getElementById('db5Reset')?.addEventListener('click',()=>{ ['db5Region','db5Type'].forEach(id=>{ const e=document.getElementById(id); if(e&&!(id==='db5Region'&&SCOPED_REGION)) e.value=''; }); render(); });
    document.querySelectorAll('.db-section-tabs a').forEach(a=> a.addEventListener('click',e=>{ e.preventDefault(); const id=a.getAttribute('href').slice(1); document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}); document.querySelectorAll('.db-section-tabs a').forEach(x=>x.classList.remove('active')); a.classList.add('active'); setTimeout(()=>{ try{ leafletMap&&leafletMap.invalidateSize(); }catch(_e){} }, 300); }));
    document.querySelectorAll('.db-lang-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        lang=btn.dataset.lang;
        document.querySelectorAll('.db-lang-btn').forEach(b=>b.classList.toggle('active',b===btn));
        applyLang();
        const bannerText=document.getElementById('db5ScopeBannerText');
        if(SCOPED_REGION&&bannerText) bannerText.textContent=(lang==='th'?'กำลังดูเฉพาะพื้นที่: ':'Showing only: ')+SCOPED_REGION;
        render();
      });
    });
    wireDrillClose();
    setTimeout(render, 240);
    window.addEventListener('resize', ()=>{ try{ leafletMap&&leafletMap.invalidateSize(); }catch(_e){} });
    window.addEventListener('storage',render);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
