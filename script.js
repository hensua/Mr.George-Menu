let ocultarTimeout;  // Variable para almacenar el temporizador de ocultación
let interactuando = false;  // Variable para controlar la interacción con los botones

//Evitar Click derecho en toda la pagina
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Detecta iOS y Quita la opcion de hacer zoom
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // Evita el doble tap para hacer zoom
    document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault(); // Prevenir zoom en gestos de pinza
    }
    }, { passive: false });

    // Evita zoom en doble toque
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
    var now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault(); // Prevenir zoom en doble toque
    }
    lastTouchEnd = now;
    }, false);
}

// Función para actualizar el contador del carrito en el icono
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const contadorElemento = document.getElementById('contador_carrito');

    // Verificar si el elemento existe antes de intentar actualizarlo
    if (contadorElemento) {
        const totalCantidad = carrito.reduce((total, item) => total + item.cantidad, 0);  // Suma la cantidad de todos los productos

        if (totalCantidad > 0) {
            contadorElemento.textContent = totalCantidad;
            contadorElemento.style.display = 'inline';  // Muestra el contador
        } else {
            contadorElemento.style.display = 'none';  // Oculta el contador si el carrito está vacío
        }
    }
}

// Función para agregar un producto al carrito
function agregarAlCarrito(event) {
    event.preventDefault();
    
    // Identificar si es un artículo principal o un acompañamiento
    const articulo = event.target.closest('.articulo');
    const acompanamiento = event.target.closest('.acompanamiento-item');
    
    console.log('Elemento seleccionado:', articulo || acompanamiento); // Para depuración
    
    if (!articulo && !acompanamiento) {
        console.error('El artículo o acompañamiento no se encuentra en el DOM.');
        return;
    }

    // Obtener los atributos comunes (id, nombre, precio) del artículo o acompañamiento
    const id = (articulo || acompanamiento).getAttribute('data-id');
    const nombre = (articulo || acompanamiento).getAttribute('data-nombre');
    const precio = parseFloat((articulo || acompanamiento).getAttribute('data-precio'));

    // Verificar si el elemento es un artículo principal y obtener las instrucciones solo para el artículo principal
    const instrucciones = articulo ? document.getElementById('instrucciones').value : '';
    
    // Validar solo que el ID exista
    if (!id) {
        console.error('El artículo no tiene un ID válido.');
        return;
    }

    // Obtener el carrito existente
    let carrito = obtenerCarrito();
    let productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        // Solo incrementa la cantidad si el producto ya existe
        productoExistente.cantidad += 1;

        // Actualiza las instrucciones si es un artículo principal
        if (articulo) {
            productoExistente.instrucciones = instrucciones;
        }
    } else {
        // Agregar un nuevo producto al carrito
        productoExistente = {
            id,
            nombre,
            precio,
            cantidad: 1,
            instrucciones: articulo ? instrucciones : ''  // Solo agregar instrucciones si es un artículo principal
        };
        carrito.push(productoExistente);
    }

    // Guardar el carrito en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualiza el botón del artículo o acompañamiento
    actualizarBotonCantidad(articulo || acompanamiento, productoExistente.cantidad);

    // Actualiza el contador del carrito
    actualizarContadorCarrito();

    interactuando = true;  // Marca que se está interactuando

    // Reinicia el temporizador de ocultación
    if (ocultarTimeout) {
        clearTimeout(ocultarTimeout);
    }

    ocultarTimeout = setTimeout(() => {
        interactuando = false;  // Marca que se ha dejado de interactuar
        ocultarBotones(articulo || acompanamiento);
    }, 2000);
}


// Función para obtener el contenido del carrito
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

