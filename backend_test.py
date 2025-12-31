import requests
import sys
import json
from datetime import datetime, timedelta

class TravelLogAPITester:
    def __init__(self, base_url="https://travel-log-app-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.trip_id = None
        self.itinerary_id = None
        self.expense_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'endpoint': endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e),
                'endpoint': endpoint
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User"
        }
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user: {response['user']['email']}")
            return True
        return False

    def test_login(self):
        """Test user login with existing user"""
        if not self.token:
            print("❌ No token available for login test")
            return False
        
        # We'll test login with a fresh request (without using existing token)
        temp_token = self.token
        self.token = None
        
        # Extract email from the registration (we'll use a known test user)
        test_data = {
            "email": "test@example.com",
            "password": "TestPass123!"
        }
        
        # First register a test user for login
        reg_success, reg_response = self.run_test("Pre-Login Registration", "POST", "auth/register", 200, {
            "email": "test_login@example.com",
            "password": "TestPass123!",
            "full_name": "Login Test User"
        })
        
        if reg_success:
            # Now test login
            login_data = {
                "email": "test_login@example.com",
                "password": "TestPass123!"
            }
            success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
            if success and 'token' in response:
                print(f"   Login successful for: {response['user']['email']}")
                # Restore original token for other tests
                self.token = temp_token
                return True
        
        # Restore original token
        self.token = temp_token
        return False

    def test_get_profile(self):
        """Test get current user profile"""
        return self.run_test("Get User Profile", "GET", "auth/me", 200)[0]

    def test_update_profile(self):
        """Test update user profile"""
        profile_data = {
            "full_name": "Updated Test User",
            "nip": "123456789",
            "jabatan": "Staff IT",
            "unit": "Bagian Teknologi Informasi"
        }
        success, response = self.run_test("Update Profile", "PUT", "auth/profile", 200, profile_data)
        if success and response.get('profile_completed'):
            print(f"   Profile completed: {response['profile_completed']}")
        return success

    def test_create_trip(self):
        """Test create trip"""
        today = datetime.now()
        tomorrow = today + timedelta(days=1)
        
        trip_data = {
            "judul": "Test Perjalanan Dinas",
            "tujuan": "Jakarta",
            "tanggal_mulai": today.strftime('%Y-%m-%d'),
            "tanggal_selesai": tomorrow.strftime('%Y-%m-%d'),
            "dasar_perjalanan": "Surat Tugas No. 123/ST/2024",
            "maksud_tujuan": "Menghadiri rapat koordinasi"
        }
        success, response = self.run_test("Create Trip", "POST", "trips", 200, trip_data)
        if success and 'id' in response:
            self.trip_id = response['id']
            print(f"   Created trip ID: {self.trip_id}")
        return success

    def test_get_trips(self):
        """Test get all trips"""
        return self.run_test("Get All Trips", "GET", "trips", 200)[0]

    def test_get_trip_detail(self):
        """Test get trip detail"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        return self.run_test("Get Trip Detail", "GET", f"trips/{self.trip_id}", 200)[0]

    def test_update_trip(self):
        """Test update trip"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        
        update_data = {
            "judul": "Updated Test Perjalanan Dinas",
            "status": "completed"
        }
        return self.run_test("Update Trip", "PUT", f"trips/{self.trip_id}", 200, update_data)[0]

    def test_create_itinerary(self):
        """Test create itinerary"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        
        today = datetime.now()
        itinerary_data = {
            "tanggal": today.strftime('%Y-%m-%d'),
            "waktu": "09:00",
            "kegiatan": "Rapat koordinasi",
            "lokasi": "Kantor Pusat Jakarta",
            "catatan": "Membawa laptop dan dokumen"
        }
        success, response = self.run_test("Create Itinerary", "POST", f"trips/{self.trip_id}/itineraries", 200, itinerary_data)
        if success and 'id' in response:
            self.itinerary_id = response['id']
            print(f"   Created itinerary ID: {self.itinerary_id}")
        return success

    def test_get_itineraries(self):
        """Test get trip itineraries"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        return self.run_test("Get Itineraries", "GET", f"trips/{self.trip_id}/itineraries", 200)[0]

    def test_update_itinerary(self):
        """Test update itinerary"""
        if not self.trip_id or not self.itinerary_id:
            print("❌ No trip ID or itinerary ID available")
            return False
        
        update_data = {
            "kegiatan": "Updated rapat koordinasi",
            "catatan": "Updated notes"
        }
        return self.run_test("Update Itinerary", "PUT", f"trips/{self.trip_id}/itineraries/{self.itinerary_id}", 200, update_data)[0]

    def test_create_expense(self):
        """Test create expense"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        
        today = datetime.now()
        expense_data = {
            "tanggal": today.strftime('%Y-%m-%d'),
            "uraian": "Transport taxi",
            "jumlah": 150000,
            "catatan": "Dari bandara ke hotel"
        }
        success, response = self.run_test("Create Expense", "POST", f"trips/{self.trip_id}/expenses", 200, expense_data)
        if success and 'id' in response:
            self.expense_id = response['id']
            print(f"   Created expense ID: {self.expense_id}")
            print(f"   Auto-generated number: {response.get('nomor')}")
        return success

    def test_get_expenses(self):
        """Test get trip expenses"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        return self.run_test("Get Expenses", "GET", f"trips/{self.trip_id}/expenses", 200)[0]

    def test_update_expense(self):
        """Test update expense"""
        if not self.trip_id or not self.expense_id:
            print("❌ No trip ID or expense ID available")
            return False
        
        update_data = {
            "uraian": "Updated transport taxi",
            "jumlah": 175000
        }
        return self.run_test("Update Expense", "PUT", f"trips/{self.trip_id}/expenses/{self.expense_id}", 200, update_data)[0]

    def test_validate_report(self):
        """Test report validation"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        
        success, response = self.run_test("Validate Report", "GET", f"trips/{self.trip_id}/report/validate", 200)
        if success:
            print(f"   Can generate report: {response.get('can_generate')}")
            print(f"   Profile completed: {response.get('profile_completed')}")
            print(f"   Trip completed: {response.get('trip_completed')}")
            print(f"   Has itinerary: {response.get('has_itinerary')}")
            print(f"   Has expense: {response.get('has_expense')}")
        return success

    def test_generate_pdf_report(self):
        """Test PDF report generation"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        
        # Use requests with stream=True for file download
        url = f"{self.base_url}/api/trips/{self.trip_id}/report?format=pdf"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers, stream=True)
            if response.status_code == 200:
                print("✅ PDF Report Generation - Status: 200")
                print(f"   Content-Type: {response.headers.get('Content-Type')}")
                print(f"   Content-Length: {response.headers.get('Content-Length', 'Unknown')}")
                self.tests_passed += 1
                return True
            else:
                print(f"❌ PDF Report Generation - Expected 200, got {response.status_code}")
                self.failed_tests.append({
                    'test': 'Generate PDF Report',
                    'expected': 200,
                    'actual': response.status_code,
                    'endpoint': f"trips/{self.trip_id}/report?format=pdf"
                })
                return False
        except Exception as e:
            print(f"❌ PDF Report Generation - Error: {str(e)}")
            self.failed_tests.append({
                'test': 'Generate PDF Report',
                'error': str(e),
                'endpoint': f"trips/{self.trip_id}/report?format=pdf"
            })
            return False
        finally:
            self.tests_run += 1

    def test_generate_excel_report(self):
        """Test Excel report generation"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        
        # Use requests with stream=True for file download
        url = f"{self.base_url}/api/trips/{self.trip_id}/report?format=xlsx"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers, stream=True)
            if response.status_code == 200:
                print("✅ Excel Report Generation - Status: 200")
                print(f"   Content-Type: {response.headers.get('Content-Type')}")
                print(f"   Content-Length: {response.headers.get('Content-Length', 'Unknown')}")
                self.tests_passed += 1
                return True
            else:
                print(f"❌ Excel Report Generation - Expected 200, got {response.status_code}")
                self.failed_tests.append({
                    'test': 'Generate Excel Report',
                    'expected': 200,
                    'actual': response.status_code,
                    'endpoint': f"trips/{self.trip_id}/report?format=xlsx"
                })
                return False
        except Exception as e:
            print(f"❌ Excel Report Generation - Error: {str(e)}")
            self.failed_tests.append({
                'test': 'Generate Excel Report',
                'error': str(e),
                'endpoint': f"trips/{self.trip_id}/report?format=xlsx"
            })
            return False
        finally:
            self.tests_run += 1

    def test_delete_expense(self):
        """Test delete expense"""
        if not self.trip_id or not self.expense_id:
            print("❌ No trip ID or expense ID available")
            return False
        return self.run_test("Delete Expense", "DELETE", f"trips/{self.trip_id}/expenses/{self.expense_id}", 200)[0]

    def test_delete_itinerary(self):
        """Test delete itinerary"""
        if not self.trip_id or not self.itinerary_id:
            print("❌ No trip ID or itinerary ID available")
            return False
        return self.run_test("Delete Itinerary", "DELETE", f"trips/{self.trip_id}/itineraries/{self.itinerary_id}", 200)[0]

    def test_delete_trip(self):
        """Test delete trip"""
        if not self.trip_id:
            print("❌ No trip ID available")
            return False
        return self.run_test("Delete Trip", "DELETE", f"trips/{self.trip_id}", 200)[0]

def main():
    print("🚀 Starting Travel Log API Tests...")
    print("=" * 60)
    
    tester = TravelLogAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Registration", tester.test_register),
        ("User Login", tester.test_login),
        ("Get Profile", tester.test_get_profile),
        ("Update Profile", tester.test_update_profile),
        ("Create Trip", tester.test_create_trip),
        ("Get All Trips", tester.test_get_trips),
        ("Get Trip Detail", tester.test_get_trip_detail),
        ("Update Trip", tester.test_update_trip),
        ("Create Itinerary", tester.test_create_itinerary),
        ("Get Itineraries", tester.test_get_itineraries),
        ("Update Itinerary", tester.test_update_itinerary),
        ("Create Expense", tester.test_create_expense),
        ("Get Expenses", tester.test_get_expenses),
        ("Update Expense", tester.test_update_expense),
        ("Validate Report", tester.test_validate_report),
        ("Generate PDF Report", tester.test_generate_pdf_report),
        ("Generate Excel Report", tester.test_generate_excel_report),
        ("Delete Expense", tester.test_delete_expense),
        ("Delete Itinerary", tester.test_delete_itinerary),
        ("Delete Trip", tester.test_delete_trip),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Unexpected error: {str(e)}")
            tester.failed_tests.append({
                'test': test_name,
                'error': str(e)
            })
    
    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failure['test']}")
            if 'expected' in failure:
                print(f"   Expected: {failure['expected']}, Got: {failure['actual']}")
            if 'error' in failure:
                print(f"   Error: {failure['error']}")
            print(f"   Endpoint: {failure.get('endpoint', 'N/A')}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())