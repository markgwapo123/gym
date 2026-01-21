import requests
import sys

def create_admin():
    url = "http://localhost:5000/api/auth/register"
    
    # Default admin credentials
    data = {
        "name": "Admin User",
        "username": "admin",
        "password": "admin123",
        "role": "Admin"
    }
    
    try:
        response = requests.post(url, json=data)
        
        if response.status_code == 201:
            print("✅ Admin user created successfully!")
            print("\nLogin Credentials:")
            print("Username: admin")
            print("Password: admin123")
            print("\n⚠️  Please change the password after first login!")
        else:
            print(f"❌ Error: {response.json().get('message', 'Failed to create admin')}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to backend server")
        print("Make sure the Flask server is running on http://localhost:5000")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("Creating admin user...")
    create_admin()
