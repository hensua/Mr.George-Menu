let map;
let marcadorSeleccionado; // Marcador para la ubicación seleccionada por el usuario
let directionsService; // Servicio para calcular la ruta
let directionsRenderer; // Renderizador de la ruta en el mapa
let autocomplete;
let geocoder; // Geocodificador para obtener la dirección
const tarifaPorKilometro = 1653; // Tarifa por kilómetro en pesos colombianos
const costoMinimo = 3000; // Costo mínimo de domicilio
const costoMaximo = 20000; // Costo máximo de domicilio

function initMap() {
    const tiendaLocation = { lat: 10.3737561, lng: -75.4736056 }; // Ubicación de la tienda

    // Inicializa el mapa
    map = new google.maps.Map(document.getElementById("map"), {
        center: tiendaLocation,
        zoom: 15,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    geocoder = new google.maps.Geocoder();

    new google.maps.Marker({
        position: tiendaLocation,
        map,
        title: "Mr. George",
        icon: {
            url: "img/iconTienda.png",
            scaledSize: new google.maps.Size(40, 40)
        }
    });

    map.addListener("click", (event) => {
        const selectedLocation = event.latLng;
        if (marcadorSeleccionado) {
            marcadorSeleccionado.setPosition(selectedLocation);
        } else {
            marcadorSeleccionado = new google.maps.Marker({
                position: selectedLocation,
                map,
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                },
                title: "Ubicación seleccionada"
            });
        }
        obtenerDireccion(selectedLocation);
        calcularYMostrarRuta(tiendaLocation, selectedLocation);
    });

    initAutocomplete();
}

function obtenerDireccion(location) {
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                const address = results[0].formatted_address;
                document.getElementById("addressInput").value = address;
            } else {
                alert("No se pudo encontrar la dirección para esta ubicación.");
            }
        } else {
            alert("Error en la geolocalización: " + status);
        }
    });
}

function initAutocomplete() {
    const cartagenaBounds = {
        north: 10.5330,
        south: 10.2430,
        east: -75.1800,
        west: -75.5500
    };

    autocomplete = new google.maps.places.Autocomplete(document.getElementById("addressInput"), {
        bounds: cartagenaBounds,
        componentRestrictions: { country: 'CO' },
        fields: ["address_components", "geometry"]
    });

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            alert("No se encontró una ubicación para la dirección ingresada.");
            return;
        }

        const selectedLocation = place.geometry.location;
        map.setCenter(selectedLocation);

        if (marcadorSeleccionado) {
            marcadorSeleccionado.setPosition(selectedLocation);
        } else {
            marcadorSeleccionado = new google.maps.Marker({
                position: selectedLocation,
                map,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                title: "Ubicación seleccionada"
            });
        }

        obtenerDireccion(selectedLocation);
        calcularYMostrarRuta({ lat: 10.3738801, lng: -75.47366 }, selectedLocation);
    });
}

function calcularYMostrarRuta(origen, destino) {
    const request = {
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            const distanciaEnKm = result.routes[0].legs[0].distance.value / 1000; // Convierte metros a kilómetros
            calcularCostoDomicilio(distanciaEnKm); // Calcula y muestra el costo del domicilio
        } else {
            alert("No se pudo calcular la ruta.");
        }
    });
}

function calcularCostoDomicilio(distanciaKm) {
    let costoDomicilio = distanciaKm * tarifaPorKilometro;

    // Aplicar los límites de costo mínimo y máximo
    if (costoDomicilio < costoMinimo) {
        costoDomicilio = costoMinimo;
    } else if (costoDomicilio > costoMaximo) {
        costoDomicilio = costoMaximo;
    }

    // Redondea hacia abajo el valor de costoDomicilio para evitar decimales
    const costoFormateado = `$${Math.floor(costoDomicilio).toLocaleString('es-CO')}`;

    // Muestra el costo de envío en el HTML con paréntesis alrededor del valor
    document.getElementById("costoEnvio").textContent = `Domicilio: ${costoFormateado}`;
}

function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { lat: latitude, lng: longitude };
                map.setCenter(currentLocation);
                if (marcadorSeleccionado) {
                    marcadorSeleccionado.setPosition(currentLocation);
                } else {
                    marcadorSeleccionado = new google.maps.Marker({
                        position: currentLocation,
                        map,
                        title: "Tu ubicación",
                        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    });
                }
                obtenerDireccion(currentLocation);
                calcularYMostrarRuta({ lat: 10.3738801, lng: -75.47366 }, currentLocation);
            },
            () => alert("No se pudo obtener la ubicación")
        );
    } else {
        alert("Geolocalización no soportada en este navegador.");
    }
}

function cerrarMapa() {
    document.getElementById("contenedor_full_map").style.display = "none";
}

function listoUbicacion() {
    if (marcadorSeleccionado) {
        const ubicacion = marcadorSeleccionado.getPosition();
        const enlaceGoogleMaps = `https://www.google.com/maps?q=${ubicacion.lat()},${ubicacion.lng()}`;
        const direccion = document.getElementById("addressInput").value;
        const referencia = document.getElementById("referenciaInput").value;

        enviarPedidoFinal(`*DOMICILIO*\n\n *Ubicación:*\n ${direccion}\n\n *Punto de referencia:*\n ${referencia}\n\n *Ubicación en Google Maps:*\n ${enlaceGoogleMaps}`);
        cerrarMapa();
    } else {
        alert("Por favor, selecciona una ubicación.");
    }
}


