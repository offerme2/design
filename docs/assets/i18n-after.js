'use strict';
(() => {
 const {t,field,lang}=window.oohI18n;
 const baseTable=inquiryTable;
 inquiryTable=function(){
  const table=baseTable(),headers=table[0],originalIndex=headers.indexOf('原名');
  const data=[headers.map(k=>t(k)),...table.slice(1).map(line=>line.map((v,j)=>j===originalIndex?v:t(v)))];
  // Always include the untouched source title, including when downstream code changes field selection.
  if(originalIndex<0){data[0].push(t('中文原名'));for(let i=1;i<data.length;i++)data[i].push(window.OOH_DATA.locations.find(r=>r.id===table[i][0])?.['版位名稱']||'');}
  for(let i=1;i<data.length;i++){
   const source=window.OOH_DATA.locations.find(r=>r.id===table[i][0]);if(!source)continue;
   for(let j=0;j<headers.length;j++){
    const k=headers[j];if(k==='原名')data[i][j]=source['版位名稱'];
    else if(['顯示名稱','城市','行政區/商圈','媒體類別','媒體型式','尺寸規格','播放時間/檔次','地理位置描述'].includes(k))data[i][j]=String(field(source,k));
   }
  }
  return data;
 };
 textInquiry=function(){return inquiryTable().map(row=>row.join('\t')).join('\n');};
 const baseParse=parseInquiryCSV;
 parseInquiryCSV=function(text){const records=baseParse(text),reverse=Object.fromEntries(Object.entries(window.OOH_I18N[lang]||{}).map(([k,v])=>[v,k]));records[0]=records[0].map(k=>reverse[k]||k);return records;};
 // Search local-language names as well as the original Chinese spelling.
 filtered=function(){return rows.filter(r=>(!state.environment||r['室內戶外']===state.environment)&&(!state.city||r['城市']===state.city)&&(!state.district||r['行政區/商圈']===state.district)&&(!state.format||r['媒體型式']===state.format)&&(!state.type||r['媒體類別']===state.type)&&(!state.query||[r.id,...['版位名稱','原名','顯示名稱','行政區/商圈','城市','媒體型式','媒體類別'].flatMap(k=>[r[k],field(r,k),t(r[k])])].join(' ').toLowerCase().includes(state.query.toLowerCase())));};
 window.atlasQA.filtered=filtered;
 window.inquiryQA={...window.inquiryQA,inquiryTable,csvInquiry,xlsxInquiry,textInquiry};
 window.oohI18n.apply();
})();
