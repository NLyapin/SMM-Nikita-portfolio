// Smooth scroll snap functionality
class PageSlider {
    constructor() {
        this.currentPage = 0;
        this.pages = document.querySelectorAll('.page');
        this.isScrolling = false;
        this.scrollTimeout = null;

        this.init();
    }

    init() {
        // Check if we have pages
        this.pages = document.querySelectorAll('.page');

        if (this.pages.length === 0) {
            // If no pages found, create wrapper and wrap body content
            this.wrapPages();
            this.pages = document.querySelectorAll('.page');
        }

        if (this.pages.length > 0) {
            this.setupScrollSnap();
            this.setupKeyboardNavigation();
            this.setupTouchGestures();
            this.setupWheelNavigation();
            this.updateActivePage();
        }
    }

    wrapPages() {
        const body = document.body;
        const wrapper = document.createElement('div');
        wrapper.className = 'pages-wrapper';

        // Move all direct children of body into wrapper
        const children = Array.from(body.children);
        children.forEach(child => {
            if (!child.classList.contains('pages-wrapper')) {
                wrapper.appendChild(child);
            }
        });

        body.appendChild(wrapper);
    }

    setupScrollSnap() {
        // Always use html/body for scrolling to avoid double scrollbar
        document.documentElement.style.scrollSnapType = 'y mandatory';
        document.documentElement.style.scrollBehavior = 'smooth';
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.overflowX = 'hidden';

        // Remove scroll from wrapper if it exists
        const wrapper = document.querySelector('.pages-wrapper');
        if (wrapper) {
            wrapper.style.overflow = 'visible';
            wrapper.style.height = 'auto';
        }

        this.pages.forEach((page, index) => {
            page.style.scrollSnapAlign = 'start';
            page.style.scrollSnapStop = 'always';
            if (index === 0) page.classList.add('active');
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.isScrolling) return;

            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                this.goToNextPage();
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                this.goToPrevPage();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.goToPage(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.goToPage(this.pages.length - 1);
            }
        });
    }

    setupWheelNavigation() {
        let wheelTimeout;
        let isWheeling = false;
        let wheelDelta = 0;
        const SCROLL_THRESHOLD = 100; // Increased threshold to slow down scrolling
        const WHEEL_COOLDOWN = 800; // Increased cooldown between page changes

        window.addEventListener('wheel', (e) => {
            if (this.isScrolling) {
                e.preventDefault();
                return;
            }

            clearTimeout(wheelTimeout);

            // Accumulate wheel delta to slow down scrolling
            wheelDelta += e.deltaY;

            if (!isWheeling && Math.abs(wheelDelta) > SCROLL_THRESHOLD) {
                isWheeling = true;
                e.preventDefault();

                if (wheelDelta > SCROLL_THRESHOLD) {
                    this.goToNextPage();
                    wheelDelta = 0;
                } else if (wheelDelta < -SCROLL_THRESHOLD) {
                    this.goToPrevPage();
                    wheelDelta = 0;
                }
            }

            // Reset wheel delta after cooldown
            wheelTimeout = setTimeout(() => {
                isWheeling = false;
                wheelDelta = 0;
            }, WHEEL_COOLDOWN);
        }, { passive: false });
    }

    setupTouchGestures() {
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartY, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startY, endY) {
        const swipeThreshold = 50;
        const diff = startY - endY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.goToNextPage();
            } else {
                this.goToPrevPage();
            }
        }
    }

    goToNextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.goToPage(this.currentPage + 1);
        }
    }

    goToPrevPage() {
        if (this.currentPage > 0) {
            this.goToPage(this.currentPage - 1);
        }
    }

    goToPage(index) {
        if (this.isScrolling || index < 0 || index >= this.pages.length) return;

        this.isScrolling = true;
        this.currentPage = index;

        const targetPage = this.pages[index];

        // Always use window scroll to avoid wrapper issues
        window.scrollTo({
            top: targetPage.offsetTop,
            behavior: 'smooth'
        });

        this.updateActivePage();

        setTimeout(() => {
            this.isScrolling = false;
        }, 1000); // Increased timeout for slower scrolling
    }

    updateActivePage() {
        this.pages.forEach((page, index) => {
            const wasActive = page.classList.contains('active');
            const isActive = index === this.currentPage;
            page.classList.toggle('active', isActive);

            // Trigger animation when page becomes active
            if (!wasActive && isActive) {
                // Reset and animate elements
                const elements = page.querySelectorAll('*:not(script):not(style)');
                elements.forEach((el) => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(20px)';
                });

                // Animate with slight delay
                setTimeout(() => {
                    elements.forEach((el, i) => {
                        setTimeout(() => {
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0)';
                        }, Math.min(i * 30, 300));
                    });
                }, 50);
            }
        });
    }
}

