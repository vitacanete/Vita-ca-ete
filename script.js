
// ============================================
// VITA CAÑETE - SISTEMA DE INVENTARIO
// ============================================

// Categorías del bowl
const CATEGORIAS = [
    "Carnes",
    "Vegetales",
    "Carbohidratos",
    "Otros",
    "Aderezos"
];

// Nombre utilizado para guardar los datos
const CLAVE_STORAGE = "vitaCaneteInventario";

// ============================================
// INVENTARIO INICIAL
// ============================================

const inventarioInicial = [
    {
        id: 1,
        nombre: "Pollo",
        categoria: "Carnes",
        stock: 20
    },
    {
        id: 2,
        nombre: "Atún",
        categoria: "Carnes",
        stock: 15
    },
    {
        id: 3,
        nombre: "Huevo",
        categoria: "Carnes",
        stock: 30
    },

    {
        id: 4,
        nombre: "Lechuga",
        categoria: "Vegetales",
        stock: 30
    },
    {
        id: 5,
        nombre: "Tomate",
        categoria: "Vegetales",
        stock: 25
    },
    {
        id: 6,
        nombre: "Zanahoria",
        categoria: "Vegetales",
        stock: 20
    },
    {
        id: 7,
        nombre: "Choclo",
        categoria: "Vegetales",
        stock: 20
    },

    {
        id: 8,
        nombre: "Arroz",
        categoria: "Carbohidratos",
        stock: 40
    },
    {
        id: 9,
        nombre: "Quinoa",
        categoria: "Carbohidratos",
        stock: 20
    },

    {
        id: 10,
        nombre: "Palta",
        categoria: "Otros",
        stock: 18
    },
    {
        id: 11,
        nombre: "Aceitunas",
        categoria: "Otros",
        stock: 25
    },

    {
        id: 12,
        nombre: "Salsa César",
        categoria: "Aderezos",
        stock: 20
    }
];


// ============================================
// VARIABLES
// ============================================

let inventario = [];

let bowl = [];

let pasoActual = 0;

let movimientosStock = [];

let timeoutNotificacion;


// ============================================
// INICIO DEL SISTEMA
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    cargarInventario();

    renderizarTodo();

    mostrarSeccion("crear-bowl");

    registrarServiceWorker();

});


// ============================================
// CARGAR INVENTARIO
// ============================================

function cargarInventario() {

    const datos = localStorage.getItem(CLAVE_STORAGE);

    if (datos) {

        try {

            inventario = JSON.parse(datos).map(function (ingrediente) {

                return {
                    ...ingrediente,
                    stock: Number(ingrediente.stock) || 0
                };

            });

        } catch (error) {

            inventario = inventarioInicial.map(function (ingrediente) {
                return { ...ingrediente };
            });

            guardarInventario();
        }

    } else {

        inventario = inventarioInicial.map(function (ingrediente) {
            return { ...ingrediente };
        });

        guardarInventario();
    }
}


// ============================================
// GUARDAR INVENTARIO
// ============================================

function guardarInventario() {

    localStorage.setItem(
        CLAVE_STORAGE,
        JSON.stringify(inventario)
    );

}


// ============================================
// MOSTRAR SECCIÓN
// ============================================

function mostrarSeccion(nombre) {

    const secciones = document.querySelectorAll(".seccion");

    secciones.forEach(function (seccion) {

        seccion.classList.remove("activa");

    });


    const seccionSeleccionada = document.getElementById(nombre);

    if (seccionSeleccionada) {

        seccionSeleccionada.classList.add("activa");

    }


    if (nombre === "crear-bowl") {

        renderizarBowl();

    }


    if (nombre === "inventario") {

        renderizarInventario();

    }


    if (nombre === "agregar-stock") {

        renderizarSelectorStock();

    }

}


// ============================================
// RENDERIZAR TODO
// ============================================

function renderizarTodo() {

    renderizarProgreso();

    renderizarBowl();

    renderizarInventario();

    renderizarSelectorStock();

    renderizarMovimientosStock();

}


