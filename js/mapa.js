let map;
let marcadorSeleccionado; // Marcador para la ubicación seleccionada por el usuario
let directionsService; // Servicio para calcular la ruta
let directionsRenderer; // Renderizador de la ruta en el mapa
let autocomplete;
let geocoder; // Geocodificador para obtener la dirección

function initMap() {
    const tiendaLocation = { lat: 10.3737561, lng: -75.4736056 }; // Ubicación de la tienda

    // Inicializa el mapa
    map = new google.maps.Map(document.getElementById("map"), {
        center: tiendaLocation,
        zoom: 15,
    });

    // Inicializa el servicio de direcciones y el renderizador
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map); // Vincula el renderizador al mapa

    // Inicializa el geocodificador
    geocoder = new google.maps.Geocoder();

    // Marcador de la tienda
    new google.maps.Marker({
        position: tiendaLocation,
        map,
        title: "Mr. George",
        icon: {
            url: "img/iconTienda.png",
            scaledSize: new google.maps.Size(40, 40) // Tamaño del ícono de la tienda
        }
    });

    // Evento para colocar el marcador rojo en la ubicación seleccionada
    map.addListener("click", (event) => {
        const selectedLocation = event.latLng;

        // Si ya existe un marcador, lo movemos a la nueva ubicación
        if (marcadorSeleccionado) {
            marcadorSeleccionado.setPosition(selectedLocation);
        } else {
            // Crear un nuevo marcador en la ubicación seleccionada
            marcadorSeleccionado = new google.maps.Marker({
                position: selectedLocation,
                map,
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" // Ícono de marcador rojo
                },
                title: "Ubicación seleccionada"
            });
        }

        // Obtener la dirección de la ubicación seleccionada y llenarla en el campo de texto
        obtenerDireccion(selectedLocation);

        // Trazar la ruta desde la tienda hasta la ubicación seleccionada
        calcularYMostrarRuta(tiendaLocation, selectedLocation);
    });

    // Inicializa el autocompletado
    initAutocomplete();
}

// Función para obtener la dirección y rellenar el campo addressInput
function obtenerDireccion(location) {
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                const address = results[0].formatted_address;
                document.getElementById("addressInput").value = address; // Rellena el campo de dirección
            } else {
                alert("No se pudo encontrar la dirección para esta ubicación.");
            }
        } else {
            alert("Error en la geolocalización: " + status);
        }
    });
}

// Función para inicializar el autocompletado en el input de dirección
function initAutocomplete() {
    const cartagenaBounds = {
        north: 10.5330, // Latitud norte de Cartagena
        south: 10.2430, // Latitud sur de Cartagena
        east: -75.1800,  // Longitud este de Cartagena
        west: -75.5500   // Longitud oeste de Cartagena
    };

    autocomplete = new google.maps.places.Autocomplete(document.getElementById("addressInput"), {
        bounds: cartagenaBounds, // Limita las sugerencias a Cartagena
        componentRestrictions: { country: 'CO' }, // Restringe a Colombia
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

        // Mover o crear el marcador en la ubicación seleccionada
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

        // Obtener la dirección de la ubicación seleccionada y llenarla en el campo de texto
        obtenerDireccion(selectedLocation);

        // Trazar la ruta desde la tienda hasta la ubicación seleccionada
        calcularYMostrarRuta({ lat: 10.3738801, lng: -75.47366 }, selectedLocation);
    });
}

// Función para calcular y mostrar la ruta
function calcularYMostrarRuta(origen, destino) {
    const request = {
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING // Modo de transporte
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result); // Muestra la ruta en el mapa
        } else {
            alert("No se pudo calcular la ruta.");
        }
    });
}

// Función para usar la ubicación actual del usuario
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { lat: latitude, lng: longitude };

                // Centrar el mapa en la ubicación actual
                map.setCenter(currentLocation);

                // Si ya existe un marcador seleccionado, muévelo a la ubicación actual
                if (marcadorSeleccionado) {
                    marcadorSeleccionado.setPosition(currentLocation);
                } else {
                    // Crear un nuevo marcador en la ubicación actual
                    marcadorSeleccionado = new google.maps.Marker({
                        position: currentLocation,
                        map,
                        title: "Tu ubicación",
                        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    });
                }

                // Obtener la dirección de la ubicación actual y rellenar el campo de texto
                obtenerDireccion(currentLocation);

                // Trazar la ruta desde la tienda hasta la ubicación actual
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

        // Crear el enlace de Google Maps con las coordenadas seleccionadas
        const enlaceGoogleMaps = `https://www.google.com/maps?q=${ubicacion.lat()},${ubicacion.lng()}`;

        // Llamar a la función enviarPedidoFinal con el enlace de Google Maps como "Domicilio"
        enviarPedidoFinal("*Domicilio* \n" + enlaceGoogleMaps);

        cerrarMapa(); // Cierra el mapa después de confirmar
    } else {
        alert("Por favor, selecciona una ubicación.");
    }
}
