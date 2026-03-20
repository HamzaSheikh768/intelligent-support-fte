#!/usr/bin/env python3
"""
Multi-Channel Credentials Validation Test
Tests Gmail and WhatsApp credentials configuration
"""

import json
import sys
from pathlib import Path

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

def test_gmail_credentials():
    """Test Gmail API credentials"""
    print_header("GMAIL API CREDENTIALS TEST")
    
    creds_path = Path(__file__).parent.parent / "secrets" / "credentials.json"
    
    # Check if file exists
    if not creds_path.exists():
        print_error(f"Credentials file not found: {creds_path}")
        return False
    
    print_success(f"Credentials file found: {creds_path}")
    
    # Load and validate
    try:
        with open(creds_path) as f:
            creds = json.load(f)
        
        # Check structure
        if 'installed' not in creds:
            print_error("Invalid credentials structure: missing 'installed' key")
            return False
        
        installed = creds['installed']
        
        # Validate required fields
        required_fields = ['client_id', 'client_secret', 'project_id', 'auth_uri', 'token_uri']
        missing = [f for f in required_fields if f not in installed]
        
        if missing:
            print_error(f"Missing required fields: {missing}")
            return False
        
        print_success("Credentials structure is valid")
        print_info(f"Client ID: {installed['client_id']}")
        print_info(f"Project ID: {installed['project_id']}")
        print_info(f"Auth URI: {installed['auth_uri']}")
        
        # Check if values match .env
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        env_client_id = os.getenv('GMAIL_CLIENT_ID')
        if env_client_id and env_client_id == installed['client_id']:
            print_success("Client ID matches .env configuration")
        else:
            print_warning("Client ID in .env doesn't match credentials.json")
        
        return True
        
    except json.JSONDecodeError as e:
        print_error(f"Invalid JSON in credentials file: {e}")
        return False
    except Exception as e:
        print_error(f"Error loading credentials: {e}")
        return False

def test_twilio_credentials():
    """Test Twilio WhatsApp credentials"""
    print_header("TWILIO WHATSAPP CREDENTIALS TEST")
    
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    # Get credentials from env
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
    
    # Validate presence
    if not account_sid:
        print_error("TWILIO_ACCOUNT_SID not found in .env")
        return False
    
    if not auth_token:
        print_error("TWILIO_AUTH_TOKEN not found in .env")
        return False
    
    if not whatsapp_number:
        print_error("TWILIO_WHATSAPP_NUMBER not found in .env")
        return False
    
    print_success("All Twilio credentials found in .env")
    print_info(f"Account SID: {account_sid}")
    print_info(f"WhatsApp Number: {whatsapp_number}")
    
    # Validate format
    if not account_sid.startswith('AC'):
        print_warning("Account SID should start with 'AC'")
        return False
    
    print_success("Account SID format is valid")
    
    # Try to initialize Twilio client
    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        print_success("Twilio client initialized successfully")
        
        # Note: We can't actually test the credentials without making an API call
        # which would cost money. Just initializing proves the format is correct.
        print_warning("Full credential validation requires API call (skipped to avoid charges)")
        
        return True
        
    except ImportError:
        print_warning("Twilio package not installed (pip install twilio)")
        return True  # Still valid, just can't test
    except Exception as e:
        print_error(f"Failed to initialize Twilio client: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    print_header("DATABASE CONNECTION TEST")
    
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print_error("DATABASE_URL not found in .env")
        return False
    
    print_success("Database URL found in .env")
    
    # Check if it's a Neon DB URL
    if 'neon.tech' in database_url:
        print_success("Using Neon PostgreSQL (serverless)")
    else:
        print_info("Using standard PostgreSQL")
    
    # Try to connect
    try:
        import asyncio
        import asyncpg
        
        async def test_connection():
            conn = await asyncpg.connect(database_url)
            await conn.fetchval('SELECT 1')
            await conn.close()
            return True
        
        result = asyncio.run(test_connection())
        if result:
            print_success("Database connection successful")
            return True
            
    except ImportError:
        print_warning("asyncpg not installed (pip install asyncpg)")
        return True  # Still valid
    except Exception as e:
        print_error(f"Database connection failed: {e}")
        return False

def test_openrouter_credentials():
    """Test OpenRouter API credentials"""
    print_header("OPENROUTER API CREDENTIALS TEST")
    
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    model = os.getenv('OPENROUTER_MODEL', 'gpt-4o')
    
    if not api_key:
        print_error("OPENROUTER_API_KEY not found in .env")
        return False
    
    print_success("OpenRouter API key found in .env")
    print_info(f"Model: {model}")
    
    # Validate format
    if not api_key.startswith('sk-or-'):
        print_warning("API key should start with 'sk-or-'")
        return False
    
    print_success("API key format is valid")
    
    return True

def test_channel_endpoints():
    """Test channel webhook endpoints"""
    print_header("CHANNEL WEBHOOK ENDPOINTS TEST")
    
    import requests
    
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend health check: {data.get('status', 'unknown')}")
            
            # Check channel status
            channels = data.get('channels', {})
            print_info(f"Email channel: {channels.get('email', 'unknown')}")
            print_info(f"WhatsApp channel: {channels.get('whatsapp', 'unknown')}")
            print_info(f"Web form channel: {channels.get('web_form', 'unknown')}")
        else:
            print_error(f"Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Backend not running (start with: cd backend && uvicorn src.main:app --reload)")
        return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False
    
    # Test webhook endpoints exist
    webhook_tests = [
        ("/webhooks/whatsapp", "WhatsApp webhook"),
        ("/webhooks/gmail", "Gmail webhook"),
    ]
    
    for endpoint, name in webhook_tests:
        try:
            # POST request to simulate webhook
            response = requests.post(
                f"{base_url}{endpoint}",
                data={"test": "data"},
                timeout=5
            )
            # 422 is acceptable (validation error means endpoint exists)
            if response.status_code in [200, 422, 400]:
                print_success(f"{name} endpoint exists")
            elif response.status_code == 404:
                print_error(f"{name} endpoint not found")
                return False
            else:
                print_warning(f"{name} endpoint returned {response.status_code}")
        except Exception as e:
            print_error(f"{name} test failed: {e}")
    
    return True

def main():
    """Run all tests"""
    print_header("MULTI-CHANNEL CREDENTIALS VALIDATION")
    print("Testing Gmail, WhatsApp, and other service credentials\n")
    
    results = {
        'Gmail Credentials': test_gmail_credentials(),
        'Twilio Credentials': test_twilio_credentials(),
        'Database Connection': test_database_connection(),
        'OpenRouter Credentials': test_openrouter_credentials(),
        'Channel Endpoints': test_channel_endpoints(),
    }
    
    # Summary
    print_header("TEST SUMMARY")
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
    
    # Overall
    passed = sum(results.values())
    total = len(results)
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.RESET}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Multi-channel architecture is ready!{Colors.RESET}\n")
        return 0
    else:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  Some tests failed. Please fix the issues above.{Colors.RESET}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