// ============================================
// MOSTRAR PROGRESO
// ============================================

function renderizarProgreso() {

    const contenedor = document.getElementById("progreso");

    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    CATEGORIAS.forEach(function (categoria, indice) {

        const elemento = document.createElement("div");

        elemento.className = "progreso-item";


        if (indice === pasoActual) {

            elemento.classList.add("activo");

        }


        if (indice < pasoActual) {

            elemento.classList.add("completado");

        }


        elemento.textContent =
            `${indice + 1}. ${categoria}`;


        contenedor.appendChild(elemento);

    });

}


// ============================================
// MOSTRAR CATEGORÍA ACTUAL
// ============================================

function renderizarBowl() {

    const contenedor =
        document.getElementById("categorias-bowl");


    if (!contenedor) {
        return;
    }


    const categoriaActual =
        CATEGORIAS[pasoActual];


    contenedor.innerHTML = "";


    const caja =
        document.createElement("div");

    caja.className =
        "categoria-contenedor";


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        `Selecciona ${categoriaActual}`;


    caja.appendChild(titulo);


    const grid =
        document.createElement("div");

    grid.className =
        "ingredientes-grid";


    const ingredientes =
        inventario.filter(function (ingrediente) {

            return ingrediente.categoria === categoriaActual;

        });


    if (ingredientes.length === 0) {

        grid.innerHTML =
            '<p class="vacio">No hay ingredientes en esta categoría.</p>';

    }


    ingredientes.forEach(function (ingrediente) {

        const card =
            document.createElement("div");


        card.className =
            "ingrediente-card";


        const seleccionado =
            bowl.some(function (item) {

                return item.id === ingrediente.id;

            });


        if (seleccionado) {

            card.classList.add("seleccionado");

        }


        if (ingrediente.stock <= 0) {

            card.classList.add("sin-stock");

        }


        card.innerHTML = `
            <div class="ingrediente-nombre">
                ${escapeHTML(ingrediente.nombre)}
            </div>

            <div class="ingrediente-stock">
                Stock disponible: ${ingrediente.stock}
            </div>
        `;


        if (ingrediente.stock > 0) {

            card.addEventListener(
                "click",
                function () {

                    seleccionarIngrediente(
                        ingrediente.id
                    );

                }
            );

        }


        grid.appendChild(card);

    });


    caja.appendChild(grid);

    contenedor.appendChild(caja);


    renderizarProgreso();

    actualizarBotones();

    renderizarResumen();

}


// ============================================
// SELECCIONAR INGREDIENTE
// ============================================

function seleccionarIngrediente(id) {

    const ingrediente =
        inventario.find(function (item) {

            return item.id === id;

        });


    if (!ingrediente) {
        return;
    }


    if (ingrediente.stock <= 0) {

        mostrarNotificacion(
            "Este ingrediente no tiene stock."
        );

        return;
    }


    const posicion =
        bowl.findIndex(function (item) {

            return item.id === id;

        });


    if (posicion !== -1) {

        bowl.splice(posicion, 1);


        mostrarNotificacion(
            `${ingrediente.nombre} eliminado del bowl.`
        );

    } else {

        bowl.push({

            id: ingrediente.id,

            nombre: ingrediente.nombre,

            categoria: ingrediente.categoria

        });


        mostrarNotificacion(
            `${ingrediente.nombre} agregado al bowl.`
        );

    }


    renderizarBowl();

}


// ============================================
// SIGUIENTE CATEGORÍA
// ============================================

function siguientePaso() {

    const categoria =
        CATEGORIAS[pasoActual];


    const seleccionados =
        bowl.filter(function (item) {

            return item.categoria === categoria;

        });


    if (seleccionados.length === 0) {

        mostrarNotificacion(
            `Debes seleccionar al menos un ingrediente de ${categoria}.`
        );

        return;
    }


    if (pasoActual < CATEGORIAS.length - 1) {

        pasoActual++;

        renderizarBowl();

    }

}


