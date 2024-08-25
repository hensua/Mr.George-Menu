function enviarPedido() {
    const plato = document.getElementById('plato').value;
    const bebida = document.getElementById('bebida').value;
    const mensaje = `Hola, me gustaría pedir: \n- Plato: ${plato}\n- Bebida: ${bebida}`;

    // URL de WhatsApp con mensaje prellenado
    const url = `https://wa.me/+573014762994?text=${encodeURIComponent(mensaje)}`;

    // Redirigir a la URL de WhatsApp
    window.open(url, '_blank');
}