// Initialize when DOM is ready
let pageSlider;

function initPageSlider() {
    pageSlider = new PageSlider();

    // Update current page on scroll
    let scrollTimeout;
    const updateOnScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const pages = document.querySelectorAll('.page');
            const scrollPosition = window.pageYOffset || window.scrollY;

            pages.forEach((page, index) => {
                const pageTop = page.offsetTop;
                const pageHeight = page.offsetHeight;
                const viewportHeight = window.innerHeight;

                if (scrollPosition >= pageTop - viewportHeight / 3 &&
                    scrollPosition < pageTop + pageHeight - viewportHeight / 3) {
                    if (!page.classList.contains('active')) {
                        page.classList.add('active');
                        if (pageSlider) {
                            pageSlider.currentPage = index;
                            pageSlider.updateActivePage();
                        }
                    }
                } else {
                    page.classList.remove('active');
                }
            });
        }, 100);
    };

    // Always use window scroll listener
    window.addEventListener('scroll', updateOnScroll, { passive: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageSlider);
} else {
    initPageSlider();
}

// Sync photo height with skills column
function syncPhotoHeight() {
    const photoPlaceholder = document.querySelector('.photo-placeholder');
    const photoImage = document.querySelector('.photo-image');
    const skillsCol1 = document.querySelector('.skills-col-1');

    if (photoPlaceholder && photoImage && skillsCol1) {
        const updateHeight = () => {
            // Wait for images to load
            if (photoImage.complete && photoImage.naturalHeight > 0) {
                const skillsHeight = skillsCol1.offsetHeight;

                if (skillsHeight > 0) {
                    // Set max-height to limit container, let image maintain aspect ratio
                    photoPlaceholder.style.maxHeight = skillsHeight + 'px';
                    // Don't set fixed height, let flex handle it naturally
                    // Remove any inline height that might cause stretching
                    if (photoPlaceholder.style.height) {
                        photoPlaceholder.style.height = '';
                    }
                }
            } else {
                // Wait for image to load
                photoImage.addEventListener('load', updateHeight, { once: true });
            }
        };

        // Initial update
        if (document.readyState === 'complete') {
            setTimeout(updateHeight, 100);
        } else {
            window.addEventListener('load', () => setTimeout(updateHeight, 100));
        }

        window.addEventListener('resize', updateHeight);

        // Use MutationObserver to watch for content changes
        const observer = new MutationObserver(updateHeight);
        observer.observe(skillsCol1, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Also observe the image
        if (photoImage.complete) {
            updateHeight();
        } else {
            photoImage.addEventListener('load', updateHeight, { once: true });
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncPhotoHeight);
} else {
    syncPhotoHeight();
}

// Font loading check for Safari compatibility
function waitForFonts() {
    // Improved font loading check for Safari
    const checkFont = () => {
        // Try multiple methods to check font availability
        if (document.fonts && document.fonts.check) {
            // Check with different font sizes and weights
            const isLoaded = document.fonts.check('12px Gilroy') ||
                           document.fonts.check('16px Gilroy') ||
                           document.fonts.check('1em Gilroy') ||
                           document.fonts.check('normal 400 12px Gilroy');

            if (isLoaded) {
                document.body.classList.add('fonts-loaded');
                return true;
            }
        }
        return false;
    };

    // Method 1: Use Font Loading API if available
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            if (!checkFont()) {
                // Safari sometimes needs extra time
                setTimeout(() => {
                    if (!checkFont()) {
                        // Show content anyway after timeout
                        document.body.classList.add('fonts-loaded');
                    }
                }, 300);
            }
        }).catch(() => {
            // If promise rejects, show content
            document.body.classList.add('fonts-loaded');
        });

        // Also listen for loadingdone event (Safari support)
        if (document.fonts.addEventListener) {
            document.fonts.addEventListener('loadingdone', () => {
                checkFont() || setTimeout(() => document.body.classList.add('fonts-loaded'), 100);
            });
        }
    }

    // Method 2: Check periodically (for Safari)
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds total (100ms * 20)
    const intervalId = setInterval(() => {
        attempts++;
        if (checkFont() || attempts >= maxAttempts) {
            clearInterval(intervalId);
            document.body.classList.add('fonts-loaded');
        }
    }, 100);

    // Safety timeout - always show content after 2.5 seconds
    setTimeout(() => {
        clearInterval(intervalId);
        document.body.classList.add('fonts-loaded');
    }, 2500);
}