// ============================================
// CATEGORÍA ANTERIOR
// ============================================

function anteriorPaso() {

    if (pasoActual > 0) {

        pasoActual--;

        renderizarBowl();

    }

}


// ============================================
// ACTUALIZAR BOTONES
// ============================================

function actualizarBotones() {

    const anterior =
        document.getElementById("btn-anterior");


    const siguiente =
        document.getElementById("btn-siguiente");


    if (anterior) {

        anterior.style.display =
            pasoActual === 0
                ? "none"
                : "block";

    }


    if (siguiente) {

        siguiente.style.display =
            pasoActual === CATEGORIAS.length - 1
                ? "none"
                : "block";

    }

}


// ============================================
// RESUMEN DEL BOWL
// ============================================

function renderizarResumen() {

    const resumen =
        document.getElementById("resumen-bowl");


    const cantidad =
        document.getElementById("cantidad-seleccionados");


    if (!resumen) {
        return;
    }


    if (cantidad) {

        cantidad.textContent =
            bowl.length;

    }


    if (bowl.length === 0) {

        resumen.innerHTML =
            '<p class="vacio">Todavía no has seleccionado ingredientes.</p>';

        return;
    }


    resumen.innerHTML = "";


    CATEGORIAS.forEach(function (categoria) {

        const ingredientes =
            bowl.filter(function (item) {

                return item.categoria === categoria;

            });


        if (ingredientes.length === 0) {
            return;
        }


        const bloque =
            document.createElement("div");


        bloque.className =
            "resumen-categoria";


        const titulo =
            document.createElement("h4");


        titulo.textContent =
            categoria;


        bloque.appendChild(titulo);


        const lista =
            document.createElement("ul");


        ingredientes.forEach(function (ingrediente) {

            const li =
                document.createElement("li");


            li.textContent =
                ingrediente.nombre;


            lista.appendChild(li);

        });


        bloque.appendChild(lista);

        resumen.appendChild(bloque);

    });

}


// ============================================
// CONFIRMAR BOWL
// ============================================

function confirmarBowl() {

    if (bowl.length === 0) {

        mostrarNotificacion(
            "Debes seleccionar ingredientes antes de confirmar."
        );

        return;
    }


    const faltantes =
        CATEGORIAS.filter(function (categoria) {

            return !bowl.some(function (item) {

                return item.categoria === categoria;

            });

        });


    if (faltantes.length > 0) {

        mostrarNotificacion(
            "Faltan categorías: " +
            faltantes.join(", ")
        );

        return;
    }


    // Verificar stock antes de descontar

    for (const item of bowl) {

        const ingrediente =
            inventario.find(function (elemento) {

                return elemento.id === item.id;

            });


        if (!ingrediente || ingrediente.stock <= 0) {

            mostrarNotificacion(
                `No hay stock suficiente de ${item.nombre}.`
            );

            return;
        }

    }


    // Descontar una unidad de cada ingrediente

    bowl.forEach(function (item) {

        const ingrediente =
            inventario.find(function (elemento) {

                return elemento.id === item.id;

            });


        if (ingrediente) {

            ingrediente.stock--;

        }

    });


    guardarInventario();


    // Limpiar bowl

    bowl = [];

    pasoActual = 0;


    renderizarTodo();


    mostrarNotificacion(
        "✅ Bowl confirmado. Stock actualizado."
    );

}


// ============================================
// LIMPIAR BOWL
// ============================================

function limpiarBowl() {

    bowl = [];

    pasoActual = 0;


    renderizarBowl();


    mostrarNotificacion(
        "Bowl limpiado."
    );

}


// ============================================
// INVENTARIO
// ============================================

