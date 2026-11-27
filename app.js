const places = {
  "antigonish town centre": { label: "Town Centre", key: "town", x: 483.8, y: 365.4, km: 0 },
  "stfx university": { label: "StFX", key: "stfx", x: 470.3, y: 406.8, km: 0.9 },
  "st. martha's regional hospital": { label: "St. Martha's", key: "hospital", x: 546.5, y: 296.1, km: 1.5 },
  "antigonish mall": { label: "The Mall", key: "mall", x: 540.3, y: 416.4, km: 1.5 },
  "antigonish market square": { label: "Market Square", key: "market", x: 537, y: 405.5, km: 1.4 },
  "antigonish landing": { label: "Antigonish Landing", key: "landing", x: 663.8, y: 239.5, km: 3.1 },
  "pomquet beach": { label: "Pomquet Beach", key: "pomquet", x: 1860.3, y: 110.7, km: 20 },
  "paqtnkek mi'kmaw nation": { label: "Paqtnkek", key: "paqtnkek", x: 1871.4, y: 654.5, km: 18 },
  "mcdonald's": { label: "McDonald's", key: "mcdonalds", x: 393.4, y: 430.1, km: 1.4 },
};
const mapPlaceValues = {
  town: "Antigonish Town Centre",
  stfx: "StFX University",
  hospital: "St. Martha's Regional Hospital",
  mall: "Antigonish Mall",
  market: "Antigonish Market Square",
  landing: "Antigonish Landing",
  mcdonalds: "McDonald's, 37 James Street, Antigonish, Nova Scotia",
};

const pickupInput = document.querySelector("#pickup");
const destinationInput = document.querySelector("#destination");
const toast = document.querySelector("#toast");
const scheduleDialog = document.querySelector("#schedule-dialog");
const scheduleButton = document.querySelector("#schedule-button");
const rideTimeInput = document.querySelector("#ride-time");
const childToggle = document.querySelector("#book-for-child");
const childDetails = document.querySelector("#child-details");
const friendToggle = document.querySelector("#ride-with-friend");
const friendPickupFields = document.querySelector("#friend-pickup-fields");
const friendPickupInput = document.querySelector("#friend-pickup");
const friendNameInput = document.querySelector("#friend-name");
const friendRouteSummary = document.querySelector("#friend-route-summary");
const friendMapTarget = document.querySelector("#map-friend-target");
const localMapFallback = document.querySelector("#local-map-fallback");
const localMapTargetLabel = document.querySelector("#local-map-target-label");
const mapDrawing = document.querySelector("#local-map");
const zoomMapInButton = document.querySelector("#zoom-map-in");
const zoomMapOutButton = document.querySelector("#zoom-map-out");
const mapDirectionsLink = document.querySelector("#map-directions-link");
const mapPickInstruction = document.querySelector("#map-pick-instruction");
const mapPlaceSelect = document.querySelector("#map-place-select");
const userProfileDialog = document.querySelector("#user-profile-dialog");
const userProfileForm = document.querySelector("#user-profile-form");
const userProfileKey = "anti-walk-rider-profile";
const rideTypes = {
  neighbour: { base: 5.5, perKm: 0.95 },
  shared: { base: 3.5, perKm: 0.65 },
  group: { base: 7.5, perKm: 1.45 },
};

let selectedRide = "neighbour";
let pickupTime = null;
let toastTimeout;
let currentDistance = 3.1;
let mapSelectionTarget = "destination";
let mapView = { x: 0, y: 0, width: 900, height: 760 };
let panStart = null;
let suppressMapClick = false;
const manualMapLocations = new WeakMap();
let riderProfile = { name: "", email: "", phone: "", riderType: "Local rider" };
let selectedMembership = "Community";

function findPlace(value) {
  const normalized = value.trim().toLocaleLowerCase();
  if (normalized.includes("mcdonald")) return places["mcdonald's"];
  return places[normalized] ?? null;
}

function getLocationForInput(input) {
  const manualLocation = manualMapLocations.get(input);
  return manualLocation?.value === input.value ? manualLocation : findPlace(input.value);
}

function estimateFare(type, distance) {
  return (rideTypes[type].base + distance * rideTypes[type].perKm).toFixed(2);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 5000);
}

function formatPlace(value) {
  const place = findPlace(value);
  return place?.label ?? (value.trim() || "Choose a place");
}

function setDistance(distance) {
  currentDistance = distance;
  document.querySelector("#trip-distance").textContent = `About ${distance.toFixed(1)} km`;
  document.querySelector("#map-distance").textContent = `${distance.toFixed(1)} km`;
  Object.keys(rideTypes).forEach((type) => {
    document.querySelector(`#${type}-price`).textContent = `$${estimateFare(type, distance)}`;
  });
}

