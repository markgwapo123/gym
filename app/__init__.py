from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
bcrypt = Bcrypt(app)

# MongoDB connection
client = MongoClient(app.config['MONGODB_URI'])
db = client[app.config['DATABASE_NAME']]

# Collections
users_collection = db['users']
members_collection = db['members']
attendance_collection = db['attendance']
payments_collection = db['payments']

from app import routes
