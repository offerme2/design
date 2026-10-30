'use strict';
(() => {
 const languages=['zh','en','ja','ko'];
 let stored='';try{stored=localStorage.getItem('offerme-ooh-language')||'';}catch{}
 const requested=new URLSearchParams(location.search).get('lang');
 const lang=languages.includes(requested)?requested:languages.includes(stored)?stored:'zh';
 try{localStorage.setItem('offerme-ooh-language',lang);}catch{}
 const dict=window.OOH_I18N?.[lang]||{};
 const keys=Object.keys(dict).filter(k=>k.length>1&&dict[k]&&k!==dict[k]).sort((a,b)=>b.length-a.length);
 const re=keys.length?new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g'):null;
 function t(value){const text=String(value??'');const trimmed=text.trim();if(dict[trimmed])return text.replace(trimmed,dict[trimmed]);return re?text.replace(re,k=>dict[k]||k):text;}
 function field(r,k){if(lang==='zh')return r[k]??'';const aliases={'行政區/商圈':'商圈','媒體類別':'類別','媒體型式':'媒體形式','播放時間/檔次':'播放時間'};const name=aliases[k]||k;return r[name+'_'+lang]?.trim()||r[k]||'';}
 document.documentElement.lang=lang==='zh'?'zh-Hant':lang;
 window.oohI18n={lang,t,field};
 // Native dialogs are localized too, without changing their behaviour.
 const nativeConfirm=window.confirm.bind(window),nativeAlert=window.alert.bind(window);
 window.confirm=s=>nativeConfirm(t(s));window.alert=s=>nativeAlert(t(s));
 const switcher=document.createElement('label');switcher.id='languageSwitcher';switcher.setAttribute('aria-label','Language');
 const select=document.createElement('select');select.id='language';select.setAttribute('aria-label','Language');
 for(const [value,label] of [['zh','中文'],['en','English'],['ja','日本語'],['ko','한국어']]){const o=new Option(label,value);o.selected=value===lang;select.append(o);}
 select.onchange=()=>{try{localStorage.setItem('offerme-ooh-language',select.value);}catch{}const url=new URL(location.href);url.searchParams.set('lang',select.value);location.href=url.href;};
 switcher.append(select);document.querySelector('header').append(switcher);
 const style=document.createElement('style');style.textContent='header{padding-right:165px;position:relative}#languageSwitcher{position:absolute;right:24px;top:18px;z-index:10}#language{font:inherit;font-size:13px;color:#eef7ff;background:#142338;border:1px solid #8296a9;border-radius:6px;padding:8px 9px;min-width:110px}header nav{flex-wrap:wrap}header .inquiry-primary{white-space:normal}#panel h2{overflow-wrap:anywhere}html:not([lang="zh-Hant"]) .map-legend{font-size:10px}html:not([lang="zh-Hant"]) .map-caption{font-size:10px}@media(max-width:740px){header{padding-right:16px;padding-top:60px}#languageSwitcher{top:10px;right:16px}}';document.head.append(style);
 // Translate display-only nodes. Stable Chinese keys, filter values, geometry and original names are preserved.
 let observer;
 const renderedText=new WeakMap(),renderedAttributes=new WeakMap();
 const ignored=node=>node.parentElement?.closest('script,style,#languageSwitcher,.original-name');
 function apply(){
  observer?.disconnect();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){if(ignored(node)||renderedText.get(node)===node.nodeValue)continue;const next=t(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;renderedText.set(node,next);}
  for(const el of document.querySelectorAll('[placeholder],[aria-label],[title],img[alt]')){
   if(el.closest('#languageSwitcher'))continue;
   const previous=renderedAttributes.get(el)||{};
   for(const attr of ['placeholder','aria-label','title','alt'])if(el.hasAttribute(attr)){const v=el.getAttribute(attr);if(previous[attr]===v)continue;const next=t(v);if(next!==v)el.setAttribute(attr,next);previous[attr]=next;}
   renderedAttributes.set(el,previous);
  }
  for(const el of document.querySelectorAll('.original-name')){const r=window.OOH_DATA.locations.find(r=>el.textContent.endsWith(r['版位名稱']));if(r)el.textContent=t('原名')+'：'+r['版位名稱'];}
  observer?.observe(document.body,{subtree:true,childList:true,characterData:true});
 }
 window.oohI18n.apply=apply;
 document.addEventListener('DOMContentLoaded',()=>{apply();observer=new MutationObserver(apply);observer.observe(document.body,{subtree:true,childList:true,characterData:true});});
})();
