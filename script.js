// Función para agregar un producto al carrito
function agregarAlCarrito(event) {
    event.preventDefault();
    const articulo = event.target.closest('.articulo');
    const id = articulo.getAttribute('data-id');
    const nombre = articulo.getAttribute('data-nombre');
    const precio = parseFloat(articulo.getAttribute('data-precio'));

    let carrito = obtenerCarrito();

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${nombre} ha sido añadido al carrito.`);
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
function actualizarCantidad(id, incremento) {
    let carrito = obtenerCarrito();
    const producto = carrito.find(item => item.id === id);

    if (producto) {
        producto.cantidad += incremento;

        // Eliminar el producto si la cantidad es menor a 1
        if (producto.cantidad < 1) {
            carrito = carrito.filter(item => item.id !== id);
        }

        // Limitar la cantidad máxima a 99
        if (producto.cantidad > 99) {
            producto.cantidad = 99;
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarrito();
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
    const url = `https://wa.me/+573014762994?text=${encodeURIComponent(mensaje)}`;

    // Redirigir a la URL de WhatsApp
    window.open(url, '_blank');
}

// Llama a mostrarCarrito cuando se cargue compras.html
if (window.location.pathname.includes('compras.html')) {
    mostrarCarrito();
}