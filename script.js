// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAK2ex1uACVSPo_fxlgN_iDBAWlsBvV4RM",
    authDomain: "refresqueriaporton.firebaseapp.com",
    projectId: "refresqueriaporton",
    storageBucket: "refresqueriaporton.firebasestorage.app",
    messagingSenderId: "608366778564",
    appId: "1:608366778564:web:39cf58eb7802c1e0189191",
    measurementId: "G-LW73YBZVPF"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Configuración de productos
const products = {
    refrescos: [
        {name: "Cocacola", price: "$20.00", img: "imagenes/Cocacola.jpeg", category: "Bebidas"},
        {name: "Sangria", price: "$20.00", img: "imagenes/Sangria.jpeg", category: "Bebidas"},
        {name: "Sprite", price: "$20.00", img: "imagenes/Sprite.jpeg", category: "Bebidas"},
        {name: "Fanta Fresa", price: "$20.00", img: "imagenes/Fanta_Fresa.jpeg", category: "Bebidas"},
    ],
    snacks: [
        {name: "Tostitos preparados", price: "$50.00", img: "imagenes/Tostitos_Preparados.jpeg", category: "Snacks"},
        {name: "Pepihuates", price: "$25.00", img: "imagenes/Prepihuates.jpeg", category: "Snacks"},
        {name: "Raspado de vainilla CH", price: "$25.00", img: "imagenes/Ras_Vainilla.jpeg", category: "Snacks"},
        {name: "Raspado de ciruela CH", price: "$25.00", img: "imagenes/Ras_Ciruela.jpeg", category: "Snacks"},
    ],
    dulces: [
        {name: "Chocolate", price: "$8.00", img: "imagenes/Nugs.jpeg", category: "Dulces"},
        {name: "Gomitas", price: "$7.00", img: "imagenes/Gomitas.jpeg", category: "Dulces"},
    ],
    contacto: [
        {name: "Teléfono: 123-456-789", price: "", img: null, type: "contacto"},
        {name: "Correo: info@refresqueria.com", price: "", img: null, type: "contacto"},
        {name: "Dirección: Av. Principal #123", price: "", img: null, type: "contacto"},
    ],
    sobre: [
        {name: "Somos una refresquería familiar dedicada a ofrecer los mejores productos frescos y deliciosos.", price: "", img: null, type: "info"},
        {name: "Horario: Lunes a Domingo 8:00 AM - 10:00 PM", price: "", img: null, type: "info"},
        {name: "¡Visítanos y descubre por qué somos los favoritos del barrio!", price: "", img: null, type: "info"},
    ]
};

// Sistema del Carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    actualizarContadorEscritorio();
}

function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.name === producto.name);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarPanelCarrito();
    mostrarNotificacion('Producto agregado al carrito');
}

function quitarDelCarrito(nombreProducto) {
    carrito = carrito.filter(item => item.name !== nombreProducto);
    guardarCarrito();
    actualizarPanelCarrito();
}

function actualizarCantidad(nombreProducto, cambio) {
    const producto = carrito.find(item => item.name === nombreProducto);
    if (producto) {
        producto.cantidad += cambio;
        if (producto.cantidad <= 0) {
            quitarDelCarrito(nombreProducto);
        } else {
            guardarCarrito();
            actualizarPanelCarrito();
        }
    }
}

function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const cartCount = document.getElementById('cart-count');
    const cartCountDesktop = document.getElementById('cart-count-desktop');
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    if (cartCountDesktop) {
        cartCountDesktop.textContent = totalItems;
    }
}

// ===== NUEVO CONTADOR PARA ESCRITORIO =====
function actualizarContadorEscritorio() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contadorEscritorio = document.getElementById('contador-escritorio');
    
    if (contadorEscritorio) {
        contadorEscritorio.textContent = totalItems;
        
        // Aplicar colores para modo oscuro
        const esModoOscuro = document.documentElement.classList.contains('dark');
        if (esModoOscuro) {
            contadorEscritorio.style.color = 'white';
            contadorEscritorio.style.background = '#2ec4b6';
        } else {
            contadorEscritorio.style.color = 'var(--dark)';
            contadorEscritorio.style.background = 'var(--secondary)';
        }
        
        // Animación cuando hay productos
        if (totalItems > 0) {
            contadorEscritorio.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                contadorEscritorio.style.animation = '';
            }, 500);
        }
    }
}

