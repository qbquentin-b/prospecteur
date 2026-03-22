import time
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to http://localhost:3003...")
        page.goto("http://localhost:3003")

        print("Waiting for data to load...")
        # Wait until the skeleton loaders are gone and data grid has rows
        page.wait_for_selector('text="Burger Joints Austin, TX 1"', timeout=60000)

        print("Taking dashboard screenshot...")
        page.screenshot(path="dashboard.png")

        print("Clicking to open sidebar...")
        # Find the first row's detail button
        page.locator('button', has_text="chevron_right").first.click()

        print("Waiting for sidebar to slide in...")
        time.sleep(1) # Wait for animation

        print("Taking sidebar screenshot...")
        page.screenshot(path="sidebar.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()