/* Dashboard ก4 — รับเรื่องร้องเรียน (Activity 4)
   แก้ขยะ: อยู่ใน #staffApp ให้ sidebar ดัน, filter มี label, ตารางไม่โดนตัด, กราฟมีเลข/รวมกลาง, responsive
*/
(() => {
  'use strict';
  const STORAGE_KEY = 'ecmis-a4-workspace-v3';
  const DEMO_KEY = 'ecmis-demo-cases';
  const THAI_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const REGIONS = ['ส่วนกลาง','เขต 1','เขต 2','เขต 3','เขต 4','เขต 5','เขต 6','เขต 7','เขต 8','เขต 9'];
  const CHANNELS = ['Website','Walk-in','สายด่วน 1206','หนังสือราชการ','จดหมาย','ม.62 (ป.ป.ช.)','เบอร์โทร ปปท. เขต 1-9'];

  const urlParams = new URLSearchParams(location.search);
  const urlRole = urlParams.get('role') || '';
  const urlRegion = urlParams.get('region') || '';
  const REGIONAL_ROLE_PREFIXES = ['regional-'];
  const isRegionalRole = REGIONAL_ROLE_PREFIXES.some(p=>urlRole.startsWith(p));
  const SCOPED_REGION = (isRegionalRole && REGIONS.includes(urlRegion)) ? urlRegion : null;

  const STAGE_LABELS = {
    th:{'admin-registry':'ธุรการ ศรร. รอออกเลข','central-registry':'สารบรรณกลาง รอบันทึกเลข','regional-registry':'ธุรการประจำเขต รอออกเลข','officer-finalize-screening':'เจ้าหน้าที่กลั่นกรอง','regional-officer':'เจ้าหน้าที่ประจำเขต','regional-director':'ผอ.เขต พิจารณา','center':'ศูนย์รับเรื่องฯ พิจารณา','officer':'เจ้าหน้าที่พิจารณา'},
    en:{'admin-registry':'Complaint-center clerk','central-registry':'Central registry clerk','regional-registry':'Regional registry clerk','officer-finalize-screening':'Officer screening','regional-officer':'Regional officer','regional-director':'Regional director review','center':'Complaint center review','officer':'Officer review'}
  };
  const STAGE_ORDER=['admin-registry','central-registry','regional-registry','officer-finalize-screening','regional-officer','regional-director','center','officer'];

  const I18N = {
    th:{}, // Thai is the source text already in the DOM; nothing to swap
    en:{
      pageTitle:'New Module 4 — Complaint Registry-Control & Statistics Analysis System',
      pageSub:'Track whether required registry books (Central / Case-Admin / Complaint-Center) are fully issued per channel, and how complaints are distributed.',
      filterYear:'Year received', filterRegion:'Region', filterChannel:'Channel',
      btnClear:'Clear', btnList:'Case list', btnPrint:'Print',
      tabOverview:'Overview', tabRegistry:'Registry', tabWatch:'Watchlist', tabCharts:'Charts', tabMap:'Map',
      statTotal:'Total complaints', statTotalSub:'All channels combined', hintList:'View list',
      statPending:'Pending', statPendingSub:'Awaiting registration & assignment', statPendingHint:'Clerk',
      statReview:'Under review', statReviewSub:'Officer / supervisor', statReviewHint:'In progress',
      statOverdue:'Overdue', statOverdueSub:'Over 30 days', statOverdueHint:'Needs follow-up',
      statCompletePct:'Overall registry completeness', statCompletePctSub:'Cases with every required registry number obtained', hintDetail:'View detail',
      statWorstChannel:'Lowest-completeness channel',
      registryByChannel:'Registry completeness — by intake channel', clickHint:'Click a row to see cases',
      registryStage:'Where cases sit in the registry pipeline',
      thCase:'Case No.', thSubject:'Subject', thChannelRegion:'Channel / region', thStage:'Status',
      watchHeader:'Watchlist — processing time', watchHeaderHint:'Over 30 days = overdue',
      watchWarn:'Watch (15–30 days)', watchOver:'Overdue (>30 days)',
      thCaseNo:'Case No.', thRegion:'Region',
      chartStatus:'Status breakdown', unitCases:'cases', chartRegion:'By region',
      chartTrend:'Intake trend — last 12 months', chartMap:'Map — density by province',
      legendLow:'Low', legendMid:'Medium', legendHigh:'High', legendHint:'Bigger circle = more cases • click for count',
    }
  };
  let lang='th';
  function applyLang(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n;
      const val=I18N[lang]?.[key];
      if(lang==='th'){ if(el.dataset.i18nTh) el.textContent=el.dataset.i18nTh; }
      else if(val){ if(!el.dataset.i18nTh) el.dataset.i18nTh=el.textContent; el.textContent=val; }
    });
  }

  function parseReceived(c){
    if(c.receivedAt) { const d=new Date(c.receivedAt); if(!isNaN(d)) return d; }
    if(c.received){ const m=String(c.received).match(/(\d{1,2})\s+([^ ]+)\s+(\d{4})/); if(m){ const map={มกราคม:0,กุมภาพันธ์:1,มีนาคม:2,เมษายน:3,พฤษภาคม:4,มิถุนายน:5,กรกฎาคม:6,สิงหาคม:7,กันยายน:8,ตุลาคม:9,พฤศจิกายน:10,ธันวาคม:11}; const mm=map[m[2]]; if(mm!==undefined) return new Date(+m[3]-543,mm,+m[1]); } }
    return null;
  }
  function daysSince(d){ if(!d || isNaN(d)) return null; return Math.floor((Date.now()-d.getTime())/86400000); }
  function loadCases(){
    let base = [];
    try{
      const txt = localStorage.getItem(STORAGE_KEY);
      if(txt){
        const store=JSON.parse(txt);
        const isInquiry = window.ECMISCasePartition?.isInquiryCase || (()=>false);
        base = Object.values(store).filter(s=>!isInquiry(s)).map(s=>{
          const c=s.caseData||s;
          return c ? {...c, _stage: s.workflow?.stage||''} : null;
        }).filter(Boolean);
      }
      const demo = JSON.parse(localStorage.getItem(DEMO_KEY)||'[]');
      demo.forEach(r=>{ if(r.trackingNumber) base.push({id:'DEMO-'+r.trackingNumber,subject:r.subject||'เรื่องร้องเรียน',channel:'Website',region:'ส่วนกลาง',province:'กรุงเทพมหานคร',received:r.submittedAt,receivedAt:r.submittedAt,allocationStatus:r.allocationStatus}); });
    }catch(_e){}
    if(base.length<8){
      const seeds=[
        {id:'ECMIS-2569-000184',subject:'ร้องเรียนการจัดซื้อวัสดุสำนักงานไม่เป็นไปตามระเบียบ',channel:'Website',region:'ส่วนกลาง',province:'กรุงเทพมหานคร',receivedAt:'2026-08-03T09:10:00+07:00',registry:{srr:'0102/2569'}},
        {id:'ECMIS-2569-000183',subject:'ร้องเรียนการใช้อำนาจโดยมิชอบของเจ้าหน้าที่',channel:'สายด่วน 1206',region:'เขต 2',province:'ชลบุรี',receivedAt:'2026-08-03T08:45:00+07:00',registry:{srr:'0103/2569'}},
        {id:'ECMIS-2569-000182',subject:'ขอให้ตรวจสอบการเบิกจ่ายงบประมาณโครงการ',channel:'หนังสือราชการ',region:'เขต 3',province:'นครราชสีมา',receivedAt:'2026-08-02T15:20:00+07:00',registry:{srr:'0104/2569'}},
        {id:'ECMIS-2569-000181',subject:'ร้องเรียนการเรียกรับผลประโยชน์',channel:'Walk-in',region:'เขต 4',province:'ขอนแก่น',receivedAt:'2026-08-02T13:05:00+07:00',registry:{srr:'0105/2569'}},
        {id:'ECMIS-2569-000180',subject:'แจ้งเบาะแสการเรียกรับผลประโยชน์ในการอนุมัติใบอนุญาต',channel:'Website',region:'ส่วนกลาง',province:'นนทบุรี',receivedAt:'2026-08-02T11:20:00+07:00',registry:{srr:'0107/2569'}},
        {id:'seed-admin-registry-letter-002',subject:'ขอให้ตรวจสอบการจัดซื้ออุปกรณ์สำนักงาน',channel:'จดหมาย',region:'ส่วนกลาง',province:'กรุงเทพมหานคร',receivedAt:'2026-08-10T14:20:00+07:00',registry:{office:'0142/2569',kbk:'0087/2569'}},
        {id:'seed-admin-registry-m62-003',subject:'ส่งเรื่องกล่าวหาให้ดำเนินการตามมาตรา 62',channel:'ม.62 (ป.ป.ช.)',region:'ส่วนกลาง',province:'นนทบุรี',receivedAt:'2026-08-10T13:45:00+07:00',registry:{office:'0143/2569',kbk:'0088/2569'}},
        {id:'seed-central-registry-letter-001',subject:'ร้องเรียนการจัดซื้อครุภัณฑ์โดยไม่เปิดเผยราคากลาง',channel:'จดหมาย',region:'ส่วนกลาง',province:'กรุงเทพมหานคร',receivedAt:'2026-08-04T10:30:00+07:00',registry:{}},
      ];
      const ids=new Set(base.map(c=>c.id)); seeds.forEach(s=>{ if(!ids.has(s.id)) base.push(s); });
    }
    return base;
  }
  function applyFilters(cases){
    const y=parseInt(document.getElementById('dbYear')?.value||'0',10)||0;
    const r=document.getElementById('dbRegion')?.value||'';
    const ch=document.getElementById('dbChannel')?.value||'';
    return cases.filter(c=>{
      if(y){ const d=parseReceived(c); if(!d || (d.getFullYear()+543)!==y) return false; }
      if(r && c.region!==r) return false;
      if(ch && c.channel!==ch) return false;
      return true;
    });
  }
  function bucket(c){
    // pending = ยังไม่มีเลขรับ/ยังไม่ลงทะเบียนเสร็จ
    const hasReg = !!(c.registry && (c.registry.srr||c.registry.kbk||c.registry.office||c.registry.region));
    if(c.allocationStatus==='pending' || (!hasReg && !c.trackingYear)) return 'pending';
    const d=parseReceived(c); const ds=daysSince(d);
    if(ds==null) return 'normal';
    if(ds>30) return 'overdue';
    if(ds>14) return 'watch';
    return 'normal';
  }
  function esc(s){ const d=document.createElement('div'); d.textContent=String(s??''); return d.innerHTML; }

  function rankList(container, rows, onClick){
    if(!container) return;
    const max=Math.max(1,...rows.map(r=>r.value));
    container.innerHTML = rows.map(r=>`
      <button type="button" class="rank-row"><span class="rank-label" title="${esc(r.label)}">${esc(r.label)}</span>
      <span class="rank-track"><span class="rank-fill" style="width:${Math.max(3,r.value/max*100)}%;background:${r.color||'#082b50'}"></span></span>
      <span class="rank-val">${esc(r.display!==undefined?r.display:r.value)}${r.suffix?`<small> ${esc(r.suffix)}</small>`:''}</span></button>`).join('');
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
      <tr><td class="id">${esc(c.id)}</td><td>${esc(c.subject||'-')}</td><td>${esc((c.channel||'-')+' · '+(c.region||'-'))}</td><td>${esc((STAGE_LABELS[lang]||STAGE_LABELS.th)[c._stage]||c._stage||'-')}</td></tr>`).join('')
      : `<tr><td colspan="4" class="text-center text-muted py-3">${lang==='th'?'ไม่พบเรื่องตามเงื่อนไข':'No matching cases'}</td></tr>`;
    ov.classList.add('open');
  }
  function wireDrillClose(){
    const ov=drillOverlay(); if(!ov) return;
    document.getElementById('drillClose')?.addEventListener('click',()=>ov.classList.remove('open'));
    ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.remove('open'); });
  }

  function renderRegistrySection(cases){
    const rc = window.ECMISActivity4DocumentRules?.registryCompleteness;
    if(!rc) return;
    const withCompleteness = cases.map(c=>({c, r:rc(c)}));
    const totalComplete = withCompleteness.filter(x=>x.r.isComplete).length;
    const pct = cases.length ? Math.round(100*totalComplete/cases.length) : 100;
    const pctEl=document.getElementById('dbStatRegistryPct'); if(pctEl) pctEl.firstChild.textContent=pct;

    const byChannel={};
    withCompleteness.forEach(({c,r})=>{
      const ch=c.channel||'-';
      byChannel[ch]=byChannel[ch]||{total:0,complete:0};
      byChannel[ch].total++; if(r.isComplete) byChannel[ch].complete++;
    });
    const channelEntries=Object.entries(byChannel).map(([name,d])=>({name,total:d.total,pct:d.total?Math.round(100*d.complete/d.total):100})).sort((a,b)=>a.pct-b.pct);
    if(channelEntries.length){
      const worst=channelEntries[0];
      const worstEl=document.getElementById('dbStatWorstChannel'); if(worstEl) worstEl.textContent=worst.pct+'%';
      const worstSubEl=document.getElementById('dbStatWorstChannelSub');
      if(worstSubEl) worstSubEl.textContent = worst.name+' ('+worst.total+(lang==='th'?' เรื่อง)':' cases)');
    }
    rankList(document.getElementById('dbRegistryRank'), channelEntries.map(e=>({label:e.name,value:e.pct,display:e.pct+'%',suffix:'· '+e.total,color:e.pct<50?'#a52c25':e.pct<90?'#caa631':'#22704a'})),
      (row)=> openDrill((lang==='th'?'ช่องทาง: ':'Channel: ')+row.label, cases.filter(c=>(c.channel||'-')===row.label)));

    const byStage={};
    cases.forEach(c=>{ const st=c._stage||'-'; byStage[st]=(byStage[st]||0)+1; });
    const stageRows=STAGE_ORDER.filter(s=>byStage[s]).map(s=>({key:s,label:(STAGE_LABELS[lang]||STAGE_LABELS.th)[s]||s,value:byStage[s]}));
    funnelChart(document.getElementById('dbRegistryFunnel'), stageRows,
      (row)=> openDrill((STAGE_LABELS[lang]||STAGE_LABELS.th)[row.key]||row.key, cases.filter(c=>(c._stage||'-')===row.key)));
  }

  let charts={}, markers=[];
  let leafletMap=null;
  function destroyCharts(){ Object.values(charts).forEach(ch=>{ try{ch.destroy();}catch(_e){} }); charts={}; }

  function render(){
    const all=loadCases();
    const cases=applyFilters(all);
    const pending=cases.filter(c=> bucket(c)==='pending').length;
    const overdue=cases.filter(c=> bucket(c)==='overdue').length;
    const watch=cases.filter(c=> bucket(c)==='watch').length;
    const review=cases.length - pending - overdue; // ปกติ+เฝ้าระวังที่เหลือ
    const total=cases.length;
    document.getElementById('dbStatTotal').textContent=total.toLocaleString('th-TH');
    document.getElementById('dbStatPending').textContent=pending.toLocaleString('th-TH');
    document.getElementById('dbStatReview').textContent=review.toLocaleString('th-TH');
    document.getElementById('dbStatDone').textContent=overdue.toLocaleString('th-TH');
    const donutTotalEl=document.getElementById('dbDonutTotal'); if(donutTotalEl) donutTotalEl.textContent=total.toLocaleString('th-TH');

    const warnList=cases.filter(c=> bucket(c)==='watch');
    const overList=cases.filter(c=> bucket(c)==='overdue');
    document.getElementById('dbWatchWarnCount').textContent=warnList.length;
    document.getElementById('dbWatchOverCount').textContent=overList.length;
    document.getElementById('dbWatchWarnBody').innerHTML = warnList.length? warnList.slice(0,10).map(c=>`<tr><td class="fw-semibold" style="white-space:nowrap">${esc(c.id)}</td><td class="cell-subject" title="${esc(c.subject)}">${esc(c.subject||'-')}</td><td style="white-space:nowrap">${esc(c.region||'-')}</td></tr>`).join('') : `<tr><td colspan="3" class="text-center text-muted py-3">— ไม่มีเรื่องเฝ้าระวัง —</td></tr>`;
    document.getElementById('dbWatchOverBody').innerHTML = overList.length? overList.slice(0,10).map(c=>`<tr class="table-danger"><td class="fw-semibold" style="white-space:nowrap">${esc(c.id)}</td><td class="cell-subject" title="${esc(c.subject)}">${esc(c.subject||'-')}</td><td style="white-space:nowrap">${esc(c.region||'-')}</td></tr>`).join('') : `<tr><td colspan="3" class="text-center text-muted py-3">— ไม่มีเรื่องเกินกำหนด —</td></tr>`;

    renderRegistrySection(cases);
    destroyCharts();
    const unitWord = lang==='th' ? 'เรื่อง' : 'cases';
    const donutLabels = lang==='th' ? ['รอดำเนินการ','เฝ้าระวัง','ปกติ','เกินกำหนด'] : ['Pending','Watch','Normal','Overdue'];
    const donutData=[pending, watch, Math.max(0,review-watch), overdue];
    const donutEl=document.getElementById('dbDonut');
    if(donutEl){
      charts.donut=new Chart(donutEl,{type:'doughnut',data:{labels:donutLabels,datasets:[{data:donutData,backgroundColor:['#0d6efd','#ffc107','#198754','#dc3545'],borderWidth:2,hoverOffset:4}]},options:{cutout:'66%',plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14,font:{size:12}}},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${ctx.raw} ${unitWord}`}}},animation:false}});
    }
    const regionCounts=REGIONS.map(r=> cases.filter(c=>c.region===r).length);
    const bar1=document.getElementById('dbBarRegion');
    if(bar1) charts.barRegion=new Chart(bar1,{type:'bar',data:{labels:REGIONS,datasets:[{label:unitWord,data:regionCounts,backgroundColor:'rgba(13,110,253,.9)',borderRadius:6,borderSkipped:false}]},options:{indexAxis:'y',maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.raw} ${unitWord}`}}},scales:{x:{beginAtZero:true,ticks:{precision:0},grid:{color:'rgba(148,163,184,.2)'}},y:{grid:{display:false}}},animation:false}});

    const trendLabels=[], trendVals=[];
    for(let i=11;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); trendLabels.push(THAI_MONTHS[d.getMonth()]+' '+(d.getFullYear()+543)); trendVals.push(cases.filter(c=>{ const rd=parseReceived(c); return rd && rd.getFullYear()===d.getFullYear() && rd.getMonth()===d.getMonth(); }).length); }
    const trendEl=document.getElementById('dbTrend');
    if(trendEl) charts.trend=new Chart(trendEl,{type:'line',data:{labels:trendLabels,datasets:[{label:(lang==='th'?'รับเรื่อง':'Received'),data:trendVals,borderColor:'#0d6efd',backgroundColor:'rgba(13,110,253,.09)',fill:true,tension:.35,pointRadius:4,pointHoverRadius:6,borderWidth:2}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.raw} ${unitWord}`}}},scales:{y:{beginAtZero:true,ticks:{precision:0},grid:{color:'rgba(148,163,184,.18)'}},x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:true,maxTicksLimit:12}}},animation:false}});

    const complete=cases.filter(c=> !!(c.registry && (c.registry.srr||c.registry.kbk||c.registry.office)) || !!c.trackingYear).length;
    const pct= total? Math.round(complete/total*100):100;
    const healthEl=document.getElementById('dbHealth');
    if(healthEl){ charts.health=new Chart(healthEl,{type:'doughnut',data:{datasets:[{data:[pct,100-pct],backgroundColor:[pct>=80?'#198754':pct>=50?'#ffc107':'#dc3545','#e9ecef'],borderWidth:0}]},options:{cutout:'72%',plugins:{legend:{display:false},tooltip:{enabled:false}},animation:false}}); const pctEl=document.getElementById('dbHealthPct'); if(pctEl){ pctEl.textContent=pct+'%'; pctEl.style.color=pct>=80?'#198754':pct>=50?'#997404':'#dc3545'; } }

    // heatmap
    const months=[]; for(let i=11;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); months.push(d); }
    let html='<thead><tr><th style="min-width:110px">เขตพื้นที่</th>'+months.map(d=>`<th class="text-center" style="font-size:11px;white-space:nowrap">${THAI_MONTHS[d.getMonth()]}</th>`).join('')+'<th class="text-center">รวม</th></tr></thead><tbody>';
    REGIONS.forEach(region=>{
      const counts=months.map(md=> cases.filter(c=>{ const rd=parseReceived(c); return rd && c.region===region && rd.getFullYear()===md.getFullYear() && rd.getMonth()===md.getMonth(); }).length);
      const max=Math.max(1,...counts);
      const totalRow=counts.reduce((a,b)=>a+b,0);
      html+='<tr><td class="fw-semibold" style="white-space:nowrap">'+esc(region)+'</td>'+counts.map(cnt=>{ const lv=cnt===0?0:Math.min(7,Math.ceil(cnt/(max/7))); return `<td class="text-center p-1"><span class="heatmap-cell heat-${lv}" title="${cnt} เรื่อง">${cnt||''}</span></td>`; }).join('')+`<td class="text-center fw-bold">${totalRow}</td></tr>`;
    });
    html+='</tbody>';
    const ht=document.getElementById('dbHeatTable'); if(ht) ht.innerHTML=html;

    renderMap(cases);
  }

  const PROV_COORDS={'กรุงเทพมหานคร':[13.7563,100.5018],'นนทบุรี':[13.8591,100.5210],'ชลบุรี':[13.3611,100.9847],'นครราชสีมา':[14.9799,102.0977],'ขอนแก่น':[16.4322,102.8236],'เชียงใหม่':[18.7883,98.9853],'พิษณุโลก':[16.8246,100.2589],'ราชบุรี':[13.5285,99.8134],'สุราษฎร์ธานี':[9.1382,99.3215],'สงขลา':[7.1756,100.4106]};
  function renderMap(cases){
    const el=document.getElementById('dbMap'); if(!el) return;
    if(!leafletMap){
      leafletMap=L.map('dbMap',{zoomControl:true,scrollWheelZoom:false}).setView([13.8,100.9],5.6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:17}).addTo(leafletMap);
    }
    markers.forEach(m=>leafletMap.removeLayer(m)); markers=[];
    const byProv={}; cases.forEach(c=>{ const p=c.province||'ไม่ระบุ'; byProv[p]=(byProv[p]||0)+1; });
    const max=Math.max(1,...Object.values(byProv));
    Object.entries(byProv).forEach(([prov,cnt])=>{
      const coord=PROV_COORDS[prov]; if(!coord) return;
      const r= 9 + (cnt/max)*16;
      const color = cnt/max>0.66?'#dc3545':cnt/max>0.33?'#fd7e14':'#198754';
      const m=L.circleMarker(coord,{radius:r,fillColor:color,color:'#fff',weight:2,fillOpacity:.88}).addTo(leafletMap);
      m.bindPopup(`<b>${esc(prov)}</b><br>${cnt} เรื่อง`);
      markers.push(m);
    });
    const note=document.getElementById('dbMapNote'); if(note) note.textContent = `แสดง ${cases.length} เรื่อง ตามจังหวัดเกิดเหตุ • วงกลมใหญ่ = เรื่องเยอะ • คลิกดูจำนวน`;
    setTimeout(()=>{ try{ leafletMap.invalidateSize(); }catch(_e){} }, 220);
  }

  function init(){
    const ysel=document.getElementById('dbYear');
    if(ysel){
      const years=[0]; const nowBE=new Date().getFullYear()+543; for(let y=nowBE;y>=nowBE-4;y--) years.push(y);
      ysel.innerHTML=years.map(y=> y===0?`<option value="0">ทุกปี พ.ศ.</option>`:`<option value="${y}">พ.ศ. ${y}</option>`).join('');
    }
    if(SCOPED_REGION){
      const regionSel=document.getElementById('dbRegion');
      if(regionSel){ regionSel.value=SCOPED_REGION; regionSel.disabled=true; }
      const banner=document.getElementById('dbScopeBanner'), bannerText=document.getElementById('dbScopeBannerText');
      if(banner&&bannerText){ banner.style.display='flex'; bannerText.textContent=(lang==='th'?'กำลังดูเฉพาะพื้นที่: ':'Showing only: ')+SCOPED_REGION; }
    }
    ['dbYear','dbRegion','dbChannel'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('change',render); });
    document.getElementById('dbPrint')?.addEventListener('click',()=>window.print());
    document.getElementById('dbReset')?.addEventListener('click',()=>{ ['dbYear','dbRegion','dbChannel'].forEach(id=>{ const e=document.getElementById(id); if(e&&!(id==='dbRegion'&&SCOPED_REGION)) e.value=id==='dbYear'?'0':''; }); render(); });
    document.querySelectorAll('.db-section-tabs a').forEach(a=>{ a.addEventListener('click',e=>{ e.preventDefault(); const id=a.getAttribute('href').slice(1); const target=document.getElementById(id); if(target) target.scrollIntoView({behavior:'smooth',block:'start'}); document.querySelectorAll('.db-section-tabs a').forEach(x=>x.classList.remove('active')); a.classList.add('active'); setTimeout(()=>{ try{ leafletMap&&leafletMap.invalidateSize(); }catch(_e){} }, 300); }); });
    document.querySelectorAll('.db-lang-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        lang=btn.dataset.lang;
        document.querySelectorAll('.db-lang-btn').forEach(b=>b.classList.toggle('active',b===btn));
        applyLang();
        const bannerText=document.getElementById('dbScopeBannerText');
        if(SCOPED_REGION&&bannerText) bannerText.textContent=(lang==='th'?'กำลังดูเฉพาะพื้นที่: ':'Showing only: ')+SCOPED_REGION;
        render();
      });
    });
    wireDrillClose();
    // รอ sidebar render เสร็จค่อยวาดกราฟ/แผนที่ จะได้ไม่โดนทับ (แก้บั๊ก board ก4)
    setTimeout(render, 220);
    window.addEventListener('resize', ()=>{ try{ leafletMap&&leafletMap.invalidateSize(); }catch(_e){} });
    window.addEventListener('storage',render);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
