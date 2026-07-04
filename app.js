document.addEventListener("DOMContentLoaded", () => {
    cargarReservaGuardada();
    inicializarMenuResponsivo();
});

function inicializarMenuResponsivo() {
    const btnHamburger = document.getElementById('btn-hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (btnHamburger && navMenu) {
        btnHamburger.addEventListener('click', () => {
            navMenu.classList.toggle('activo');
        });

        const enlaces = navMenu.querySelectorAll('a');
        enlaces.forEach(enlace => {
            enlace.addEventListener('click', () => {
                navMenu.classList.remove('activo');
            });
        });
    }
}

function seleccionarCuarto(nombreHabitacion, precio) {
    const inputHabitacion = document.getElementById('habitacion_seleccionada');
    if (inputHabitacion) {
        inputHabitacion.value = nombreHabitacion;
    }
    
    alert("Has seleccionado: " + nombreHabitacion + " (S/ " + precio + ".00 / noche).\nPor favor, completa tus fechas para procesar la reserva.");

    const seccionFormulario = document.getElementById('inicio'); // Te mueve directo arriba al motor de reservas
    if (seccionFormulario) {
        seccionFormulario.scrollIntoView({ behavior: 'smooth' });
    }
}

function cerrarModal() {
    const modal = document.getElementById("modal-reserva");
    if (modal) {
        modal.classList.remove("mostrar"); 
    }
}

function iniciarReserva() {
    // CORREGIDO: Capturamos los elementos usando los nuevos IDs unificados
    const elLlegada = document.getElementById('fecha-llegada');
    const elSalida = document.getElementById('fecha-salida');
    const elHuespedes = document.getElementById('cant_huespedes');
    const elHabitacion = document.getElementById('habitacion_seleccionada');

    if (!elLlegada || !elSalida || !elHuespedes) {
        console.error("No se encontraron los inputs en el HTML.");
        return;
    }

    const llegadaInput = elLlegada.value;
    const salidaInput = elSalida.value;
    const huespedesInput = elHuespedes.value;
    const habitacionInput = elHabitacion ? elHabitacion.value : 'General / No especificada';

    if (!llegadaInput || !salidaInput || !huespedesInput) {
        alert("Por favor, selecciona las fechas y la cantidad de huéspedes.");
        return;
    }

    // Guardamos en la memoria local del navegador
    const datosReserva = {
        fechallegada: llegadaInput,
        fechasalida: salidaInput,
        cantidadhuespedes: huespedesInput
    };
    localStorage.setItem("miReservaHospedaje", JSON.stringify(datosReserva));

    // CORREGIDO: Empaquetamos los datos con los names exactos que lee tu archivo PHP
    const datosFormulario = new FormData();
    datosFormulario.append('fecha-llegada', llegadaInput);
    datosFormulario.append('fecha-salida', salidaInput);
    datosFormulario.append('cant_huespedes', huespedesInput);
    datosFormulario.append('habitacion', habitacionInput);

    fetch('procesar_reserva.php', {
        method: 'POST',
        body: datosFormulario
    })
    .then(respuesta => {
        if (!respuesta.ok) {
            throw new Error("Respuesta de red no válida.");
        }
        return respuesta.json();
    })
    .then(data => {
        if (data.status === 'success') {
            alert("✨ " + data.message);
            document.getElementById('reserva-form').reset();
            if (elHabitacion) elHabitacion.value = "General / No especificada"; // Reseteamos habitación
        } else {
            alert("⚠️ " + data.message);
        }
    })
    .catch(error => {
        console.error('Error crítico en la comunicación:', error);
        alert('Hubo un problema al procesar la comunicación con el servidor de base de datos.');
    });
}

function cargarReservaGuardada() {
    const reservaGuardada = localStorage.getItem("miReservaHospedaje");

    if (reservaGuardada) {
        const datos = JSON.parse(reservaGuardada);

        if (document.getElementById('fecha-llegada')) {
            document.getElementById('fecha-llegada').value = datos.fechallegada;
        }
        if (document.getElementById('fecha-salida')) {
            document.getElementById('fecha-salida').value = datos.fechasalida;
        }
        // CORREGIDO: Carga usando el nuevo ID unificado
        if (document.getElementById('cant_huespedes')) {
            document.getElementById('cant_huespedes').value = datos.cantidadhuespedes;
        }

        console.log("Memoria activa: Se recuperaron las fechas anteriores.");
    }
}

const galeriaFotos = {
    'img-simple': ['img/hab-simple.jpg', 'img/bano-simple.jpg'],
    'img-doble': ['img/hab-doble.jpg', 'img/bano-doble.jpg'],
    'img-familiar': ['img/hab-familiar.jpg', 'img/bano-familiar.jpg']
};

const indicesCarrusel = {
    'img-simple': 0,
    'img-doble': 0,
    'img-familiar': 0
};

function cambiarFoto(idElemento, direccion) {
    const listaFotos = galeriaFotos[idElemento];
    const elementoImg = document.getElementById(idElemento);

    if (listaFotos && elementoImg) {
        elementoImg.style.opacity = '0.3';

        setTimeout(() => {
            let nuevoIndice = indicesCarrusel[idElemento] + direccion;

            if (nuevoIndice >= listaFotos.length) {
                nuevoIndice = 0;
            } else if (nuevoIndice < 0) {
                nuevoIndice = listaFotos.length - 1;
            }

            indicesCarrusel[idElemento] = nuevoIndice;
            elementoImg.src = listaFotos[nuevoIndice];
            elementoImg.style.opacity = '1';
        }, 150);
    }
}