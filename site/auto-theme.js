// Theme is locked to light across the whole site — the OS dark/light
// preference is intentionally ignored so the UI looks identical on every
// device. This file used to mirror the system theme via matchMedia, but
// users found the auto-dark surprising on mocks / dashboards. Keep the
// file (it's referenced from every Cambridge exam page) but no-op the
// detection.
(function () {
  document.documentElement.setAttribute('data-theme', 'light');
})();
