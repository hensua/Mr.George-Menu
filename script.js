let ocultarTimeout;  // Variable para almacenar el temporizador de ocultación
let interactuando = false;  // Variable para controlar la interacción con los botones

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
    const articulo = event.target.closest('.articulo');

    if (!articulo) {
        console.error('El artículo no se encuentra en el DOM.');
        return;
    }

    const id = articulo.getAttribute('data-id');
    const nombre = articulo.getAttribute('data-nombre');
    const precio = parseFloat(articulo.getAttribute('data-precio'));

    if (!id || !nombre || isNaN(precio)) {
        console.error('El artículo no tiene los atributos necesarios.');
        return;
    }

    let carrito = obtenerCarrito();
    let productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        // Solo incrementa la cantidad si el producto ya existe
        productoExistente.cantidad += 1;
    } else {
        productoExistente = { id, nombre, precio, cantidad: 1 };
        carrito.push(productoExistente);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarBotonCantidad(articulo, productoExistente.cantidad);  // Actualiza el botón del artículo
    actualizarContadorCarrito();  // Actualiza el contador del carrito
    interactuando = true;  // Marca que se está interactuando
    // Reinicia el temporizador de ocultación
    if (ocultarTimeout) {
        clearTimeout(ocultarTimeout);
    }
    ocultarTimeout = setTimeout(() => {
        interactuando = false;  // Marca que se ha dejado de interactuar
        ocultarBotones(articulo);
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

    carrito.forEach(item => {
        const productoHTML = `
            <div class="producto_carrito">
                <h4>${item.nombre}</h4>
                <p>Precio: $${item.precio}</p>
                <p>Cantidad: 
                    <button class="producto_carrito_boton_quitar" onclick="actualizarCantidad('${item.id}', -1)">-</button> 
                    ${item.cantidad} 
                    <button class="producto_carrito_boton_agregar" onclick="actualizarCantidad('${item.id}', 1)">+</button>
                </p>
            </div>
        `;
        contenedor.innerHTML += productoHTML;
    });

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p>Tu carrito está vacío</p>';
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

// CAMBIADO
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
            botonAdd.style.backgroundColor = 'transparent';  // Quita el fondo del botón
            botonAdd.style.border = 'none';  // Elimina el borde externo del botón
            botonAdd.style.boxShadow = 'inset 0 0 0 1px rgb(255, 174, 0)';  // Establece un borde interno

            botonAdd.onclick = null;  // Desactiva la funcionalidad de agregar más productos desde el botón inicial
            mostrarBotones(articulo.getAttribute('data-id'));  // Muestra los botones si hay cantidad
        } else {
            //botonAdd.innerHTML = '+';
            botonAdd.textContent = '+'; 
            botonAdd.style.backgroundColor = 'rgb(255, 255, 0)';  // Restaura el color original
            botonAdd.style.boxShadow = 'none'; //Elimina el borde interno
            botonAdd.onclick = (event) => agregarAlCarrito(event);  // Restaura la funcionalidad inicial del botón
            ocultarBotones(articulo);  // Asegura que los botones estén ocultos si la cantidad es 0
        }
    }
}

// CAMBIADO
// Función para cambiar la cantidad del artículo directamente desde el botón
function cambiarCantidadArticulo(id, cambio) {
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
        const articulo = document.querySelector(`.articulo[data-id="${id}"]`);
        if (articulo) {
            actualizarBotonCantidad(articulo, producto.cantidad);  // Actualiza el botón
        }
        actualizarContadorCarrito();  // Actualiza el contador del carrito

        interactuando = true;  // Marca que se está interactuando

        // Si la cantidad llega a 0, reinicia el botón a su estado inicial
        if (producto.cantidad < 1) {
            actualizarBotonCantidad(articulo, 0);
        } else {
            // Reinicia el temporizador de ocultación solo para el artículo actual
            if (ocultarTimeout) {
                clearTimeout(ocultarTimeout);
            }
            ocultarTimeout = setTimeout(() => {
                interactuando = false;  // Marca que se ha dejado de interactuar
                ocultarBotones(articulo);
            }, 2000);
        }
    }
}

// Función para mostrar los botones + y - cuando se hace clic en la cantidad
function mostrarBotones(id) {
    // Ocultar todos los botones antes de mostrar los del artículo actual
    document.querySelectorAll('.articulo').forEach(otroArticulo => {
        ocultarBotones(otroArticulo, true);  // Oculta de forma inmediata
    });

    const articulo = document.querySelector(`.articulo[data-id="${id}"]`);
    const botonAdd = articulo.querySelector('.boton_add');
    const botonMenos = botonAdd.querySelector('.boton_menos');
    const botonMas = botonAdd.querySelector('.boton_mas');

    botonMenos.style.display = 'inline';
    botonMas.style.display = 'inline';

    // Solo reiniciar el temporizador de ocultación si no se está interactuando
    if (!interactuando) {
        if (ocultarTimeout) {
            clearTimeout(ocultarTimeout);
        }

        // Ocultar los botones nuevamente después de 2 segundos si no se está interactuando
        ocultarTimeout = setTimeout(() => {
            ocultarBotones(articulo);
        }, 2000);
    }
}

function ocultarBotones(articulo, inmediato = false) {
    const botonAdd = articulo.querySelector('.boton_add');
    const botonMenos = botonAdd?.querySelector('.boton_menos');
    const botonMas = botonAdd?.querySelector('.boton_mas');
    const cantidad = parseInt(botonAdd?.querySelector('span')?.textContent);

    if (botonMenos && botonMas) {
        if ((cantidad > 0 && !interactuando) || inmediato) {
            botonMenos.style.display = 'none';
            botonMas.style.display = 'none';
        }
    }
}

// Función para enviar el pedido a WhatsApp
function enviarPedido() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    let mensaje = 'Hola, me gustaría pedir: \n';
    carrito.forEach(item => {
        mensaje += `- ${item.nombre}: $${item.precio} x ${item.cantidad}\n`;
    });

    // URL de WhatsApp con mensaje prellenado
    const telefono = '+573014762994';  // Número de teléfono de destino
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
}

function inicializarArticulos() {
    document.querySelectorAll('.articulo').forEach(articulo => {
        const id = articulo.getAttribute('data-id');
        const carrito = obtenerCarrito();
        const producto = carrito.find(item => item.id === id);

        if (producto) {
            // Actualiza la vista del artículo si está en el carrito
            actualizarBotonCantidad(articulo, producto.cantidad);
        } else {
            // Inicializa el estado del botón si el producto no está en el carrito
            actualizarBotonCantidad(articulo, 0);
        }

        // Agregar eventos de clic para manejar dinámicamente los botones
        const botonAdd = articulo.querySelector('.boton_add');
        if (botonAdd) {
            botonAdd.addEventListener('click', () => {
                const cantidadElemento = articulo.querySelector('.boton_add span');
                if (cantidadElemento) {
                    mostrarBotones(id);
                }
            });
        }

        // Ocultar los botones al cargar la página para cada artículo
        ocultarBotones(articulo);
    });
}

// Inicializa la vista del carrito y el contador al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('compras.html')) {
        mostrarCarrito();  // Muestra el contenido del carrito en la página de compras
    } else {
        actualizarContadorCarrito();  // Actualiza el contador del carrito en la página de productos
        inicializarArticulos();  // Inicializa la vista de los artículos
    }
});