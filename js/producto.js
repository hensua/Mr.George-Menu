document.addEventListener('DOMContentLoaded', () => {
    const producto = JSON.parse(localStorage.getItem('productoSeleccionado'));
    if (!producto) {
        console.error('No se encontró el producto en localStorage.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('nombre-producto').textContent = producto.nombre || 'Nombre no disponible';
    document.getElementById('descripcion-producto').textContent = producto.descripcion || 'Descripción no disponible';
    document.getElementById('precio-producto').textContent = `$${formatearPrecio(parseFloat(producto.precio) || 0)}`;
    document.getElementById('imagen-producto').src = producto.imagen || 'img/default.png';

    // Establecer la cantidad inicial desde localStorage o 1
    const cantidadElemento = document.getElementById('cantidad');
    cantidadElemento.textContent = producto.cantidad || 1;

    // Obtener el carrito desde localStorage
    let carrito = obtenerCarrito();
    // Verificar si el producto ya está en el carrito
    let productoExistente = carrito.find(item => item.id === producto.id);

    // Si el producto ya existe en el carrito, establecer las instrucciones guardadas
    if (productoExistente) {
        document.getElementById('instrucciones').value = productoExistente.instrucciones || ''; // Mostrar instrucciones guardadas
        cantidadElemento.textContent = productoExistente.cantidad || 1; // Mostrar cantidad guardada
    }

    // Función para modificar la cantidad y actualizar el botón de agregar
    function modificarCantidad(cambio) {
        let cantidad = parseInt(cantidadElemento.textContent);
        cantidad += cambio;

        // Limitar la cantidad entre 1 y 99
        if (cantidad < 1) cantidad = 0;
        if (cantidad > 99) cantidad = 99;

        cantidadElemento.textContent = cantidad;
        actualizarValorBoton(cantidad);

        // Si la cantidad llega a 0, eliminar el producto del carrito y redirigir
        if (cantidad === 0) {
            eliminarDelCarrito();
            window.location.href = 'index.html';
        }
    }

    // Función para formatear el número con separadores de miles
    function formatearPrecio(valor) {
        // Asegurarnos de que el valor es un número
        const numero = parseFloat(valor);
        // Formatear el número con separadores de miles
        return `${numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    }

    // Función para actualizar el texto del botón "AGREGAR $VALOR"
    function actualizarValorBoton(cantidad) {
        const precio = parseFloat(producto.precio) || 0; // Asegúrate de convertir el precio a float
        const valor = cantidad * precio;
        const btnAgregar = document.getElementById('btn-agregar');
        btnAgregar.textContent = `AGREGAR $${formatearPrecio(valor)}`; // Formato del valor en el botón
    }

    // Función para agregar el producto al carrito
    function agregarAlCarrito() {
        const cantidad = parseInt(cantidadElemento.textContent);
        const instrucciones = document.getElementById('instrucciones').value;  // Capturar las instrucciones adicionales

        // Si la cantidad es 0 o menor, eliminar el producto del carrito
        if (cantidad <= 0) {
            eliminarDelCarrito();
            return;
        }

        // Crear un nuevo objeto productoFinal con las instrucciones y la cantidad actualizadas
        const productoFinal = {
            ...producto,
            cantidad: cantidad,
            instrucciones: instrucciones // Agregar las instrucciones al objeto producto
        };

        let carrito = obtenerCarrito();
        let productoExistente = carrito.find(item => item.id === productoFinal.id);

        // Si el producto ya existe en el carrito, actualiza cantidad e instrucciones
        if (productoExistente) {
            productoExistente.cantidad = cantidad;
            productoExistente.instrucciones = instrucciones; // Actualizar instrucciones si ya existe en el carrito
        } else {
            // Si no existe, añadir el producto al carrito
            carrito.push(productoFinal);
        }

        // Guardar el carrito actualizado en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        window.location.href = 'index.html';
    }

    // Función para eliminar el producto del carrito
    function eliminarDelCarrito() {
        let carrito = obtenerCarrito();
        carrito = carrito.filter(item => item.id !== producto.id); // Eliminar el producto por su id
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    // Función para obtener el carrito desde localStorage
    function obtenerCarrito() {
        const carrito = localStorage.getItem('carrito');
        return carrito ? JSON.parse(carrito) : []; // Devolver un array vacío si no hay carrito
    }

    // Inicializar el valor del botón al cargar la página
    actualizarValorBoton(parseInt(cantidadElemento.textContent));

    // Agregar eventos a los botones
    /*document.getElementById('btn-atras').addEventListener('click', () => window.location.href = 'index.html');*/
    document.getElementById('btn-atras').addEventListener('click', () => window.history.back());
    document.getElementById('btn-restar').addEventListener('click', () => modificarCantidad(-1));
    document.getElementById('btn-sumar').addEventListener('click', () => modificarCantidad(1));
    document.getElementById('btn-agregar').addEventListener('click', agregarAlCarrito);
});