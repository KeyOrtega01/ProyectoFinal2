
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    template_dir = os.path.abspath('frontend/templates')
    static_dir = os.path.abspath('static') 
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    app.config.from_object(Config)
    
  
    app.config['JWT_SECRET_KEY'] = 'tu-clave-secreta-muy-segura'  
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)

    from app.routes import configure_routes
    configure_routes(app, bcrypt, jwt)

    return app

app = create_app()