function estimateDistanceBetween(start, end) {
  if (start.key && start.key === end.key) return 0.7;
  if (start.key === "town") return end.km || 0.7;
  if (end.key === "town") return start.km || 0.7;
  return Math.max(0.7, Math.hypot(start.x - end.x, start.y - end.y) * 0.0105 * 1.25);
}

function estimateLocalDistance() {
  const pickup = getLocationForInput(pickupInput);
  const destination = getLocationForInput(destinationInput);
  if (!pickup || !destination) return 3.1;
  if (friendToggle.checked) {
    const friendPickup = getLocationForInput(friendPickupInput);
    if (!friendPickup) return 3.1;
    return estimateDistanceBetween(pickup, friendPickup) + estimateDistanceBetween(friendPickup, destination);
  }
  return estimateDistanceBetween(pickup, destination);
}

function updateDirectionsLink() {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", pickupInput.value.trim() || "Antigonish Town Centre, Antigonish, NS");
  url.searchParams.set("destination", destinationInput.value.trim() || "StFX University, Antigonish, NS");
  if (friendToggle.checked && friendPickupInput.value.trim()) {
    url.searchParams.set("waypoints", friendPickupInput.value.trim());
  }
  url.searchParams.set("travelmode", "driving");
  mapDirectionsLink.href = url.toString();
}

function updateRoute() {
  document.querySelector("#route-origin-label").textContent = formatPlace(pickupInput.value);
  document.querySelector("#route-destination-label").textContent = formatPlace(destinationInput.value);
  friendRouteSummary.hidden = !friendToggle.checked;
  document.querySelector("#friend-route-label").textContent = formatPlace(friendPickupInput.value);
  setDistance(estimateLocalDistance());
  updateDirectionsLink();
  updateLocalMapDrawing();
  document.querySelectorAll(".destination-chip").forEach((chip) => {
    chip.classList.toggle("selected", chip.dataset.place === destinationInput.value);
  });
}

function updateMapPickInstruction() {
  const placeType = {
    pickup: "your pickup",
    friend: "your friend's pickup",
    destination: "your drop-off",
  }[mapSelectionTarget] ?? "your drop-off";
  mapPickInstruction.textContent = localMapFallback.hidden
    ? `Click the map or choose a place below to set ${placeType}.`
    : `Choose a local place to set ${placeType}.`;
  localMapTargetLabel.textContent = `Choose a local place to set ${placeType}. No map key or network lookup is needed.`;
}

function getMapTargetInput(target) {
  if (target === "pickup") return pickupInput;
  if (target === "friend") return friendPickupInput;
  return destinationInput;
}

function setSelectedMapLocation(target, address, point = null) {
  const targetInput = getMapTargetInput(target);
  targetInput.value = address;
  if (point) {
    manualMapLocations.set(targetInput, {
      ...point,
      key: `map-pin-${point.x.toFixed(2)}-${point.y.toFixed(2)}`,
      value: address,
    });
  } else {
    manualMapLocations.delete(targetInput);
  }
  updateRoute();
  localMapFallback.hidden = true;
  const placeType = target === "pickup" ? "Pickup" : target === "friend" ? "Friend's pickup" : "Drop-off";
  updateMapPickInstruction();
  showToast(`${placeType} set to ${address}.`);
}

function updateLocalMapDrawing() {
  const placeFor = getLocationForInput;
  const markerPlaces = {
    "#pickup-marker": placeFor(pickupInput),
    "#destination-marker": placeFor(destinationInput),
    "#friend-marker": friendToggle.checked ? placeFor(friendPickupInput) : null,
  };
  Object.entries(markerPlaces).forEach(([selector, place]) => {
    const marker = mapDrawing.querySelector(selector);
    if (!marker) return;
    if (!place) {
      marker.setAttribute("display", "none");
      return;
    }
    marker.removeAttribute("display");
    marker.setAttribute("transform", `translate(${place.x} ${place.y})`);
  });

  const routePlaces = [
    placeFor(pickupInput),
    ...(friendToggle.checked ? [placeFor(friendPickupInput)] : []),
    placeFor(destinationInput),
  ].filter(Boolean);
  const routePath = routePlaces.length > 1
    ? routePlaces.map((place, index) => `${index ? "L" : "M"} ${place.x} ${place.y}`).join(" ")
    : "";
  mapDrawing.querySelector("#route-line").setAttribute("d", routePath);
  mapDrawing.querySelector("#route-shadow").setAttribute("d", routePath);
}