function actualizarPanelCarrito() {
    const contenedorItems = document.getElementById('cart-items');
    const totalElemento = document.getElementById('cart-total');
    
    if (!contenedorItems || !totalElemento) return;
    
    let total = 0;
    contenedorItems.innerHTML = '';

    if (carrito.length === 0) {
        contenedorItems.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <p>Tu carrito está vacío</p>
                <small>Agrega productos desde el menú</small>
            </div>
        `;
    } else {
        carrito.forEach(item => {
            const precioNumerico = parseFloat(item.price.replace('$', '')) || 0;
            const subtotal = precioNumerico * item.cantidad;
            total += subtotal;

            const elementoItem = document.createElement('div');
            elementoItem.className = 'cart-item';
            elementoItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">${item.price}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button type="button" class="qty-btn" onclick="actualizarCantidad('${item.name}', -1)">−</button>
                        <span class="quantity">${item.cantidad}</span>
                        <button type="button" class="qty-btn" onclick="actualizarCantidad('${item.name}', 1)">+</button>
                    </div>
                    <button type="button" class="remove-btn" onclick="quitarDelCarrito('${item.name}')">
                        🗑️
                    </button>
                </div>
                <div class="cart-item-subtotal">
                    $${subtotal.toFixed(2)}
                </div>
            `;
            contenedorItems.appendChild(elementoItem);
        });
    }

    totalElemento.textContent = `$${total.toFixed(2)}`;
    actualizarContadorCarrito();
    actualizarContadorEscritorio();
}

// FUNCIONES PARA ABRIR Y CERRAR EL CARRITO
function abrirCarrito() {
    console.log('Abriendo carrito...');
    const cartPanel = document.getElementById('cart-panel');
    const cartBackdrop = document.getElementById('cart-backdrop');
    
    if (cartPanel && cartBackdrop) {
        cartPanel.classList.add('active');
        cartBackdrop.classList.add('active');
        actualizarPanelCarrito();
        console.log('Carrito abierto correctamente');
    } else {
        console.error('No se encontraron elementos del carrito');
    }
}

function cerrarCarrito() {
    console.log('Cerrando carrito...');
    const cartPanel = document.getElementById('cart-panel');
    const cartBackdrop = document.getElementById('cart-backdrop');
    
    if (cartPanel && cartBackdrop) {
        cartPanel.classList.remove('active');
        cartBackdrop.classList.remove('active');
        console.log('Carrito cerrado correctamente');
    }
}

// ===== NUEVO BOTÓN CARRITO ESCRITORIO =====
function inicializarCarritoEscritorio() {
    const botonEscritorio = document.getElementById('carrito-escritorio');
    
    if (botonEscritorio) {
        console.log('🖥️ Inicializando nuevo botón carrito escritorio...');
        
        // Remover event listeners existentes
        const nuevoBoton = botonEscritorio.cloneNode(true);
        botonEscritorio.parentNode.replaceChild(nuevoBoton, botonEscritorio);
        
        // Agregar nuevo event listener
        nuevoBoton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Nuevo botón desktop clickeado');
            abrirCarrito();
        });
        
        // Aplicar estilos forzados para visibilidad
        aplicarEstilosCarritoEscritorio(nuevoBoton);
        
        console.log('✅ Nuevo botón carrito escritorio configurado');
        return nuevoBoton;
    } else {
        console.error('❌ No se encontró el nuevo botón carrito escritorio');
        return null;
    }
}

