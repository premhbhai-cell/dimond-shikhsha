
document.addEventListener('DOMContentLoaded',()=>{
 const reveal=()=>document.querySelectorAll('.rf-reveal').forEach(el=>{if(el.getBoundingClientRect().top<window.innerHeight-45)el.classList.add('show')});
 reveal(); window.addEventListener('scroll',reveal,{passive:true});
 const form=document.querySelector('.rf-form'); if(form){form.addEventListener('submit',e=>{e.preventDefault();alert('Thank you! Diamond Shiksha Prachar Samiti has received your message. We will contact you soon.');form.reset()})}
 initAutoGalleries();
 removeLegacySmileChat();
});


/* Remove the old third-party/legacy Smile Foundation chat widget.
   The original widget is injected dynamically, so CSS-only hiding is not enough. */
function removeLegacySmileChat(){
 const legacySelectors=[
  '.chaty-widget','.chaty-widget-is','.ht-ctc','.ht-ctc-chat','.joinchat',
  '.tawk-min-container','.tawk-chat-container','.tidio-chat','.crisp-client',
  '.intercom-lightweight-app','.smartsupp-widget','.drift-widget',
  '[id*="chaty" i]','[class*="chaty" i]',
  '[id*="tawk" i]','[class*="tawk" i]',
  '[id*="joinchat" i]','[class*="joinchat" i]',
  'iframe[title*="chat" i]','iframe[title*="live" i]',
  'iframe[src*="chat" i]','iframe[src*="tawk" i]'
 ];
 const remove=()=>{
  document.querySelectorAll(legacySelectors.join(',')).forEach(el=>{
   if(el && !el.closest('.rf-wa-float')) el.remove();
  });
  document.querySelectorAll('body *').forEach(el=>{
   if(!el || el.classList.contains('rf-wa-float') || el.closest('.rf-wa-float')) return;
   const text=(el.textContent||'').trim().toLowerCase();
   if(text.includes('welcome to smile foundation') || text.includes('welcome to smile')){
    const r=el.getBoundingClientRect();
    const cs=getComputedStyle(el);
    if(cs.position==='fixed' || r.left<350 || r.bottom>window.innerHeight-350){
      const target=el.parentElement && el.parentElement!==document.body ? el.parentElement : el;
      if(target!==document.body) target.remove(); else el.remove();
    }
   }
  });
 };
 remove();
 new MutationObserver(remove).observe(document.body,{childList:true,subtree:true});
}


function initAutoGalleries(){
 document.querySelectorAll('[data-rf-gallery]').forEach(gallery=>setupGallery(gallery));
}