function showLocalMapFallback() {
  localMapFallback.hidden = false;
  updateMapPickInstruction();
}

function constrainMapView() {
  mapView.x = Math.min(900 - mapView.width, Math.max(0, mapView.x));
  mapView.y = Math.min(760 - mapView.height, Math.max(0, mapView.y));
}

function applyMapView() {
  constrainMapView();
  mapDrawing.setAttribute("viewBox", `${mapView.x} ${mapView.y} ${mapView.width} ${mapView.height}`);
  zoomMapInButton.disabled = mapView.width <= 450;
  zoomMapOutButton.disabled = mapView.width >= 900;
}

function zoomMap(factor, point = { x: 450, y: 380 }) {
  const width = Math.min(900, Math.max(450, mapView.width * factor));
  const scale = width / mapView.width;
  const height = 760 * width / 900;
  mapView = {
    x: point.x - (point.x - mapView.x) * scale,
    y: point.y - (point.y - mapView.y) * scale,
    width,
    height,
  };
  applyMapView();
}

function mapPointFromPointer(event) {
  const rect = mapDrawing.getBoundingClientRect();
  const scale = Math.max(rect.width / mapView.width, rect.height / mapView.height);
  const visibleWidth = rect.width / scale;
  const visibleHeight = rect.height / scale;
  return {
    x: mapView.x + (mapView.width - visibleWidth) / 2 + ((event.clientX - rect.left) / rect.width) * visibleWidth,
    y: mapView.y + (mapView.height - visibleHeight) / 2 + ((event.clientY - rect.top) / rect.height) * visibleHeight,
  };
}

function selectMapPlace(element) {
  const placeKey = element.dataset.mapPlace;
  const place = Object.values(places).find((candidate) => candidate.key === placeKey);
  const inputValue = mapPlaceValues[placeKey];
  if (!place || !inputValue) return;
  setSelectedMapLocation(mapSelectionTarget, inputValue);
}

mapDrawing.querySelectorAll(".map-place[data-map-place]").forEach((element) => {
  const placeKey = element.dataset.mapPlace;
  const place = Object.values(places).find((candidate) => candidate.key === placeKey);
  if (place) {
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", `Set ${place.label} as the selected stop`);
    element.classList.add("map-place-selectable");
    element.addEventListener("click", () => selectMapPlace(element));
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectMapPlace(element);
      }
    });
  }
});

mapDrawing.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest(".map-place")) return;
  const rect = mapDrawing.getBoundingClientRect();
  panStart = {
    x: event.clientX,
    y: event.clientY,
    view: { ...mapView },
    width: rect.width,
    height: rect.height,
    moved: false,
  };
  mapDrawing.classList.add("is-panning");
  mapDrawing.setPointerCapture(event.pointerId);
});

mapDrawing.addEventListener("pointermove", (event) => {
  if (!panStart) return;
  if (Math.hypot(event.clientX - panStart.x, event.clientY - panStart.y) > 4) panStart.moved = true;
  const scale = Math.max(panStart.width / panStart.view.width, panStart.height / panStart.view.height);
  mapView = {
    ...panStart.view,
    x: panStart.view.x - (event.clientX - panStart.x) / scale,
    y: panStart.view.y - (event.clientY - panStart.y) / scale,
  };
  applyMapView();
});

function stopMapPan() {
  suppressMapClick = Boolean(panStart?.moved);
  panStart = null;
  mapDrawing.classList.remove("is-panning");
}

mapDrawing.addEventListener("pointerup", stopMapPan);
mapDrawing.addEventListener("pointercancel", stopMapPan);
mapDrawing.addEventListener("wheel", (event) => {
  event.preventDefault();
  zoomMap(event.deltaY < 0 ? 0.85 : 1.18, mapPointFromPointer(event));
}, { passive: false });

