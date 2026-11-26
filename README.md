# ANTI-Walk — Antigonish rides

A responsive front-end rideshare prototype for Antigonish, Nova Scotia.

## Run locally

Serve this folder with a static web server (for example, VS Code Live Server) and
open `index.html`. The interactive OpenStreetMap works without a key; the
standalone `driver.html` page is linked from the ride-booking page.

## Optional Google Maps mode

By default, the app uses Leaflet with OpenStreetMap tiles and Photon reverse
geocoding, so map taps select a location without a configured API key. To use
the optional Google Maps JavaScript map and in-app driving routes instead:

1. Create a Google Cloud project, attach billing, and enable **Maps JavaScript
   API**, **Routes API**, and **Geocoding API**.
2. Create a browser API key. Restrict it to your local site origin (such as
   `http://localhost:5500/*`) and restrict API access to those three APIs.
3. Copy `maps-config.example.js` to `maps-config.js` and set
   `window.GOOGLE_MAPS_API_KEY` in the local copy. The local file is git-ignored;
   do not commit a real key.

Google Maps Platform usage may incur charges. In the default no-key mode,
clicking the map looks up the nearest mapped place/address through the public
Photon service; the map tiles are from OpenStreetMap. Map-click coordinates are
sent to Photon. Public map and geocoding services have usage limits and no
availability guarantee. If they are blocked, use the **Places** button or the
map-panel place picker; local choices such as McDonald's work without a network
lookup. Google Maps mode uses the configured key for map taps and in-app driving
routes. The app links to Google Maps for turn-by-turn directions in either mode.

## Prototype features

- Interactive OpenStreetMap with no-key click-to-set via Photon, plus the optional configured Google Maps mode
- Map-panel place picker includes McDonald's and can set pickup, friend pickup, or drop-off
- Optional friend ride with an ordered pickup at your location, then your friend's, then the destination
- Map-panel picker can set your pickup, friend pickup, or drop-off; the active-driver count is sample data
- Antigonish pickup and drop-off suggestions, ride choices, and fare estimates
- Parent-authorized child booking flow with guardian consent and trusted contact
- Community, Neighbour Plus, and Household concept membership options
- Local rider profile saved in the current browser
- ANTI-Walk driver signup page with live profile preview and local-only profile saving

This is a front-end concept only. It does not dispatch rides, verify drivers,
process payments, activate memberships, or transmit booking/profile data. Plan
prices, fares, availability, and ride estimates are illustrative, not service
offers. Do not enter real personal information in the demo.
