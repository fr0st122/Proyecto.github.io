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

// Configuración de productos ACTUALIZADA - CON NOMBRES CORRECTOS JPEG:
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
                        <button class="qty-btn" onclick="actualizarCantidad('${item.name}', -1)">−</button>
                        <span class="quantity">${item.cantidad}</span>
                        <button class="qty-btn" onclick="actualizarCantidad('${item.name}', 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="quitarDelCarrito('${item.name}')">
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
}

// Sistema de Navegación
function showCategory(categoria) {
    const contenedor = document.getElementById('products-container');
    const tituloPagina = document.getElementById('page-title');
    
    if (!contenedor || !tituloPagina) return;
    
    // Actualizar menú activo
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
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
    
    // Estilos para la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${tipo === 'error' ? '#dc3545' : 'var(--primary)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 5000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-weight: 500;
        max-width: 300px;
    `;
    
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

// Sistema de Tema CORREGIDO
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
        } else {
            root.classList.add('light');
            if (inputMobile) inputMobile.checked = false;
            if (inputDesktop) inputDesktop.checked = false;
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
                        <button class="btn btn-proceso" data-id="${pedido.id}">
                            ⚡ En Proceso
                        </button>
                    ` : ''}
                    ${pedido.estado === 'proceso' ? `
                        <button class="btn btn-entregado" data-id="${pedido.id}">
                            ✅ Entregado
                        </button>
                    ` : ''}
                    ${pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' ? `
                        <button class="btn btn-cancelar" data-id="${pedido.id}">
                            ❌ Cancelar
                        </button>
                    ` : ''}
                    <button class="btn btn-eliminar" data-id="${pedido.id}">
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
                            if (nuevoEstado === 'entregado') {
                                // Notificación por email
                                const cuerpo = encodeURIComponent(`Hola ${pedido.nombre},

Tu pedido ha sido marcado como ENTREGADO.

📦 Resumen del pedido:
${ (pedido.productos || []).map(prod => `• ${prod.cantidad || prod.qty || 1} x ${prod.name} (${prod.price})`).join('\n') }

💰 Total: $${pedido.total}

¡Gracias por confiar en Refresquería EL PORTON!

Atentamente,
El equipo de EL PORTON`);
                                window.open(`mailto:${pedido.correo}?subject=¡Tu pedido ha sido entregado!&body=${cuerpo}`);
                            }
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
                    estado: data.estado || 'pendiente' // Estado por defecto
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

// Función para ajustar el grid según el tamaño de pantalla
function ajustarGridResponsivo() {
    const ancho = window.innerWidth;
    const contenedor = document.getElementById('products-container');
    
    if (!contenedor) return;
    
    const grid = contenedor.querySelector('.products-grid');
    if (!grid) return;
    
    if (ancho >= 1200) {
        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else if (ancho >= 1024) {
        grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    } else if (ancho >= 768) {
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
        grid.style.gridTemplateColumns = '1fr';
    }
}

// Inicialización general
function inicializarApp() {
    // Inicializar tema
    inicializarTema();
    
    // Inicializar carrito
    actualizarContadorCarrito();
    
    // Inicializar grid responsivo
    ajustarGridResponsivo();
    window.addEventListener('resize', ajustarGridResponsivo);
    
    // Verificar si estamos en la página principal
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        // Inicializar vista de inicio
        showCategory('inicio');
        
        // Menu toggle para móviles
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                document.getElementById('sidebar').classList.toggle('active');
            });
        }
        
        // Carrito toggle mobile
        const verCarrito = document.getElementById('ver-carrito');
        if (verCarrito) {
            verCarrito.addEventListener('click', function() {
                document.getElementById('cart-panel').classList.add('active');
                document.getElementById('cart-backdrop').classList.add('active');
                actualizarPanelCarrito();
            });
        }
        
        // Carrito toggle desktop
        const verCarritoDesktop = document.getElementById('ver-carrito-desktop');
        if (verCarritoDesktop) {
            verCarritoDesktop.addEventListener('click', function() {
                document.getElementById('cart-panel').classList.add('active');
                document.getElementById('cart-backdrop').classList.add('active');
                actualizarPanelCarrito();
            });
        }
        
        // Cerrar carrito
        const closeCart = document.getElementById('close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', cerrarCarrito);
        }
        
        const cartBackdrop = document.getElementById('cart-backdrop');
        if (cartBackdrop) {
            cartBackdrop.addEventListener('click', cerrarCarrito);
        }
        
        function cerrarCarrito() {
            document.getElementById('cart-panel').classList.remove('active');
            document.getElementById('cart-backdrop').classList.remove('active');
        }
        
        // Vaciar carrito
        const vaciarCarrito = document.getElementById('vaciar-carrito');
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
        const pagarCarrito = document.getElementById('pagar-carrito');
        if (pagarCarrito) {
            pagarCarrito.addEventListener('click', mostrarModalPedido);
        }
        
        // Modal de datos
        const cancelarDatos = document.getElementById('cancelar-datos');
        if (cancelarDatos) {
            cancelarDatos.addEventListener('click', cerrarModalPedido);
        }
        
        const cancelarPedido = document.getElementById('cancelar-pedido');
        if (cancelarPedido) {
            cancelarPedido.addEventListener('click', cerrarModalPedido);
        }
        
        // Cerrar modal al hacer clic fuera
        const modalDatos = document.getElementById('modal-datos');
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
        const formDatos = document.getElementById('form-datos');
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
    }
    
    // Verificar si estamos en la página de pedidos
    const pedidosContainer = document.getElementById('pedidos-container');
    if (pedidosContainer) {
        inicializarPedidos();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);