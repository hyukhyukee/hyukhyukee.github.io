(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const navLinks = Array.from(document.querySelectorAll('.primary-nav a'));
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  function updateActiveNav() {
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 96) current = section;
    }

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
    });
  }

  if (sections.length) {
    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav);
  }

  const emailModal = document.querySelector('[data-email-modal]');
  const emailOpeners = document.querySelectorAll('[data-email-open]');
  const emailClosers = document.querySelectorAll('[data-email-close]');
  const copyButtons = document.querySelectorAll('[data-copy-email]');
  const copyStatus = document.querySelector('[data-copy-status]');

  function openEmailModal() {
    if (!emailModal) return;
    emailModal.classList.add('open');
    emailModal.setAttribute('aria-hidden', 'false');
    if (copyStatus) copyStatus.textContent = '';
  }

  function closeEmailModal() {
    if (!emailModal) return;
    emailModal.classList.remove('open');
    emailModal.setAttribute('aria-hidden', 'true');
  }

  emailOpeners.forEach((button) => button.addEventListener('click', openEmailModal));
  emailClosers.forEach((button) => button.addEventListener('click', closeEmailModal));

  copyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const email = button.dataset.copyEmail;
      try {
        await navigator.clipboard.writeText(email);
        if (copyStatus) copyStatus.textContent = `${email} copied.`;
      } catch (error) {
        if (copyStatus) copyStatus.textContent = email;
      }
    });
  });

  const imageModal = document.querySelector('[data-image-modal]');
  const imageModalImg = document.querySelector('[data-image-modal-img]');
  const imageModalCaption = document.querySelector('[data-image-modal-caption]');
  const imageClosers = document.querySelectorAll('[data-image-close]');
  const projectVisuals = Array.from(document.querySelectorAll('.project-visual'));

  function openImageModal(figure) {
    if (!imageModal || !imageModalImg) return;
    const image = figure.querySelector('img');
    const caption = figure.querySelector('figcaption');
    if (!image) return;

    imageModalImg.src = image.currentSrc || image.src;
    imageModalImg.alt = image.alt || '';
    if (imageModalCaption) imageModalCaption.textContent = caption ? caption.textContent : image.alt || '';
    imageModal.classList.add('open');
    imageModal.setAttribute('aria-hidden', 'false');
  }

  function closeImageModal() {
    if (!imageModal || !imageModalImg) return;
    imageModal.classList.remove('open');
    imageModal.setAttribute('aria-hidden', 'true');
    imageModalImg.removeAttribute('src');
  }

  projectVisuals.forEach((figure) => {
    figure.setAttribute('role', 'button');
    figure.setAttribute('tabindex', '0');
    figure.setAttribute('aria-label', 'Open larger project image');
    figure.addEventListener('click', () => openImageModal(figure));
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImageModal(figure);
      }
    });
  });

  imageClosers.forEach((button) => button.addEventListener('click', closeImageModal));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeEmailModal();
      closeImageModal();
    }
  });

  const projectTabs = Array.from(document.querySelectorAll('[data-project-tab]'));
  const projectPanels = Array.from(document.querySelectorAll('[data-project-panel]'));

  function activateProject(name) {
    if (!name || !projectTabs.length) return;
    const exists = projectTabs.some((tab) => tab.dataset.projectTab === name);
    if (!exists) return;

    projectTabs.forEach((tab) => {
      const active = tab.dataset.projectTab === name;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    projectPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.projectPanel === name);
    });
  }

  if (projectTabs.length) {
    projectTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const name = tab.dataset.projectTab;
        activateProject(name);
        history.replaceState(null, '', '#' + name);
      });
    });

    const initial = decodeURIComponent(window.location.hash.slice(1)) || projectTabs[0].dataset.projectTab;
    activateProject(initial);

    window.addEventListener('hashchange', () => {
      activateProject(decodeURIComponent(window.location.hash.slice(1)));
    });
  }

  const languageLinks = Array.from(document.querySelectorAll('[data-language-base]'));

  function syncLanguageLinks() {
    languageLinks.forEach((link) => {
      const base = link.dataset.languageBase;
      if (base) link.href = base + (window.location.hash || '');
    });
  }

  if (languageLinks.length) {
    syncLanguageLinks();
    window.addEventListener('hashchange', syncLanguageLinks);
  }

  const experienceList = document.querySelector('[data-experience-list]');
  const experienceToggle = document.querySelector('[data-experience-toggle]');

  if (experienceList && experienceToggle) {
    experienceToggle.addEventListener('click', () => {
      const isCollapsed = experienceList.classList.toggle('is-collapsed');
      experienceToggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      const collapsedLabel = experienceToggle.dataset.collapsedLabel || '전체보기';
      const expandedLabel = experienceToggle.dataset.expandedLabel || '접기';
      experienceToggle.querySelector('span').textContent = isCollapsed ? collapsedLabel : expandedLabel;
    });
  }

  const pdfDownload = document.querySelector('[data-pdf-download]');
  if (pdfDownload) {
    function downloadPdfBlob(blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfDownload.getAttribute('download') || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function base64ToBlob(base64, type) {
      const bytes = atob(base64);
      const chunks = [];
      for (let index = 0; index < bytes.length; index += 8192) {
        const slice = bytes.slice(index, index + 8192);
        const values = new Uint8Array(slice.length);
        for (let i = 0; i < slice.length; i += 1) values[i] = slice.charCodeAt(i);
        chunks.push(values);
      }
      return new Blob(chunks, { type });
    }

    pdfDownload.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        const embeddedPdf = document.getElementById('resume-pdf-data');
        const base64 = window.RESUME_PDF_BASE64 || (embeddedPdf && embeddedPdf.textContent.trim());
        if (base64) {
          downloadPdfBlob(base64ToBlob(base64, 'application/pdf'));
          return;
        }

        const response = await fetch(pdfDownload.href);
        if (!response.ok) throw new Error('PDF download failed');

        const blob = await response.blob();
        downloadPdfBlob(blob);
      } catch (error) {
        window.location.href = pdfDownload.href;
      }
    });
  }
})();
