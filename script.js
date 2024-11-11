Swal.fire({
    title: "Less Points = Better Score",
    text: "The less points you have, the better will be your score",
    icon: "info"
  });

const map = new maplibregl.Map({
    container: 'map',
    style:
        'https://api.maptiler.com/maps/a6f3e17a-2ea3-46e0-9f02-12ad1ec54d31/style.json?key=8MOjFyRKnXwDpgJNoum8',
    center: [0,0],
    zoom: 1
});

map.addControl(new maplibregl.NavigationControl());

score_lab = document.getElementById("points_box")

var score = 0

async function updateMapWithRandomCountry() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Stefie/geojson-world/refs/heads/master/capitals.geojson');
        const data = await response.json();

        if (!data.features || !Array.isArray(data.features)) {
            throw new Error('Invalid GeoJSON data structure');
        }
        const randomIndex = Math.floor(Math.random() * data.features.length);
        const randomCountry = data.features[randomIndex];
        
        const iso2 = randomCountry.properties.iso2;
        const countryName = randomCountry.properties.country;

        map.setFilter("Countries", ['==', ['get', 'iso_a2'], iso2]);

        const instructionsElement = document.getElementById('instruction');
        if (instructionsElement) {
            instructionsElement.innerHTML = `Find ${countryName} capital on the map`;
        } else {
            console.warn("Instructions element not found");
        }
        return {
            country: countryName,
            iso2: iso2,
            coordinates: randomCountry.geometry.coordinates,
            city: randomCountry.properties.city
        };

    } catch (error) {
        console.error('Error updating map with random country:', error);
    }
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (angle) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

var country;

map.on('load', function() {
    updateMapWithRandomCountry().then(selectedCountry => {
        country = selectedCountry;
    });
    map.on('click', (e) => {
        const latitude = e.lngLat.lat;
        const longitude = e.lngLat.lng;
        
        console.log(latitude, country.coordinates[0])
        console.log(longitude, country.coordinates[1])
        var dist = haversine(latitude, longitude, country.coordinates[1], country.coordinates[0])
        score += Math.round(dist);
        Swal.fire({title:"You were "+Math.round(dist)+"km away", customClass: {container: 'my-swal'}});
        score_lab.innerHTML = score+" points"
        
        console.log('Clicked coordinates:', {
            latitude,
            longitude,
            point: e.point
        });

        new maplibregl.Popup()
            .setLngLat([country.coordinates[0], country.coordinates[1]])
            .setHTML(country.city)
            .addTo(map);
        
        updateMapWithRandomCountry().then(selectedCountry => {
            country = selectedCountry;
        });
    });
  });
