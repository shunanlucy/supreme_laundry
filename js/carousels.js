/* ==========================================================
   THE SUPREME LAUNDRY — CAROUSEL CONTROLLERS
   1. Hero Promo 4-Theme Carousel
   2. Laundry Best Practices & Specialties Carousel
   ========================================================== */

// 1. HERO PROMO 4-SLIDE CAROUSEL
let heroSlideIndex = 0;
let heroCarouselTimer = null;

function getHeroSlides() {
    return document.querySelectorAll('.promo-banner-slide');
}

function getHeroDots() {
    return document.querySelectorAll('#heroCarouselDots .c-dot');
}

function updateHeroDots(index) {
    const dots = getHeroDots();
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });
}

function goToHeroSlide(index) {
    const track = document.getElementById('heroCarouselTrack');
    const slides = getHeroSlides();
    if (!track || slides.length === 0) return;
    
    heroSlideIndex = (index + slides.length) % slides.length;
    const targetSlide = slides[heroSlideIndex];
    if (targetSlide) {
        track.scrollTo({
            left: targetSlide.offsetLeft - track.offsetLeft,
            behavior: 'smooth'
        });
    }
    updateHeroDots(heroSlideIndex);
}

function scrollHeroCarousel(direction) {
    const slides = getHeroSlides();
    if (slides.length === 0) return;
    goToHeroSlide(heroSlideIndex + direction);
}

function initHeroCarousel() {
    const track = document.getElementById('heroCarouselTrack');
    const wrapper = document.getElementById('heroCarouselWrapper');
    if (!track) return;

    // Detect user swipe / scroll to update active dot
    track.addEventListener('scroll', () => {
        const slides = getHeroSlides();
        const scrollLeft = track.scrollLeft;
        let closestIndex = 0;
        let minDiff = Infinity;
        
        slides.forEach((slide, i) => {
            const diff = Math.abs((slide.offsetLeft - track.offsetLeft) - scrollLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });
        
        if (closestIndex !== heroSlideIndex) {
            heroSlideIndex = closestIndex;
            updateHeroDots(heroSlideIndex);
        }
    }, { passive: true });

    // Auto rotate every 4.5s
    function startAutoSlide() {
        stopAutoSlide();
        heroCarouselTimer = setInterval(() => {
            scrollHeroCarousel(1);
        }, 4500);
    }

    function stopAutoSlide() {
        if (heroCarouselTimer) {
            clearInterval(heroCarouselTimer);
            heroCarouselTimer = null;
        }
    }

    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAutoSlide);
        wrapper.addEventListener('mouseleave', startAutoSlide);
        wrapper.addEventListener('touchstart', stopAutoSlide, { passive: true });
        wrapper.addEventListener('touchend', startAutoSlide, { passive: true });
    }

    startAutoSlide();
}

// 2. LAUNDRY BEST PRACTICES & SPECIALTIES CAROUSEL
let tipsSlideIndex = 0;

function getTipsSlides() {
    return document.querySelectorAll('.tips-carousel-card');
}

function getTipsDots() {
    return document.querySelectorAll('#tipsCarouselDots .c-dot');
}

function updateTipsDots(index) {
    const dots = getTipsDots();
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });
}

function goToTipsSlide(index) {
    const track = document.getElementById('tipsCarouselTrack');
    const slides = getTipsSlides();
    if (!track || slides.length === 0) return;

    tipsSlideIndex = (index + slides.length) % slides.length;
    const targetSlide = slides[tipsSlideIndex];
    if (targetSlide) {
        track.scrollTo({
            left: targetSlide.offsetLeft - track.offsetLeft,
            behavior: 'smooth'
        });
    }
    updateTipsDots(tipsSlideIndex);
}

function scrollTipsCarousel(direction) {
    const slides = getTipsSlides();
    if (slides.length === 0) return;
    goToTipsSlide(tipsSlideIndex + direction);
}

function initTipsCarousel() {
    const track = document.getElementById('tipsCarouselTrack');
    if (!track) return;

    track.addEventListener('scroll', () => {
        const slides = getTipsSlides();
        const scrollLeft = track.scrollLeft;
        let closestIndex = 0;
        let minDiff = Infinity;

        slides.forEach((slide, i) => {
            const diff = Math.abs((slide.offsetLeft - track.offsetLeft) - scrollLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        });

        if (closestIndex !== tipsSlideIndex) {
            tipsSlideIndex = closestIndex;
            updateTipsDots(tipsSlideIndex);
        }
    }, { passive: true });
}
