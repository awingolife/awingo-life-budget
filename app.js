const stageIcons=['👶','📚','🎓','💼','🌿','🧓'];const choiceIcons={marriage:'💍',housing:'🏠',car:'🚗',children:'🧸',hobby:'🎨'};
const living=[['出生與幼兒','0–6歲',0,6,101.6],['學業養成','6–18歲',6,18,152.55],['專業養成','18–25歲',18,25,125.2],['職場與生活','25–40歲',25,40,350.0874],['中年與發展','40–65歲',40,65,655.4958],['退休與晚年','65歲以後',65,85,588]];
const stageRows=[
 [[0,3,[36000,18000,6000,96000,3000]],[3,6,[36000,6000,8000,36000,3000]]],
 [[6,12,[54000,6000,8000,36000,2000]],[12,15,[66000,8000,12000,48000,2500]],[15,18,[72000,10000,15000,60000,3000]]],
 [[18,22,[120000,52000,6000,6000]],[22,25,[144000,18000]]],
 [[25,30,[96000,18000,12000,6000,24000,12000,39965*1.2,18000]],[30,40,[108000,24000,12000,12000,18000,12000,46757*1.2,18000]]],
 [[40,50,[108000,24000,12000,18000,18000,12000,53593*1.2,18000]],[50,65,[108000,24000,12000,24000,18000,12000,56769*1.2,18000]]],
 [[65,75,[108000,18000,9600,24000,14400,72000,24000,6000]],[75,100,[108000,18000,9600,36000,14400,84000,48000,6000]]]
];
const itemNames=[['飲食','尿布／日用品','衣著／圖書／玩具','托育／幼兒園自付假設','日常醫療'],['飲食','衣著／日用品','學校費用','補習／安親／才藝合計','日常醫療'],['生活費','學費或工作進修','教材','學生交通'],['飲食','衣著／日用品','手機／網路','日常醫療','工作進修','人情／禮物','商業保費（薪資10%）','基本通勤'],['飲食','衣著／日用品','手機／網路','日常醫療','工作進修','人情／禮物','商業保費（薪資10%）','基本通勤'],['飲食','衣著／日用品','手機／網路','日常醫療','基本社交／人情往來','商業保費預算','基本照顧協助','日常交通']];
function rowItems(v,i,age){const row=stageRows[i].find(r=>age>=r[0]&&age<r[1]);return row[2].map((n,j)=>{if(i===0&&age<3&&j===3)return [0,v.careMonthly*12,360000][v.levels[0]];if(i===3&&j===7)return v.commuteMonthly*12;if(i===4&&j===7)return v.commuteMidMonthly*12;if(i===5&&j===7)return v.retireTransportMonthly*12;const fixed=(i===0&&j===3)||(i===3&&j===6)||(i===4&&j===6)||(i===5&&(j===5||j===6||j===7));return n*(fixed?1:factors[v.levels[i]])});}
function annualLiving(v,i,age){const custom=v.livingMonthly[i];if(custom!==null)return custom*12/10000;return rowItems(v,i,age).reduce((a,b)=>a+b,0)/10000;}
function stageExtras(i){return i===0?2:i===2?3:0;}
function studentHousingCost(v){return v.studentHousing==='home'?0:v.studentHousing==='dorm'?v.dormAnnual:v.rentAnnual;}
const labels=['預算考量','基本生存','享受生活'];
const factors=[.5,1,3];
const guessLabels=['2,000萬以下','2,000～4,000萬','4,000～6,000萬','6,000萬以上'];
const housingPrices=[500,1000,2000],carPresets=[{price:35,fuel:2.4,parking:1.2,maintenance:1,insurance:.88,tax:1,replace:12,until:66},{price:60,fuel:3.6,parking:2.4,maintenance:1.5,insurance:.93,tax:1.5,replace:10,until:60},{price:120,fuel:6,parking:3.6,maintenance:2.4,insurance:1.49,tax:2.5,replace:8,until:60}];
const childPresets=[{early:9,school:8,adult:0},{early:18,school:15,adult:12},{early:30,school:25,adult:25}];
const $=s=>document.querySelector(s);
const defaults=()=>({levels:[1,1,1,1,1,1],marriage:1,housing:1,car:1,hobby:1,children:0,childTier:1,life:85,marriageAge:30,housingAge:30,housingPrice:1000,downPercent:20,mortgageYears:30,mortgageRate:2.2,housingMode:'buy',rentAnnual:12,carAge:30,carUntil:60,carReplace:10,carPrice:60,carAnnual:8.43,carFuel:3.6,carParking:2.4,carMaintenance:1.5,carInsurance:.93,carTax:1.5,carDownPercent:20,carLoanYears:7,carLoanRate:5,carLoanFee:2600,childAge:32,childCount:1,childGap:3,childUntil:25,childEarly:76.4/6,childSchool:152.55/12,childAdult:134.8/7,hobbyStart:18,hobbyEnd:85,hobbyEndCustom:false,hobbyMonthly:2000,hobbyExtra:0,hobbyExtraAge:30,studentHousing:'dorm',dormAnnual:2.4,commuteMonthly:1500,commuteMidMonthly:1500,retireTransportMonthly:500,careMonthly:15000,childShare:100,familyExtra:'none',familyExtraMonthly:0,familyExtraStart:30,familyExtraEnd:85,guess:null,inspected:{},custom:{},edited:{},livingMonthly:[null,null,null,null,null,null]});
let state=defaults();
try{const saved=JSON.parse(localStorage.getItem('awingo-life-v13')||localStorage.getItem('awingo-life-v12')||localStorage.getItem('awingo-life-v11'));if(saved&&Array.isArray(saved.levels)&&saved.levels.length===6){state={...state,...saved,inspected:saved.inspected||{},custom:saved.custom||{},edited:saved.edited||{},livingMonthly:Array.isArray(saved.livingMonthly)&&saved.livingMonthly.length===6?saved.livingMonthly:[null,null,null,null,null,null]};if(saved.schema<8){state.commuteMidMonthly=1500;state.retireTransportMonthly=500;state.childTier=1}if(saved.schema<9){state.hobbyEndCustom=!!saved.edited?.hobby&&saved.hobbyEnd!==saved.life;if(state.car===0&&!saved.edited?.car)state.carUntil=66}if(saved.schema<5&&!saved.edited?.housing)state.housingPrice=housingPrices[Math.max(0,state.housing)];;if(!state.levels.every(v=>[0,1,2].includes(v)))state=defaults();for(const key of ['marriage','housing','car','hobby','children'])if(![-1,0,1,2].includes(state[key]))state[key]=key==='children'?-1:1;}}catch{}
const fmt=n=>(Math.abs(n)<0.05?0:n).toLocaleString('zh-TW',{maximumFractionDigits:1});
const money=n=>Number(n).toLocaleString('zh-TW',{maximumFractionDigits:0});
let chartMode='all';let current;
function normalize(){
 state.life=Math.min(100,Math.max(70,Math.round(Number(state.life)||85)));
 for(const [k,def] of Object.entries({marriageAge:30,housingAge:30,carAge:30,hobbyStart:18,childAge:32}))state[k]=Math.min(state.life-1,Math.max(18,Math.round(Number(state[k])||def)));
 state.mortgageYears=Math.min(40,Math.max(10,Math.round(Number(state.mortgageYears)||30)));
 state.mortgageRate=Math.min(10,Math.max(0,Number(state.mortgageRate)||0));
 state.housingPrice=Math.min(10000,Math.max(100,Number(state.housingPrice)||1000));
 state.downPercent=Math.min(100,Math.max(0,Number(state.downPercent)||0));
 state.carReplace=Math.min(30,Math.max(5,Math.round(Number(state.carReplace)||10)));
 state.carUntil=Math.min(100,Math.max(state.carAge+1,Math.round(Number(state.carUntil)||60)));
 state.carDownPercent=Math.min(100,Math.max(0,Number(state.carDownPercent) || 0));
 state.carLoanYears=Math.min(7,Math.max(1,Math.round(Number(state.carLoanYears)||7)));
 state.carLoanRate=Math.min(20,Math.max(0,Number(state.carLoanRate)||0));
 state.carLoanFee=Math.min(100000,Math.max(0,Number(state.carLoanFee)||0));
 for(const k of ['carPrice','carTax','childEarly','childSchool','childAdult','rentAnnual'])state[k]=Math.min(1000,Math.max(0,Number(state[k])||0));
 state.childCount=Math.min(5,Math.max(1,Math.round(Number(state.childCount)||1)));
 state.childGap=Math.min(20,Math.max(1,Math.round(Number(state.childGap)||3)));
 state.childUntil=[18,25].includes(+state.childUntil)?+state.childUntil:25;
 state.hobbyEnd=state.hobbyEndCustom?Math.min(100,Math.max(state.hobbyStart+1,Math.round(Number(state.hobbyEnd)||state.life))):state.life;
 for(const k of ['hobbyMonthly','hobbyExtra','familyExtraMonthly','dormAnnual','commuteMonthly','commuteMidMonthly','retireTransportMonthly','careMonthly','carFuel','carParking','carMaintenance','carInsurance'])state[k]=Math.max(0,Number(state[k])||0);
 state.carAnnual=carAnnualCost(state);
 state.childShare=Math.min(100,Math.max(0,Number(state.childShare)||0));
 for(const k of ['hobbyExtraAge','familyExtraStart','familyExtraEnd'])state[k]=Math.max(18,Math.min(state.life,Math.round(Number(state[k])||30)));
 if(!['buy','rent'].includes(state.housingMode))state.housingMode='buy';
}
function mortgageMonthly(v){const principal=v.housingPrice*(1-v.downPercent/100),r=v.mortgageRate/1200,n=v.mortgageYears*12;return r===0?principal/n:principal*r/(1-Math.pow(1+r,-n))}
function carAnnualCost(v){return +v.carFuel + +v.carParking + +v.carMaintenance + +v.carInsurance}
function carAges(v){const a=[];if(v.car>=0)for(let y=v.carAge;y<Math.min(v.carUntil,v.life);y+=v.carReplace)a.push(y);return a}
function carLoanMonthly(v){const p=v.carPrice*(1-v.carDownPercent/100),n=v.carLoanYears*12,r=v.carLoanRate/1200;return p===0?0:r===0?p/n:p*r/(1-Math.pow(1+r,-n))}
function carLoanBalance(v,paid){const p=v.carPrice*(1-v.carDownPercent/100),n=v.carLoanYears*12,r=v.carLoanRate/1200,m=carLoanMonthly(v);if(paid>=n)return 0;return Math.max(0,r===0?p-m*paid:p*Math.pow(1+r,paid)-m*(Math.pow(1+r,paid)-1)/r)}
function model(v){
 const keys=['living','marriage','housing','car','children','hobby'];
 const recurring=Object.fromEntries(keys.map(k=>[k,Array(v.life).fill(0)])),lumps=Object.fromEntries(keys.map(k=>[k,Array(v.life).fill(0)]));
 const carLoanByYear=Array(v.life).fill(0),carOperatingByYear=Array(v.life).fill(0);
 const carDownByYear=Array(v.life).fill(0),carPayoffByYear=Array(v.life).fill(0);
 const add=(key,age,amount,once=false)=>{if(age>=0&&age<v.life)(once?lumps:recurring)[key][age]+=amount};
 const parts=[];
 living.forEach((r,i)=>{const end=i===5?v.life:r[3];let sum=0;for(let age=r[2];age<end;age++){const annual=annualLiving(v,i,age);add('living',age,annual);sum+=annual}if(v.livingMonthly[i]===null){const extra=stageExtras(i)*factors[v.levels[i]];add('living',r[2],extra,true);sum+=extra}parts.push(sum)});
 if(v.marriage>=0)add('marriage',v.marriageAge,[10,40,120][v.marriage],true);
 for(let age=18;age<v.life;age++){
  const buying=v.housingMode==='buy'&&v.housing>=0;
  if(!buying||age<v.housingAge)add('housing',age,age<22?studentHousingCost(v):v.rentAnnual);
 }
 if(v.housingMode==='buy'&&v.housing>=0){add('housing',v.housingAge,v.housingPrice*v.downPercent/100,true);const monthly=mortgageMonthly(v);for(let month=0;month<v.mortgageYears*12;month++)add('housing',v.housingAge+Math.floor(month/12),monthly)}
 if(v.car>=0){
  const loanMonthly=carLoanMonthly(v),term=v.carLoanYears*12,hasLoan=v.carPrice*(1-v.carDownPercent/100)>0;
  for(const age of carAges(v)){
   const down=v.carPrice*v.carDownPercent/100+(hasLoan?v.carLoanFee/10000:0);
   add('car',age,down,true);carDownByYear[age]+=down;
   const monthsPaid=Math.min(term,(v.life-age)*12);
   for(let month=0;month<monthsPaid;month++){
    const year=age+Math.floor(month/12);
    add('car',year,loanMonthly);carLoanByYear[year]+=loanMonthly;
   }
   if(monthsPaid<term){
    const balance=carLoanBalance(v,monthsPaid);
    add('car',v.life-1,balance,true);carPayoffByYear[v.life-1]+=balance;
   }
  }
  for(let age=v.carAge;age<Math.min(v.carUntil,v.life);age++){
   const annual=carAnnualCost(v)+v.carTax;
   add('car',age,annual);carOperatingByYear[age]+=annual;
  }
 }
 if(v.children>0)for(let child=0;child<v.childCount;child++){const born=v.childAge+child*v.childGap;for(let age=0;age<v.childUntil;age++)add('children',born+age,(age<6?v.childEarly:age<18?v.childSchool:v.childAdult)*v.childShare/100)}
 if(v.children===0&&v.familyExtra!=='none')for(let age=v.familyExtraStart;age<Math.min(v.familyExtraEnd,v.life);age++)add(v.familyExtra==='quality'?'hobby':'children',age,v.familyExtraMonthly*12/10000);
 for(let age=v.hobbyStart;age<Math.min(v.hobbyEnd,v.life);age++)add('hobby',age,v.hobbyMonthly*12/10000);
 add('hobby',v.hobbyExtraAge,v.hobbyExtra,true);
 const years=Array.from({length:v.life},(_,age)=>keys.reduce((sum,k)=>sum+recurring[k][age]+lumps[k][age],0));
 const sums=Object.fromEntries(keys.map(k=>[k,recurring[k].reduce((x,y)=>x+y,0)+lumps[k].reduce((x,y)=>x+y,0)]));
 return {years,sums,parts,recurring,lumps,carLoanByYear,carOperatingByYear,carDownByYear,carPayoffByYear,total:years.reduce((x,y)=>x+y,0)};
}
function applyChildTier(v,t){const factor=[.5,1,3][t];v.childEarly=76.4/6*factor;v.childSchool=152.55/12*factor;v.childAdult=134.8/7;v.childTier=t}
function optionHint(key,i){if(key.startsWith('living')){const j=+key.slice(6),r=living[j],v={...state,levels:[...state.levels],livingMonthly:[...state.livingMonthly]};v.levels[j]=i;v.livingMonthly[j]=null;return '每月約 '+money(model(v).parts[j]/((j===5?v.life:r[3])-r[2])*10000/12)+' 元'}return {housing:housingPrices.map(n=>money(n)+' 萬元房價'),car:carPresets.map(p=>p.price+' 萬元／台'),marriage:[10,40,120].map(n=>'一次性 '+n+' 萬元'),hobby:[500,2000,5000].map(n=>'每月 '+money(n)+' 元')}[key]?.[i]||''}
const tierIcons=['<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/></svg>','<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M4 7V5a2 2 0 0 1 2-2h12v4M16 12h5"/><circle cx="16" cy="14" r=".6"/></svg>','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l4-5h10l4 5-9 12L3 9zm0 0h18M7 4l5 17 5-17"/><path d="M19 1v3M17.5 2.5h3"/></svg>'];
function options(key,selected,none){return `<div class="options">${labels.map((label,i)=>`<button class="option ${selected===i?'active':''}" aria-pressed="${selected===i}" data-key="${key}" data-level="${i}">${tierIcons[i]}<span>${label}</span><small>${optionHint(key,i)}</small></button>`).join('')}</div>${none?`<button class="btn none-option ${selected===-1?'active':''}" aria-pressed="${selected===-1}" data-key="${key}" data-level="-1">${none}</button>`:''}<p class="preset-note">重新選擇等級，會將這項金額套回參考設定。</p>`}
function childOptions(){return `<div class="options child-count">${['不養小孩','養 1 位','養 2 位'].map((t,i)=>`<button class="option ${state.children===i?'active':''}" aria-pressed="${state.children===i}" data-child-count="${i}"><span>${t}</span></button>`).join('')}</div>`}
function childTierOptions(){return `<div class="options">${labels.map((t,i)=>`<button class="option ${state.childTier===i?'active':''}" aria-pressed="${state.childTier===i}" data-child-tier="${i}">${tierIcons[i]}<span>${t}</span><small>每位0～滿18歲前約${fmt([114.475,228.95,686.85][i])}萬</small></button>`).join('')}</div>`}
function numberField(key,label,unit,step='0.1'){return `<div class="field"><label for="${key}">${label}</label><input id="${key}" type="number" min="0" step="${step}" value="${state[key]}"> ${unit}</div>`}
function ageField(key,label,min=18){return `<div class="field"><label for="${key}">${label}</label><input id="${key}" type="number" min="${key==='carReplace'?5:min}" max="${key==='carReplace'?30:state.life}" step="1" value="${state[key]}"> ${key==='carReplace'||key==='childGap'?'年':'歲'}</div>`}
const yuan=n=>money(n*10000)+' 元';
const badge=key=>state.edited[key]?'<span class="personal-tag">我的設定</span>':'';
function calculationDetails(i){const scale=factors[state.levels[i]],end=i===5?state.life:living[i][3];if(state.livingMonthly[i]!==null)return `<details class="calculation"><summary>看看費用怎麼算 ＋</summary><p>你自訂的每月 ${money(state.livingMonthly[i])} 元，乘以本階段 ${end-living[i][2]} 年，共 ${fmt(state.livingMonthly[i]*12*(end-living[i][2])/10000)} 萬元。這筆月額取代本階段的預設生活費明細；居住、婚禮、車貸等重大選擇仍各自計算。</p><p class="note">此月額由你自行設定，主計總處家庭收支資料不代表這筆個人預算。各年採固定價格，未加通膨。</p></details>`;const stageIntro=[`飲食、日用品等依所選等級計算；0～3歲保母費與3～6歲幼兒園費依照顧情境估算。`,`吃穿、學校費用、補習安親與日常醫療依所選等級估算。`,`生活、就學、教材與學生交通依所選等級估算；宿舍費另列在居住項目。`,`生活費依所選等級估算；商業保費按此階段假設薪資10%計，通勤另按每月設定計。`,`生活費依所選等級估算；商業保費按此階段假設薪資10%計，通勤另按每月設定計。`,`生活費依所選等級估算；商業保費、基本照顧協助與日常交通採固定情境預算。`][i];return `<details class="calculation"><summary>看看費用怎麼算 ＋</summary><p class="note">下列為目前選擇的年度情境。${stageIntro}生活項目以基本款的 ${scale} 倍試算；若自訂整段月額，會取代這段預設預算。</p>${stageRows[i].filter(r=>r[0]<end).map(r=>`<h4>${r[0]}～滿 ${Math.min(r[1],end)} 歲前｜每年</h4><div class="calc-table">${rowItems(state,i,r[0]).map((n,j)=>`<div class="flow-row"><span>${i===0&&r[0]===0&&j===3?(state.levels[0]===0?'家人照顧': '保母自付預算'):i===2&&r[0]===22?(j===0?'生活費':'工作進修'):itemNames[i][j]||'工作進修'}</span><b>${money(n)} 元</b></div>`).join('')}</div>`).join('')}${stageExtras(i)?`<p>另含一次性${i===0?'初期用品':'電腦／設備'} ${money(stageExtras(i)*scale*10000)}元。</p>`:''}<p>本段總額 ÷ ${((end-living[i][2])*12)} 個月＝預覽月平均；實際曲線依上列年齡分段。</p><p class="note">參考：<a href="https://eng.stat.gov.tw/News_Content.aspx?n=4218&s=236604" target="_blank" rel="noopener">主計總處114年家庭收支調查</a>${i===3||i===4?'；<a href="https://www.stat.gov.tw/News_Content.aspx?n=3703&s=235863" target="_blank" rel="noopener">114年薪資統計表6</a>（25–29：39,965；30–39：46,757；40–49：53,593；50–64：56,769元／月）':''}。官方家庭統計供分類與量級參考；本工具各項費用、托育自付、醫療${i===3||i===4?"及薪資10%商業保費":"與保費預算"}均為情境設定，不是官方個人成長費用平均。各年採固定價格，未加通膨。</p>${i===5?'<p class="note">基本照顧協助供偶爾陪診與生活協助，不足以代表全天看護或住宿機構。<a href="https://www.health.taichung.gov.tw/805068/post" target="_blank" rel="noopener">長照給付與部分負擔參考</a>。</p>':''}</details>`;}
function livingCard(i,m){
 if(!state.inspected['living'+i])return '';
 const key='living'+i,r=living[i],end=i===5?state.life:r[3],monthly=m.parts[i]*10000/(end-r[2])/12;
 const tags=i===0?['飲食／日用品','衣著／玩具','托育／幼兒園','日常醫療']:i===1?['吃穿／日用品','學校費用','補習／安親／才藝','日常醫療']:i===2?['生活費','學費／教材','進修／設備','學生交通']:itemNames[i];
 const notes=[
  '回想小時候的照顧方式，或先選一個接近的情境。保母、幼兒園依選項計入；這段不另外算手機網路、個人保費、交通與居住。不確定的費用，之後也可以問問父母或照顧者。',
  '想想求學時的吃穿、學校費用，以及曾參與的補習、安親或才藝。不確定先選接近的；這段不另外算手機網路、個人保費、交通與居住。',
  '這段包含生活、就學與學生時期的交通；18～滿22歲前的學生交通先抓每月500元。宿舍或租屋另在「居住」計算，工作通勤不算在這筆學生交通裡。',
  '這段先看日常生活、個人保費與基本通勤。通勤預設每月'+money(state.commuteMonthly)+'元；居住、買車與興趣另列。若開車已涵蓋通勤，可自行調低重複的交通費。',
  '這段同樣計入日常生活、個人保費與基本通勤。通勤預設每月'+money(state.commuteMidMonthly)+'元；居住、買車與興趣另列。若用車費已涵蓋通勤，可自行調整。',
  '這段包含晚年日常、較高的個人保費預算、基本照顧協助與日常交通。交通先抓每月'+money(state.retireTransportMonthly)+'元；居住及你選擇的興趣預算另列，不在這段重複加總。'
 ];
 return `<div class="reference"><strong>◇ ${r[0]}｜${labels[state.levels[i]]} ${badge(key)}</strong><div class="monthly-line">這段花費攤平均每月 <b>${money(monthly)}</b> 元</div><p>${r[2]}歲至滿${end}歲前；這段合計約${fmt(m.parts[i])}萬元。</p><div class="coverage">${tags.map(t=>`<span>${t}</span>`).join('')}</div><p class="sub">${notes[i]}</p>${calculationDetails(i)}${customButton(key)}${state.custom[key]?`${i===0?numberField('careMonthly','基本生存保母每月自付','元','500'):''}${i===3?numberField('commuteMonthly','每月基本通勤','元','100'):''}${i===4?numberField('commuteMidMonthly','每月基本通勤','元','100'):''}${i===5?numberField('retireTransportMonthly','每月日常交通','元','100'):''}<p class="note">填入月額後，會取代這段預設生活預算；居住、用車與興趣仍另外計算。</p><div class="field"><label for="livingMonthly${i}">用我的月預算取代本階段設定</label><input type="number" id="livingMonthly${i}" data-living-month="${i}" min="0" step="100" value="${Math.round(monthly)}"> 元</div>`:''}</div>`;
}
function housingCard(){if(!state.inspected.housing)return '';const buy=state.housing>=0&&state.housingMode==='buy',p=state.housingPrice,down=p*state.downPercent/100;return `<div class="reference"><strong>◇ ${buy?money(p)+' 萬元的房子':'不買房｜租屋'} ${badge('housing')}</strong><div class="monthly-line">${buy?'房貸期間每月':'租屋每月'}約 <b>${money((buy?mortgageMonthly(state):state.rentAnnual/12)*10000)}</b> 元</div>${buy?`<p>${state.housingAge}歲付自備款 ${fmt(down)} 萬（${state.downPercent}%），其餘 ${fmt(p-down)} 萬貸款 ${state.mortgageYears} 年，年利率假設 ${state.mortgageRate}%。買房當年停止租金，不再加整筆房價。</p>`:'<p>租金計到試算終點，包含65歲以後，不因退休歸零。</p>'}<p>18～滿22歲前：${{home:'住家裡，住房支出0元',dorm:'學生宿舍，每年'+fmt(state.dormAnnual)+'萬元',rent:'租屋，每年'+fmt(state.rentAnnual)+'萬元'}[state.studentHousing]}；滿22歲後、買房前每月租金 ${money(state.rentAnnual*10000/12)} 元。</p><p class="sub">學生住房三選一；買房後優先計房貸。未含水電、管理、修繕、房屋持有與購屋稅費、裝潢；租金固定，無房屋出售回收。</p>${customButton('housing')}${state.custom.housing?`<div class="field"><label for="studentHousing">18～22歲住房</label><select id="studentHousing">${[['home','住家裡'],['dorm','學生宿舍'],['rent','租屋']].map(([v,t])=>`<option value="${v}" ${state.studentHousing===v?'selected':''}>${t}</option>`).join('')}</select></div>${numberField('dormAnnual','宿舍每年','萬元')}${numberField('rentAnnual','租屋每年','萬元')}${buy?ageField('housingAge','預計買房年齡')+numberField('housingPrice','房屋總價','萬元','1')+numberField('downPercent','自備款比例','%')+numberField('mortgageYears','房貸年限','年','1')+numberField('mortgageRate','房貸年利率假設','%'):''}`:''}</div>`}
function customButton(key){return `<button class="btn" data-expand="${key}">${state.custom[key]?'收起個別化設定':'改成我的情況 ＋'}</button>`}
function fmtCar(n){return String(Number(Number(n).toFixed(2)))}
function carCard(){
 if(!state.inspected.car)return '';
 if(state.car<0)return '<div class="reference"><strong>◇ 不買車</strong><p>購車、車貸與用車費為0；25～65歲及晚年仍有基本交通預算，可在各階段調整。</p></div>';
 const ages=carAges(state),annual=carAnnualCost(state)+state.carTax,operating=annual*10000/12,loan=carLoanMonthly(state)*10000,hasLoan=loan>0;
 const items=[['加油／充電',state.carFuel],['停車',state.carParking],['保養維修',state.carMaintenance],['汽車保險',state.carInsurance],['稅費',state.carTax]];
 const balances=ages.reduce((sum,age)=>sum+carLoanBalance(state,Math.min(state.carLoanYears*12,(state.life-age)*12)),0);
 return `<div class="reference"><strong>◇ ${labels[state.car]}｜預計買${ages.length}台車 ${badge('car')}</strong><div class="monthly-line">${hasLoan?'車貸期間每月約':'每月用車費約'} <b>${money(loan+operating)}</b> 元</div><p>${hasLoan?`每月車貸約${money(loan)}元，加上用車費約${money(operating)}元；還清後每月用車費約${money(operating)}元。`:'這個設定沒有車貸，每月金額只包含用車費。'}</p><p>${state.carAge}歲起用車，到滿${Math.min(state.carUntil,state.life)}歲前；每${state.carReplace}年換車，共買${ages.length}台。購車年齡：${ages.join('、')}歲。</p><p>每台車${fmt(state.carPrice)}萬元，買車當年付頭期款${fmt(state.carPrice*state.carDownPercent/100)}萬元（${state.carDownPercent}%）；${hasLoan?`其餘${fmt(state.carPrice*(1-state.carDownPercent/100))}萬元，以${state.carLoanYears}年、年利率${state.carLoanRate}%試算車貸。每筆貸款費用另假設${money(state.carLoanFee)}元。`:'其餘無貸款。'}頭期款與貸款月付計入後，不再加整筆車價。</p><div class="calc-table">${items.map(([t,n])=>`<div class="flow-row"><span>${t}</span><b>${fmtCar(n)}萬元／年</b></div>`).join('')}</div><p>持續用車費合計${fmtCar(annual)}萬元／年。加油金已在裡面，不另加總。</p><p class="note">上述車貸年限、利率與貸款費用是課堂試算條件，不保證實際核貸。基本通勤另列於生活費，若同一趟路已包含在用車費中，可回到該階段調低。${state.carReplace<state.carLoanYears?'換車期間可能有兩筆車貸同時還款，圖表會一起計入。':''}${balances>0?'試算終點仍有未清車貸約'+fmt(balances)+'萬元，已列在最後一年清償。':''}</p><details class="calculation"><summary>看看費用怎麼算 ＋</summary><p>每台車＝頭期款＋貸款本息（月付×期數）＋貸款費用；持續用車費另按用車年數加總。月付採本息平均攤還。售出舊車的回收款未扣除。</p><p class="note">參考：<a href="https://www.skbank.com.tw/carloan/" target="_blank" rel="noopener">新光銀行中古車貸款</a>公開最長7年；<a href="https://mkp.taishinbank.com.tw/TsCms/marketing/expose/WM_20190125103622697/index.html?openExternalBrowser=1" target="_blank" rel="noopener">台新銀行中古車貸款</a>揭露利率與費用範例。實際成數、利率、期限與費用依個別核貸結果而定。</p></details>${customButton('car')}${state.custom.car?`<div class="custom-fields">${ageField('carAge','首次買車年齡')}${ageField('carUntil','用車到幾歲')}${ageField('carReplace','每幾年換車',1)}${numberField('carPrice','每次購車價格','萬元','1')}${numberField('carDownPercent','頭期款比例','%','1')}${numberField('carLoanYears','車貸年限（最多7年）','年','1')}${numberField('carLoanRate','車貸年利率假設','%')}${numberField('carLoanFee','每次貸款費用','元','100')}${numberField('carFuel','加油／充電每年','萬元')}${numberField('carParking','停車每年','萬元')}${numberField('carMaintenance','保養維修每年','萬元')}${numberField('carInsurance','汽車保險每年','萬元')}${numberField('carTax','稅費每年','萬元')}</div>`:''}</div>`;
}
function childCard(){
 if(!state.inspected.children)return '';
 if(state.children===0)return `<div class="reference"><strong>◇ 不養小孩</strong><p>預設不增加養育費。毛小孩與生活品質可在個別化設定中另外加入。</p>${customButton('children')}${state.custom.children?`<div class="field"><label for="familyExtra">延伸生活選擇</label><select id="familyExtra">${[['none','暫不增加支出'],['pet','養毛小孩'],['quality','提升生活品質']].map(([v,t])=>`<option value="${v}" ${state.familyExtra===v?'selected':''}>${t}</option>`).join('')}</select></div>${state.familyExtra!=='none'?numberField('familyExtraMonthly','額外每月預算','元','100')+ageField('familyExtraStart','開始年齡')+ageField('familyExtraEnd','結束年齡'):''}`:''}</div>`;
 const tierText=[`每位孩子0～滿18歲前約114.5萬元，以基本方案一半試算；在托育、生活用品與學習安排上多留意預算。`,`每位孩子0～滿18歲前約229萬元，作為養育費的參考基準。`,`每位孩子0～滿18歲前約686.9萬元，以基本方案三倍試算；為照顧安排、學習體驗與生活選擇留較多預算。`];
 return `<div class="reference"><strong>◇ 養育${state.childCount}位孩子 ${badge('children')}</strong><div class="field"><label for="childAge">預計幾歲生第一位小孩？</label><input id="childAge" type="number" min="18" max="${state.life-1}" step="1" value="${state.childAge}"> 歲</div>${state.childCount>1?ageField('childGap','兩位相隔幾年',1):''}<p>依你設定的生育年齡，將孩子的養育費逐年標在圖表上。</p><strong>孩子0～滿18歲前的養育預算</strong>${childTierOptions()}<p>${state.edited.children?'已依你填入的金額試算，選擇等級可恢復參考預算。':tierText[state.childTier]}</p><div class="monthly-grid">${[['0–5歲',state.childEarly],['6–17歲',state.childSchool],...(state.childUntil===25?[['18–24歲支援',state.childAdult]]:[])].map(([t,n])=>`<span>每位${t}<br><b>${yuan(n/12)}／月</b></span>`).join('')}</div><p class="note">三種等級只調整孩子0～17歲費用；18～24歲支援另計，可在個別化設定調整。這裡算孩子，上方成長階段算你自己；住房與用車若增加請另調整。${state.childShare!==100?'目前自己負擔比例為'+state.childShare+'%。':''}</p>${customButton('children')}${state.custom.children?numberField('childCount','孩子人數','位','1')+numberField('childShare','自己負擔比例','%','1')+`<div class="field"><label for="childUntil">支援至</label><select id="childUntil"><option value="18" ${state.childUntil===18?'selected':''}>18歲</option><option value="25" ${state.childUntil===25?'selected':''}>25歲</option></select></div>`+numberField('childEarly','每位0–5歲每年','萬元')+numberField('childSchool','每位6–17歲每年','萬元')+numberField('childAdult','每位18–24歲支援每年','萬元'):''}</div>`;
}
function marriageCard(){if(!state.inspected.marriage)return '';return state.marriage<0?'<div class="reference">選擇不結婚，這項婚禮支出為 0。</div>':`<div class="reference"><strong>◇ 結婚預算 ${badge('marriage')}</strong>${ageField('marriageAge','預計幾歲結婚？')}<div class="monthly-line">當年一次性支出 <b>${[10,40,120][state.marriage]}</b> 萬元</div><p>包含登記、婚禮、婚戒與蜜月的合計假設。不列為每月固定支出；養小孩另外選擇。</p></div>`}
function hobbyCard(){
 if(!state.inspected.hobby)return '';
 const description=['以免費或低花費的活動為主，偶爾買本書、看場電影，留一點錢給喜歡的事。','留一筆固定預算給閱讀、運動、影音娛樂；想上課或安排短途出遊時，從這筆預算慢慢存。','願意為課程、運動和旅行多留一些預算。平常不一定花滿，也可以累積起來安排一趟旅行。'];
 return `<div class="reference"><strong>◇ 興趣與休閒 ${badge('hobby')}</strong><div class="monthly-line">每月 <b>${money(state.hobbyMonthly)}</b> 元</div><p>${state.hobbyStart}歲至滿${Math.min(state.hobbyEnd,state.life)}歲前，每年${money(state.hobbyMonthly*12)}元。${description[state.hobby]}</p><p class="note">退休興趣費也在這裡計算。旅行與設備若已包含在每月預算裡，不用再填進額外支出；工作進修、孩子才藝與蜜月不重複計算。</p><details class="calculation"><summary>看看費用怎麼算 ＋</summary><p>每月預算×12×持續年數＋尚未包含的額外一次性費用。月額是全年攤開的預算，不表示每月花費一樣。</p><p class="note"><a href="https://eng.stat.gov.tw/News_Content.aspx?n=4218&s=236604" target="_blank" rel="noopener">主計總處114年家庭收支調查第1表</a>：單人戶全年休閒、運動與文化16,278元（每月約1,357元），涵蓋各年齡，與本工具分類不完全相同。本工具500／2,000／5,000元為情境預算，並非官方等級。</p></details>${customButton('hobby')}${state.custom.hobby?ageField('hobbyStart','開始年齡')+ageField('hobbyEnd','結束年齡')+numberField('hobbyMonthly','每月預算','元','100')+numberField('hobbyExtra','未包含的額外設備／旅行','萬元')+ageField('hobbyExtraAge','額外支出年齡'):''}</div>`;
}
function eventNames(age,v){const out=[];if(v.marriage>=0&&age===v.marriageAge)out.push('結婚');if(v.housingMode==='buy'&&v.housing>=0&&age===v.housingAge)out.push('買房');if(carAges(v).includes(age))out.push(age===v.carAge?'買車':'換車');if(v.children>0)for(let i=0;i<v.childCount;i++)if(age===v.childAge+i*v.childGap)out.push('孩子出生');if(v.hobbyExtra>0&&age===v.hobbyExtraAge)out.push('興趣大筆支出');return out;}
function svgChart(m,download=false){
 const W=900,H=download?760:420,top=download?175:50,bottom=download?550:330,left=65,right=875;
 const monthly=m.years.map((_,i)=>Object.keys(m.recurring).reduce((a,k)=>a+m.recurring[k][i],0));
 const lumps=m.years.map((_,i)=>Object.keys(m.lumps).reduce((a,k)=>a+m.lumps[k][i],0));
 const all=download||chartMode==='all',max=Math.max(20,Math.ceil(Math.max(...(all?m.years:monthly))/20)*20),x=a=>left+a/state.life*(right-left),y=v=>bottom-v/max*(bottom-top);
 let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="每年持續支出曲線與當年重大支出柱，年齡每五歲標示一次" style="font-family:system-ui,sans-serif"><rect width="900" height="${H}" fill="${download?'#fff':'#0b192d'}" rx="16"/>`;
 if(download)out+=`<text x="35" y="42" fill="#a47e3e" font-size="20">◇ AwinGo｜我的人生花費圖 v1.5</text><text x="35" y="90" fill="#0b192d" font-size="34" font-weight="bold">一生總花費 ${fmt(m.total)} 萬元</text><text x="35" y="117" fill="#627083" font-size="14">出生至滿${state.life}歲前・固定幣值試算・非臺灣平均</text><text x="35" y="145" fill="#627083" font-size="14">房價 ${state.housing<0?'租屋':fmt(state.housingPrice)+'萬'}・購車 ${carAges(state).length} 台・養育 ${state.children<=0?0:state.childCount} 位孩子</text>`;
 for(const [a,b,color]of [[0,20,download?'#f3eee3':'#203449'],[20,40,download?'#eaf0f3':'#2b4055'],[40,state.life,download?'#f9f5eb':'#1b3045']])out+=`<rect x="${x(a)}" y="${top}" width="${x(b)-x(a)}" height="${bottom-top}" fill="${color}"/>`;
 for(let i=0;i<state.life;i++)out+=`<line x1="${x(i)}" y1="${top}" x2="${x(i)}" y2="${bottom}" stroke="${download?'#bbb':'#fff'}" opacity="${i%5===0?.23:.09}" stroke-dasharray="${i%5===0?'2 5':'1 8'}"/>`;
 for(let i=0;i<=4;i++){const v=max*i/4;out+=`<line x1="${left}" y1="${y(v)}" x2="${right}" y2="${y(v)}" stroke="${download?'#ddd':'#ffffff22'}" stroke-dasharray="3 5"/><text x="${left-10}" y="${y(v)+4}" text-anchor="end" font-size="13" fill="${download?'#627083':'#bac8d6'}">${fmt(v)}</text>`}
 out+=`<text x="12" y="${top-16}" font-size="13" fill="${download?'#627083':'#bac8d6'}">萬元／年</text>`;
 if(all)lumps.forEach((n,i)=>{if(n>0)out+=`<rect x="${x(i+.18)}" y="${y(monthly[i]+n)}" width="${Math.max(4,(right-left)/state.life*.56)}" height="${y(monthly[i])-y(monthly[i]+n)}" fill="${download?'#748fa2':'#8fb2c2'}" opacity=".88"><title>${i}歲一次性支出${fmt(n)}萬元</title></rect>`});
 const points=monthly.map((v,i)=>`${x(i+.5)},${y(v)}`).join(' ');
 out+=`<polyline points="${points}" fill="none" stroke="#d5ac62" stroke-width="3.6" stroke-linejoin="round"/>`;
 for(const a of [20,40])out+=`<line x1="${x(a)}" y1="${top}" x2="${x(a)}" y2="${bottom}" stroke="#9a855e" stroke-width="1.4" stroke-dasharray="5 4"/>`;
 for(let a=0;a<=state.life;a+=5)out+=`<text x="${x(a)}" y="${bottom+21}" text-anchor="middle" font-size="11" fill="${download?'#627083':'#bac8d6'}">${a}</text>`;
 for(const [a,b,label]of [[0,20,'依賴期'],[20,40,'獨立期'],[40,state.life,'互賴期']])out+=`<text x="${x((a+b)/2)}" y="${bottom+48}" text-anchor="middle" font-size="15" fill="${download?'#18273a':'#edf1f5'}">${label}</text>`;
 const eventIcons={'結婚':'💍','買房':'🏠','買車':'🚗','換車':'🚙','孩子出生':'👶','興趣大筆支出':'🎨'};
 for(let age=0;age<state.life;age++){const ev=eventNames(age,state);if(ev.length){const at=x(age+.5),row=age%2?bottom-31:bottom-14;out+=`<circle cx="${at}" cy="${bottom-5}" r="5" fill="#ee9e79"><title>${age}歲：${ev.join('、')}</title></circle><text x="${at}" y="${row}" text-anchor="middle" font-size="${ev.length>1?15:19}" aria-hidden="true">${ev.map(name=>eventIcons[name]||'✦').join('')}<title>${age}歲：${ev.join('、')}</title></text>`}}
 if(!download)m.years.forEach((v,i)=>out+=`<rect data-age="${i}" x="${x(i)}" y="${top}" width="${(right-left)/state.life}" height="${bottom-top+15}" fill="transparent" style="cursor:pointer"><title>${i}歲：持續${fmt(monthly[i])}萬，一次性${fmt(lumps[i])}萬</title></rect>`);
 if(download){out+=`<text x="35" y="614" fill="#63748a" font-size="16">金線：每年持續支出　藍柱：當年一次性支出　橘點：人生事件</text>`;[[0,20,'依賴期'],[20,40,'獨立期'],[40,state.life,'互賴期']].forEach(([a,b,t],i)=>{out+=`<text x="${35+i*290}" y="665" fill="#18273a" font-size="19">${t} ${fmt(m.years.slice(a,b).reduce((x,y)=>x+y,0))} 萬</text>`});out+=`<text x="35" y="710" fill="#a47e3e" font-size="17">AwinGo × 阿偉哥｜先看見花費，再選擇想過的生活。</text><text x="35" y="738" fill="#627083" font-size="13">回饋 awingolife@gmail.com・金額可能因四捨五入略有差異</text>`;}return out+'</svg>';
}
const categoryNames={living:'日常生活',marriage:'結婚',housing:'居住／房貸',car:'用車',children:'家庭／養育',hobby:'興趣與休閒'};
let flowAge=30;
function renderMonthly(){
 if(!current)return;
 flowAge=Math.min(state.life-1,Math.max(0,flowAge));
 $('#flowAge').max=state.life-1;$('#flowAge').value=flowAge;$('#flowAgeLabel').textContent=flowAge;
 const keys=Object.keys(categoryNames);
 const total=keys.reduce((n,k)=>n+current.recurring[k][flowAge],0);
 $('#monthTotal').textContent=money(total*10000/12);
 const rows=keys.filter(k=>current.recurring[k][flowAge]>0).flatMap(k=>{
  if(k==='car')return [
   ...(current.carLoanByYear[flowAge]>0?[['車貸月付',current.carLoanByYear[flowAge]]]:[]),
   ...(current.carOperatingByYear[flowAge]>0?[['用車費（含油電等）',current.carOperatingByYear[flowAge]]]:[])
  ];
  return [[categoryNames[k],current.recurring[k][flowAge]]];
 });
 $('#monthRows').innerHTML=rows.map(([label,value])=>`<div class="flow-row"><span>${label}</span><b>${money(value*10000/12)} 元／月</b></div>`).join('');
 $('#yearTotal').textContent=fmt(current.years[flowAge])+' 萬元';
 $('#yearEvents').textContent=eventNames(flowAge,state).join('、')||'日常生活';
 const once=keys.filter(k=>current.lumps[k][flowAge]>0);
 const lumps=once.flatMap(k=>{
  if(k==='car')return [
   ...(current.carDownByYear[flowAge]>0?[['買車頭期款／貸款費用',current.carDownByYear[flowAge]]]:[]),
   ...(current.carPayoffByYear[flowAge]>0?[['試算終點未清車貸',current.carPayoffByYear[flowAge]]]:[])
  ];
  return [[categoryNames[k],current.lumps[k][flowAge]]];
 });
 $('#onceRows').innerHTML=lumps.length?'<strong>這一年另有的大筆支出</strong>'+lumps.map(([label,value])=>`<div class="flow-row"><span>${label}</span><b>${fmt(value)} 萬元</b></div>`).join(''):'這一年沒有另外設定的大筆支出。';
}
function render(){
 normalize();const m=model(state);current=m;
 $('#lifeLabel').textContent=state.life;$('#lifespan').value=state.life;
 $('#living').innerHTML=living.map((r,i)=>`<div class="row"><div class="row-head"><h3><span class="stage-emoji" aria-hidden="true">${stageIcons[i]}</span> ${r[0]} <span class="sub">${i===5?'65–'+state.life+'歲':r[1]}</span></h3><span class="cost">${fmt(m.parts[i])} 萬</span></div>${options('living'+i,state.levels[i])}${livingCard(i,m)}</div>`).join('');
 $('#choices').innerHTML=[['marriage','結婚','一次性婚禮與相關準備；養小孩另外計算。','不結婚',marriageCard],['housing','居住／買房','先準備自備款，再按月還房貸。','不買房（租屋）',housingCard],['car','買車／用車','看見一生會買幾台，以及每月的用車負擔。','不買車',carCard],['children','家庭與生活選擇','先選孩子人數與預計生育年齡，再選接近你的養育預算。',null,childCard],['hobby','興趣與休閒','你想每月留多少錢，做自己喜歡的事？選個接近的預算，看看這筆花費累積起來是多少。',null,hobbyCard]].map(([key,title,desc,none,card])=>`<div class="row"><div class="row-head"><h3><span class="stage-emoji" aria-hidden="true">${choiceIcons[key]}</span> ${title}</h3><span class="cost">${fmt(m.sums[key])} 萬</span></div><p class="sub">${desc}</p>${key==='children'?childOptions():options(key,state[key],none)}${card()}</div>`).join('');
 const reference=defaults();reference.life=state.life;reference.hobbyEnd=state.life;
 const baseline=model(reference).total;
 $('#total').textContent=fmt(m.total);$('#baseline').textContent=fmt(baseline);$('#summary').textContent=`出生至滿 ${state.life} 歲前 · 依你選的情境試算`;
 $('#annual').textContent=fmt(m.total/state.life)+' 萬';$('#referenceAge').textContent=state.life;$('#delta').textContent=(m.total>=baseline?'多':'少')+' '+fmt(Math.abs(m.total-baseline))+' 萬';$('#chart').innerHTML=svgChart(m);$('#chartAll').setAttribute('aria-pressed',String(chartMode==='all'));$('#chartRecurring').setAttribute('aria-pressed',String(chartMode==='recurring'));$('#chartAll').classList.toggle('active',chartMode==='all');$('#chartRecurring').classList.toggle('active',chartMode==='recurring');
 $('#guessResult').textContent=state.guess!==null?'你原本猜：'+guessLabels[state.guess]+'；你選擇的人生：約'+fmt(m.total)+'萬元。':'';
 $('#stages').innerHTML=[[0,20,'依賴期','0–19歲'],[20,40,'獨立期','20–39歲'],[40,state.life,'互賴期',`40–${state.life-1}歲`]].map(([a,b,t,age])=>`<div class="stage-card">◇ ${t}<br><span class="sub">${age}</span><strong>${fmt(m.years.slice(a,b).reduce((x,y)=>x+y,0))} 萬</strong></div>`).join('');
 $('#breakdown').innerHTML=Object.entries(m.sums).map(([k,v])=>`<div class="bar-row"><span>${categoryNames[k]}</span><div class="bar"><div class="fill" style="width:${v/m.total*100}%"></div></div><b>${fmt(v)} 萬</b></div>`).join('');
 renderMonthly();try{localStorage.setItem('awingo-life-v13',JSON.stringify({...state,schema:9}))}catch{}
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-key]');if(b){const v=+b.dataset.level,k=b.dataset.key;state.inspected[k]=true;state.custom[k]=false;state.edited[k]=false;if(k.startsWith('living')){state.levels[+k.slice(6)]=v;state.livingMonthly[+k.slice(6)]=null}else{state[k]=v;if(['housing','car','children'].includes(k)){state.inspected[k]=true;state.custom[k]=false;if(k==='housing'){state.housingMode=v<0?'rent':'buy';if(v>=0)state.housingPrice=housingPrices[v]}if(k==='car'&&v>=0){const p=carPresets[v];Object.assign(state,{carPrice:p.price,carFuel:p.fuel,carParking:p.parking,carMaintenance:p.maintenance,carInsurance:p.insurance,carAnnual:p.fuel+p.parking+p.maintenance+p.insurance,carTax:p.tax,carReplace:p.replace,carUntil:p.until,carDownPercent:20,carLoanYears:7,carLoanRate:5,carLoanFee:2600})}}if(k==='hobby')Object.assign(state,{hobbyMonthly:[500,2000,5000][v],hobbyExtra:0});}render();return}
 const count=e.target.closest('[data-child-count]');if(count){state.children=+count.dataset.childCount;state.childCount=state.children;state.inspected.children=true;state.custom.children=false;state.familyExtra='none';render();return}const tier=e.target.closest('[data-child-tier]');if(tier){applyChildTier(state,+tier.dataset.childTier);state.edited.children=false;render();return}const expand=e.target.closest('[data-expand]');if(expand){const k=expand.dataset.expand;state.custom[k]=!state.custom[k];render();return}
 const hit=e.target.closest('[data-age]');if(hit){flowAge=+hit.dataset.age;renderMonthly();$('#hint').textContent=`${hit.dataset.age}歲：${eventNames(+hit.dataset.age,state).join('、')||'一般生活'}，全年約 ${fmt(current.years[+hit.dataset.age])} 萬元。`;$('#monthPanel').scrollIntoView({behavior:'smooth',block:'nearest'});}
});
$('#lifespan').addEventListener('input',e=>{state.life=+e.target.value;render()});
document.addEventListener('input',e=>{if(e.target.type!=='number')return;const k=e.target.id;if(e.target.dataset.livingMonth!==undefined){const i=+e.target.dataset.livingMonth;state.livingMonthly[i]=Math.max(0,Math.min(1000000,+e.target.value||0));state.edited['living'+i]=true;return}if(Object.prototype.hasOwnProperty.call(state,k)&&typeof state[k]==='number'){state[k]=+e.target.value;if(k==='hobbyEnd')state.hobbyEndCustom=true;const group=k.startsWith('car')?'car':k.startsWith('child')?'children':k.startsWith('hobby')?'hobby':k==='marriageAge'?'marriage':'housing';state.edited[group]=true}});
document.addEventListener('change',e=>{const k=e.target.id;if(['studentHousing','familyExtra'].includes(k)){state[k]=e.target.value;render();return}if(['hobbyMonthly','hobbyExtra','hobbyExtraAge','dormAnnual','careMonthly','commuteMonthly','commuteMidMonthly','retireTransportMonthly','carFuel','carParking','carMaintenance','carInsurance','childShare','familyExtraMonthly','familyExtraStart','familyExtraEnd'].includes(k)){state[k]=+e.target.value;render();return}if(e.target.dataset.livingMonth!==undefined){const i=+e.target.dataset.livingMonth;state.livingMonthly[i]=Math.max(0,Math.min(1000000,+e.target.value||0));state.edited['living'+i]=true;render();return}if(k==='childUntil'){state.childUntil=+e.target.value;state.edited.children=true;render();return}if(['marriageAge','housingAge','housingPrice','downPercent','mortgageYears','mortgageRate','carAge','carUntil','carReplace','carPrice','carDownPercent','carLoanYears','carLoanRate','carLoanFee','carFuel','carParking','carMaintenance','carInsurance','carTax','childAge','childCount','childGap','childEarly','childSchool','childAdult','hobbyStart','hobbyEnd','rentAnnual'].includes(k)){state[k]=+e.target.value;if(k==='hobbyEnd')state.hobbyEndCustom=true;const group=k.startsWith('car')?'car':k.startsWith('child')?'children':k.startsWith('hobby')?'hobby':k==='marriageAge'?'marriage':'housing';state.edited[group]=true;render()}});
$('#chartAll').onclick=()=>{chartMode='all';render()};$('#chartRecurring').onclick=()=>{chartMode='recurring';render()};
const chartPanel=$('#chartPanel'),expandChart=$('#expandChart');
function setChartExpanded(open){chartPanel.classList.toggle('chart-expanded',open);document.body.classList.toggle('chart-open',open);expandChart.setAttribute('aria-expanded',String(open));expandChart.textContent=open?'✕ 收起大圖':'⛶ 放大看圖';if(open)$('#chart').scrollLeft=0;else expandChart.focus()}
expandChart.onclick=()=>setChartExpanded(!chartPanel.classList.contains('chart-expanded'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&chartPanel.classList.contains('chart-expanded'))setChartExpanded(false)});
$('#reset').onclick=()=>{if(!window.confirm('恢復預設情境？自訂數字會重設，原本的猜測會保留。'))return;const guess=state.guess;state=defaults();state.guess=guess;render();$('#hint').textContent='已恢復預設情境，原本的猜測仍保留。'};
$('#download').onclick=()=>{
 const svg=svgChart(current,true),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();
 img.onload=()=>{
  try{
   const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=1520;
   const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   canvas.toBlob(png=>{
    URL.revokeObjectURL(url);
    if(!png){window.alert('圖片暫時無法下載，請直接截圖保存。');return}
    const pngUrl=URL.createObjectURL(png),a=document.createElement('a');a.href=pngUrl;a.download='AwinGo-人生花費圖.png';a.click();setTimeout(()=>URL.revokeObjectURL(pngUrl),5000);
   },'image/png');
  }catch{URL.revokeObjectURL(url);window.alert('圖片暫時無法下載，請直接截圖保存。')}
 };
 img.onerror=()=>{URL.revokeObjectURL(url);window.alert('圖片暫時無法下載，請直接截圖保存。')};
 img.src=url;
};
$('#flowAge').addEventListener('input',e=>{flowAge=+e.target.value;renderMonthly()});
let pendingGuess=null;
$('#guessOptions').innerHTML=guessLabels.map((t,i)=>`<button class="guess-option" data-guess="${i}" aria-pressed="false">${t}</button>`).join('');
document.addEventListener('click',e=>{const b=e.target.closest('[data-guess]');if(!b)return;pendingGuess=+b.dataset.guess;document.querySelectorAll('[data-guess]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});$('#start').disabled=false});
$('#privacyStart').onclick=()=>{$('#privacy').hidden=true;$('#hook').hidden=false;$('#hook').scrollIntoView({behavior:'smooth'})};
$('#start').onclick=()=>{if(pendingGuess===null)return;state.guess=pendingGuess;$('#hook').hidden=true;$('#bridge').hidden=false;document.querySelector('.layout').hidden=false;render();$('#bridge').scrollIntoView({behavior:'smooth',block:'start'})};
$('#reveal').onclick=()=>{render();$('#feedback').hidden=false;$('#morePractice').hidden=false;document.querySelector('.right').hidden=false;$('#afterResult').hidden=false;document.querySelector('.right').scrollIntoView({behavior:'smooth',block:'start'})};
render();
