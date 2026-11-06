// Restores the saved theme before first paint to avoid a light flash. Kept as a file, not an
// inline script, so the Content-Security-Policy in netlify.toml can refuse inline scripts.
(function () {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (error) {
    /* storage unavailable: keep the light default */
  }
})();