mapDrawing.addEventListener("click", (event) => {
  if (suppressMapClick) {
    suppressMapClick = false;
    return;
  }
  if (event.target.closest(".map-place, .map-decoration")) return;
  const point = mapPointFromPointer(event);
  if (point.x < 0 || point.x > 900 || point.y < 0 || point.y > 760) {
    showToast("Choose a location within the Antigonish map area.");
    return;
  }
  const nearestPlace = Object.values(places)
    .filter((place) => place.x >= 0 && place.x <= 900 && place.y >= 0 && place.y <= 760)
    .map((place) => ({ place, distance: Math.hypot(place.x - point.x, place.y - point.y) }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (nearestPlace?.distance <= 18) {
    const address = mapPlaceValues[nearestPlace.place.key];
    if (address) {
      setSelectedMapLocation(mapSelectionTarget, address);
      return;
    }
  }
  const latitude = 45.6555 - point.y / 760 * 0.071;
  const longitude = -62.055 + point.x / 900 * 0.12;
  setSelectedMapLocation(
    mapSelectionTarget,
    `Map pin (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
    point,
  );
});

zoomMapInButton.addEventListener("click", () => zoomMap(0.8));
zoomMapOutButton.addEventListener("click", () => zoomMap(1.25));

function setMapSelectionTarget(target) {
  mapSelectionTarget = target;
  document.querySelectorAll(".map-target-button").forEach((button) => {
    const selected = button.dataset.mapTarget === target;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  updateMapPickInstruction();
}

document.querySelectorAll(".map-target-button").forEach((button) => {
  button.addEventListener("click", () => setMapSelectionTarget(button.dataset.mapTarget));
});

document.querySelector("#choose-local-place").addEventListener("click", () => {
  showLocalMapFallback();
});

function selectListedPlace(place) {
  if (!place) return;
  setSelectedMapLocation(mapSelectionTarget, place);
}

mapPlaceSelect.addEventListener("change", () => {
  const place = mapPlaceSelect.value;
  if (!place) return;
  selectListedPlace(place);
  mapPlaceSelect.value = "";
});

document.querySelectorAll(".local-map-place").forEach((button) => {
  button.addEventListener("click", () => selectListedPlace(button.dataset.localPlace));
});

function renderRiderProfile() {
  const name = riderProfile.name.trim();
  document.querySelector("#profile-button-label").textContent = name || "My profile";
  document.querySelector("#profile-initials").textContent = name
    ? name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase()
    : "?";
  document.querySelector("#profile-membership").textContent = selectedMembership;
}

function loadRiderProfile() {
  try {
    const savedProfile = localStorage.getItem(userProfileKey);
    if (!savedProfile) return;
    const profile = JSON.parse(savedProfile);
    if (!profile || typeof profile.name !== "string") throw new Error("Saved rider profile is invalid.");
    riderProfile = {
      name: profile.name,
      email: typeof profile.email === "string" ? profile.email : "",
      phone: typeof profile.phone === "string" ? profile.phone : "",
      riderType: typeof profile.riderType === "string" ? profile.riderType : "Local rider",
    };
    const membershipPlans = ["Community", "Neighbour Plus", "Household"];
    selectedMembership = membershipPlans.includes(profile.membership) ? profile.membership : "Community";
    document.querySelector("#rider-name").value = riderProfile.name;
    document.querySelector("#rider-email").value = riderProfile.email;
    document.querySelector("#rider-phone").value = riderProfile.phone;
    document.querySelector("#rider-type").value = riderProfile.riderType;
  } catch (error) {
    console.error("ANTI-Walk couldn't load the local rider profile.", error);
    document.querySelector("#profile-status").textContent = "The saved profile couldn't be loaded from this browser.";
  }
}

document.querySelector("#user-profile-button").addEventListener("click", () => userProfileDialog.showModal());
document.querySelector("#close-profile-dialog").addEventListener("click", () => userProfileDialog.close());
document.querySelector("#cancel-profile-dialog").addEventListener("click", () => userProfileDialog.close());
userProfileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  riderProfile = {
    name: document.querySelector("#rider-name").value.trim(),
    email: document.querySelector("#rider-email").value.trim(),
    phone: document.querySelector("#rider-phone").value.trim(),
    riderType: document.querySelector("#rider-type").value,
  };
  try {
    localStorage.setItem(userProfileKey, JSON.stringify({
      ...riderProfile,
      membership: selectedMembership,
    }));
    renderRiderProfile();
    userProfileDialog.close();
    showToast("Your rider profile is saved in this browser only.");
  } catch (error) {
    console.error("ANTI-Walk couldn't save the local rider profile.", error);
    document.querySelector("#profile-status").textContent = "Couldn't save the profile in this browser. Check storage settings and try again.";
  }
});

document.querySelectorAll(".ride-option").forEach((option) => {
  option.addEventListener("click", () => {
    selectedRide = option.dataset.ride;
    document.querySelectorAll(".ride-option").forEach((rideOption) => {
      const selected = rideOption === option;
      rideOption.classList.toggle("selected", selected);
      rideOption.setAttribute("aria-checked", String(selected));
    });
  });
});

document.querySelectorAll(".destination-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    destinationInput.value = chip.dataset.place;
    updateRoute();
  });
});

pickupInput.addEventListener("input", updateRoute);
destinationInput.addEventListener("input", updateRoute);
friendPickupInput.addEventListener("input", updateRoute);
document.querySelector("#swap-route").addEventListener("click", () => {
  [pickupInput.value, destinationInput.value] = [destinationInput.value, pickupInput.value];
  updateRoute();
});

childToggle.addEventListener("change", () => {
  childDetails.hidden = !childToggle.checked;
  childDetails.disabled = !childToggle.checked;
  updateRideRequestLabel();
  if (childToggle.checked) document.querySelector("#child-name").focus();
});

function updateRideRequestLabel() {
  const label = childToggle.checked
    ? friendToggle.checked ? "Request a family ride" : "Request a ride for my child"
    : friendToggle.checked ? "Find a ride for both of us" : "Find my ride";
  document.querySelector("#request-ride span").textContent = label;
}

friendToggle.addEventListener("change", () => {
  friendPickupFields.hidden = !friendToggle.checked;
  friendPickupFields.disabled = !friendToggle.checked;
  friendMapTarget.hidden = !friendToggle.checked;
  if (!friendToggle.checked && mapSelectionTarget === "friend") {
    setMapSelectionTarget("destination");
  }
  updateRideRequestLabel();
  updateRoute();
  if (friendToggle.checked) friendNameInput.focus();
});

document.querySelector("#ride-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!pickupInput.value.trim() || !destinationInput.value.trim()) {
    showToast("Enter both a pickup and drop-off to continue.");
    return;
  }
  if (pickupInput.value.trim().toLocaleLowerCase() === destinationInput.value.trim().toLocaleLowerCase()) {
    showToast("Choose two different places for your ride.");
    return;
  }
  if (friendToggle.checked) {
    const pickup = pickupInput.value.trim().toLocaleLowerCase();
    const friendPickup = friendPickupInput.value.trim().toLocaleLowerCase();
    const destination = destinationInput.value.trim().toLocaleLowerCase();
    if (pickup === friendPickup || friendPickup === destination) {
      showToast("Choose a different location for each pickup and drop-off.");
      return;
    }
  }
  const rideName = document.querySelector(`[data-ride="${selectedRide}"] .ride-copy strong`).textContent;
  const fare = document.querySelector(`#${selectedRide}-price`).textContent;
  const time = pickupTime ? ` for ${pickupTime.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}` : "";
  const rideDescription = childToggle.checked
    ? friendToggle.checked ? "Parent-authorized family ride" : "Parent-authorized child ride"
    : friendToggle.checked ? `Ride for you and ${friendNameInput.value.trim()}` : rideName;
  const routeDescription = friendToggle.checked
    ? `from ${formatPlace(pickupInput.value)}, via ${friendNameInput.value.trim()} at ${formatPlace(friendPickupInput.value)}, to ${formatPlace(destinationInput.value)}`
    : `from ${formatPlace(pickupInput.value)} to ${formatPlace(destinationInput.value)}`;
  showToast(`Demo request: ${rideDescription} ${routeDescription}${time} · ${fare} estimate. No driver has been contacted.`);
});

scheduleButton.addEventListener("click", () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  rideTimeInput.min = localTime;
  rideTimeInput.value = pickupTime
    ? new Date(pickupTime.getTime() - pickupTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : localTime;
  scheduleDialog.showModal();
});

document.querySelector("#save-time").addEventListener("click", (event) => {
  if (!rideTimeInput.value) {
    event.preventDefault();
    showToast("Choose a pickup time first.");
    return;
  }
  const chosenTime = new Date(rideTimeInput.value);
  if (chosenTime.getTime() < Date.now()) {
    event.preventDefault();
    showToast("Choose a time in the future.");
    return;
  }
  pickupTime = chosenTime;
  scheduleButton.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="4" width="11" height="9.5" rx="1.5" /><path d="M5.5 2.5v3M10.5 2.5v3M2.5 7h11" /></svg>${chosenTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}<svg class="chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>`;
});

document.querySelectorAll(".plan-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedMembership = button.dataset.plan;
    renderRiderProfile();
    showToast(`${button.dataset.plan} is a concept plan. Membership checkout isn't connected in this demo.`);
  });
});

document.querySelector("#center-map").addEventListener("click", () => {
  mapView = { x: 0, y: 0, width: 900, height: 760 };
  applyMapView();
  localMapFallback.hidden = true;
  updateMapPickInstruction();
});

updateRoute();
applyMapView();
loadRiderProfile();
renderRiderProfile();