// Start font loading check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForFonts);
} else {
    waitForFonts();
}

// Reels: ленивая загрузка превью и модальное окно со звуком на весь экран
function initReelsVideos() {
    const modal = document.getElementById('video-modal');
    const modalPlayer = modal && modal.querySelector('.video-modal-player');
    const modalBackdrop = modal && modal.querySelector('.video-modal-backdrop');
    const modalClose = modal && modal.querySelector('.video-modal-close');
    const reelsVideos = document.querySelectorAll('.reels-video[data-src]');

    if (!modal || !modalPlayer) return;

    // Ленивая загрузка: подставляем src при появлении в зоне видимости, проигрываем без звука только когда видео готово (Safari)
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            const video = entry.target;
            const src = video.getAttribute('data-src');
            if (src && !video.src) {
                video.setAttribute('src', src);
                video.setAttribute('autoplay', '');
                video.setAttribute('muted', '');
                video.setAttribute('playsinline', '');
                video.load();
                observer.unobserve(video);
                video.muted = true;
                function startPreview() {
                    video.muted = true;
                    video.play().catch(function () {});
                    setTimeout(function () {
                        if (video.paused) video.play().catch(function () {});
                    }, 150);
                }
                video.addEventListener('canplay', startPreview, { once: true });
                video.addEventListener('loadeddata', startPreview, { once: true });
            }
            if (entry.isIntersecting) {
                video.muted = true;
                if (video.readyState >= 2) {
                    video.play().catch(function () {});
                }
            } else {
                video.pause();
            }
        });
    }, { rootMargin: '100px' });

    reelsVideos.forEach(function (video) {
        observer.observe(video);
        video.addEventListener('click', function () {
            const src = this.currentSrc || this.getAttribute('src') || this.getAttribute('data-src');
            if (!src) return;
            modalPlayer.setAttribute('src', src);
            modalPlayer.muted = false;
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            modalPlayer.load();
            function playWhenReady() {
                modalPlayer.removeEventListener('canplay', playWhenReady);
                modalPlayer.removeEventListener('loadeddata', playWhenReady);
                modalPlayer.play().catch(function () {});
            }
            modalPlayer.addEventListener('canplay', playWhenReady, { once: true });
            modalPlayer.addEventListener('loadeddata', playWhenReady, { once: true });
            if (modalPlayer.readyState >= 2) playWhenReady();
        });
    });

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        modalPlayer.pause();
        modalPlayer.removeAttribute('src');
        modalPlayer.load();
    }

    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReelsVideos);
} else {
    initReelsVideos();
}

// Сторис: по клику — открыть изображение на весь экран
function initStoriesImages() {
    var imageModal = document.getElementById('image-modal');
    var modalImg = imageModal && imageModal.querySelector('.image-modal-img');
    var modalBackdrop = imageModal && imageModal.querySelector('.video-modal-backdrop');
    var modalClose = imageModal && imageModal.querySelector('.image-modal-close');
    var storiesImages = document.querySelectorAll('.stories-image');

    if (!imageModal || !modalImg) return;

    storiesImages.forEach(function (img) {
        img.addEventListener('click', function () {
            var src = this.currentSrc || this.getAttribute('src');
            if (!src) return;
            modalImg.src = src;
            modalImg.alt = this.alt || '';
            imageModal.setAttribute('aria-hidden', 'false');
            imageModal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeImageModal() {
        imageModal.classList.remove('is-open');
        imageModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        modalImg.removeAttribute('src');
    }

    if (modalBackdrop) modalBackdrop.addEventListener('click', closeImageModal);
    if (modalClose) modalClose.addEventListener('click', closeImageModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && imageModal.classList.contains('is-open')) closeImageModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStoriesImages);
} else {
    initStoriesImages();
}