function renderizarInventario() {

    const tabla =
        document.getElementById("tabla-inventario");


    if (!tabla) {
        return;
    }


    tabla.innerHTML = "";


    let totalStock = 0;

    let stockBajo = 0;


    inventario.forEach(function (ingrediente) {

        const stock =
            Number(ingrediente.stock) || 0;


        totalStock += stock;


        if (stock <= 5) {

            stockBajo++;

        }


        let clase = "";

        let estado = "";


        if (stock === 0) {

            clase = "stock-agotado";

            estado = "Agotado";

        } else if (stock <= 5) {

            clase = "stock-bajo";

            estado = "Stock bajo";

        } else {

            clase = "stock-ok";

            estado = "Disponible";

        }


        const fila =
            document.createElement("tr");


        fila.innerHTML = `
            <td>${ingrediente.id}</td>

            <td>
                ${escapeHTML(ingrediente.nombre)}
            </td>

            <td>
                ${escapeHTML(ingrediente.categoria)}
            </td>

            <td>
                ${stock}
            </td>

            <td class="${clase}">
                ${estado}
            </td>
        `;


        tabla.appendChild(fila);

    });


    const totalIngredientes =
        document.getElementById(
            "total-ingredientes"
        );


    const totalStockElemento =
        document.getElementById(
            "total-stock"
        );


    const stockBajoElemento =
        document.getElementById(
            "stock-bajo"
        );


    if (totalIngredientes) {

        totalIngredientes.textContent =
            inventario.length;

    }


    if (totalStockElemento) {

        totalStockElemento.textContent =
            totalStock;

    }


    if (stockBajoElemento) {

        stockBajoElemento.textContent =
            stockBajo;

    }

}


// ============================================
// AGREGAR INGREDIENTE
// ============================================

function agregarIngrediente(evento) {

    if (evento) {

        evento.preventDefault();

    }


    const nombreInput =
        document.getElementById(
            "nombre-ingrediente"
        );


    const categoriaInput =
        document.getElementById(
            "categoria-ingrediente"
        );


    const stockInput =
        document.getElementById(
            "stock-inicial"
        );


    if (
        !nombreInput ||
        !categoriaInput ||
        !stockInput
    ) {

        return;

    }


    const nombre =
        nombreInput.value.trim();


    const categoria =
        categoriaInput.value;


    const stock =
        Number(stockInput.value);


    if (!nombre) {

        mostrarNotificacion(
            "Escribe el nombre del ingrediente."
        );

        return;
    }


    if (!categoria) {

        mostrarNotificacion(
            "Selecciona una categoría."
        );

        return;
    }


    if (isNaN(stock) || stock < 0) {

        mostrarNotificacion(
            "El stock no puede ser negativo."
        );

        return;
    }


    const existe =
        inventario.some(function (ingrediente) {

            return ingrediente.nombre.toLowerCase() ===
                nombre.toLowerCase();

        });


    if (existe) {

        mostrarNotificacion(
            "Ese ingrediente ya existe."
        );

        return;
    }


    const nuevoId =
        inventario.length > 0
            ? Math.max(
                ...inventario.map(function (item) {
                    return item.id;
                })
            ) + 1
            : 1;


    inventario.push({

        id: nuevoId,

        nombre: nombre,

        categoria: categoria,

        stock: stock

    });


    guardarInventario();


    nombreInput.value = "";

    categoriaInput.value = "";

    stockInput.value = "0";


    renderizarTodo();


    mostrarNotificacion(
        `✅ ${nombre} agregado correctamente.`
    );

}


// ============================================
// SELECTOR PARA AGREGAR STOCK
// ============================================

function renderizarSelectorStock() {

    const selector =
        document.getElementById(
            "stock-ingrediente"
        );


    if (!selector) {
        return;
    }


    selector.innerHTML =
        '<option value="">Seleccionar ingrediente</option>';


    inventario.forEach(function (ingrediente) {

        const option =
            document.createElement("option");


        option.value =
            ingrediente.id;


        option.textContent =
            `${ingrediente.nombre} — Stock actual: ${ingrediente.stock}`;


        selector.appendChild(option);

    });

}


// ============================================
// AGREGAR STOCK
// ============================================

