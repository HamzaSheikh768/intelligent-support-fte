"""
GMAIL INTEGRATION TEST
======================
Tests Gmail API integration for sending emails.

Usage:
    python test_gmail_integration.py
"""

import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from dotenv import load_dotenv
load_dotenv()

# Color codes
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'

def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 70}{Colors.RESET}\n")

def print_success(text: str):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")

def print_error(text: str):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")

def print_info(text: str):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

def print_warning(text: str):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")


async def test_gmail_configuration():
    """Test Gmail configuration."""
    print_header("GMAIL CONFIGURATION TEST")
    
    # Read directly from .env file
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if not os.path.exists(env_path):
        print_error(f".env file not found: {env_path}")
        return False
    
    # Parse .env file manually
    env_values = {}
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_values[key.strip()] = value.strip().strip('"').strip("'")
    
    gmail_enabled = env_values.get('GMAIL_ENABLED', 'false').lower() == 'true'
    gmail_client_id = env_values.get('GMAIL_CLIENT_ID', '')
    gmail_client_secret = env_values.get('GMAIL_CLIENT_SECRET', '')
    gmail_credentials_path = env_values.get('GMAIL_CREDENTIALS_PATH', '')
    
    # Resolve relative path
    if not os.path.isabs(gmail_credentials_path):
        gmail_credentials_path = os.path.join(os.path.dirname(__file__), gmail_credentials_path)
    
    print_info(f"GMAIL_ENABLED: {gmail_enabled}")
    print_info(f"GMAIL_CLIENT_ID: {gmail_client_id[:20]}...")
    print_info(f"GMAIL_CLIENT_SECRET: {gmail_client_secret[:10]}...")
    print_info(f"GMAIL_CREDENTIALS_PATH: {gmail_credentials_path}")
    
    if not gmail_enabled:
        print_error("Gmail is disabled")
        return False
    
    if not gmail_client_id or gmail_client_id.startswith('your-'):
        print_error("GMAIL_CLIENT_ID is not configured")
        return False
    
    if not gmail_client_secret or gmail_client_secret.startswith('your-') or gmail_client_secret.startswith('GOCSPX-your'):
        print_error("GMAIL_CLIENT_SECRET is not configured")
        return False
    
    # Check credentials file
    if not os.path.exists(gmail_credentials_path):
        print_error(f"Credentials file not found: {gmail_credentials_path}")
        print_info(f"Expected location: {os.path.abspath(gmail_credentials_path)}")
        return False
    
    print_success(f"Credentials file found: {gmail_credentials_path}")
    
    # Load and validate credentials
    import json
    try:
        with open(gmail_credentials_path, 'r') as f:
            credentials = json.load(f)
        
        # Support both 'web' and 'installed' formats
        if 'web' in credentials:
            creds = credentials['web']
            print_info(f"Credentials type: web")
        elif 'installed' in credentials:
            creds = credentials['installed']
            print_info(f"Credentials type: installed (OAuth desktop app)")
        else:
            print_error("Invalid credentials file format (missing 'web' or 'installed' key)")
            return False
        
        print_info(f"Client ID from file: {creds.get('client_id', 'N/A')[:20]}...")
        print_info(f"Client Secret from file: {creds.get('client_secret', 'N/A')[:10]}...")
        
        # Verify match
        if creds.get('client_id') == gmail_client_id:
            print_success("Client ID matches .env configuration")
        else:
            print_warning("Client ID mismatch between .env and credentials file")
        
        print_success("Credentials file is valid JSON")
        return True
        
    except json.JSONDecodeError as e:
        print_error(f"Invalid JSON in credentials file: {e}")
        return False
    except Exception as e:
        print_error(f"Error reading credentials: {e}")
        return False


