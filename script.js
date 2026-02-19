document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio initialized');
  initParticles();
  initTyping();
  initScrollAnimations();
  initTilt();
  initTheme();
  initMobileMenu();
  initYear();
});

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
  const connectionDistance = 150; // Max distance to draw line
  const mouseDistance = 200; // Interaction radius

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

  window.addEventListener('resize', () => {
    resize();
    initParticleArray();
  });

  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.5; // Velocity X
      this.vy = (Math.random() - 0.5) * 1.5; // Velocity Y
      this.size = Math.random() * 2 + 1;
      this.color = 'rgba(56, 189, 248, '; // Using accent color base (Sky 400)
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
      ctx.fillStyle = this.color + '0.5)';
      ctx.fill();
    }
  }

  function initParticleArray() {
    particles = [];
    // Adjust count based on screen size
    const count = window.innerWidth < 600 ? 30 : particleCount;
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
          ctx.strokeStyle = 'rgba(56, 189, 248,' + opacityValue * 0.2 + ')';
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
  const text = "Developer • Automation • Telegram Bots";
  const element = document.getElementById('typing-text');
  if (!element) return;

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
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set CSS variables for glow effect
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Reduced rotation intensity for better UX with glassmorphism
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseenter', () => {
      // Remove transition for instant follow
      card.style.transition = 'none';
    });

    card.addEventListener('mouseleave', () => {
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
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      document.documentElement.removeAttribute('data-theme');
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
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
