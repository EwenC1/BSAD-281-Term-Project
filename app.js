const places = {
  "antigonish town centre": { label: "Town Centre", key: "town", x: 350, y: 390, km: 0 },
  "stfx university": { label: "StFX", key: "stfx", x: 550, y: 275, km: 3.1 },
  "st. martha's regional hospital": { label: "St. Martha's", key: "hospital", x: 255, y: 331, km: 2.2 },
  "antigonish mall": { label: "The Mall", key: "mall", x: 700, y: 446, km: 4.8 },
  "antigonish market square": { label: "Market Square", key: "market", x: 366, y: 302, km: 1.7 },
  "antigonish landing": { label: "Antigonish Landing", key: "landing", x: 157, y: 480, km: 4.1 },
  "pomquet beach": { label: "Pomquet Beach", key: "pomquet", x: 784, y: 199, km: 18.5 },
  "paqtnkek mi'kmaw nation": { label: "Paqtnkek", key: "paqtnkek", x: 118, y: 211, km: 11.2 },
  "mcdonald's": { label: "McDonald's", key: "mcdonalds", x: 300, y: 430, km: 1.4 },
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
const mapElement = document.querySelector("#google-map");
const openMapElement = document.querySelector("#open-map");
const localMapFallback = document.querySelector("#local-map-fallback");
const localMapTargetLabel = document.querySelector("#local-map-target-label");
const mapDisclaimer = document.querySelector("#map-disclaimer");
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
let googleMap;
let openMap;
let openMapMarker;
let openMapReady = false;
let routeLibrary;
let mapGeocoder;
let activeRouteLine;
let directionsTimeout;
let routeRequestVersion = 0;
let currentDistance = 3.1;
let googleMapsReady = false;
let mapSelectionTarget = "destination";
let mapLookupVersion = 0;
let riderProfile = { name: "", email: "", phone: "", riderType: "Local rider" };
let selectedMembership = "Community";

function findPlace(value) {
  return places[value.trim().toLocaleLowerCase()] ?? null;
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

function setDistance(distance, isGoogleRoute = false, duration = null) {
  currentDistance = distance;
  document.querySelector("#trip-distance").textContent = isGoogleRoute
    ? `${distance.toFixed(1)} km · ${duration}`
    : `About ${distance.toFixed(1)} km`;
  document.querySelector("#map-distance").textContent = `${distance.toFixed(1)} km`;
  Object.keys(rideTypes).forEach((type) => {
    document.querySelector(`#${type}-price`).textContent = `$${estimateFare(type, distance)}`;
  });
}

function estimateDistanceBetween(start, end) {
  if (start.key === end.key) return 0.7;
  if (start.key === "town") return end.km || 0.7;
  if (end.key === "town") return start.km || 0.7;
  return Math.max(0.7, Math.abs(start.x - end.x) / 78 + Math.abs(start.y - end.y) / 80);
}

function estimateLocalDistance() {
  const pickup = findPlace(pickupInput.value);
  const destination = findPlace(destinationInput.value);
  if (!pickup || !destination) return 3.1;
  if (friendToggle.checked) {
    const friendPickup = findPlace(friendPickupInput.value);
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

function googleRouteAddress(value) {
  const place = findPlace(value);
  if (!place) return value.trim();
  const googleNames = {
    town: "Antigonish Town Centre, Antigonish, Nova Scotia",
    stfx: "St. Francis Xavier University, Antigonish, Nova Scotia",
    hospital: "St. Martha's Regional Hospital, Antigonish, Nova Scotia",
    mall: "Antigonish Mall, Antigonish, Nova Scotia",
    market: "Antigonish Market Square, Antigonish, Nova Scotia",
    landing: "Antigonish Landing, Antigonish, Nova Scotia",
    pomquet: "Pomquet Beach, Nova Scotia",
    paqtnkek: "Paqtnkek Mi'kmaw Nation, Nova Scotia",
    mcdonalds: "McDonald's, 37 James Street, Antigonish, Nova Scotia",
  };
  return googleNames[place.key] ?? value.trim();
}

function updateRoute() {
  document.querySelector("#route-origin-label").textContent = formatPlace(pickupInput.value);
  document.querySelector("#route-destination-label").textContent = formatPlace(destinationInput.value);
  friendRouteSummary.hidden = !friendToggle.checked;
  document.querySelector("#friend-route-label").textContent = formatPlace(friendPickupInput.value);
  setDistance(estimateLocalDistance());
  updateDirectionsLink();
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
  const canClickMap = googleMapsReady || (openMapReady && localMapFallback.hidden);
  mapPickInstruction.textContent = canClickMap
    ? `Click the map or choose a place to set ${placeType}.`
    : `Choose a listed local place to set ${placeType}.`;
  localMapTargetLabel.textContent = `Choose a local place to set ${placeType}. No map key or network lookup is needed.`;
}

function getMapTargetInput(target) {
  if (target === "pickup") return pickupInput;
  if (target === "friend") return friendPickupInput;
  return destinationInput;
}

function formatOpenMapResult(feature) {
  const properties = feature?.properties ?? {};
  const street = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const parts = [
    properties.name,
    street,
    properties.city ?? properties.town ?? properties.village,
    properties.state,
  ].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

function setSelectedMapLocation(target, address) {
  const targetInput = getMapTargetInput(target);
  targetInput.value = address;
  updateRoute();
  updateGoogleDirections();
  const placeType = target === "pickup" ? "Pickup" : target === "friend" ? "Friend's pickup" : "Drop-off";
  const canClickMap = googleMapsReady || (openMapReady && localMapFallback.hidden);
  mapPickInstruction.textContent = canClickMap
    ? `${placeType} set · click the map to change`
    : `${placeType} set · choose another local place`;
  showToast(`${placeType} set to ${address}.`);
}

function markOpenMapLocation(location, address) {
  if (!openMap || !window.L) return;
  if (openMapMarker) {
    openMapMarker.setLatLng(location).bindPopup(address).openPopup();
  } else {
    openMapMarker = window.L.marker(location).addTo(openMap).bindPopup(address).openPopup();
  }
}

function nearestOfflineMapPlace(location) {
  const restaurant = { lat: 45.6153226, lng: -62.00255 };
  const latMeters = (location.lat - restaurant.lat) * 111320;
  const lngMeters = (location.lng - restaurant.lng) * 111320 * Math.cos(restaurant.lat * Math.PI / 180);
  return Math.hypot(latMeters, lngMeters) <= 80
    ? { address: "McDonald's, 37 James Street, Antigonish, Nova Scotia", location: restaurant }
    : null;
}

async function selectLocationFromMap(location) {
  if (!location || !mapGeocoder) return;
  const target = mapSelectionTarget;
  mapPickInstruction.textContent = "Looking up this location…";
  try {
    const { results } = await mapGeocoder.geocode({ location, region: "CA" });
    const result = results?.[0];
    if (!result?.formatted_address) {
      showToast("Google Maps couldn't find an address at that point. Try another spot.");
      updateMapPickInstruction();
      return;
    }
    setSelectedMapLocation(target, result.formatted_address);
  } catch (error) {
    console.error("Google Maps couldn't look up the selected map location.", error);
    mapPickInstruction.textContent = "Couldn't find that location · try another spot";
    showToast("Google Maps couldn't look up that point. Try another spot on the map.");
  }
}

async function selectLocationFromOpenMap(location) {
  const requestVersion = ++mapLookupVersion;
  const target = mapSelectionTarget;
  mapPickInstruction.textContent = "Looking up the nearest mapped place…";
  try {
    const url = new URL("https://photon.komoot.io/reverse");
    url.searchParams.set("lat", location.lat.toString());
    url.searchParams.set("lon", location.lng.toString());
    url.searchParams.set("lang", "en");
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Place lookup failed with HTTP ${response.status}.`);
    const data = await response.json();
    if (requestVersion !== mapLookupVersion) return;
    const feature = data.features?.[0];
    const address = formatOpenMapResult(feature)
      || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
    setSelectedMapLocation(target, address);
    markOpenMapLocation(location, address);
  } catch (error) {
    if (requestVersion !== mapLookupVersion) return;
    console.error("ANTI-Walk couldn't look up the clicked map location.", error);
    const localPlace = nearestOfflineMapPlace(location);
    if (localPlace) {
      setSelectedMapLocation(target, localPlace.address);
      markOpenMapLocation(localPlace.location, localPlace.address);
      return;
    }
    showLocalMapFallback("Map lookup is blocked · choose a local place below");
    showToast("Map lookup is blocked. Choose a local place below to set your stop.");
  }
}

function showLocalMapFallback(message) {
  openMapElement.hidden = true;
  localMapFallback.hidden = false;
  mapDisclaimer.textContent = message;
  updateMapPickInstruction();
}

function initializeOpenMap() {
  if (!window.L) {
    showLocalMapFallback("Map library is blocked · choose a local place below");
    return;
  }
  try {
    openMap = window.L.map(openMapElement).setView([45.6226, -61.998], 14);
    const tileLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19,
    });
    let failedTiles = 0;
    let loadedTiles = 0;
    tileLayer.on("tileload", () => { loadedTiles += 1; });
    tileLayer.on("tileerror", () => {
      failedTiles += 1;
      if (!googleMapsReady && failedTiles >= 3 && loadedTiles === 0) {
        showLocalMapFallback("Map tile access is blocked · choose a local place below");
      }
    });
    tileLayer.addTo(openMap);
    openMap.on("click", (event) => selectLocationFromOpenMap(event.latlng));
    openMapReady = true;
    mapDisclaimer.textContent = "OpenStreetMap · click the map to set the selected stop";
    updateMapPickInstruction();
  } catch (error) {
    console.error("ANTI-Walk couldn't initialize the no-key map.", error);
    showLocalMapFallback("Map unavailable · choose a local place below");
  }
}

function updateGoogleDirections() {
  if (!googleMapsReady) return;
  clearTimeout(directionsTimeout);
  const requestVersion = ++routeRequestVersion;
  if (!pickupInput.value.trim() || !destinationInput.value.trim()
    || (friendToggle.checked && !friendPickupInput.value.trim())) {
    activeRouteLine?.setMap(null);
    activeRouteLine = null;
    if (friendToggle.checked && !friendPickupInput.value.trim()) {
      mapDisclaimer.textContent = "Add your friend's pickup to preview the full route";
    }
    return;
  }
  directionsTimeout = setTimeout(async () => {
    try {
      const { routes } = await routeLibrary.Route.computeRoutes({
        origin: googleRouteAddress(pickupInput.value),
        ...(friendToggle.checked
          ? { intermediates: [{ location: googleRouteAddress(friendPickupInput.value) }] }
          : {}),
        destination: googleRouteAddress(destinationInput.value),
        travelMode: "DRIVING",
        region: "CA",
        fields: ["path", "distanceMeters", "durationMillis", "viewport"],
      });
      if (requestVersion !== routeRequestVersion) return;
      if (!routes?.length || !routes[0].path?.length) throw new Error("No driving route was found.");
      activeRouteLine?.setMap(null);
      activeRouteLine = new google.maps.Polyline({
        path: routes[0].path,
        map: googleMap,
        strokeColor: "#2e7955",
        strokeWeight: 5,
        strokeOpacity: 0.9,
      });
      if (routes[0].viewport) googleMap.fitBounds(routes[0].viewport, 48);
      const distance = routes[0].distanceMeters;
      if (distance > 0) {
        const duration = `${Math.max(1, Math.round((routes[0].durationMillis ?? 0) / 60000))} min`;
        setDistance(distance / 1000, true, duration);
        mapDisclaimer.textContent = "Google Maps · driving route";
      }
    } catch (error) {
      if (requestVersion !== routeRequestVersion) return;
      activeRouteLine?.setMap(null);
      mapDisclaimer.textContent = "Google Maps · route unavailable";
      console.error("Google Maps could not calculate this route.", error);
    }
  }, 450);
}

window.initAntiWalkMap = async function initAntiWalkMap() {
  try {
    const [{ Map }, routes, geocoding] = await Promise.all([
      google.maps.importLibrary("maps"),
      google.maps.importLibrary("routes"),
      google.maps.importLibrary("geocoding"),
    ]);
    routeLibrary = routes;
    mapGeocoder = new geocoding.Geocoder();
    mapElement.classList.add("ready");
    openMapElement.hidden = true;
    localMapFallback.hidden = true;
    googleMap = new Map(mapElement, {
      center: { lat: 45.6226, lng: -61.998 },
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      clickableIcons: true,
      gestureHandling: "greedy",
      mapTypeId: "roadmap",
    });
    googleMapsReady = true;
    updateMapPickInstruction();
    googleMap.addListener("click", (event) => selectLocationFromMap(event.latLng));
    mapDisclaimer.textContent = "Google Maps · interactive driving route";
    updateGoogleDirections();
  } catch (error) {
    mapElement.classList.remove("ready");
    openMapElement.hidden = false;
    mapDisclaimer.textContent = "Google Maps unavailable · OpenStreetMap is active";
    console.error("Google Maps could not initialize.", error);
    showToast("Google Maps couldn't start. The no-key OpenStreetMap is still available.");
  }
};

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
  showLocalMapFallback("Local place picker · no map or network lookup needed");
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

window.gm_authFailure = function gmAuthFailure() {
  mapDisclaimer.textContent = "Google Maps key rejected · check key restrictions";
  showToast("Google Maps rejected the API key. Check its website and API restrictions.");
};

function loadGoogleMaps() {
  initializeOpenMap();
  const key = window.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=initAntiWalkMap&v=weekly`;
  script.async = true;
  script.onerror = () => {
    mapDisclaimer.textContent = "OpenStreetMap active · Google Maps couldn't load";
    showToast("Google Maps couldn't load. The no-key OpenStreetMap is still available.");
  };
  document.head.append(script);
}

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
    updateGoogleDirections();
  });
});

pickupInput.addEventListener("input", updateRoute);
destinationInput.addEventListener("input", updateRoute);
friendPickupInput.addEventListener("input", updateRoute);
pickupInput.addEventListener("change", updateGoogleDirections);
destinationInput.addEventListener("change", updateGoogleDirections);
friendPickupInput.addEventListener("change", updateGoogleDirections);
document.querySelector("#swap-route").addEventListener("click", () => {
  [pickupInput.value, destinationInput.value] = [destinationInput.value, pickupInput.value];
  updateRoute();
  updateGoogleDirections();
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
  updateGoogleDirections();
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
  if (googleMap) {
    localMapFallback.hidden = true;
    openMapElement.hidden = true;
    googleMap.setCenter({ lat: 45.6226, lng: -61.998 });
    googleMap.setZoom(14);
  } else if (openMap) {
    localMapFallback.hidden = true;
    openMapElement.hidden = false;
    openMap.invalidateSize();
    openMap.setView([45.6226, -61.998], 14);
  }
});

updateRoute();
loadRiderProfile();
renderRiderProfile();
loadGoogleMaps();
