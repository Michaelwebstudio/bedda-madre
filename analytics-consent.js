(() => {
  "use strict";

  // Sustituye el valor vacío por el identificador real de Google Analytics, por ejemplo: G-ABC123DE45.
  const GA_MEASUREMENT_ID = "";
  const STORAGE_KEY = "bedda_cookie_consent_v1";
  const CONSENT_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  const banner = document.getElementById("cookie-banner");
  const acceptButton = document.getElementById("accept-cookies");
  const rejectButton = document.getElementById("reject-cookies");
  const settingsButton = document.getElementById("open-cookie-settings");

  if (!banner || !acceptButton || !rejectButton || !settingsButton) return;

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !saved.choice || !saved.savedAt) return null;
      if (Date.now() - saved.savedAt > CONSENT_MAX_AGE) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return saved.choice;
    } catch {
      return null;
    }
  }

  function saveConsent(choice) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, savedAt: Date.now() }));
  }

  function hasValidMeasurementId() {
    return /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID);
  }

  function loadGoogleAnalytics() {
    if (!hasValidMeasurementId() || document.querySelector("script[data-google-analytics]")) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.dataset.googleAnalytics = "true";
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  function deleteAnalyticsCookies() {
    const hostname = window.location.hostname;
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      if (!name.startsWith("_ga")) return;
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${hostname}; SameSite=Lax`;
    });
  }

  function closeBanner() {
    banner.hidden = true;
  }

  function openBanner() {
    banner.hidden = false;
    rejectButton.focus({ preventScroll: true });
  }

  acceptButton.addEventListener("click", () => {
    saveConsent("accepted");
    loadGoogleAnalytics();
    closeBanner();
  });

  rejectButton.addEventListener("click", () => {
    saveConsent("rejected");
    deleteAnalyticsCookies();
    closeBanner();
  });

  settingsButton.addEventListener("click", openBanner);

  const consent = readConsent();
  if (consent === "accepted") loadGoogleAnalytics();
  if (!consent) banner.hidden = false;
})();
