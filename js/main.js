/* ============================================
   PILI BEACH RESORT - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Elements ----
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  const navLinksAll = document.querySelectorAll('.nav-links a');
  const heroBgImg = document.getElementById('heroBgImg');

  // ============================================
  // NAVBAR: Scroll effect (glassmorphism)
  // ============================================
  let lastScroll = 0;

  function handleNavbarScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // ============================================
  // NAVBAR: Active link highlighting
  // ============================================
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveNavLink() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinksAll.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveNavLink, { passive: true });

  // ============================================
  // MOBILE MENU: Hamburger toggle
  // ============================================
  function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMobileMenu);
  navOverlay.addEventListener('click', closeMobileMenu);

  // Close menu on link click
  navLinksAll.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ============================================
  // PARALLAX: Hero background
  // ============================================
  function handleParallax() {
    if (window.innerWidth > 768 && heroBgImg) {
      const scrollY = window.scrollY;
      heroBgImg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  // ============================================
  // SCROLL REVEAL: IntersectionObserver
  // ============================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation for sibling elements
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach((el, i) => {
    // Add stagger delay to grid items
    const parent = el.parentElement;
    if (parent && (parent.classList.contains('rooms-grid') || parent.classList.contains('dining-grid'))) {
      const siblings = Array.from(parent.children);
      const siblingIndex = siblings.indexOf(el);
      el.dataset.delay = siblingIndex * 100;
    }
    revealObserver.observe(el);
  });

  // ============================================
  // ACTIVITIES: Category tabs
  // ============================================
  const categoryTabs = document.querySelectorAll('.category-tab');
  const activityContents = document.querySelectorAll('.activities-content');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;

      // Update active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show corresponding content
      activityContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === category) {
          content.classList.add('active');

          // Re-trigger reveal animations for newly visible content
          const reveals = content.querySelectorAll('.reveal-left, .reveal-right');
          reveals.forEach(el => {
            el.classList.remove('active');
            setTimeout(() => {
              el.classList.add('active');
            }, 50);
          });
        }
      });
    });
  });

  // ============================================
  // GALLERY: Filter buttons
  // ============================================
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter gallery items
      galleryItems.forEach(item => {
        const category = item.dataset.category;

        if (filter === 'all' || category === filter) {
          item.style.display = '';
          item.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // ============================================
  // GALLERY: Lightbox
  // ============================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentLightboxIndex = 0;
  let visibleGalleryImages = [];

  function getVisibleImages() {
    visibleGalleryImages = [];
    galleryItems.forEach(item => {
      if (item.style.display !== 'none') {
        const img = item.querySelector('img');
        if (img) {
          visibleGalleryImages.push(img.src);
        }
      }
    });
  }

  function openLightbox(index) {
    getVisibleImages();
    currentLightboxIndex = index;
    lightboxImg.src = visibleGalleryImages[currentLightboxIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    if (currentLightboxIndex >= visibleGalleryImages.length) {
      currentLightboxIndex = 0;
    }
    if (currentLightboxIndex < 0) {
      currentLightboxIndex = visibleGalleryImages.length - 1;
    }
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = visibleGalleryImages[currentLightboxIndex];
      lightboxImg.style.opacity = '1';
    }, 200);
  }

  // Gallery item click
  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      // Find the visible index
      getVisibleImages();
      const imgSrc = item.querySelector('img').src;
      const visibleIndex = visibleGalleryImages.indexOf(imgSrc);
      openLightbox(visibleIndex >= 0 ? visibleIndex : 0);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext.addEventListener('click', () => navigateLightbox(1));

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // ============================================
  // ROOM DETAIL MODAL
  // ============================================
  const roomModal = document.getElementById('roomModal');
  const roomModalClose = document.getElementById('roomModalClose');
  const roomCarouselWrapper = document.getElementById('roomCarouselWrapper');
  const roomCarouselDots = document.getElementById('roomCarouselDots');
  const roomCarouselCounter = document.getElementById('roomCarouselCounter');
  const roomCarouselPrev = document.getElementById('roomCarouselPrev');
  const roomCarouselNext = document.getElementById('roomCarouselNext');

  let currentRoomSlide = 0;
  let totalRoomSlides = 0;

  // ---- Room Data ----
  const roomsData = {
    'lion': {
      name: 'Lion',
      price: '₱5,000 - ₱6,000',
      capacity: '7-10 Pax',
      description: 'Our premier beachfront villa offers the ultimate island escape. Located right on the shoreline, wake up to stunning ocean views and the sound of gentle waves. This spacious 3-bedroom villa is perfect for families or groups seeking a private, luxurious getaway. Enjoy direct beach access, a private terrace, and breathtaking sunsets from your doorstep.',
      images: [
        'images/rooms/lion/1.jpg',
        'images/rooms/lion/2.jpg',
        'images/rooms/lion/3.jpg',
        'images/rooms/lion/4.jpg',
        'images/rooms/lion/5.jpg'
      ],
      inclusions: [
        'Daily breakfast for guests',
        'Direct beachfront access',
        'Free use of swimming pool',
        'Complimentary welcome drinks',
        'Daily housekeeping service',
        'Free Wi-Fi access',
        'Parking space included',
        'Beach towels provided'
      ],
      amenities: [
        { icon: 'fa-bed', label: '3 Bedrooms' },
        { icon: 'fa-shower', label: 'Private Bathroom' },
        { icon: 'fa-water', label: 'Beachfront' },
        { icon: 'fa-fan', label: 'Air Conditioning' },
        { icon: 'fa-tv', label: 'Cable TV' },
        { icon: 'fa-kitchen-set', label: 'Mini Kitchen' },
        { icon: 'fa-person-swimming', label: 'Pool Access' },
        { icon: 'fa-wifi', label: 'Free Wi-Fi' }
      ]
    },
    'lizard': {
      name: 'Lizard',
      price: '₱3,000 - ₱3,500',
      capacity: '2-5 Pax',
      description: 'Relax in our charming poolside bungalow, perfectly positioned right next to the resort\'s sparkling swimming pool surrounded by towering coconut trees. Ideal for couples or small families, this cozy bungalow offers a serene tropical retreat with easy access to all resort amenities.',
      images: [
        'images/rooms/lizard/1.jpg',
        'images/rooms/lizard/2.jpg',
        'images/rooms/lizard/3.jpg',
        'images/rooms/lizard/4.jpg'
      ],
      inclusions: [
        'Daily breakfast for guests',
        'Direct poolside access',
        'Free use of swimming pool',
        'Complimentary welcome drinks',
        'Daily housekeeping service',
        'Free Wi-Fi access',
        'Parking space included',
        'Pool towels provided'
      ],
      amenities: [
        { icon: 'fa-bed', label: '1 Bedroom' },
        { icon: 'fa-shower', label: 'Private Bathroom' },
        { icon: 'fa-person-swimming', label: 'Poolside' },
        { icon: 'fa-fan', label: 'Air Conditioning' },
        { icon: 'fa-tv', label: 'Cable TV' },
        { icon: 'fa-wifi', label: 'Free Wi-Fi' }
      ]
    },
    'turtle': {
      name: 'Turtle',
      price: '₱2,000 - ₱2,500',
      capacity: '2-4 Pax',
      description: 'Nestled among lush tropical gardens, The Turtle Bungalow offers a peaceful and nature-filled retreat. Surrounded by vibrant greenery, swaying palms, and colorful flowers, this cozy bungalow is perfect for guests seeking tranquility and a close connection with nature while still being steps away from the beach and pool.',
      images: [
        'images/rooms/turtle/1.jpg',
        'images/rooms/turtle/2.jpg',
        'images/rooms/turtle/3.jpg',
        'images/rooms/turtle/4.jpg',
        'images/rooms/turtle/5.jpg'
      ],
      inclusions: [
        'Daily breakfast for guests',
        'Garden view terrace',
        'Free use of swimming pool',
        'Complimentary welcome drinks',
        'Daily housekeeping service',
        'Free Wi-Fi access',
        'Parking space included',
        'Beach access included'
      ],
      amenities: [
        { icon: 'fa-bed', label: '1 Bedroom' },
        { icon: 'fa-shower', label: 'Private Bathroom' },
        { icon: 'fa-leaf', label: 'Garden View' },
        { icon: 'fa-fan', label: 'Air Conditioning' },
        { icon: 'fa-wifi', label: 'Free Wi-Fi' }
      ]
    },
    'shark': {
      name: 'Shark',
      price: '₱5,000 - ₱6,000',
      capacity: '5-7 Pax',
      description: 'The Shark Villa offers spacious accommodations with a premium poolside location in the Kia-Ora section of the resort. Featuring two well-appointed bedrooms, modern furnishings, and direct access to the pool area, this villa is perfect for families or friend groups looking for comfort and convenience.',
      images: [
        'images/rooms/shark/1.jpg',
        'images/rooms/shark/2.jpg',
        'images/rooms/shark/3.jpg',
        'images/rooms/shark/4.jpg',
        'images/rooms/shark/5.jpg'
      ],
      inclusions: [
        'Daily breakfast for guests',
        'Direct poolside access',
        'Free use of swimming pool',
        'Complimentary welcome drinks',
        'Daily housekeeping service',
        'Free Wi-Fi access',
        'Parking space included',
        'Pool towels provided'
      ],
      amenities: [
        { icon: 'fa-bed', label: '2 Bedrooms' },
        { icon: 'fa-shower', label: 'Private Bathroom' },
        { icon: 'fa-person-swimming', label: 'Poolside' },
        { icon: 'fa-fan', label: 'Air Conditioning' },
        { icon: 'fa-tv', label: 'Cable TV' },
        { icon: 'fa-kitchen-set', label: 'Mini Kitchen' },
        { icon: 'fa-wifi', label: 'Free Wi-Fi' }
      ]
    },
    'stingray': {
      name: 'Stingray',
      price: '₱2,500 - ₱3,000',
      capacity: '2-5 Pax',
      description: 'Located in the serene Kia-Ora section of the resort, The Stingray Bungalow is a spacious retreat surrounded by tropical gardens. With room for up to 5 guests, it\'s ideal for small groups or families who want a quiet escape with easy access to the pool, beach, and all resort activities.',
      images: [
        'images/rooms/stingray/2.jpg',
        'images/rooms/stingray/1.jpg',
        'images/rooms/stingray/3.jpg',
        'images/rooms/stingray/4.jpg',
        'images/rooms/stingray/5.jpg'
      ],
      inclusions: [
        'Daily breakfast for guests',
        'Garden view setting',
        'Free use of swimming pool',
        'Complimentary welcome drinks',
        'Daily housekeeping service',
        'Free Wi-Fi access',
        'Parking space included',
        'Beach access included'
      ],
      amenities: [
        { icon: 'fa-bed', label: '1 Bedroom' },
        { icon: 'fa-shower', label: 'Private Bathroom' },
        { icon: 'fa-leaf', label: 'Garden View' },
        { icon: 'fa-fan', label: 'Air Conditioning' },
        { icon: 'fa-wifi', label: 'Free Wi-Fi' }
      ]
    },
    'gecko': {
      name: 'Gecko',
      price: '₱2,000 - ₱2,500',
      capacity: '2-4 Pax',
      description: 'A cozy and affordable garden bungalow in the Kia-Ora area, perfect for couples or small families. Enjoy the peaceful ambiance of the tropical garden setting while having full access to all the resort\'s amenities including the pool, beach, and water activities.',
      images: [
        'images/rooms/gecko/3.jpg',
        'images/rooms/gecko/2.jpg',
        'images/rooms/gecko/1.jpg',
        'images/rooms/gecko/4.jpg',
        'images/rooms/gecko/5.jpg'
      ],
      inclusions: [
        'Daily breakfast for guests',
        'Garden view setting',
        'Free use of swimming pool',
        'Complimentary welcome drinks',
        'Daily housekeeping service',
        'Free Wi-Fi access',
        'Parking space included',
        'Beach access included'
      ],
      amenities: [
        { icon: 'fa-bed', label: '1 Bedroom' },
        { icon: 'fa-shower', label: 'Private Bathroom' },
        { icon: 'fa-leaf', label: 'Garden View' },
        { icon: 'fa-fan', label: 'Air Conditioning' },
        { icon: 'fa-wifi', label: 'Free Wi-Fi' }
      ]
    }
  };

  // ---- Open Room Modal ----
  function openRoomModal(roomId) {
    const room = roomsData[roomId];
    if (!room) return;

    // Populate title, price, capacity
    document.getElementById('roomModalTitle').textContent = room.name;
    document.getElementById('roomModalPrice').innerHTML = `${room.price} <span>/ night</span>`;
    document.getElementById('roomModalCapacity').innerHTML =
      `<i class="fa-solid fa-users"></i> <span>${room.capacity}</span>`;
    document.getElementById('roomModalDescription').innerHTML = `<p>${room.description}</p>`;

    // Populate inclusions
    const inclusionsList = document.getElementById('roomModalInclusions');
    inclusionsList.innerHTML = room.inclusions.map(item =>
      `<li><i class="fa-solid fa-circle-check"></i> ${item}</li>`
    ).join('');

    // Populate amenities
    const amenitiesContainer = document.getElementById('roomModalAmenities');
    amenitiesContainer.innerHTML = room.amenities.map(a =>
      `<span class="room-amenity-tag"><i class="fa-solid ${a.icon}"></i> ${a.label}</span>`
    ).join('');

    // Populate carousel images
    roomCarouselWrapper.innerHTML = room.images.map(src =>
      `<img src="${src}" alt="${room.name}">`
    ).join('');

    // Setup dots
    totalRoomSlides = room.images.length;
    currentRoomSlide = 0;
    roomCarouselDots.innerHTML = room.images.map((_, i) =>
      `<button class="room-carousel-dot${i === 0 ? ' active' : ''}" data-slide="${i}"></button>`
    ).join('');

    updateRoomCarousel();

    // Dot click handlers
    roomCarouselDots.querySelectorAll('.room-carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        currentRoomSlide = parseInt(dot.dataset.slide);
        updateRoomCarousel();
      });
    });

    // Show modal
    roomModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // ---- Update Carousel ----
  function updateRoomCarousel() {
    roomCarouselWrapper.style.transform = `translateX(-${currentRoomSlide * 100}%)`;
    roomCarouselCounter.textContent = `${currentRoomSlide + 1} / ${totalRoomSlides}`;

    // Update dots
    roomCarouselDots.querySelectorAll('.room-carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentRoomSlide);
    });
  }

  // ---- Navigate Carousel ----
  function navigateRoomCarousel(direction) {
    currentRoomSlide += direction;
    if (currentRoomSlide >= totalRoomSlides) currentRoomSlide = 0;
    if (currentRoomSlide < 0) currentRoomSlide = totalRoomSlides - 1;
    updateRoomCarousel();
  }

  // ---- Close Room Modal ----
  function closeRoomModal() {
    roomModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ---- Event Listeners ----
  // Room card clicks
  document.querySelectorAll('.room-card[data-room-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open modal if clicking the Reserve button
      if (e.target.closest('.btn-sm')) return;
      openRoomModal(card.dataset.roomId);
    });
  });

  // Carousel navigation
  roomCarouselPrev.addEventListener('click', () => navigateRoomCarousel(-1));
  roomCarouselNext.addEventListener('click', () => navigateRoomCarousel(1));

  // Close modal
  roomModalClose.addEventListener('click', closeRoomModal);
  roomModal.addEventListener('click', (e) => {
    if (e.target === roomModal) closeRoomModal();
  });

  // ---- Update Keyboard handler to include room modal ----
  document.addEventListener('keydown', (e) => {
    // Room modal takes priority
    if (roomModal.classList.contains('active')) {
      switch (e.key) {
        case 'Escape': closeRoomModal(); break;
        case 'ArrowLeft': navigateRoomCarousel(-1); break;
        case 'ArrowRight': navigateRoomCarousel(1); break;
      }
      return;
    }

    // Gallery lightbox
    if (lightbox.classList.contains('active')) {
      switch (e.key) {
        case 'Escape': closeLightbox(); break;
        case 'ArrowLeft': navigateLightbox(-1); break;
        case 'ArrowRight': navigateLightbox(1); break;
      }
    }
  });

  // ============================================
  // SMOOTH SCROLL: For anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ============================================
  // LIGHTBOX IMAGE TRANSITION
  // ============================================
  lightboxImg.style.transition = 'opacity 0.2s ease';

  // ============================================
  // INITIAL STATE
  // ============================================
  handleNavbarScroll();
  highlightActiveNavLink();
});
