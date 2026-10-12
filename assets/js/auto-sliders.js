/* Shared folder-based image sliders for Diamond Shiksha.
   Add images to assets/sliders/slider1 or slider2 and refresh images.json using the included helper. */
(() => {
  const script = document.currentScript;
  if (!script) return;
  const assetBase = new URL('../sliders/', script.src);

  function getContentSections() {
    const page = location.pathname.toLowerCase();
    const selectors = [
      'body.home .elementor-top-section',
      'main > section',
      'main .rf-section',
      'main .rf-gallery-section',
      'body > section',
      '.rf-section',
      '.rf-gallery-section'
    ];
    let list = [];
    for (const selector of selectors) {
      list = [...document.querySelectorAll(selector)];
      if (list.length >= 3) break;
    }
    return [...new Set(list)].filter(el =>
      !el.closest('header, footer, nav') &&
      !el.classList.contains('rf-page-hero') &&
      !el.matches('[data-ds-slider], .ds-auto-slider') &&
      el.getBoundingClientRect().height > 40
    );
  }

  function makeSlider(number, images) {
    if (!images.length) return null;
    const slider = document.createElement('section');
    slider.className = 'ds-auto-slider';
    slider.setAttribute('aria-label', `Image gallery ${number}`);
    slider.innerHTML = `<div class="ds-auto-slider__track"></div>
      <button class="ds-auto-slider__btn ds-auto-slider__btn--prev" aria-label="Previous image" type="button">‹</button>
      <button class="ds-auto-slider__btn ds-auto-slider__btn--next" aria-label="Next image" type="button">›</button>
      <div class="ds-auto-slider__dots"></div>`;
    const track = slider.querySelector('.ds-auto-slider__track');
    const dots = slider.querySelector('.ds-auto-slider__dots');
    images.forEach((filename, index) => {
      const slide = document.createElement('div');
      slide.className = 'ds-auto-slider__slide';
      const img = document.createElement('img');
      img.src = new URL(`slider${number}/${encodeURIComponent(filename)}`, assetBase).href;
      img.alt = `Diamond Shiksha gallery image ${index + 1}`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      slide.appendChild(img); track.appendChild(slide);
      const dot = document.createElement('button');
      dot.className = 'ds-auto-slider__dot'; dot.type = 'button';
      dot.setAttribute('aria-label', `Show image ${index + 1}`);
      dot.addEventListener('click', () => go(index));
      dots.appendChild(dot);
    });
    let current = 0, timer;
    const dotItems = [...dots.children];
    function go(index) {
      current = (index + images.length) % images.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotItems.forEach((d, i) => d.setAttribute('aria-current', String(i === current)));
    }
    slider.querySelector('.ds-auto-slider__btn--prev').addEventListener('click', () => go(current - 1));
    slider.querySelector('.ds-auto-slider__btn--next').addEventListener('click', () => go(current + 1));
    go(0);
    const start = () => { if (images.length > 1) timer = setInterval(() => go(current + 1), 4000); };
    const stop = () => clearInterval(timer);
    start();
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    return slider;
  }

  function headingSection(phrase) {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,.elementor-heading-title')];
    const h = headings.find(el => el.textContent.replace(/\s+/g, ' ').toLowerCase().includes(phrase));
    return h && h.closest('.elementor-top-section, section, .rf-section, .rf-gallery-section, .e-con') || (h && h.parentElement);
  }

  async function init() {
    const allImages = await Promise.all([1, 2].map(async n => {
      try {
        const response = await fetch(new URL(`slider${n}/images.json`, assetBase), { cache: 'no-store' });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data.filter(x => typeof x === 'string' && x.trim()) : [];
      } catch { return []; }
    }));
    const isHome = /(^\/$|index\.html?$)/i.test(location.pathname);
    let placements = [];
    if (isHome) {
      // Home: first slider directly after OUR IMPACT; second after the Sustainable Development Goals section.
      const impact = headingSection('our impact');
      const sdg = headingSection('sustainable development goals');
      if (impact) placements.push({ number: 1, target: impact });
      if (sdg) placements.push({ number: 2, target: sdg });
    }
    // Other pages: distribute sliders between content sections, not both below the hero.
    if (!placements.length || placements.length < 2) {
      const sections = getContentSections();
      placements = [];
      if (sections[1]) placements.push({ number: 1, target: sections[1] });
      if (sections[3]) placements.push({ number: 2, target: sections[3] });
      if (placements.length < 2 && sections.length > 1 && !placements.some(p => p.target === sections[sections.length - 1])) {
        placements.push({ number: 2, target: sections[sections.length - 1] });
      }
    }
    placements.forEach(({ number, target }) => {
      const slider = makeSlider(number, allImages[number - 1]);
      if (slider && target && target.parentNode && !target.nextElementSibling?.classList.contains(`ds-auto-slider--${number}`)) {
        slider.classList.add(`ds-auto-slider--${number}`);
        target.insertAdjacentElement('afterend', slider);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();