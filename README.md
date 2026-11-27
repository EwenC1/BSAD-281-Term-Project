# ANTI-Walk — Antigonish rides

A responsive front-end rideshare prototype for Antigonish, Nova Scotia.

## Run locally

Serve this folder with a static web server (for example, VS Code Live Server) and
open `index.html`. The app and its interactive map work without a map API key,
external map tiles, or geocoding service. The standalone `driver.html` page is
linked from the ride-booking page.

## Map data

The bundled [Antigonish map](./antigonish-map.svg) uses OpenStreetMap road,
building, land-cover, and waterway geometry for the town and nearby area
(snapshot downloaded November 26, 2026). The data is bundled locally, so the map
does not request external tiles or require a map API key. Attribution: ©
[OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available
under the [Open Database License](https://opendatacommons.org/licenses/odbl/).

The map is centered on Antigonish; its street geometry and landmark positions
come from the OpenStreetMap snapshot, which can have omissions or errors.
To keep interaction responsive, the bundled map omits house-by-house footprints
and minor paths, uses fewer labels, and draws roads with lighter line weights.
Key Antigonish streets are labeled along their OpenStreetMap road geometry.
Zooming and panning are constrained to the map's Antigonish bounds, so the map
cannot be moved outside the area shown.
Suggested destinations outside the town map area may be beyond the visible map.
The dashed route line and fare/distance estimates are illustrative, not
turn-by-turn routing or navigation guidance. The directions link opens Google
Maps externally.

## Prototype features

- Responsive local street map with labeled landmark selection, pan, and bounded zoom
- Clicking an unlabeled map position adds a coordinate pin without geocoding
- Map-panel place picker includes McDonald's and can set pickup, friend pickup, or drop-off
- Optional friend ride with an ordered pickup at your location, then your friend's, then the destination
- Map-panel picker can set your pickup, friend pickup, or drop-off; the active-driver count is sample data
- Antigonish pickup and drop-off suggestions, ride choices, and fare estimates
- Parent-authorized child booking flow with guardian consent and trusted contact
- Community, Neighbour Plus, and Household concept membership options
- Local rider profile saved in the current browser
- ANTI-Walk driver signup page with live profile preview and local-only profile saving

Clicking a labeled landmark or selecting a place in the picker sets the active
stop. Clicking an unlabeled map area sets a coordinate pin; no address
reverse-geocoding is used.

This is a front-end concept only. It does not dispatch rides, verify drivers,
process payments, activate memberships, or transmit booking/profile data. Plan
prices, fares, availability, and ride estimates are illustrative, not service
offers. Do not enter real personal information in the demo.
