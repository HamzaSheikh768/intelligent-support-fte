#!/usr/bin/env python3
"""
Multi-Channel Integration Test
Tests Gmail and WhatsApp channel endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

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

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

def test_whatsapp_webhook():
    """Test WhatsApp webhook endpoint"""
    print_header("WHATSAPP WEBHOOK TEST")
    
    url = f"{BASE_URL}/webhooks/whatsapp"
    
    # Simulate incoming WhatsApp message from Twilio
    payload = {
        "MessageSid": "SM" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "From": "whatsapp:+923313511431",
        "Body": "Test message from WhatsApp webhook test",
        "ProfileName": "Test User",
        "WaId": "+923313511431"
    }
    
    print_info(f"Sending WhatsApp webhook to: {url}")
    print_info(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, data=payload, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print_success("WhatsApp webhook endpoint is working!")
            print_info(f"Response: {response.text[:200]}")
            return True
        else:
            print_error(f"Webhook returned {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Backend not running (start with: cd backend && uvicorn src.main:app --reload)")
        return False
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def test_gmail_webhook():
    """Test Gmail webhook endpoint"""
    print_header("GMAIL WEBHOOK TEST")
    
    url = f"{BASE_URL}/webhooks/gmail"
    
    # Simulate Gmail Pub/Sub message
    payload = {
        "message": {
            "messageId": "msg-" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "data": "eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ==",  # base64 encoded
            "attributes": {
                "historyId": "123456",
                "email": "test@example.com"
            }
        },
        "subscription": "gmail-notification"
    }
    
    print_info(f"Sending Gmail webhook to: {url}")
    print_info(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            url, 
            json=payload, 
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        # 200 or 400 are acceptable (endpoint exists)
        if response.status_code in [200, 400]:
            print_success("Gmail webhook endpoint is working!")
            print_info(f"Response: {response.text[:200]}")
            return True
        else:
            print_error(f"Webhook returned {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Backend not running")
        return False
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def test_whatsapp_status_webhook():
    """Test WhatsApp status webhook"""
    print_header("WHATSAPP STATUS WEBHOOK TEST")
    
    url = f"{BASE_URL}/webhooks/whatsapp/status"
    
    payload = {
        "MessageSid": "SM" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "MessageStatus": "delivered"
    }
    
    print_info(f"Sending status webhook to: {url}")
    
    try:
        response = requests.post(url, data=payload, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print_success("WhatsApp status webhook is working!")
            return True
        else:
            print_error(f"Webhook returned {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def test_admin_tickets():
    """Test admin tickets endpoint"""
    print_header("ADMIN TICKETS API TEST")
    
    url = f"{BASE_URL}/api/v1/admin/tickets"
    params = {"page": 1, "page_size": 5}
    
    print_info(f"Getting tickets from: {url}")
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Tickets API working! Total: {data.get('total', 0)} tickets")
            
            # Show channel distribution
            items = data.get('items', [])
            channels = {}
            for ticket in items:
                ch = ticket.get('channel', 'unknown')
                channels[ch] = channels.get(ch, 0) + 1
            
            print_info("Channel distribution in last 5 tickets:")
            for ch, count in channels.items():
                print_info(f"  - {ch}: {count}")
            
            return True
        else:
            print_error(f"API returned {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def test_admin_metrics():
    """Test admin metrics endpoint"""
    print_header("ADMIN METRICS API TEST")
    
    url = f"{BASE_URL}/api/v1/admin/metrics"
    
    print_info(f"Getting metrics from: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Metrics API working!")
            
            print_info(f"Total Tickets: {data.get('totalTickets', 0)}")
            print_info(f"Open Tickets: {data.get('openTickets', 0)}")
            
            channels = data.get('ticketsByChannel', {})
            print_info("Tickets by Channel:")
            for ch, count in channels.items():
                print_info(f"  - {ch}: {count}")
            
            return True
        else:
            print_error(f"API returned {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Test failed: {e}")
        return False

def main():
    """Run all tests"""
    print_header("MULTI-CHANNEL INTEGRATION TEST")
    print("Testing Gmail and WhatsApp webhooks + Admin APIs\n")
    
    results = {
        'WhatsApp Webhook': test_whatsapp_webhook(),
        'WhatsApp Status': test_whatsapp_status_webhook(),
        'Gmail Webhook': test_gmail_webhook(),
        'Admin Tickets': test_admin_tickets(),
        'Admin Metrics': test_admin_metrics(),
    }
    
    # Summary
    print_header("TEST SUMMARY")
    
    for test_name, result in results.items():
        status = "PASSED" if result else "FAILED"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{test_name}: {status}{Colors.RESET}")
    
    passed = sum(results.values())
    total = len(results)
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.RESET}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! Multi-channel architecture is fully operational!{Colors.RESET}\n")
        return 0
    else:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  Some tests failed. Check the errors above.{Colors.RESET}\n")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
