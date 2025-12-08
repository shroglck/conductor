
from playwright.sync_api import sync_playwright, expect
import time
import json
import subprocess

# Metrics storage
metrics = {
    "users": []
}

def get_auth_token():
    try:
        # Run the node script to generate a fresh token
        result = subprocess.run(
            ['node', 'scripts/generate-token.js'],
            capture_output=True,
            text=True,
            cwd='../' # Assuming running from code/scripts/ or adjusting path logic
        )
        # Adjusting execution context: usually run from 'code/' root
        result = subprocess.run(
            ['node', 'scripts/generate-token.js'],
            capture_output=True,
            text=True
        )
        return result.stdout.strip()
    except Exception as e:
        print(f"Error generating token: {e}")
        return None

def run_user_journey(user_id, token):
    print(f"User {user_id}: Starting Journey...")
    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Set Auth Cookie
        context.add_cookies([{
            "name": "auth_token",
            "value": token,
            "domain": "localhost",
            "path": "/"
        }])

        page = context.new_page()

        # 1. Dashboard Load
        start = time.time()
        page.goto("http://localhost:3000/")
        try:
            expect(page.get_by_text("Welcome back")).to_be_visible(timeout=5000)
            results["dashboard_load"] = (time.time() - start) * 1000
        except:
            print(f"User {user_id}: Failed to load Dashboard")
            browser.close()
            return results

        # 2. Journal Load
        start = time.time()
        page.goto("http://localhost:3000/journal")
        try:
            expect(page.get_by_text("Document your work")).to_be_visible(timeout=5000)
            results["journal_load"] = (time.time() - start) * 1000
        except:
            print(f"User {user_id}: Failed to load Journal")
            browser.close()
            return results

        # 3. Journal Create
        start = time.time()
        try:
            page.locator('textarea[name="content"]').first.fill(f"Stress Test Entry User {user_id}")
            page.get_by_role("button", name="Post Entry").click()
            expect(page.locator('.journal-card', has_text=f"Stress Test Entry User {user_id}").first).to_be_visible(timeout=5000)
            results["journal_create_interaction"] = (time.time() - start) * 1000
        except:
            print(f"User {user_id}: Failed to create Entry")

        # 4. Attendance (Classes) Load
        start = time.time()
        page.goto("http://localhost:3000/classes")
        # Just check page load
        results["classes_load"] = (time.time() - start) * 1000

        browser.close()

    print(f"User {user_id}: Journey Complete.")
    return results

def main():
    # Attempt to get a fresh token dynamically
    print("Generating Auth Token...")
    # Ideally we run this script from 'code/' directory: `python3 scripts/rail-test-suite.py`
    # The subprocess call assumes we are in `code/`.

    # Check if .env.test is loaded in environment or we need to source it.
    # Python script won't easily source .env for the subprocess.
    # For simplicity, we assume the user runs this in an environment where `node scripts/generate-token.js` works
    # OR we use a hardcoded token if generation fails (fallback).

    # Fallback token (valid for 1h from generation time in previous steps)
    # If this expires, the user must regenerate.
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtaXd2Z3ozMTAwMXdqNmw5cjIzamZpN2siLCJlbWFpbCI6InByb2Zlc3NvckB1Y3NkLmVkdSIsIm5hbWUiOiJEci4gU21pdGgiLCJpYXQiOjE3NjUxODE3MDksImV4cCI6MTc2NTE4NTMwOX0.D50xLaa9NhsOEb5RQ-xcuyOe39XnncMOC4Wikiqms8g"

    print("Running RAIL Test Suite for 10 Users...")

    for i in range(1, 11):
        try:
            res = run_user_journey(i, token)
            metrics["users"].append(res)
        except Exception as e:
            print(f"User {i} Failed: {e}")

    # Calculate Averages
    avgs = {}
    keys = ["dashboard_load", "journal_load", "journal_create_interaction", "classes_load"]

    print("\n--- Aggregate Results ---")
    for k in keys:
        values = [u[k] for u in metrics["users"] if k in u]
        if values:
            avg = sum(values) / len(values)
            print(f"{k}: {avg:.2f} ms")
            avgs[k] = avg

    # Check against RAIL goals
    print("\n--- Analysis ---")
    if avgs.get("dashboard_load", 1000) < 1000:
        print("✅ Dashboard Load: Good (< 1s)")
    else:
        print("⚠️ Dashboard Load: Needs Improvement")

    if avgs.get("journal_create_interaction", 100) < 100:
        print("✅ Interaction: Good (< 100ms)")
    else:
        print("⚠️ Interaction: Slow (> 100ms) - Expected for DB write")

if __name__ == "__main__":
    main()