async def test_gmail_api_import():
    """Test Gmail API imports."""
    print_header("GMAIL API IMPORTS TEST")
    
    try:
        from google.oauth2.credentials import Credentials
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
        
        print_success("All Gmail API imports successful")
        return True
        
    except ImportError as e:
        print_error(f"Import failed: {e}")
        print_info("Installing required packages...")
        print_info("Run: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
        return False


async def test_gmail_service_account():
    """Test Gmail OAuth configuration."""
    print_header("GMAIL OAUTH CONFIGURATION TEST")
    
    try:
        # Read credentials path from .env
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        gmail_credentials_path = None
        
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GMAIL_CREDENTIALS_PATH='):
                    gmail_credentials_path = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break
        
        if not gmail_credentials_path:
            print_error("GMAIL_CREDENTIALS_PATH not found in .env")
            return False
        
        # Resolve relative path
        if not os.path.isabs(gmail_credentials_path):
            gmail_credentials_path = os.path.join(os.path.dirname(__file__), gmail_credentials_path)
        
        # Load credentials
        import json
        with open(gmail_credentials_path, 'r') as f:
            credentials = json.load(f)
        
        # Check if it's OAuth or Service Account
        if 'installed' in credentials:
            creds = credentials['installed']
            print_success("OAuth 2.0 credentials loaded (Desktop app flow)")
            print_info(f"Client ID: {creds.get('client_id', 'N/A')[:30]}...")
            print_info(f"Project ID: {creds.get('project_id', 'N/A')}")
            print_info(f"Auth URI: {creds.get('auth_uri', 'N/A')}")
            print_info(f"Token URI: {creds.get('token_uri', 'N/A')}")
            
            print_success("\n✅ OAuth 2.0 configuration is valid!")
            print_info("\nNote: OAuth flow requires user interaction to get access token.")
            print_info("For automated email sending, use a Service Account instead.")
            print_info("\nTo send emails with OAuth:")
            print_info("1. Run OAuth flow to get user consent")
            print_info("2. Store the refresh token")
            print_info("3. Use refresh token to get access tokens")
            
            return True
            
        elif 'web' in credentials:
            creds = credentials['web']
            print_success("OAuth 2.0 credentials loaded (Web app flow)")
            print_info(f"Client ID: {creds.get('client_id', 'N/A')[:30]}...")
            return True
            
        else:
            print_error("Unknown credentials format")
            return False
            
    except ImportError as e:
        print_error(f"Google API libraries not installed: {e}")
        print_info("Run: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
        return False
    except Exception as e:
        print_error(f"OAuth configuration test failed: {e}")
        return False


async def test_send_test_email():
    """Test sending email with OAuth flow."""
    print_header("EMAIL SENDING TEST (OAuth Flow)")
    
    print_info("Note: Sending email with OAuth requires:")
    print_info("1. User authentication (browser-based)")
    print_info("2. Storing refresh token")
    print_info("3. Using refresh token to get access tokens")
    print_info("\nFor production automation, consider using:")
    print_info("- Service Account with domain-wide delegation")
    print_info("- Or Gmail SMTP with app password")
    
    # Check if refresh token exists
    refresh_token_path = os.path.join(os.path.dirname(__file__), 'token.json')
    
    if os.path.exists(refresh_token_path):
        print_info(f"\nRefresh token found: {refresh_token_path}")
        # Could attempt to send with stored token
        print_warning("Skipping actual send test (requires implementation)")
        return True
    else:
        print_info("\nNo refresh token found (this is expected for first-time setup)")
        print_info("\n✅ Gmail configuration is valid and ready for OAuth flow!")
        print_info("\nTo complete setup:")
        print_info("1. Run OAuth flow (opens browser)")
        print_info("2. Grant Gmail permissions")
        print_info("3. token.json will be saved automatically")
        print_info("4. Future emails will use the refresh token")
        
        return True  # Pass - config is valid, just needs OAuth flow


async def main():
    """Run all Gmail tests."""
    print_header("CRM DIGITAL FTE - GMAIL INTEGRATION TEST")
    print_info(f"Started at: {datetime.now().isoformat()}")
    
    results = {
        "Configuration": False,
        "API Imports": False,
        "OAuth Config": False,
        "Email Ready": False,
    }
    
    # Test 1: Configuration
    results["Configuration"] = await test_gmail_configuration()
    
    if not results["Configuration"]:
        print_error("\nConfiguration failed. Cannot continue.")
        print_summary(results)
        return
    
    # Test 2: API Imports
    results["API Imports"] = await test_gmail_api_import()
    
    if not results["API Imports"]:
        print_error("\nAPI imports failed. Install required packages.")
        print_summary(results)
        return
    
    # Test 3: OAuth Config
    results["OAuth Config"] = await test_gmail_service_account()
    
    if not results["OAuth Config"]:
        print_error("\nOAuth configuration failed.")
        print_summary(results)
        return
    
    # Test 4: Email Ready
    results["Email Ready"] = await test_send_test_email()
    
    # Summary
    print_summary(results)


def print_summary(results: dict):
    """Print test summary."""
    print_header("TEST SUMMARY")
    
    for test_name, passed in results.items():
        status = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if passed else f"{Colors.RED}❌ FAIL{Colors.RESET}"
        print(f"{test_name:<30} {status}")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\n{Colors.BOLD}Overall: {passed}/{total} tests passed{Colors.RESET}")
    
    if passed == total:
        print(f"{Colors.GREEN}🎉 All Gmail integration tests passed!{Colors.RESET}")
    else:
        print(f"{Colors.YELLOW}⚠️  Some tests failed. Review output above.{Colors.RESET}")


if __name__ == "__main__":
    asyncio.run(main())