function aplicarEstilosCarritoEscritorio(boton) {
    if (!boton) return;
    
    // Estilos base
    boton.style.display = 'flex';
    boton.style.visibility = 'visible';
    boton.style.opacity = '1';
    boton.style.position = 'fixed';
    boton.style.top = '20px';
    boton.style.right = '20px';
    boton.style.zIndex = '1001';
    boton.style.pointerEvents = 'all';
    
    // Ocultar en móviles
    if (window.innerWidth <= 1023) {
        boton.style.display = 'none';
        boton.style.visibility = 'hidden';
        boton.style.opacity = '0';
        boton.style.pointerEvents = 'none';
    }
    
    // Forzar colores para modo oscuro
    const esModoOscuro = document.documentElement.classList.contains('dark');
    if (esModoOscuro) {
        boton.style.color = 'white';
        boton.style.background = 'linear-gradient(135deg, #ff6b35, #e64a19)';
        
        // Aplicar a elementos hijos
        const texto = boton.querySelector('.carrito-texto');
        const contador = boton.querySelector('.carrito-contador');
        
        if (texto) {
            texto.style.color = 'white';
        }
        if (contador) {
            contador.style.color = 'white';
            contador.style.background = '#2ec4b6';
        }
    }
}

function configurarCarritos() {
    console.log('🔧 Configurando todos los carritos...');
    
    // Configurar el nuevo botón de escritorio
    const botonEscritorio = inicializarCarritoEscritorio();
    
    // Aplicar estilos iniciales
    if (botonEscritorio) {
        aplicarEstilosCarritoEscritorio(botonEscritorio);
    }
    
    // Ocultar completamente el botón viejo
    const botonViejo = document.getElementById('ver-carrito-desktop');
    if (botonViejo) {
        botonViejo.style.display = 'none';
        botonViejo.style.visibility = 'hidden';
        botonViejo.style.opacity = '0';
        botonViejo.style.pointerEvents = 'none';
    }
    
    // Configurar responsive
    window.addEventListener('resize', function() {
        const botonActual = document.getElementById('carrito-escritorio');
        if (botonActual) {
            aplicarEstilosCarritoEscritorio(botonActual);
        }
    });
}

// Sistema de Navegación
function showCategory(categoria, elemento = null) {
    const contenedor = document.getElementById('products-container');
    const tituloPagina = document.getElementById('page-title');
    
    if (!contenedor || !tituloPagina) return;
    
    // Actualizar menú activo
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    
    if (elemento) {
        elemento.classList.add('active');
    } else {
        // Si no hay elemento, buscar el botón correspondiente
        const botonCategoria = document.querySelector(`[onclick*="${categoria}"]`);
        if (botonCategoria) {
            botonCategoria.classList.add('active');
        }
    }
    
    contenedor.innerHTML = '';
    
    // Aplicar clase vertical para contacto y sobre
    if (categoria === 'contacto' || categoria === 'sobre') {
        contenedor.classList.add('vertical');
    } else {
        contenedor.classList.remove('vertical');
    }
    
    if (categoria === 'inicio') {
        mostrarVistaInicio(contenedor);
        tituloPagina.textContent = 'Bienvenido a EL PORTON';
    } else if (products[categoria]) {
        tituloPagina.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
        if (categoria === 'contacto' || categoria === 'sobre') {
            mostrarInformacion(contenedor, products[categoria]);
        } else {
            mostrarProductos(contenedor, products[categoria]);
        }
    }
    
    // Cerrar sidebar en móviles
    if (window.innerWidth <= 1023) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
}

function mostrarVistaInicio(contenedor) {
    contenedor.innerHTML = `
        <div class="welcome">
            <h2>Bienvenido a Refresquería EL PORTON</h2>
            <p>Somos una refresquería familiar. Explora nuestras categorías desde la barra lateral y agrega tus productos favoritos al carrito.</p>
            <p>Puedes ver nuestras promociones y novedades aquí.</p>
        </div>
    `;
}

