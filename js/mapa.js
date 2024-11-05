let map;
let marcadorSeleccionado; // Marcador para la ubicación seleccionada por el usuario
let directionsService; // Servicio para calcular la ruta
let directionsRenderer; // Renderizador de la ruta en el mapa

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

        // Trazar la ruta desde la tienda hasta la ubicación seleccionada
        calcularYMostrarRuta(tiendaLocation, selectedLocation);
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

let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(document.getElementById("addressInput"));
    autocomplete.setFields(["address_components", "geometry"]);
}

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

                // Trazar la ruta desde la tienda hasta la ubicación actual
                calcularYMostrarRuta({ lat: 10.3738801, lng: -75.47366 }, currentLocation);
            },
            () => alert("No se pudo obtener la ubicación")
        );
    } else {
        alert("Geolocalización no soportada en este navegador.");
    }
}


