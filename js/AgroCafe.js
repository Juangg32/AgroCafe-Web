// Lógica de búsqueda en tiempo real
function buscarProducto() {
    const input = document.getElementById("buscador").value.toLowerCase();
    const productos = document.querySelectorAll(".producto-item");
    const mensajeSinResultado = document.getElementById("sin-resultado");
    let hayResultados = false;

    // Función para normalizar texto, eliminar acentos y espacios
    function normalizar(texto) {
        return texto.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // Filtrar productos según el input
    productos.forEach(producto => {
        const nombre = normalizar(producto.getAttribute("data-nombre"));
        if (nombre.includes(normalizar(input))) {
            producto.style.display = "block";
            hayResultados = true;
        } else {
            producto.style.display = "none";
        }
    });

    // Mostrar u ocultar mensaje de "Sin resultados"
    if (hayResultados || input === "") {
        mensajeSinResultado.classList.add("d-none");
    } else {
        mensajeSinResultado.classList.remove("d-none");
    }

    // Ocultar títulos de categoría si todos sus elementos están ocultos por la búsqueda
    const secciones = document.querySelectorAll('.categoria-seccion');
    secciones.forEach(seccion => {
        const itemsVisibles = seccion.querySelectorAll('.producto-item[style="display: block;"], .producto-item:not([style*="display: none"])');
        const titulo = seccion.querySelector('.category-title');

        if (itemsVisibles.length === 0 && input !== "") {
            titulo.style.display = "none";
        } else {
            titulo.style.display = "inline-block";
        }
    });
}

// Simulación de filtro por categorías en el menú
function filtrarCategoria(categoriaSeleccionada) {
    const secciones = document.querySelectorAll('.categoria-seccion');

    secciones.forEach(seccion => {
        if (categoriaSeleccionada === 'Todos' || seccion.getAttribute('data-categoria') === categoriaSeleccionada) {
            seccion.style.display = 'block';
        } else {
            seccion.style.display = 'none';
        }
    });

    // Limpiar buscador al cambiar de categoría
    document.getElementById("buscador").value = "";
    buscarProducto(); // resetear vistas
}

// --- LÓGICA DEL CARRITO DE COMPRAS DINÁMICO ---

// Arreglo (memoria) para almacenar los productos guardados
let carrito = [];

function agregarAlCarrito(botonClicado) {
    // 1. Obtener la tarjeta completa del producto donde se hizo clic
    const tarjeta = botonClicado.closest('.glass-card');

    // 2. Extraer los datos del HTML (Nombre, Precio e Icono)
    const nombre = tarjeta.querySelector('h3').innerText;
    const precioTexto = tarjeta.querySelector('.precio').innerText;
    const precioNumerico = parseFloat(precioTexto.replace('$', '')); // Convierte "$250" a 250
    const icono = tarjeta.querySelector('.icono').innerHTML;

    // 3. Agregar el producto al arreglo del carrito
    carrito.push({
        nombre: nombre,
        precio: precioNumerico,
        icono: icono
    });

    // 4. Actualizar toda la interfaz del carrito
    actualizarCarritoUI();

    // 5. Efecto visual: Cambiamos el botón para confirmar que se agregó
    const contenidoOriginal = botonClicado.innerHTML;
    botonClicado.innerHTML = '<i class="bi bi-check2-circle fs-5 me-2"></i> ¡Agregado!';
    botonClicado.style.backgroundColor = '#4A5D23'; // Verde
    botonClicado.style.borderColor = '#4A5D23';

    // Regresamos el botón a la normalidad tras 1.5 segundos
    setTimeout(() => {
        botonClicado.innerHTML = contenidoOriginal;
        botonClicado.style.backgroundColor = '';
        botonClicado.style.borderColor = '';
    }, 1500);
}

// Función para dibujar los productos, el botón de eliminar y sumar los precios
function actualizarCarritoUI() {
    const contenedorCarrito = document.getElementById('contenido-carrito');
    const contadorBadge = document.getElementById('contador-carrito');

    // Actualizar el número rojo en el icono del menú
    contadorBadge.innerText = carrito.length;

    // Si el carrito está vacío, mostramos el mensaje por defecto
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="text-center mt-5 text-muted">
                <i class="bi bi-basket fs-1"></i>
                <p class="mt-3">Tu carrito está vacío.</p>
            </div>`;
        document.getElementById('carrito-subtotal').innerText = "$0.00";
        document.getElementById('carrito-iva').innerText = "$0.00";
        document.getElementById('carrito-total').innerText = "$0.00";
        return;
    }

    // Si hay productos, construimos la lista HTML
    let htmlLista = '<ul class="list-group list-group-flush mb-3">';
    let subtotal = 0;

    carrito.forEach((producto, index) => {
        // Sumamos al subtotal
        subtotal += producto.precio;

        // Creamos cada renglón del carrito con su botón de eliminar (basura roja)
        htmlLista += `
            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div class="d-flex align-items-center">
                    <span class="me-3 fs-5">${producto.icono}</span>
                    <div class="text-start">
                        <h6 class="mb-0 fw-bold">${producto.nombre}</h6>
                        <small class="text-muted">$${producto.precio.toFixed(2)}</small>
                    </div>
                </div>
                <!-- BOTÓN PARA ELIMINAR -->
                <button class="btn btn-sm text-danger" onclick="eliminarDelCarrito(${index})" title="Eliminar">
                    <i class="bi bi-trash3-fill fs-5"></i>
                </button>
            </li>
        `;
    });

    htmlLista += '</ul>';
    contenedorCarrito.innerHTML = htmlLista;

    // MATEMÁTICAS: Cálculos de Subtotal, IVA y Total
    const iva = subtotal * 0.16; // Calculamos el 16%
    const total = subtotal + iva;

    // Imprimir los valores en el HTML formateados a 2 decimales (.toFixed(2))
    document.getElementById('carrito-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('carrito-iva').innerText = `$${iva.toFixed(2)}`;
    document.getElementById('carrito-total').innerText = `$${total.toFixed(2)}`;
}

// Función para eliminar un producto
function eliminarDelCarrito(index) {
    // Quitamos el elemento de la memoria
    carrito.splice(index, 1);

    // Volvemos a calcular todo
    actualizarCarritoUI();
}

async function obtenerPrecioRealCafe() {
    const elementoPrecio = document.getElementById('precio-cafe-ticker');
    
    try {
        // Ejemplo usando una API de cotización o backend propio
        const respuesta = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const datos = await respuesta.json();
        
        // Conversión o cálculo del valor
        const precioEstimado = (datos.rates.MXN * 12.5).toFixed(2); // Ajuste según tu tarifa/bolsa
        
        if (elementoPrecio) {
            elementoPrecio.textContent = `$${precioEstimado} MXN/kg`;
        }
    } catch (error) {
        console.error("Error consultando el precio actual:", error);
    }
}

// Consultar precio al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    obtenerPrecioRealCafe();
    // Consultar automáticamente cada 60 segundos
    setInterval(obtenerPrecioRealCafe, 60000); 
});