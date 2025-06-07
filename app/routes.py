from flask import request, jsonify, render_template
from app.models import db, Usuario, Libro
from flask_jwt_extended import create_access_token
from flask_bcrypt import Bcrypt

def configure_routes(app, bcrypt, jwt):

    @app.route('/')
    def index():
        return render_template('login.html')
    
    @app.route('/biblioteca')
    def biblioteca():
        return render_template('biblioteca.html')

    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'GET':
            return render_template('register.html')

        try:
            datos = request.get_json()
            nombre = datos.get('nombre')
            email = datos.get('email')
            password = datos.get('password')

            if not all([nombre, email, password]):
                return jsonify({"mensaje": "Todos los campos son requeridos"}), 400

            if Usuario.query.filter_by(email=email).first():
                return jsonify({"mensaje": "El correo ya está registrado"}), 400

            hashed = bcrypt.generate_password_hash(password).decode('utf-8')
            nuevo_usuario = Usuario(nombre=nombre, email=email, password=hashed)
            db.session.add(nuevo_usuario)
            db.session.commit()

            return jsonify({"mensaje": "Registro exitoso"}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"mensaje": "Error en el registro", "error": str(e)}), 500

    @app.route('/login', methods=['POST'])
    def login():
        try:
            datos = request.get_json()
            if not datos:
                return jsonify({"mensaje": "Error: No se recibieron datos"}), 400

            email = datos.get('email')
            password = datos.get('password')

            if not email or not password:
                return jsonify({"mensaje": "Correo y contraseña requeridos"}), 400

            usuario = Usuario.query.filter_by(email=email).first()

            if not usuario or not bcrypt.check_password_hash(usuario.password, password):
                return jsonify({"mensaje": "Credenciales inválidas"}), 401

            token = create_access_token(identity=usuario.id)
            return jsonify({
                "mensaje": "Login exitoso",
                "access_token": token,
                "user_id": usuario.id,
                "nombre": usuario.nombre
            }), 200

        except Exception as e:
            print("Error en login:", e)
            return jsonify({"mensaje": "Error en el servidor", "error": str(e)}), 500

    @app.route('/libros', methods=['GET'])
    def obtener_libros():
        try:
            libros = Libro.query.all()
            return jsonify([libro.to_dict() for libro in libros]), 200
        except Exception as e:
            return jsonify({"mensaje": "Error al obtener libros", "error": str(e)}), 500

    @app.route('/libros', methods=['POST'])
    def agregar_libro():
        try:
            datos = request.get_json()
            titulo = datos.get('titulo')
            autor = datos.get('autor')

            if not titulo or not autor:
                return jsonify({"mensaje": "Título y autor son requeridos"}), 400

            nuevo_libro = Libro(titulo=titulo, autor=autor, estado='Disponible', activo=True)
            db.session.add(nuevo_libro)
            db.session.commit()
            return jsonify(nuevo_libro.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"mensaje": "Error al agregar libro", "error": str(e)}), 500

    @app.route('/libros/<int:id>', methods=['PUT'])
    def actualizar_libro(id):
        try:
            datos = request.get_json()
            libro = Libro.query.get_or_404(id)

            libro.titulo = datos.get('titulo', libro.titulo)
            libro.autor = datos.get('autor', libro.autor)

            db.session.commit()
            return jsonify(libro.to_dict()), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"mensaje": "Error al actualizar libro", "error": str(e)}), 500

    @app.route('/libros/<int:id>', methods=['DELETE'])
    def desactivar_libro(id):
        try:
            libro = Libro.query.get_or_404(id)
            libro.activo = False
            db.session.commit()
            return jsonify({"mensaje": "Libro desactivado"}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"mensaje": "Error al desactivar libro", "error": str(e)}), 500

    @app.route('/libros/<int:id>/activar', methods=['PUT'])
    def activar_libro(id):
        try:
            libro = Libro.query.get_or_404(id)
            libro.activo = True
            db.session.commit()
            return jsonify({"mensaje": "Libro activado"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"mensaje": "Error al activar libro", "error": str(e)}), 500

    @app.route('/logout', methods=['POST'])
    def logout():
        response = jsonify({"mensaje": "Sesión cerrada"})
        response.set_cookie('access_token', '', expires=0)  
        return response
