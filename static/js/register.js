document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.innerHTML = '';  // limpia mensajes previos

    if (!nombre || !email || !password) {
        mensajeDiv.innerHTML = `<div class="alert alert-danger">Todos los campos son obligatorios.</div>`;
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            mensajeDiv.innerHTML = `<div class="alert alert-success">${data.mensaje}. Redirigiendo al login...</div>`;
            setTimeout(() => {
                window.location.href = 'login';  // redirige al login
            }, 2000);
        } else {
            mensajeDiv.innerHTML = `<div class="alert alert-danger">${data.mensaje}</div>`;
        }
    } catch (error) {
        mensajeDiv.innerHTML = `<div class="alert alert-danger">Error en la conexión con el servidor.</div>`;
        console.error('Error en fetch:', error);
    }
});
