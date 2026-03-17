// ============================================================================
// SITE CONFIG — Global Education LC
// ============================================================================
// Single source of truth for all branding, URLs, and identity settings.
// Load this file via <script src="site config/global education/site-config.js">
// BEFORE any other scripts so window.SITE_CONFIG is available everywhere.
// ============================================================================

window.SITE_CONFIG = {

  // ─── Brand Identity ────────────────────────────────────────────────────────
  brandName:        'Muzaffars English',
  testIdentifier:   'muzaffars',
  logoUrl:          'https://i.ibb.co/gMQ80dNn/image.png',
  heading1:         'Bilim va malakalarni baholash agentligi',
  heading2:         'Chet tilini bilish darajasi',

  // ─── Telegram ──────────────────────────────────────────────────────────────
  telegramChannel:      'Muzaffars English',
  telegramUrl:          'https://t.me/Muzaffar_Jovliyev_blog',
  ieltsTelegramChannel: 'https://t.me/Muzaffar_Jovliyev_blog',
  adminTelegram:        'https://t.me/m_jovliyevv',

  // ─── Certificate / PDF ─────────────────────────────────────────────────────
  directorName:     'J.Muzaffar',
  directorFullName: 'Jovliyev Muzaffar',
  directorTitle:    'Direktor | Director',
  ceoTitle:         'CEO of Muzaffars English',
  siteDomain:       'mockstream.site',

  // ─── Backend ───────────────────────────────────────────────────────────────
  backendUrl:       'https://davirbek.alwaysdata.net',
  adminBackendUrl:  'https://admin0709.alwaysdata.net',
};

// ─── Seed legacy window._site* globals ───────────────────────────────────────
window._siteLogoUrl         = window.SITE_CONFIG.logoUrl;
window._siteLogoWording     = window.SITE_CONFIG.brandName;
window._siteTestId          = window.SITE_CONFIG.testIdentifier;
window._siteTelegramChannel = window.SITE_CONFIG.telegramChannel;