function mostrarProductos(contenedor, productos) {
    if (productos.length === 0) {
        contenedor.innerHTML = '<div class="empty-state">No hay productos disponibles en esta categoría.</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'products-grid';
    
    productos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'product-card';
        
        let imgHTML = "";
        if (producto.img) {
            imgHTML = `
                <div class="product-image">
                    <img src="${producto.img}" alt="${producto.name}" loading="lazy">
                </div>
            `;
        }
        
        tarjeta.innerHTML = `
            ${imgHTML}
            <div class="product-info">
                <h3 class="product-name">${producto.name}</h3>
                <div class="product-price">${producto.price}</div>
            </div>
        `;
        
        // Solo agregar botón si el producto tiene precio
        if (producto.price) {
            const boton = document.createElement('button');
            boton.className = 'add-to-cart-btn';
            boton.textContent = 'Agregar al Carrito';
            boton.type = 'button';
            boton.addEventListener('click', () => agregarAlCarrito(producto));
            tarjeta.querySelector('.product-info').appendChild(boton);
        }
        
        grid.appendChild(tarjeta);
    });
    
    contenedor.appendChild(grid);
}

function mostrarInformacion(contenedor, informacion) {
    const lista = document.createElement('div');
    lista.className = 'info-list';
    
    informacion.forEach(item => {
        const elemento = document.createElement('div');
        elemento.className = 'info-item';
        elemento.innerHTML = `
            <div class="info-content">
                <p>${item.name}</p>
            </div>
        `;
        lista.appendChild(elemento);
    });
    
    contenedor.appendChild(lista);
}

// Sistema de Modal de Pedido
function mostrarModalPedido() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío');
        return;
    }
    
    // Resetear formulario
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-correo').value = '';
    document.getElementById('error-nombre').textContent = '';
    document.getElementById('error-correo').textContent = '';
    
    // Mostrar modal
    document.getElementById('modal-datos').classList.add('active');
    
    // Enfocar primer campo
    setTimeout(() => {
        document.getElementById('input-nombre').focus();
    }, 300);
}

function cerrarModalPedido() {
    document.getElementById('modal-datos').classList.remove('active');
}

