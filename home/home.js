document.addEventListener('DOMContentLoaded',()=>{
  initHomeHero();
});

function initHomeHero(){
  const hero=document.querySelector('.rf-home-hero');
  if(!hero)return;
  const slides=[...hero.querySelectorAll('.rf-home-slide')];
  const prev=hero.querySelector('.rf-home-hero-btn.prev');
  const next=hero.querySelector('.rf-home-hero-btn.next');
  const dotsWrap=hero.querySelector('.rf-home-hero-dots');
  let index=0, timer=null;

  // Disable any leftover legacy Slick instance if one was initialized.
  const legacy=document.querySelector('.hajs-slick');
  try{
    if(legacy && window.jQuery && window.jQuery.fn && window.jQuery.fn.slick && window.jQuery(legacy).hasClass('slick-initialized')){
      window.jQuery(legacy).slick('unslick');
    }
  }catch(e){}

  slides.forEach((_,i)=>{
    const d=document.createElement('button');
    d.type='button'; d.className='rf-home-hero-dot'+(i===0?' active':'');
    d.setAttribute('aria-label',`Go to slide ${i+1}`);
    d.addEventListener('click',()=>go(i,true));
    dotsWrap.appendChild(d);
  });
  const dots=()=>[...dotsWrap.querySelectorAll('.rf-home-hero-dot')];

  function render(){
    slides.forEach((s,i)=>s.classList.toggle('is-active',i===index));
    dots().forEach((d,i)=>d.classList.toggle('active',i===index));
  }
  function go(n,manual=false){
    index=(n+slides.length)%slides.length;
    render();
    reset();
  }
  function reset(){
    if(timer)clearInterval(timer);
    if(slides.length>1)timer=setInterval(()=>go(index+1),1000);
  }
  prev.addEventListener('click',()=>go(index-1,true));
  next.addEventListener('click',()=>go(index+1,true));
  hero.addEventListener('mouseenter',()=>{if(timer)clearInterval(timer)});
  hero.addEventListener('mouseleave',reset);
  let sx=0;
  hero.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  hero.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>45)go(index+(dx<0?1:-1),true)},{passive:true});
  render(); reset();
}

/* Smooth 1-to-target impact counter animation */
document.addEventListener('DOMContentLoaded',()=>{
  const counters=[...document.querySelectorAll('.elementor-counter-number[data-rf-counter]')];
  if(!counters.length)return;
  const animate=(el)=>{
    if(el.dataset.rfCounterDone==='true')return;
    el.dataset.rfCounterDone='true';
    const target=parseInt(el.dataset.rfCounter,10)||0;
    const duration=1800;
    const start=performance.now();
    const tick=(now)=>{
      const p=Math.min((now-start)/duration,1);
      const eased=1-Math.pow(1-p,3);
      el.textContent=String(Math.floor(target*eased));
      if(p<1)requestAnimationFrame(tick); else el.textContent=String(target);
    };
    requestAnimationFrame(tick);
  };
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)animate(entry.target)}),{threshold:.25});
  counters.forEach(el=>io.observe(el));
});

// Diamond Shiksha Prachar Samiti home enhancements
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.elementor-counter-number[data-rf-counter]').forEach(el=>{
    const target=Number(el.dataset.rfCounter||el.dataset.toValue||0); const duration=1800; let start=0; const t0=performance.now();
    const tick=now=>{const p=Math.min(1,(now-t0)/duration); const e=1-Math.pow(1-p,3); el.textContent=Math.floor(target*e).toLocaleString(); if(p<1) requestAnimationFrame(tick); else el.textContent=target.toLocaleString();};
    el.textContent='0'; requestAnimationFrame(tick);
  });
  document.querySelectorAll('h2').forEach(h=>{if(h.textContent.trim().toLowerCase().includes('empanelment & accreditations')){const sec=h.closest('section'); if(sec) sec.style.display='none';}});
});


/* Stories in Motion slider */
document.addEventListener('DOMContentLoaded',()=>{
  const row=document.querySelector('.rf-story-row');
  if(!row) return;
  const cards=[...row.querySelectorAll('.rf-story-card')];
  if(cards.length<2) return;
  let paused=false;
  row.addEventListener('mouseenter',()=>paused=true);
  row.addEventListener('mouseleave',()=>paused=false);
  row.addEventListener('touchstart',()=>paused=true,{passive:true});
  row.addEventListener('touchend',()=>paused=false,{passive:true});
  setInterval(()=>{
    if(paused || window.innerWidth<=600) return;
    const card=cards[0];
    const step=card.getBoundingClientRect().width+24;
    if(row.scrollLeft+row.clientWidth>=row.scrollWidth-step-2){
      row.scrollTo({left:0,behavior:'smooth'});
    }else{
      row.scrollBy({left:step,behavior:'smooth'});
    }
  },3000);
});