function agregarStock() {

    const selector =
        document.getElementById(
            "stock-ingrediente"
        );


    const cantidadInput =
        document.getElementById(
            "cantidad-stock"
        );


    if (!selector || !cantidadInput) {

        return;

    }


    const id =
        Number(selector.value);


    const cantidad =
        Number(cantidadInput.value);


    if (!id) {

        mostrarNotificacion(
            "Selecciona un ingrediente."
        );

        return;
    }


    if (!cantidad || cantidad <= 0) {

        mostrarNotificacion(
            "La cantidad debe ser mayor a 0."
        );

        return;
    }


    const ingrediente =
        inventario.find(function (item) {

            return item.id === id;

        });


    if (!ingrediente) {

        mostrarNotificacion(
            "Ingrediente no encontrado."
        );

        return;
    }


    const stockAnterior =
        Number(ingrediente.stock) || 0;


    ingrediente.stock =
        stockAnterior + cantidad;


    guardarInventario();


    // Guardar movimiento

    movimientosStock.unshift({

        fecha:
            new Date().toLocaleString("es-CL"),

        ingrediente:
            ingrediente.nombre,

        cantidad:
            cantidad,

        anterior:
            stockAnterior,

        nuevo:
            ingrediente.stock

    });


    // Máximo 10 movimientos

    if (movimientosStock.length > 10) {

        movimientosStock =
            movimientosStock.slice(0, 10);

    }


    renderizarSelectorStock();

    renderizarInventario();

    renderizarBowl();

    renderizarMovimientosStock();


    cantidadInput.value = "1";

    selector.value = "";


    mostrarNotificacion(
        `✅ Se agregaron ${cantidad} unidades de ${ingrediente.nombre}. Stock actual: ${ingrediente.stock}`
    );

}


// ============================================
// MOSTRAR MOVIMIENTOS DE STOCK
// ============================================

function renderizarMovimientosStock() {

    const contenedor =
        document.getElementById(
            "lista-movimientos"
        );


    if (!contenedor) {
        return;
    }


    if (movimientosStock.length === 0) {

        contenedor.innerHTML =
            '<p class="vacio">No hay movimientos todavía.</p>';

        return;
    }


    contenedor.innerHTML = "";


    movimientosStock.forEach(function (movimiento) {

        const div =
            document.createElement("div");


        div.className =
            "movimiento";


        div.innerHTML = `
            <strong>
                ${escapeHTML(movimiento.ingrediente)}
            </strong>

            <br>

            Se agregaron
            <strong>
                ${movimiento.cantidad}
            </strong>
            unidades.

            <br>

            Stock:
            ${movimiento.anterior}
            →
            <strong>
                ${movimiento.nuevo}
            </strong>

            <br>

            <small>
                ${movimiento.fecha}
            </small>
        `;


        contenedor.appendChild(div);

    });

}


// ============================================
// NOTIFICACIONES
// ============================================

function mostrarNotificacion(mensaje) {

    const notificacion =
        document.getElementById(
            "notificacion"
        );


    if (!notificacion) {
        return;
    }


    clearTimeout(timeoutNotificacion);


    notificacion.textContent =
        mensaje;


    notificacion.classList.add(
        "mostrar"
    );


    timeoutNotificacion =
        setTimeout(function () {

            notificacion.classList.remove(
                "mostrar"
            );

        }, 3000);

}


// ============================================
// PROTEGER TEXTO HTML
// ============================================

function escapeHTML(texto) {

    return String(texto).replace(
        /[&<>"']/g,
        function (caracter) {

            return {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            }[caracter];

        }
    );

}


// ============================================
// SERVICE WORKER / PWA
// ============================================

function registrarServiceWorker() {

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("./sw.js")

            .then(function () {

                console.log(
                    "Service Worker registrado correctamente."
                );

            })

            .catch(function (error) {

                console.error(
                    "Error al registrar Service Worker:",
                    error
                );

            });

    }

}
