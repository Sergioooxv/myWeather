document.getElementById('weather-form').addEventListener('submit', async function (event) {
            event.preventDefault();

            const location = document.getElementById('location').value;
            const tempUnit = document.getElementById('temp-unit').value;
            const apiKey = 'AIzaSyCY3CFeuywBj_eOPYrgtWdAtDGyvZxjArU'; // Tu clave API de Google Maps
            const weatherApiKey = '4d0f78fed8ff9bd80a42280651119936'; // Tu clave API de OpenWeatherMap
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}&units=${tempUnit}`;
            const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${weatherApiKey}&units=${tempUnit}`;
            const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;

            try {
                // Obtener datos del clima actual
                const weatherResponse = await fetch(weatherApiUrl);
                const weatherData = await weatherResponse.json();

                // Obtener datos de geocodificación
                const geocodeResponse = await fetch(geocodeApiUrl);
                const geocodeData = await geocodeResponse.json();

                // Verificar si los datos son válidos
                if (weatherData.cod === 200 && geocodeData.status === 'OK') {
                    const temp = weatherData.main.temp;
                    const tempUnitLabel = tempUnit === 'metric' ? '°C' : '°F';
                    const tempDescription = tempUnit === 'metric' ? 'Temperatura (°C)' : 'Temperatura (°F)';

                    // Mostrar resultados del clima
                    document.getElementById('weather-results').innerHTML = `
                <div class="row weather-info">
                    <div class="col-lg-2 col-md-6">
                        <div class="weather-card">
                            <i class="fa-solid fa-thermometer-half"></i>
                            <p id="temp">${temp.toFixed(1)}${tempUnitLabel}</p>
                            <p>${tempDescription}</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <div class="weather-card">
                            <i class="fa-solid fa-cloud-sun"></i>
                            <p id="condition">${weatherData.weather[0].description}</p>
                            <p>Condición</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <div class="weather-card">
                            <i class="fa-solid fa-tachometer-alt"></i>
                            <p id="humidity">${weatherData.main.humidity}%</p>
                            <p>Humedad</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <div class="weather-card">
                            <i class="fa-solid fa-wind"></i>
                            <p id="wind">${weatherData.wind.speed} ${tempUnit === 'metric' ? 'm/s' : 'mph'}</p>
                            <p>Viento</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <div class="weather-card">
                            <i class="fa-solid fa-gauge"></i>
                            <p id="pressure">${weatherData.main.pressure} hPa</p>
                            <p>Presión</p>
                        </div>
                    </div>
                    <div class="col-lg-2 col-md-6">
                        <div class="weather-card">
                            <i class="fa-solid fa-globe"></i>
                            <p id="location-name">${weatherData.name}</p>
                            <p>Ubicación</p>
                        </div>
                    </div>
                </div>
            `;

                    // Mostrar el mapa de Google Maps
                    const map = new google.maps.Map(document.getElementById('weather-map'), {
                        center: {
                            lat: geocodeData.results[0].geometry.location.lat,
                            lng: geocodeData.results[0].geometry.location.lng
                        },
                        zoom: 12
                    });

                    new google.maps.Marker({
                        position: {
                            lat: geocodeData.results[0].geometry.location.lat,
                            lng: geocodeData.results[0].geometry.location.lng
                        },
                        map: map
                    });

                    // Obtener y mostrar el pronóstico extendido
                    const forecastResponse = await fetch(forecastApiUrl);
                    const forecastData = await forecastResponse.json();

                    const forecastCards = forecastData.list.filter((_, index) => index % 8 === 0).slice(0, 5); // Pronóstico de 5 días

                    const forecastHTML = forecastCards.map(forecast => {
                        const date = new Date(forecast.dt * 1000);
                        const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
                        const temp = forecast.main.temp.toFixed(1);
                        const description = forecast.weather[0].description;
                        const icon = forecast.weather[0].icon;

                        return `
                    <div class="col-lg-2 col-md-6 col-sm-6">
                        <div class="forecast-card">
                            <p class="forecast-day">${day}</p>
                            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" />
                            <p class="forecast-temp">${temp}${tempUnitLabel}</p>
                            <p class="forecast-description">${description}</p>
                        </div>
                    </div>
                `;
                    }).join('');

                    document.getElementById('forecast-cards').innerHTML = forecastHTML;
                } else {
                    document.getElementById('weather-results').innerHTML = `<p>No se encontró la ubicación. Por favor, inténtalo de nuevo.</p>`;
                }
            } catch (error) {
                console.error('Error al obtener el clima o el mapa:', error);
                document.getElementById('weather-results').innerHTML = `<p>Hubo un problema al obtener la información. Por favor, inténtalo de nuevo.</p>`;
            }
        });

        // Cargar la API de Google Maps
        function initMap() {
            // Esta función se llama cuando la API de Google Maps está cargada
        }

        // Cargar el script de Google Maps API
        function loadGoogleMapsScript() {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCY3CFeuywBj_eOPYrgtWdAtDGyvZxjArU&callback=initMap`; // Usa tu clave real
            script.defer = true;
            script.async = true;
            document.head.appendChild(script);
        }

        window.onload = loadGoogleMapsScript;