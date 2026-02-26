document.addEventListener('DOMContentLoaded', () => {
  initTheme(); // Initialize theme first to ensure correct colors
  initParticles();
  initTyping();
  initScrollAnimations();
  initTilt();
  initMobileMenu();
  initYear();
  initEmailProtection();
});

/* -----------------------------------------------------------
   UTILITIES
----------------------------------------------------------- */
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/* -----------------------------------------------------------
   PARTICLE BACKGROUND
----------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  // Configuration
  const particleCount = 60; // Number of particles
  const mobileParticleCount = 30; // Number of particles on mobile
  const mobileBreakpoint = 600; // Screen width breakpoint for mobile
  const connectionDistance = 150; // Max distance to draw line
  const mouseDistance = 200; // Interaction radius

  // Dynamic Accent Color
  let accentColor = '56, 189, 248'; // Default Sky 400

  const updateAccentColor = () => {
    const style = getComputedStyle(document.documentElement);
    const color = style.getPropertyValue('--accent-rgb');
    if (color) accentColor = color.trim();
  };

  // Initial fetch
  updateAccentColor();

  // Listen for theme changes
  const observer = new MutationObserver(updateAccentColor);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Mouse position
  let mouse = { x: null, y: null };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Resize handling
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', debounce(() => {
    resize();
    initParticleArray();
  }, 200));

  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.5; // Velocity X
      this.vy = (Math.random() - 0.5) * 1.5; // Velocity Y
      this.size = Math.random() * 2 + 1;
    }

    update() {
      // Move
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction
      if (mouse.x != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouseDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseDistance - distance) / mouseDistance;
          const directionX = forceDirectionX * force * 3;
          const directionY = forceDirectionY * force * 3;
          this.vx -= directionX * 0.05; // Gentle push away
          this.vy -= directionY * 0.05;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentColor}, 0.5)`;
      ctx.fill();
    }
  }

  function initParticleArray() {
    particles = [];
    // Adjust count based on screen size
    const count = window.innerWidth < mobileBreakpoint ? mobileParticleCount : particleCount;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Draw connections
    connectParticles();

    requestAnimationFrame(animate);
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          let opacityValue = 1 - (distance / connectionDistance);
          ctx.strokeStyle = `rgba(${accentColor}, ${opacityValue * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  initParticleArray();
  animate();
}

/* -----------------------------------------------------------
   TYPING EFFECT
----------------------------------------------------------- */
function initTyping() {
  const element = document.getElementById('typing-text');
  if (!element) return;

  const text = element.getAttribute('data-text') || "";
  let index = 0;

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, 80);
    }
  }

  // Start typing after a short delay
  setTimeout(type, 1500);
}

/* -----------------------------------------------------------
   SCROLL ANIMATION
----------------------------------------------------------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger effect based on index? Not easy here, just use natural scroll.
        // Or could add delay based on dataset.

        entry.target.classList.add('entrance-anim');
        // Force reflow?
        void entry.target.offsetWidth;
        entry.target.classList.add('visible');

        // Remove animation class after it completes to allow fast hover effects
        setTimeout(() => {
          entry.target.classList.remove('entrance-anim');
        }, 800);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  elements.forEach(el => observer.observe(el));
}

/* -----------------------------------------------------------
   3D TILT EFFECT & GLOW
----------------------------------------------------------- */
function initTilt() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    let ticking = false;
    let mouseX = 0;
    let mouseY = 0;
    let rafId = null;

    card.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = mouseX - rect.left;
          const y = mouseY - rect.top;

          // Set CSS variables for glow effect
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          // Reduced rotation intensity for better UX with glassmorphism
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

          ticking = false;
        });
        ticking = true;
      }
    });

    card.addEventListener('mouseenter', () => {
      // Remove transition for instant follow
      card.style.transition = 'none';
    });

    card.addEventListener('mouseleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        ticking = false;
      }

      // Restore transition to smooth return
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';

      // Clear inline styles after transition to revert to CSS hover state
      setTimeout(() => {
        card.style.transition = '';
        card.style.transform = '';
      }, 500);
    });
  });
}

/* -----------------------------------------------------------
   THEME TOGGLE
----------------------------------------------------------- */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');

  if (!toggleBtn || !sunIcon || !moonIcon) return;

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      document.documentElement.removeAttribute('data-theme');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  toggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/* -----------------------------------------------------------
   MOBILE MENU
----------------------------------------------------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links li a');

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
}

/* -----------------------------------------------------------
   DYNAMIC YEAR
----------------------------------------------------------- */
function initYear() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/* -----------------------------------------------------------
   EMAIL PROTECTION
----------------------------------------------------------- */
function initEmailProtection() {
  const emailLink = document.getElementById('mail-button');
  if (!emailLink) return;

  const user = 'maitybikash565';
  const domain = 'gmail.com';

  // Construct the email only when needed
  const email = user + '@' + domain;

  emailLink.addEventListener('click', (e) => {
    // If href is still '#', prevent default and open mailto
    if (emailLink.getAttribute('href') === '#') {
        e.preventDefault();
        window.location.href = 'mailto:' + email;
    }
  });

  // Set href on hover to improve UX (user sees mailto in status bar)
  // This is a trade-off: bots that hover might see it, but it's less likely than scraping static HTML.
  emailLink.addEventListener('mouseenter', () => {
    emailLink.setAttribute('href', 'mailto:' + email);
  });
}
