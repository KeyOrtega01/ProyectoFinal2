document.addEventListener('DOMContentLoaded', () => {
    cargarLibros();
    configurarEventos();
});

async function cargarLibros() {
    try {
        const response = await fetch('/libros');
        if (!response.ok) throw new Error('Error al cargar libros');

        const libros = await response.json();
        renderizarLibros(libros);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

function renderizarLibros(libros) {
    const tabla = document.getElementById('tablaLibros');
    tabla.innerHTML = libros.map(libro => `
        <tr>
            <td>${libro.titulo}</td>
            <td>${libro.autor}</td>
            <td>${libro.activo ? "Disponible" : "Desactivado"}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" 
                    onclick="prepararEdicion(${libro.id}, '${libro.titulo}', '${libro.autor}')">
                    Editar
                </button>
                <button class="btn btn-sm btn-danger ${libro.activo ? '' : 'disabled'}" 
                    onclick="confirmarDesactivar(${libro.id})">
                    Desactivar
                </button>
                <button class="btn btn-sm btn-success ${libro.activo ? 'disabled' : ''}" 
                    onclick="confirmarActivar(${libro.id})">
                    Activar
                </button>
            </td>
        </tr>
    `).join('');
}

function configurarEventos() {
    document.getElementById('formAgregarLibro').addEventListener('submit', async (e) => {
        e.preventDefault();
        await agregarLibro();
    });

    document.getElementById('formEditarLibro').addEventListener('submit', async (e) => {
        e.preventDefault();
        await editarLibro();
    });
}

async function agregarLibro() {
    const titulo = document.getElementById('titulo').value.trim();
    const autor = document.getElementById('autor').value.trim();

    if (!titulo || !autor) {
        alert('Título y autor son obligatorios');
        return;
    }

    try {
        const response = await fetch('/libros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, autor })
        });

        if (!response.ok) throw new Error('Error al agregar libro');

        const nuevoLibro = await response.json();
        
        alert('Libro agregado exitosamente');
        document.getElementById('formAgregarLibro').reset();
        bootstrap.Modal.getInstance(document.getElementById('modalAgregarLibro')).hide();
        
        actualizarTablaConLibro(nuevoLibro);
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

function actualizarTablaConLibro(libro) {
    const tabla = document.getElementById('tablaLibros');
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>${libro.activo ? "Disponible" : "Desactivado"}</td>
        <td>
            <button class="btn btn-sm btn-warning me-2" 
                onclick="prepararEdicion(${libro.id}, '${libro.titulo}', '${libro.autor}')">
                Editar
            </button>
            <button class="btn btn-sm btn-danger ${libro.activo ? '' : 'disabled'}" 
                onclick="confirmarDesactivar(${libro.id})">
                Desactivar
            </button>
            <button class="btn btn-sm btn-success ${libro.activo ? 'disabled' : ''}" 
                onclick="confirmarActivar(${libro.id})">
                Activar
            </button>
        </td>
    `;
    tabla.appendChild(nuevaFila);
}

window.prepararEdicion = function(id, titulo, autor) {
    document.getElementById('editarId').value = id;
    document.getElementById('editarTitulo').value = titulo;
    document.getElementById('editarAutor').value = autor;
    new bootstrap.Modal(document.getElementById('modalEditarLibro')).show();
};

async function editarLibro() {
    const id = document.getElementById('editarId').value;
    const titulo = document.getElementById('editarTitulo').value.trim();
    const autor = document.getElementById('editarAutor').value.trim();

    try {
        const response = await fetch(`/libros/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, autor })
        });

        if (!response.ok) throw new Error('Error al actualizar libro');

        alert('Libro actualizado correctamente');
        bootstrap.Modal.getInstance(document.getElementById('modalEditarLibro')).hide();
        cargarLibros();
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

window.confirmarDesactivar = function(id) {
    if (confirm('¿Estás seguro de desactivar este libro?')) {
        desactivarLibro(id);
    }
};

async function desactivarLibro(id) {
    try {
        const response = await fetch(`/libros/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al desactivar libro');

        alert('Libro desactivado exitosamente');
        cargarLibros();
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}

window.confirmarActivar = function(id) {
    if (confirm('¿Quieres volver a activar este libro?')) {
        activarLibro(id);
    }
};

async function activarLibro(id) {
    try {
        const response = await fetch(`/libros/${id}/activar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: true })
        });

        if (!response.ok) throw new Error('Error al activar libro');

        alert('Libro activado exitosamente');
        cargarLibros();
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}
document.getElementById('logoutButton').addEventListener('click', () => {
    fetch('/logout')
        .then(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_nombre');
            window.location.href = '/login';
        })
        .catch(error => console.error('Error:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const userNombre = localStorage.getItem('user_nombre');
    if (userNombre) {
        document.getElementById('userNombre').textContent = userNombre;
    }
});
