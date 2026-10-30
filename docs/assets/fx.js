'use strict';
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // count-up stats
 if(!reduce)for(const el of document.querySelectorAll('#total,#cityTotal')){const n=+el.textContent;if(!n)continue;const t0=performance.now(),dur=1400;const tick=t=>{const k=Math.min(1,(t-t0)/dur);el.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(tick);};el.textContent='0';requestAnimationFrame(tick);}
 // card reveal + spotlight
 const results=document.getElementById('results');let seen=new WeakSet();
 const tag=()=>{let i=0;for(const c of results.querySelectorAll('.resource')){if(seen.has(c))continue;seen.add(c);c.style.setProperty('--d',i++%12);c.classList.add('fx-in');}};
 new MutationObserver(()=>{seen=new WeakSet();tag();}).observe(results,{childList:true});tag();
 results.addEventListener('pointermove',e=>{const c=e.target.closest('.resource');if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');if(!reduce)c.style.transform=`rotateX(${(.5-y)*8}deg) rotateY(${(x-.5)*10}deg) translateZ(6px)`;});
 results.addEventListener('pointerout',e=>{const c=e.target.closest('.resource');if(c&&!c.contains(e.relatedTarget))c.style.transform='';});
 // panel content swap animation
 const panel=document.getElementById('panel');new MutationObserver(()=>{panel.classList.remove('fx-swap');void panel.offsetWidth;panel.classList.add('fx-swap');}).observe(panel,{childList:true});
 // ambient cursor glow
 if(!reduce&&matchMedia('(hover:hover)').matches){const g=document.createElement('div');g.id='fxCursor';document.body.prepend(g);addEventListener('pointermove',e=>{g.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;},{passive:true});}
})();
