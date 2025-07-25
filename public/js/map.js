
const mapDiv = document.getElementById("map");

// Check if the mapDiv exists and has data-location
if (mapDiv && mapDiv.dataset.location) {
  const location = mapDiv.dataset.location;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        alert("Location not found");
        return;
      }

      const lat = data[0].lat;
      const lon = data[0].lon;

      const map = L.map('map').setView([lat, lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([lat, lon]).addTo(map)
        .bindPopup(location)
        .openPopup();
    })
    .catch(error => {
      console.error("Map loading error:", error);
    });
}
