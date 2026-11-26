const driverForm = document.querySelector("#driver-form");
const statusMessage = document.querySelector("#driver-save-status");
const storageKey = "anti-walk-driver-profile";
const previousStorageKey = "goodneighbour-driver-profile";
const photoInput = document.querySelector("#driver-photo");
let photoUrl = null;

function getProfile() {
  return {
    name: document.querySelector("#driver-name").value.trim(),
    email: document.querySelector("#driver-email").value.trim(),
    phone: document.querySelector("#driver-phone").value.trim(),
    area: document.querySelector("#driver-area").value,
    bio: document.querySelector("#driver-bio").value.trim(),
    vehicle: document.querySelector("#driver-vehicle").value.trim(),
    year: document.querySelector("#driver-year").value,
    colour: document.querySelector("#driver-colour").value.trim(),
    seats: document.querySelector("#driver-seats").value,
    preferences: Array.from(document.querySelectorAll('input[name="preferences"]:checked'), (input) => input.value),
    available: document.querySelector("#driver-available").checked,
  };
}

function updatePreview() {
  const profile = getProfile();
  document.querySelector("#preview-name").textContent = profile.name || "Your name";
  document.querySelector("#avatar-initial").textContent = profile.name ? profile.name.charAt(0).toLocaleUpperCase() : "?";
  document.querySelector("#preview-area").textContent = `${profile.area} · Local driver`;
  document.querySelector("#preview-bio").textContent = profile.bio || "A short introduction helps riders know who they'll be meeting.";
  document.querySelector("#preview-vehicle").textContent = profile.vehicle
    ? `${profile.year || "Year"} ${profile.colour || ""} ${profile.vehicle}`.replace(/\s+/g, " ").trim()
    : "Vehicle details";
  document.querySelector("#preview-seats").textContent = `${profile.seats} passenger${profile.seats === "1" ? "" : "s"}`;
  const availability = document.querySelector("#availability-pill");
  availability.classList.toggle("unavailable", !profile.available);
  availability.lastChild.textContent = profile.available ? " Available" : " Not taking rides";
  const preferenceContainer = document.querySelector("#preview-preferences");
  preferenceContainer.replaceChildren();
  if (profile.preferences.length) {
    profile.preferences.forEach((preference) => {
      const tag = document.createElement("span");
      tag.textContent = preference;
      preferenceContainer.append(tag);
    });
  } else {
    const tag = document.createElement("span");
    tag.textContent = "New neighbour";
    preferenceContainer.append(tag);
  }
}

function fillForm(profile) {
  document.querySelector("#driver-name").value = profile.name ?? "";
  document.querySelector("#driver-email").value = profile.email ?? "";
  document.querySelector("#driver-phone").value = profile.phone ?? "";
  document.querySelector("#driver-area").value = profile.area ?? "Antigonish Town";
  document.querySelector("#driver-bio").value = profile.bio ?? "";
  document.querySelector("#driver-vehicle").value = profile.vehicle ?? "";
  document.querySelector("#driver-year").value = profile.year ?? "";
  document.querySelector("#driver-colour").value = profile.colour ?? "";
  document.querySelector("#driver-seats").value = profile.seats ?? "3";
  document.querySelector("#driver-available").checked = profile.available ?? true;
  document.querySelectorAll('input[name="preferences"]').forEach((input) => {
    input.checked = (profile.preferences ?? []).includes(input.value);
  });
  document.querySelector("#bio-count").textContent = String(profile.bio?.length ?? 0);
}

function loadSavedProfile() {
  try {
    const savedProfile = localStorage.getItem(storageKey) ?? localStorage.getItem(previousStorageKey);
    if (!savedProfile) return;
    fillForm(JSON.parse(savedProfile));
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, savedProfile);
    document.querySelector("#preview-saved").hidden = false;
    statusMessage.textContent = "Your saved demo profile was loaded from this browser.";
  } catch {
    statusMessage.textContent = "The saved profile couldn't be read. You can still build a new profile on this device.";
  }
}

driverForm.addEventListener("input", updatePreview);
driverForm.addEventListener("change", updatePreview);
driverForm.addEventListener("input", (event) => {
  if (event.target.id === "driver-bio") {
    document.querySelector("#bio-count").textContent = String(event.target.value.length);
  }
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) {
    photoInput.value = "";
    statusMessage.textContent = "Choose an image under 3 MB. It will only be previewed in this browser.";
    return;
  }
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  const image = document.querySelector("#avatar-image");
  image.src = photoUrl;
  image.hidden = false;
  document.querySelector("#avatar-initial").hidden = true;
});

driverForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = getProfile();
  try {
    localStorage.setItem(storageKey, JSON.stringify(profile));
    document.querySelector("#preview-saved").hidden = false;
    statusMessage.textContent = "Your demo profile is saved on this device only. Nothing was sent to a rideshare service.";
  } catch {
    statusMessage.textContent = "This browser couldn't save the profile. Check its storage settings and try again.";
  }
});

loadSavedProfile();
updatePreview();