async function setupGallery(gallery){
 const track=gallery.querySelector('.rf-gallery-track');
 const dots=gallery.querySelector('.rf-gallery-dots');
 const prev=gallery.querySelector('.rf-gallery-btn.prev');
 const next=gallery.querySelector('.rf-gallery-btn.next');
 const empty=gallery.querySelector('.rf-gallery-empty');
 const dir=(gallery.getAttribute('data-gallery-dir')||'images/').replace(/^\.?\//,'');
 let files=[];
 try{
  // Works when the static server exposes a directory index (common on local servers/Apache).
  const res=await fetch(dir,{cache:'no-store'});
  if(res.ok){
   const text=await res.text();
   const doc=new DOMParser().parseFromString(text,'text/html');
   const exts=/\.(avif|webp|png|jpe?g|gif|svg)$/i;
   files=[...doc.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(Boolean)
     .map(h=>decodeURIComponent(h.split('#')[0])).filter(h=>exts.test(h));
  }
 }catch(e){}
 // Fallback list is generated server-side into the page's data attribute when directory listing is unavailable.
 if(!files.length){
  try{files=JSON.parse(gallery.getAttribute('data-gallery-fallback')||'[]')}catch(e){files=[]}
 }
 files=[...new Set(files)].filter(Boolean);
 if(!files.length){
  empty.style.display='block';
  prev.style.display=next.style.display=dots.style.display='none';
  return;
 }
 empty.style.display='none';
 files.forEach((src,i)=>{
  const slide=document.createElement('div');slide.className='rf-gallery-slide';
  const img=document.createElement('img');
  img.loading=i===0?'eager':'lazy'; img.decoding='async'; img.alt=`Diamond Shiksha Prachar Samiti gallery image ${i+1}`;
  img.src=src.startsWith('http')?src:dir+src.replace(/^\//,'');
  img.addEventListener('click',()=>openLightbox(img.src));
  slide.appendChild(img);track.appendChild(slide);
  const dot=document.createElement('button');dot.className='rf-gallery-dot';dot.type='button';dot.setAttribute('aria-label',`Go to image ${i+1}`);dots.appendChild(dot);
 });
 let index=0, timer=null, startX=0, moving=false;
 const slides=()=>track.querySelectorAll('.rf-gallery-slide');
 const render=()=>{track.style.transform=`translateX(-${index*100}%)`;dots.querySelectorAll('.rf-gallery-dot').forEach((d,i)=>d.classList.toggle('active',i===index));};
 const go=n=>{index=(n+files.length)%files.length;render();reset();};
 const reset=()=>{if(timer)clearInterval(timer);if(files.length>1)timer=setInterval(()=>go(index+1),4200);};
 prev.addEventListener('click',()=>go(index-1)); next.addEventListener('click',()=>go(index+1));
 dots.querySelectorAll('.rf-gallery-dot').forEach((d,i)=>d.addEventListener('click',()=>go(i)));
 gallery.addEventListener('mouseenter',()=>timer&&clearInterval(timer));gallery.addEventListener('mouseleave',reset);
 gallery.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;moving=true;},{passive:true});
 gallery.addEventListener('touchend',e=>{if(!moving)return;const dx=e.changedTouches[0].clientX-startX;moving=false;if(Math.abs(dx)>40)go(index+(dx<0?1:-1));},{passive:true});
 render();reset();
}

function openLightbox(src){
 let box=document.querySelector('.rf-lightbox');
 if(!box){
  box=document.createElement('div');box.className='rf-lightbox';box.innerHTML='<button class="rf-lightbox-close" aria-label="Close">&times;</button><img alt="Gallery preview">';
  document.body.appendChild(box);box.addEventListener('click',e=>{if(e.target===box||e.target.classList.contains('rf-lightbox-close'))box.classList.remove('open')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')box.classList.remove('open')});
 }
 box.querySelector('img').src=src;box.classList.add('open');
}


/* Impact Gallery: one-card-at-a-time auto movement every 1 second. */
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.rf-gallery-slider .rf-gallery-track').forEach(function(track){
    if(track.dataset.rfGalleryReady==='1') return;
    const original=[...track.querySelectorAll('img')];
    if(original.length<2) return;
    track.dataset.rfGalleryReady='1';
    const visible=()=>window.innerWidth<=600?1:window.innerWidth<=900?2:3;
    const originals=original.map(img=>img.cloneNode(true));
    const all=[...originals,...originals.slice(0,visible())];
    track.innerHTML=''; all.forEach(img=>track.appendChild(img));
    track.style.transition='transform .45s ease';
    track.style.willChange='transform';
    let index=0;
    let timer;
    function step(){
      const count=visible();
      const gap=parseFloat(getComputedStyle(track).gap)||20;
      const card=track.querySelector('img');
      if(!card) return;
      const stepSize=card.getBoundingClientRect().width+gap;
      index++;
      track.style.transform='translateX(-'+(index*stepSize)+'px)';
      if(index>=originals.length){
        setTimeout(function(){
          track.style.transition='none';
          index=0;
          track.style.transform='translateX(0)';
          requestAnimationFrame(function(){requestAnimationFrame(function(){track.style.transition='transform .45s ease';});});
        },470);
      }
    }
    function start(){clearInterval(timer);timer=setInterval(step,1000)}
    function stop(){clearInterval(timer)}
    track.parentElement.addEventListener('mouseenter',stop);
    track.parentElement.addEventListener('mouseleave',start);
    track.parentElement.addEventListener('touchstart',stop,{passive:true});
    track.parentElement.addEventListener('touchend',start,{passive:true});
    start();
  });
});



/* FINAL MOBILE NAVIGATION — single handler, works on touch + mouse */
(function(){
  function bindMobileNav(){
    const toggle=document.querySelector('.rf-toggle');
    const nav=document.querySelector('.rf-nav');
    if(!toggle || !nav || toggle.dataset.rfMobileNav==='1') return;
    toggle.dataset.rfMobileNav='1';
    const setOpen=(open)=>{
      nav.classList.toggle('open',open);
      toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
      toggle.textContent=open?'✕':'☰';
    };
    const handle=(e)=>{
      if(window.innerWidth>1000) return;
      e.preventDefault(); e.stopPropagation();
      setOpen(!nav.classList.contains('open'));
    };
    toggle.addEventListener('click',handle,true);
    toggle.addEventListener('pointerup',function(e){
      if(e.pointerType==='touch') { e.preventDefault(); e.stopPropagation(); }
    },true);
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
    window.addEventListener('resize',()=>{if(window.innerWidth>1000)setOpen(false);});
    setOpen(false);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindMobileNav);
  else bindMobileNav();
  window.addEventListener('load',bindMobileNav);
})();