// Función para mostrar el contenido del carrito en compras.html
function mostrarCarrito() {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById('carrito_contenido');
    contenedor.innerHTML = '';

    let totalCantidad = 0; // Inicializa el total de cantidades
    let valorTotal = 0; // Inicializa el valor total

    carrito.forEach(item => {
        totalCantidad += item.cantidad; // Suma la cantidad de cada ítem al total
        valorTotal += item.cantidad * item.precio; // Calcula el valor total

        const productoHTML = `
            <div id="producto_carrito">
                <div id="caja_uno">
                    <img id="comida_logo_size" src="${item.imagen}" alt="Imagen del producto"/>  
                </div>
                <div id="caja_dos">
                <div id="caja_eliminar">
                    <button id="btn_eliminar" onclick="confirmarEliminacion('${item.id}')">
                    <img id="icon_eliminar"  src="img/Icon_eliminar.png" alt="icono eliminar producto">
                    </button>
                </div>
                    <div id="caja_info">
                        <h4 id="titulo_producto">${item.nombre}</h4>
                        <p id="caja_intrucciones">
                            <strong>Instrucciones:</strong>
                            <textarea id="instrucciones" readonly>${item.instrucciones ? item.instrucciones : "No has agregado instrucciones"}</textarea>
                        </p>
                    </div>
                    <div id="caja_precio_cantidad">
                        <span id="precio">$${Number(item.precio).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span> <!-- Formateo del precio -->

                        <div id="cont_cantidad">
                            <button id="producto_carrito_boton_quitar" onclick="actualizarCantidad('${item.id}', -1)">-</button> 
                            <span id="cantidad">${item.cantidad}</span>
                            <button id="producto_carrito_boton_agregar" onclick="actualizarCantidad('${item.id}', 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += productoHTML;
    });

    // Mostrar el total de cantidades
    const totalSpan = document.getElementById('cantidad_producto');
    if (totalSpan) {
        totalSpan.textContent = `${totalCantidad} producto${totalCantidad !== 1 ? 's' : ''}`;
    }

    // Mostrar el valor total formateado
    const valorTotalSpan = document.getElementById('span_valor');
    if (valorTotalSpan) {
        valorTotalSpan.textContent = `$${valorTotal.toLocaleString()}`; // Formatea el valor total con separador de miles
    }

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p>Tu carrito está vacío</p>';
        // Reiniciar el total si el carrito está vacío
        if (totalSpan) {
            totalSpan.textContent = '0 productos';
        }
        if (valorTotalSpan) {
            valorTotalSpan.textContent = '$0'; // Reinicia el valor total
        }
    }
}

function confirmarEliminacion(id) {
    const confirmacion = confirm("¿Estás seguro de que quieres eliminar este producto del carrito?");
    if (confirmacion) {
        actualizarCantidad(id, -999);  // Configura la cantidad a 0 o menor para eliminarlo
    }
}

// Función para actualizar la cantidad de un producto en el carrito
function actualizarCantidad(id, cambio) {
    let carrito = obtenerCarrito();
    const producto = carrito.find(item => item.id === id);

    if (producto) {
        producto.cantidad += cambio;
        if (producto.cantidad < 1) {
            carrito = carrito.filter(item => item.id !== id);  // Elimina el producto si la cantidad es inferior a 1
        } else if (producto.cantidad > 99) {
            producto.cantidad = 99;  // Limita la cantidad máxima a 99
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarrito();  // Actualiza la visualización del carrito
        actualizarContadorCarrito();  // Actualiza el contador del carrito

        // Actualiza la visualización en el artículo si aún está en la página de productos
        const articulo = document.querySelector(`.articulo[data-id="${id}"]`);
        if (articulo) {
            actualizarBotonCantidad(articulo, producto.cantidad);  // Actualiza el botón en la vista de productos
        }
    }
}

// Función para actualizar el botón de agregar al carrito con la cantidad y los botones +/-
function actualizarBotonCantidad(articulo, cantidad) {
    const botonAdd = articulo.querySelector('.boton_add');
    if (botonAdd) {
        if (cantidad > 0) {
            botonAdd.innerHTML = `
                <div class="contenedor_cantidad">
                    <button class="boton_menos" onclick="cambiarCantidadArticulo('${articulo.getAttribute('data-id')}', -1)">-</button>
                    <span class="numero_cantidad" onclick="mostrarBotones('${articulo.getAttribute('data-id')}')" style="cursor: pointer;">${cantidad}</span>
                    <button class="boton_mas" onclick="cambiarCantidadArticulo('${articulo.getAttribute('data-id')}', 1)">+</button>
                </div>
            `;
            botonAdd.style.backgroundColor = 'transparent';
            botonAdd.style.border = 'none';
            botonAdd.style.boxShadow = 'inset 0 0 0 1px rgb(255, 174, 0)';

            botonAdd.onclick = null;  // Desactiva la funcionalidad de agregar más productos
            mostrarBotones(articulo.getAttribute('data-id'));
        } else {
            botonAdd.textContent = '+';
            botonAdd.style.backgroundColor = 'rgb(255, 255, 0)';
            botonAdd.style.boxShadow = 'none';
            botonAdd.onclick = (event) => agregarAlCarrito(event);
            ocultarBotones(articulo);
        }
    }
}

// Función para cambiar la cantidad del artículo directamente desde el botón
function cambiarCantidadArticulo(id, cambio) {
    let carrito = obtenerCarrito();
    const producto = carrito.find(item => item.id === id);

    if (producto) {
        producto.cantidad += cambio;

        if (producto.cantidad < 1) {
            carrito = carrito.filter(item => item.id !== id);
        } else if (producto.cantidad > 99) {
            producto.cantidad = 99;
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        const articulo = document.querySelector(`.articulo[data-id="${id}"], .acompanamiento-item[data-id="${id}"]`);
        
        if (articulo) {
            actualizarBotonCantidad(articulo, producto.cantidad);
            ocultarBotones(articulo); // Asegúrate de que se oculten los botones si la cantidad es 0
        }

        actualizarContadorCarrito();

        interactuando = true;

        if (producto.cantidad < 1) {
            actualizarBotonCantidad(articulo, 0);
        } else {
            if (ocultarTimeout) {
                clearTimeout(ocultarTimeout);
            }
            ocultarTimeout = setTimeout(() => {
                interactuando = false;
                ocultarBotones(articulo);
            }, 2000);
        }
    }
}

// Función para mostrar los botones + y - cuando se hace clic en la cantidad
function mostrarBotones(id) {
    console.log(`Buscando artículo con ID: ${id}`);

    // Buscar el artículo en el DOM
    const articulo = document.querySelector(`.articulo[data-id="${id}"], .acompanamiento-item[data-id="${id}"]`);

    // Verificar si se encontró el artículo
    if (!articulo) {
        console.error('Artículo no encontrado');
        return; // Salir si no se encontró el artículo
    }

    const botonAdd = articulo.querySelector('.boton_add');

    // Crear los botones menos y más si no existen
    let botonMenos = articulo.querySelector('.boton_menos');
    let botonMas = articulo.querySelector('.boton_mas');

    if (!botonMenos) {
        botonMenos = document.createElement('button');
        botonMenos.classList.add('boton_menos');
        botonMenos.textContent = '-';
        botonMenos.onclick = (event) => cambiarCantidadArticulo(id, -1);
        articulo.appendChild(botonMenos);
    }

    if (!botonMas) {
        botonMas = document.createElement('button');
        botonMas.classList.add('boton_mas');
        botonMas.textContent = '+';
        botonMas.onclick = (event) => cambiarCantidadArticulo(id, 1);
        articulo.appendChild(botonMas);
    }

    // Mostrar los botones
    botonMenos.style.display = 'inline';
    botonMas.style.display = 'inline';

    // Ocultar los botones de otros artículos inmediatamente, excepto el artículo actual
    document.querySelectorAll('.articulo, .acompanamiento-item').forEach(otroArticulo => {
        if (otroArticulo !== articulo) {  // Solo oculta los que no son el actual
            ocultarBotones(otroArticulo, true);  // Oculta de forma inmediata
        }
    });

    // Solo reiniciar el temporizador de ocultación si no se está interactuando
    if (!interactuando) {
        if (ocultarTimeout) {
            clearTimeout(ocultarTimeout);
        }

        ocultarTimeout = setTimeout(() => {
            ocultarBotones(articulo);
        }, 2000);
    }
}


function ocultarBotones(articulo, inmediato = false) {
    const botonAdd = articulo.querySelector('.boton_add');
    const botonMenos = articulo.querySelector('.boton_menos');
    const botonMas = articulo.querySelector('.boton_mas');
    const cantidad = parseInt(botonAdd?.querySelector('.numero_cantidad')?.textContent || '0');

    if (botonMenos && botonMas) {
        if ((cantidad > 0 && !interactuando) || inmediato) {
            botonMenos.style.display = 'none';
            botonMas.style.display = 'none';
        }
    }
}

// Función para verificar si está dentro del horario permitido
function verificarHorario() {
    const ahora = new Date();
    const horas = ahora.getHours();

    /*if (horas === 17) {
        return 'reserva'; // Horario de reserva (5:00 PM)
    } else if (horas >= 18 && horas <= 23) {
        return 'abierto'; // Horario abierto (6:00 PM a 11:59 PM)
    } else {
        return 'cerrado'; // Fuera del horario permitido
    }*/
}

// Función para actualizar el estado del horario en el DOM
function actualizarHorario() {
    const estadoHorario = verificarHorario();
    const horarioDiv = document.getElementById('horario');

    let mensaje = '';
    let imagen = '';

    if (estadoHorario === 'abierto') {
        mensaje = 'Abierto';
        imagen = 'img/reloj.png'; // Ruta de la imagen del reloj abierto
    } else if (estadoHorario === 'cerrado') {
        mensaje = 'Cerrado';
        imagen = 'img/reloj.png'; // Ruta de la imagen del reloj cerrado
    } else if (estadoHorario === 'reserva') {
        mensaje = 'Cerrado, pero puedes reservar tu pedido';
        imagen = 'img/reloj.png'; // Ruta de la imagen del reloj para reserva
    }

    // Modificar el contenido del div con la imagen y el mensaje
    horarioDiv.innerHTML = `
        <img id="img-reloj" src="${imagen}" alt="Estado del reloj">
        <p id="msg-reloj">${mensaje}</p>
    `;
}

// Llamar a la función para actualizar el horario al cargar la página
document.addEventListener('DOMContentLoaded', actualizarHorario);

// Función para mostrar el modal
function mostrarModal() {
    document.getElementById("deliveryModal").style.display = "block";
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById("deliveryModal").style.display = "none";
}

// Función para el botón de "Recoger en Tienda"
function selectPickup() {
    cerrarModal();
    enviarPedidoFinal("*Recoger en tienda* \n" + "https://bit.ly/MrGeorgeDireccion");
}

function mostrarMapa() {
    document.getElementById("contenedor_full_map").style.display = "block";
}

function cerrarMapa() {
    document.getElementById("contenedor_full_map").style.display = "none";
}

function listoUbicacion() {
    enviarPedidoFinal("Domicilio");
    cerrarMapa();
}

// Función para el botón de "Domicilio"
function selectDelivery() {
    cerrarModal();
    mostrarMapa();
    /*enviarPedidoFinal("Domicilio");*/
}

// Función para enviar el pedido a WhatsApp después de seleccionar el método de entrega
function enviarPedidoFinal(metodoEntrega) {
    const carrito = obtenerCarrito(); // Asegúrate de tener esta función

    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    // Verificar el estado del horario
    const estadoHorario = verificarHorario(); // Asegúrate de tener esta función
    if (estadoHorario === "cerrado") {
        alert("La tienda está cerrada. No puedes enviar pedidos en este momento.");
        return;
    } else if (estadoHorario === "reserva") {
        alert("Aún no estamos abiertos, pero puedes reservar tu pedido.");
    }

    // Generar el mensaje para WhatsApp
    let mensaje = "Hola, me gustaría pedir: \n";
    carrito.forEach((item) => {
        mensaje += `- ${item.nombre}: $${item.precio} x ${item.cantidad}\n ${item.instrucciones ? item.instrucciones : "No se agregaron instrucciones."}\n`;
    });

    // Agregar una nota si es una reserva
    if (estadoHorario === "reserva") {
        mensaje += "\n(Este es un pedido anticipado como reserva)";
    }

    // Añadir el método de entrega
    mensaje += `\nMétodo de Entrega: ${metodoEntrega}`;

    // URL de WhatsApp con mensaje prellenado
    const telefono = "+573014762994";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    // Abrir WhatsApp en una nueva pestaña
    window.open(url, "_blank");
}

// Función principal para enviar el pedido que primero muestra el modal de entrega
function enviarPedido() {
    mostrarModal();
}



// Función para inicializar artículos y acompañamientos
function inicializarArticulos() {
    // Inicializa artículos
    document.querySelectorAll('.articulo, .acompanamiento-item').forEach(item => {
        const id = item.getAttribute('data-id');
        const carrito = obtenerCarrito();
        const producto = carrito.find(item => item.id === id);

        // Actualiza la vista del artículo o acompañamiento según su estado en el carrito
        if (producto) {
            // Si el producto o acompañamiento está en el carrito
            actualizarBotonCantidad(item, producto.cantidad);
        } else {
            // Inicializa el estado del botón si no está en el carrito
            actualizarBotonCantidad(item, 0);
        }

        // Agregar eventos de clic para manejar dinámicamente los botones
        const botonAdd = item.querySelector('.boton_add');
        if (botonAdd) {
            botonAdd.addEventListener('click', () => {
                const cantidadElemento = item.querySelector('.numero_cantidad');
                if (cantidadElemento) {
                    mostrarBotones(id);
                }
            });
        }

        // Ocultar los botones al cargar la página para cada artículo o acompañamiento
        ocultarBotones(item);
    });
}

// Inicializa la vista del carrito y el contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('compras.html')) {
        mostrarCarrito();  // Muestra el contenido del carrito en la página de compras
    } else {
        actualizarContadorCarrito();  // Actualiza el contador del carrito en la página de productos
        inicializarArticulos();  // Inicializa la vista de los artículos y acompañamientos
    }
});


// Llama a filtrarArticulosAll al cargar la página
window.onload = function() {
    filtrarArticulosAll();
};

// Función para mostrar el footer
function mostrarFooter() {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'block';
    }
}

// Función para la selección de productos por categoría All
function filtrarArticulosAll() {
    // Obtener todos los botones de categoría
    const botones = document.querySelectorAll('.escoger_seccion_a');

    // Aplicar la clase de seleccionado solo al botón de la categoría "All"
    botones.forEach(boton => {
        if (boton.textContent === 'Recomendados') {
            boton.classList.add('boton_seleccionado');
        } else {
            boton.classList.remove('boton_seleccionado');
        }
    });

    // Mostrar todos los artículos que tienen el atributo data-categoria-all
    document.querySelectorAll('.articulo').forEach(articulo => {
        if (articulo.getAttribute('data-categoria-all') === 'All') {
            articulo.style.display = 'block';  // Muestra el artículo
        } else {
            articulo.style.display = 'none';  // Oculta el artículo
        }
    });

    // Mostrar el footer después de filtrar
    mostrarFooter();
}

// Función para la selección de productos por categorías Hamburguesa, Perros, Picadas y Bebidas
function filtrarArticulos(categoria) {
    // Obtener todos los botones de categoría
    const botones = document.querySelectorAll('.escoger_seccion_a');

    // Aplicar la clase de seleccionado solo al botón correspondiente
    botones.forEach(boton => {
        if (boton.textContent === categoria) {
            boton.classList.add('boton_seleccionado');
        } else {
            boton.classList.remove('boton_seleccionado');
        }
    });

    // Mostrar u ocultar los artículos según la categoría
    document.querySelectorAll('.articulo').forEach(articulo => {
        if (articulo.getAttribute('data-categoria') === categoria) {
            articulo.style.display = 'block';  // Muestra el artículo
        } else {
            articulo.style.display = 'none';  // Oculta el artículo
        }
    });

    // Mostrar el footer después de filtrar
    mostrarFooter();
}

// Función para validar y obtener los acompañamientos
function obtenerAcompanamientos(acompañamientos) {
    const contenedorAcompanamiento = document.getElementById('contenedor_acompañamiento');
    const contenedorAcompanamientos = document.getElementById('acompañamientos');

    // Limpiar el contenedor antes de agregar nuevos acompañamientos
    contenedorAcompanamientos.innerHTML = '';

    // Mostrar en consola los acompañamientos
    console.log("Acompañamientos son:");
    if (Array.isArray(acompañamientos) && acompañamientos.length > 0) {
        contenedorAcompanamiento.style.display = 'block'; // Mostrar el contenedor

        acompañamientos.forEach(acompañamiento => {
            console.log(`ID: ${acompañamiento.id}, Nombre: ${acompañamiento.nombre}, Precio: ${acompañamiento.precio}, Imagen: ${acompañamiento.imagen}`);

            // Crear el elemento HTML para el acompañamiento
            const divAcompanamiento = document.createElement('div');
            divAcompanamiento.classList.add('acompanamiento-item');

            // Configura los atributos
            divAcompanamiento.setAttribute('data-id', acompañamiento.id);
            divAcompanamiento.setAttribute('data-nombre', acompañamiento.nombre);
            divAcompanamiento.setAttribute('data-precio', acompañamiento.precio);

            // Verifica si el nombre del acompañamiento contiene "250 ml"
            let nombreSinEtiqueta = acompañamiento.nombre.replace("250 ml", "").trim();
            if (acompañamiento.nombre.includes("250 ml")) {
                // Crear el div "etiqueta_info" con el texto "250 ml"
                const etiquetaInfo = document.createElement('div');
                etiquetaInfo.classList.add('etiqueta_info');
                etiquetaInfo.textContent = "250 ml";

                // Añadir "etiqueta_info" al divAcompanamiento, antes de la imagen
                divAcompanamiento.appendChild(etiquetaInfo);
            }

            // Imagen del acompañamiento
            const imgAcompanamiento = document.createElement('img');
            imgAcompanamiento.src = acompañamiento.imagen;
            imgAcompanamiento.alt = acompañamiento.nombre;
            divAcompanamiento.appendChild(imgAcompanamiento);

            // Crear el contenedor "articulo_info"
            const articuloInfo = document.createElement('div');
            articuloInfo.classList.add('articulo_info');

            // Nombre del acompañamiento
            const nombreAcompanamiento = document.createElement('h4');
            nombreAcompanamiento.textContent = nombreSinEtiqueta;
            articuloInfo.appendChild(nombreAcompanamiento);

            // Crear el h6 con el texto predeterminado
            const descripcionAcompanamiento = document.createElement('h6');
            descripcionAcompanamiento.textContent = "El mejor y rico sabor";
            articuloInfo.appendChild(descripcionAcompanamiento);

            // Añadir el contenedor "articulo_info" al div principal
            divAcompanamiento.appendChild(articuloInfo);

            // Crear el contenedor para el precio y el botón
            const contenedorPrecioBoton = document.createElement('div');
            contenedorPrecioBoton.classList.add('contenedor_precio_boton_add');

            // Función para formatear el número con puntos en miles
            function formatearPrecio(precio) {
                return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            }

            // Precio del acompañamiento
            const precioFormateado = formatearPrecio(acompañamiento.precio);
            const precioAcompanamiento = document.createElement('h5');
            precioAcompanamiento.textContent = `$${precioFormateado}`;
            contenedorPrecioBoton.appendChild(precioAcompanamiento);

            // Botón de agregar
            const botonAdd = document.createElement('button');
            botonAdd.textContent = '+';
            botonAdd.classList.add('boton_add');
            botonAdd.onclick = (event) => agregarAlCarrito(event, acompañamiento);  // Modificamos la función de agregar al carrito
            contenedorPrecioBoton.appendChild(botonAdd);


            // Añadir el contenedor con el precio y el botón al div principal
            divAcompanamiento.appendChild(contenedorPrecioBoton);

            // Añadir el acompañamiento al contenedor
            contenedorAcompanamientos.appendChild(divAcompanamiento);
        });
    } else {
        contenedorAcompanamiento.style.display = 'none'; // Ocultar si no hay acompañamientos
    }
}

// Código para cargar acompañamientos en producto.html
document.addEventListener('DOMContentLoaded', function() {
    const productoSeleccionado = JSON.parse(localStorage.getItem('productoSeleccionado'));
    console.log("Producto seleccionado:", productoSeleccionado);

    if (window.location.pathname.includes('producto.html')) {
        console.log("Estamos en producto.html");

        if (productoSeleccionado) {
            console.log("ID del producto seleccionado:", productoSeleccionado.id);

            // Obtener los acompañamientos desde localStorage
            const acompañamientosData = JSON.parse(localStorage.getItem('acompanamientosSeleccionados')) || [];

            // Mostrar en consola los acompañamientos cargados
            console.log("Acompañamientos desde localStorage:", acompañamientosData);

            if (acompañamientosData.length > 0) {
                obtenerAcompanamientos(acompañamientosData); // Llama a la función con los datos de acompañamientos
            } else {
                console.error("No hay acompañamientos para el producto seleccionado.");
            }
        } else {
            console.warn("No hay producto seleccionado en localStorage.");
        }
    }
});

// Función para ver producto más detalle
function verProducto(event, elemento) {
    event.preventDefault();

    const producto = {
        id: elemento.dataset.id,
        nombre: elemento.dataset.nombre,
        descripcion: elemento.dataset.descripcion || 'Descripción no disponible',
        precio: elemento.dataset.precio,
        categoria: elemento.dataset.categoria,
        categoriaAll: elemento.dataset.categoriaAll,
        imagen: elemento.querySelector('img') ? elemento.querySelector('img').src : 'img/default.png',
        info: elemento.dataset.info || '',  // Manejo de data-info, aunque esté vacío
        cantidad: 1, // Inicializar la cantidad en 1 por defecto
        dataAcompanamiento: elemento.dataset.acompañamiento // Agregar data-acompañamiento
    };

    // Obtener el carrito y verificar si el producto ya está en él
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEnCarrito = carrito.find(item => item.id === producto.id);
    if (productoEnCarrito) {
        producto.cantidad = productoEnCarrito.cantidad;
    }

    // Guardar el producto seleccionado en el localStorage
    localStorage.setItem('productoSeleccionado', JSON.stringify(producto));
    
    // Almacenar los acompañamientos en un formato de objeto
    const idsAcompanamientos = producto.dataAcompanamiento ? producto.dataAcompanamiento.split(',') : [];
    const acompañamientosData = idsAcompanamientos.map(id => {
        const acompañamientoElement = document.querySelector(`.articulo[data-id="${id.trim()}"]`);
        return {
            id: id.trim(),
            nombre: acompañamientoElement.dataset.nombre,
            precio: acompañamientoElement.dataset.precio,
            imagen: acompañamientoElement.querySelector('img').src || 'img/default.png'
        };
    });
    localStorage.setItem('acompanamientosSeleccionados', JSON.stringify(acompañamientosData)); // Guardar acompañamientos como objeto

    window.location.href = 'producto.html';
}

/*localStorage.clear();*/ //Limpiar cache


document.addEventListener('DOMContentLoaded', function() {
    inicializarArticulos();  // Llama a la función para inicializar los artículos en la página
});