function procesarPedido(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('input-nombre').value.trim();
    const correo = document.getElementById('input-correo').value.trim();
    let valido = true;
    
    // Resetear errores
    document.getElementById('error-nombre').textContent = '';
    document.getElementById('error-correo').textContent = '';
    
    // Validar nombre
    if (!nombre) {
        document.getElementById('error-nombre').textContent = 'El nombre es obligatorio';
        valido = false;
    } else if (nombre.length < 2) {
        document.getElementById('error-nombre').textContent = 'El nombre debe tener al menos 2 caracteres';
        valido = false;
    }
    
    // Validar correo
    if (!correo) {
        document.getElementById('error-correo').textContent = 'El correo electrónico es obligatorio';
        valido = false;
    } else if (!/^\S+@\S+\.\S+$/.test(correo)) {
        document.getElementById('error-correo').textContent = 'Ingresa un correo electrónico válido';
        valido = false;
    }
    
    if (!valido) return;
    
    // Calcular total
    const total = carrito.reduce((sum, item) => {
        const precio = parseFloat(item.price.replace('$', '')) || 0;
        return sum + (precio * item.cantidad);
    }, 0);
    
    // Preparar datos para Firebase
    const datosPedido = {
        nombre: nombre,
        correo: correo,
        productos: carrito.map(item => ({
            nombre: item.name,
            cantidad: item.cantidad,
            precio: item.price
        })),
        total: total.toFixed(2),
        fecha: firebase.firestore.FieldValue.serverTimestamp(),
        estado: 'pendiente'
    };
    
    // Mostrar loading
    const btnConfirmar = document.getElementById('guardar-datos');
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.textContent = 'Procesando...';
    btnConfirmar.disabled = true;
    
    // Guardar en Firebase
    db.collection("pedidos").add(datosPedido)
        .then(() => {
            mostrarNotificacion('¡Pedido realizado con éxito! Te contactaremos pronto.');
            carrito = [];
            guardarCarrito();
            actualizarPanelCarrito();
            cerrarModalPedido();
            document.getElementById('form-datos').reset();
        })
        .catch(error => {
            console.error("Error guardando pedido:", error);
            mostrarNotificacion('Error al procesar el pedido. Intenta nuevamente.', 'error');
        })
        .finally(() => {
            btnConfirmar.textContent = textoOriginal;
            btnConfirmar.disabled = false;
        });
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notificacion.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

// Sistema de Tema
function inicializarTema() {
    const inputMobile = document.getElementById('theme-toggle-mobile');
    const inputDesktop = document.getElementById('theme-toggle-desktop');
    const labelMobile = document.getElementById('theme-label-mobile');
    const labelDesktop = document.getElementById('theme-label-desktop');
    const root = document.documentElement;
    
    if(!inputMobile || !inputDesktop || !labelMobile || !labelDesktop) {
        console.log('No se encontraron elementos del tema');
        return;
    }
    
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    function setLabels(theme) {
        const textoMobile = theme === 'dark' ? 'Oscuro' : 'Claro';
        const textoDesktop = theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro';
        if (labelMobile) labelMobile.textContent = textoMobile;
        if (labelDesktop) labelDesktop.textContent = textoDesktop;
    }

    const applyTheme = (theme) => {
        console.log('Aplicando tema:', theme);
        root.classList.remove('dark','light');
        
        if (theme === 'dark') {
            root.classList.add('dark');
            if (inputMobile) inputMobile.checked = true;
            if (inputDesktop) inputDesktop.checked = true;
            
            // Aplicar estilos para modo oscuro al botón de carrito
            setTimeout(() => {
                const botonCarrito = document.getElementById('carrito-escritorio');
                if (botonCarrito) {
                    botonCarrito.style.color = 'white';
                    botonCarrito.style.background = 'linear-gradient(135deg, #ff6b35, #e64a19)';
                    
                    const texto = botonCarrito.querySelector('.carrito-texto');
                    const contador = botonCarrito.querySelector('.carrito-contador');
                    
                    if (texto) texto.style.color = 'white';
                    if (contador) {
                        contador.style.color = 'white';
                        contador.style.background = '#2ec4b6';
                    }
                }
            }, 100);
            
        } else {
            root.classList.add('light');
            if (inputMobile) inputMobile.checked = false;
            if (inputDesktop) inputDesktop.checked = false;
            
            // Aplicar estilos para modo claro al botón de carrito
            setTimeout(() => {
                const botonCarrito = document.getElementById('carrito-escritorio');
                if (botonCarrito) {
                    botonCarrito.style.color = 'white';
                    botonCarrito.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
                    
                    const texto = botonCarrito.querySelector('.carrito-texto');
                    const contador = botonCarrito.querySelector('.carrito-contador');
                    
                    if (texto) texto.style.color = 'white';
                    if (contador) {
                        contador.style.color = 'var(--dark)';
                        contador.style.background = 'var(--secondary)';
                    }
                }
            }, 100);
        }
        
        setLabels(theme);
    };

    // Aplicar tema guardado o detectado
    if(stored === 'dark' || stored === 'light') {
        applyTheme(stored);
    } else {
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    // Event listeners para ambos toggles
    if (inputMobile) {
        inputMobile.addEventListener('change', () => {
            const newTheme = inputMobile.checked ? 'dark' : 'light';
            console.log('Toggle móvil cambiado a:', newTheme);
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            // Sincronizar el otro toggle
            if (inputDesktop) inputDesktop.checked = inputMobile.checked;
        });
    }

    if (inputDesktop) {
        inputDesktop.addEventListener('change', () => {
            const newTheme = inputDesktop.checked ? 'dark' : 'light';
            console.log('Toggle desktop cambiado a:', newTheme);
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            // Sincronizar el otro toggle
            if (inputMobile) inputMobile.checked = inputDesktop.checked;
        });
    }
}

// Funciones para la página de pedidos
let todosLosPedidos = [];
let filtroActual = 'todos';

function formatFecha(valor) {
    if(!valor) return '';
    if(valor.toDate && typeof valor.toDate === 'function') {
        return valor.toDate().toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    try {
        const d = new Date(valor);
        if(!isNaN(d)) return d.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch(e){}
    return String(valor);
}

function actualizarEstadisticas() {
    const total = todosLosPedidos.length;
    const pendientes = todosLosPedidos.filter(p => p.estado === 'pendiente').length;
    const proceso = todosLosPedidos.filter(p => p.estado === 'proceso').length;
    const entregados = todosLosPedidos.filter(p => p.estado === 'entregado').length;

    document.getElementById('total-pedidos').textContent = total;
    document.getElementById('pedidos-pendientes').textContent = pendientes;
    document.getElementById('pedidos-proceso').textContent = proceso;
    document.getElementById('pedidos-entregados').textContent = entregados;
}

function aplicarFiltro() {
    const pedidosFiltrados = filtroActual === 'todos' 
        ? todosLosPedidos 
        : todosLosPedidos.filter(pedido => pedido.estado === filtroActual);
    
    renderPedidos(pedidosFiltrados);
    actualizarEstadisticas();
}

function getEstadoClass(estado) {
    const estados = {
        'pendiente': 'pendiente',
        'proceso': 'proceso', 
        'entregado': 'entregado',
        'cancelado': 'cancelado'
    };
    return estados[estado] || 'pendiente';
}

function getEstadoText(estado) {
    const textos = {
        'pendiente': 'Pendiente',
        'proceso': 'En Proceso',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    };
    return textos[estado] || 'Pendiente';
}

function renderPedidos(pedidos) {
    const cont = document.getElementById('pedidos-container');
    
    if (pedidos.length === 0) {
        cont.innerHTML = `
            <div class="empty-state">
                <div class="icon">📦</div>
                <h3>No hay pedidos ${filtroActual !== 'todos' ? getEstadoText(filtroActual) : ''}</h3>
                <p>${filtroActual === 'todos' ? 'Cuando los clientes realicen pedidos, aparecerán aquí.' : 
                    `No hay pedidos en estado "${getEstadoText(filtroActual)}" en este momento.`}</p>
            </div>
        `;
        return;
    }

    cont.innerHTML = '<div class="pedidos-grid"></div>';
    const grid = cont.querySelector('.pedidos-grid');

    pedidos.forEach(pedido => {
        const estadoClass = getEstadoClass(pedido.estado);
        const estadoText = getEstadoText(pedido.estado);
        
        const div = document.createElement('div');
        div.className = `pedido-card ${estadoClass}`;

        const fechaTexto = formatFecha(pedido.fecha);

        div.innerHTML = `
            <div class="pedido-header">
                <div class="pedido-cliente">
                    <div class="pedido-nombre">👤 ${pedido.nombre || 'Cliente'}</div>
                    <div class="pedido-correo">
                        📧 <a href="mailto:${pedido.correo}">${pedido.correo}</a>
                    </div>
                </div>
                <div class="pedido-info">
                    <div class="pedido-fecha">📅 ${fechaTexto}</div>
                    <div class="pedido-estado estado-${estadoClass}">${estadoText}</div>
                </div>
            </div>
            
            <ul class="pedido-productos">
                ${(pedido.productos || []).map(prod => `
                    <li class="producto-item">
                        <div class="producto-info">
                            <span class="producto-cantidad">${prod.cantidad || prod.qty || 1}</span>
                            <span class="producto-nombre">${prod.name}</span>
                        </div>
                        <span class="producto-precio">${prod.price}</span>
                    </li>
                `).join('')}
            </ul>
            
            <div class="pedido-footer">
                <div class="pedido-total">💰 Total: $${pedido.total}</div>
                <div class="pedido-acciones">
                    ${pedido.estado === 'pendiente' ? `
                        <button type="button" class="btn btn-proceso" data-id="${pedido.id}">
                            ⚡ En Proceso
                        </button>
                    ` : ''}
                    ${pedido.estado === 'proceso' ? `
                        <button type="button" class="btn btn-entregado" data-id="${pedido.id}">
                            ✅ Entregado
                        </button>
                    ` : ''}
                    ${pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' ? `
                        <button type="button" class="btn btn-cancelar" data-id="${pedido.id}">
                            ❌ Cancelar
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-eliminar" data-id="${pedido.id}">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;

        // Botones de acción
        const setupBoton = (selector, nuevoEstado, confirmMsg) => {
            const boton = div.querySelector(selector);
            if (boton) {
                boton.addEventListener('click', () => {
                    if(confirm(confirmMsg)) {
                        db.collection('pedidos').doc(pedido.id).update({
                            estado: nuevoEstado,
                            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
                        })
                        .then(() => {
                            mostrarNotificacion(`Pedido ${nuevoEstado} correctamente`);
                        })
                        .catch(err => {
                            console.error('Error actualizando pedido:', err);
                            mostrarNotificacion('Error al actualizar el pedido', 'error');
                        });
                    }
                });
            }
        };

        setupBoton('.btn-proceso', 'proceso', `¿Poner el pedido de ${pedido.nombre} en proceso?`);
        setupBoton('.btn-entregado', 'entregado', `¿Marcar el pedido de ${pedido.nombre} como entregado?`);
        setupBoton('.btn-cancelar', 'cancelado', `¿Cancelar el pedido de ${pedido.nombre}?`);

        // Eliminar pedido
        const btnEliminar = div.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', () => {
            if(confirm(`¿Eliminar permanentemente el pedido de ${pedido.nombre}?`)) {
                db.collection('pedidos').doc(pedido.id).delete()
                    .then(() => {
                        mostrarNotificacion('Pedido eliminado correctamente');
                    })
                    .catch(err => {
                        console.error('Error eliminando pedido:', err);
                        mostrarNotificacion('No se pudo eliminar el pedido.', 'error');
                    });
            }
        });

        grid.appendChild(div);
    });
}

function cargarPedidos() {
    const cont = document.getElementById('pedidos-container');
    if (!cont) return;
    
    cont.innerHTML = '<div class="loading">Cargando pedidos</div>';

    db.collection("pedidos")
        .orderBy("fecha", "desc")
        .onSnapshot(snapshot => {
            todosLosPedidos = [];
            
            if (snapshot.empty) {
                cont.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">📦</div>
                        <h3>No hay pedidos guardados</h3>
                        <p>Cuando los clientes realicen pedidos desde la tienda, aparecerán aquí.</p>
                    </div>
                `;
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                todosLosPedidos.push({
                    id: doc.id,
                    ...data,
                    estado: data.estado || 'pendiente'
                });
            });

            aplicarFiltro();
        }, err => {
            console.error('Error leyendo pedidos:', err);
            cont.innerHTML = `
                <div class="empty-state">
                    <div class="icon">⚠️</div>
                    <h3>Error cargando pedidos</h3>
                    <p>No se pudieron cargar los pedidos. Verifica tu conexión e intenta nuevamente.</p>
                </div>
            `;
        });
}

// Inicialización de la página de pedidos
function inicializarPedidos() {
    cargarPedidos();
    
    // Configurar filtros
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroActual = btn.dataset.filtro;
            aplicarFiltro();
        });
    });
}

// Inicialización general
function inicializarApp() {
    console.log('🚀 Inicializando aplicación...');
    
    // Inicializar tema
    inicializarTema();
    
    // Inicializar carrito
    actualizarContadorCarrito();
    actualizarContadorEscritorio();
    
    // CONFIGURAR TODOS LOS CARRITOS
    configurarCarritos();
    
    // Verificar si estamos en la página principal
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        console.log('🏠 Inicializando página principal...');
        
        // Inicializar vista de inicio
        showCategory('inicio');
        
        // CONFIGURACIÓN DEL CARRITO MÓVIL
        const verCarrito = document.getElementById('ver-carrito');
        const closeCart = document.getElementById('close-cart');
        const cartBackdrop = document.getElementById('cart-backdrop');
        const pagarCarrito = document.getElementById('pagar-carrito');
        const vaciarCarrito = document.getElementById('vaciar-carrito');
        
        // Botón carrito móvil
        if (verCarrito) {
            verCarrito.addEventListener('click', abrirCarrito);
            console.log('📱 Botón carrito móvil configurado');
        }
        
        // Cerrar carrito
        if (closeCart) {
            closeCart.addEventListener('click', cerrarCarrito);
        }
        
        if (cartBackdrop) {
            cartBackdrop.addEventListener('click', cerrarCarrito);
        }
        
        // Vaciar carrito
        if (vaciarCarrito) {
            vaciarCarrito.addEventListener('click', function() {
                if (carrito.length > 0) {
                    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                        carrito = [];
                        guardarCarrito();
                        actualizarPanelCarrito();
                        mostrarNotificacion('Carrito vaciado');
                    }
                }
            });
        }
        
        // Procesar pago
        if (pagarCarrito) {
            pagarCarrito.addEventListener('click', mostrarModalPedido);
        }
        
        // Menu toggle para móviles
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                document.getElementById('sidebar').classList.toggle('active');
            });
        }
        
        // Modal de datos
        const cancelarDatos = document.getElementById('cancelar-datos');
        const cancelarPedido = document.getElementById('cancelar-pedido');
        const modalDatos = document.getElementById('modal-datos');
        const formDatos = document.getElementById('form-datos');
        
        if (cancelarDatos) {
            cancelarDatos.addEventListener('click', cerrarModalPedido);
        }
        
        if (cancelarPedido) {
            cancelarPedido.addEventListener('click', cerrarModalPedido);
        }
        
        if (modalDatos) {
            modalDatos.addEventListener('click', function(e) {
                if (e.target === this) {
                    cerrarModalPedido();
                }
            });
        }
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('modal-datos').classList.contains('active')) {
                cerrarModalPedido();
            }
        });
        
        // Enviar formulario
        if (formDatos) {
            formDatos.addEventListener('submit', procesarPedido);
        }
        
        // Cerrar menú al hacer clic fuera en móviles
        document.addEventListener('click', function(e) {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (window.innerWidth <= 1023 && 
                sidebar && sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) && 
                e.target !== menuToggle &&
                !e.target.closest('.menu-toggle')) {
                sidebar.classList.remove('active');
            }
        });
        
        console.log('✅ Página principal inicializada correctamente');
    }
    
    // Verificar si estamos en la página de pedidos
    const pedidosContainer = document.getElementById('pedidos-container');
    if (pedidosContainer) {
        console.log('📦 Inicializando página de pedidos...');
        inicializarPedidos();
    }
    
    console.log('🎉 Aplicación inicializada correctamente');
}

// Agregar animación CSS para el contador
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% {
            transform: scale(1);
        }
        40% {
            transform: scale(1.2);
        }
        80% {
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);

// Ejecutar después de que cargue la página
window.addEventListener('load', function() {
    console.log('📄 Página completamente cargada');
    actualizarContadorCarrito();
    actualizarContadorEscritorio();
    
    // Reforzar configuración del carrito escritorio
    setTimeout(configurarCarritos, 100);
    
    // Verificar modo oscuro y aplicar estilos
    setTimeout(() => {
        const esModoOscuro = document.documentElement.classList.contains('dark');
        const botonCarrito = document.getElementById('carrito-escritorio');
        
        if (botonCarrito && esModoOscuro) {
            botonCarrito.style.color = 'white';
            const texto = botonCarrito.querySelector('.carrito-texto');
            const contador = botonCarrito.querySelector('.carrito-contador');
            
            if (texto) texto.style.color = 'white';
            if (contador) {
                contador.style.color = 'white';
                contador.style.background = '#2ec4b6';
            }
        }
    }, 200);
});

// Manejar cambios de tamaño de ventana
window.addEventListener('resize', function() {
    const botonEscritorio = document.getElementById('carrito-escritorio');
    if (botonEscritorio) {
        aplicarEstilosCarritoEscritorio(botonEscritorio);
    }
});

// Ejecutar una vez más después de un tiempo
setTimeout(configurarCarritos, 1000);