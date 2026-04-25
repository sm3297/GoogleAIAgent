// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Sticky Header
  const header = document.getElementById('main-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Scroll Reveal Animation
  const revealElements = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  
  // Trigger on load
  setTimeout(revealOnScroll, 100);

  // 3. Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for sticky header
          behavior: 'smooth'
        });
      }
    });
  });
  // 4. Theme Toggle Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('theme-icon-sun');
  const iconMoon = document.getElementById('theme-icon-moon');
  
  // Set default theme to light, unless user previously selected dark
  let currentTheme = localStorage.getItem('theme') || 'light';
  
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (iconSun) iconSun.style.display = 'block';
      if (iconMoon) iconMoon.style.display = 'none';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (iconSun) iconSun.style.display = 'none';
      if (iconMoon) iconMoon.style.display = 'block';
    }
  };

  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', currentTheme);
      applyTheme(currentTheme);
    });
  }

  // 5. Mobile Menu Toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Update icon based on state (optional, can stay as hamburger)
      const isExpanded = navMenu.classList.contains('active');
      mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

});
