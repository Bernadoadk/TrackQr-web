(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const navActions = document.querySelector(".nav-actions");
  const header = document.querySelector("[data-header]");
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-option]"));
  const scrollLinks = Array.from(document.querySelectorAll("[data-scroll-target]"));

  const getStoredTheme = () => localStorage.getItem("trackqr-theme") || "system";
  const resolveTheme = (choice) => (choice === "system" ? (systemThemeQuery.matches ? "dark" : "light") : choice);

  const applyTheme = (choice) => {
    const resolvedTheme = resolveTheme(choice);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeChoice = choice;
    localStorage.setItem("trackqr-theme", choice);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolvedTheme === "dark" ? "#0b1220" : "#2563eb");

    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeOption === choice;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  if (window.lucide) {
    window.lucide.createIcons();
  }

  applyTheme(getStoredTheme());
  systemThemeQuery.addEventListener("change", () => {
    if (getStoredTheme() === "system") {
      applyTheme("system");
    }
  });

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeOption || "system");
    });
  });

  const closeMobileMenu = () => {
    if (!menu || !menuToggle) return;

    menu.classList.remove("is-open");
    navActions?.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    const icon = menuToggle.querySelector("svg");

    if (icon) {
      icon.outerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
      window.lucide?.createIcons();
    }
  };

  const scrollToSection = (targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return false;

    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", window.location.pathname || "/");
    closeMobileMenu();
    return true;
  };

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.dataset.scrollTarget;
      if (!targetId) return;

      if (scrollToSection(targetId)) {
        event.preventDefault();
      }
    });
  });

  const requestedSection = new URLSearchParams(window.location.search).get("section");
  if (requestedSection) {
    window.requestAnimationFrame(() => {
      scrollToSection(requestedSection);
    });
  }

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      navActions?.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      const icon = menuToggle.querySelector("svg");

      if (icon) {
        icon.outerHTML = isOpen
          ? '<i data-lucide="x" aria-hidden="true"></i>'
          : '<i data-lucide="menu" aria-hidden="true"></i>';
        window.lucide?.createIcons();
      }
    });

    menu.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        closeMobileMenu();
      }
    });
  }

  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const animateCounter = (element) => {
    const target = Number(element.dataset.count || "0");
    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion) {
    counters.forEach((counter) => {
      counter.textContent = counter.dataset.count || "0";
    });
  } else {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.8 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const setHeaderShadow = () => {
    if (!header) return;
    header.classList.toggle("has-scrolled", window.scrollY > 20);
  };

  setHeaderShadow();
  window.addEventListener("scroll", setHeaderShadow, { passive: true });
})();
