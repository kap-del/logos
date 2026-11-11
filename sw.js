// Lets the installed app open with no connection.
//
// Network first: online, every launch gets the newest version, so a stale
// screen can't linger after an update. Offline, the last copy answers. It only
// ever stores the app's own files and the fonts the app downloads; tasks are
// in the database and never pass through here.
const VERSION = 'f0ff01adf603';
const PRECACHE = [".last_build_id", "assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/NOTICES", "assets/assets/icons/beige_ao.png", "assets/assets/icons/beige_murasaki.png", "assets/assets/icons/kuro_kin.png", "assets/assets/icons/shiro_aka.png", "assets/assets/icons/shiro_ao.png", "assets/assets/icons/shiro_kin.png", "assets/assets/icons/shiro_midori.png", "assets/assets/icons/shiro_murasaki.png", "assets/assets/icons/simple_ao.png", "assets/assets/icons/simple_kon.png", "assets/assets/icons/simple_shiro.png", "assets/fonts/MaterialIcons-Regular.otf", "assets/fonts/fallback/Roboto-Regular.ttf", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm", "drift_worker.js", "favicon.png", "flutter.js", "flutter_bootstrap.js", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png", "index.html", "main.dart.js", "manifest.json", "sqlite3.wasm", "version.json"];
const CACHE = `logos-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('logos-') && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const own = url.origin === self.location.origin;
  // Japanese and emoji glyphs come from Google's font servers on first use.
  const font = url.hostname === 'fonts.gstatic.com';
  if (!own && !font) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request, { ignoreSearch: own })
          .then((hit) => hit ?? Response.error()),
      ),
  );
});
