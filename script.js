const OWNER = "Viper12CU";
const REPO = "link_chest";

const API = `https://api.github.com/repos/${OWNER}/${REPO}/releases`;


const heroVersion = document.getElementById("hero-version");
const heroDescription = document.getElementById("hero-description");
const heroDownloadBtn = document.getElementById("hero-download-btn");

const specDate = document.getElementById("spec-date");
const specSize = document.getElementById("spec-size");
const specHash = document.getElementById("spec-hash");
const specDownloads = document.getElementById("spec-downloads");
const specStatus = document.getElementById("spec-status");
const specFilename = document.getElementById("spec-filename");

const copyRight = document.getElementById("copy-right");

copyRight.textContent = `${new Date().getFullYear()} Link Chest. All rights reserved.`;

const releaseList = document.getElementById("release-list");

function formatDate(date) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getHashShort(hash) {
  if (!hash) return "sha256:...";
  return hash.length > 40 ? hash.substring(0, 40) + "..." : hash;
}

async function loadReleases() {
  try {
    const response = await fetch(API);

    if (!response.ok) {
      console.error(
        "Error fetching releases:",
        response.status,
        response.statusText,
      );
      throw new Error("No se pudieron obtener los releases");
    }

    const releases = await response.json();

    if (releases.length === 0) {
      heroVersion.textContent = "No releases";
      heroDescription.textContent = "No releases available.";
      heroDownloadBtn.style.display = "none";
      releaseList.innerHTML =
        "<p class='col-span-full text-center text-on-surface-variant'>No releases available</p>";
      return;
    }

    showLatest(releases[0]);
    showHistory(releases);
  } catch (error) {
    heroVersion.textContent = "Error";
    heroDescription.textContent = error.message;
    heroDownloadBtn.style.display = "none";
    releaseList.innerHTML = `<p class='col-span-full text-center text-error'>${error.message}</p>`;
  }
}

function getAPK(release) {
  return release.assets.find((asset) =>
    asset.name.toLowerCase().endsWith(".apk"),
  );
}

function showLatest(release) {
  const apk = getAPK(release);

  heroVersion.textContent = release.tag_name || "v1.0.0";
  heroDescription.textContent =
    release.body?.split("\n")[0] ||
    "A modern, high-performance distribution hub for developers. This build includes critical stability improvements and optimized binary streaming for mobile APKs.";

  if (apk) {
    heroDownloadBtn.href = apk.browser_download_url;
    heroDownloadBtn.setAttribute("download", apk.name);
    heroDownloadBtn.style.display = "flex";
  } else {
    heroDownloadBtn.style.display = "none";
  }

  specDate.textContent = formatDateShort(release.published_at);

  if (apk) {
    specSize.textContent = formatBytes(apk.size);
    specDownloads.textContent = apk.download_count.toLocaleString();
    specFilename.textContent = apk.name;
  } else {
    specSize.textContent = "N/A";
    specDownloads.textContent = "0";
    specFilename.textContent = "No APK available";
  }

  specHash.textContent = getHashShort(release.target_commitish || release.sha);

  const isPrerelease = release.prerelease || release.draft;
  specStatus.textContent = isPrerelease ? "Pre-release" : "Stable";
  specStatus.className = isPrerelease
    ? "text-on-surface font-semibold text-amber-400"
    : "text-on-surface font-semibold";
  const statusDot = specStatus.previousElementSibling;
  if (statusDot) {
    statusDot.className = isPrerelease
      ? "w-2 h-2 rounded-full bg-amber-500"
      : "w-2 h-2 rounded-full bg-green-500";
  }

  document
    .getElementById("tech-specs")
    .parentElement.classList.remove("loading-skeleton");
}

function showHistory(releases) {
  releaseList.innerHTML = "";

  releases.forEach((release) => {
    const apk = getAPK(release);

    const card = document.createElement("div");
    card.className =
      "release-card col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container rounded-2xl border border-outline-variant/30 p-6 flex flex-col";
    card.setAttribute("role", "listitem");

    const tagName = release.tag_name || "Unknown";
    const releaseName = release.name || tagName;
    const publishedDate = formatDateShort(release.published_at);
    const body = release.body || "No description available";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-4">
        <div class="flex-1 min-w-0">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-container/20 border border-primary-container/30 rounded-full text-label-sm text-primary mb-3">
            <span class="material-symbols-outlined text-xs">tag</span>
            <span>${tagName}</span>
          </span>
          <h3 class="font-headline-md text-on-background truncate">${releaseName}</h3>
        </div>
      </div>

      <div class="flex items-center gap-3 text-label-sm text-on-surface-variant mb-4">
        <span class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">calendar_today</span>
          <span>${publishedDate}</span>
        </span>
        ${
          apk
            ? `
          <span class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">storage</span>
            <span>${formatBytes(apk.size)}</span>
          </span>
        `
            : ""
        }
      </div>

      <p class="text-on-surface-variant text-body-md leading-relaxed flex-1 mb-6 line-clamp-3">${body}</p>

      <div class="pt-4 border-t border-outline-variant/20">
        ${
          apk
            ? `
          <a
            class="download-btn w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-label-sm"
            href="${apk.browser_download_url}"
            download="${apk.name}"
          >
            <span class="material-symbols-outlined">download</span>
            <span>Download APK</span>
          </a>
        `
            : `
          <span class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-label-sm text-on-surface-variant">
            <span class="material-symbols-outlined">block</span>
            <span>No APK Available</span>
          </span>
        `
        }
      </div>
    `;

    releaseList.appendChild(card);
  });
}

loadReleases();
