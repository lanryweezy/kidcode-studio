import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to app
        await page.goto("http://localhost:3000")

        # We need to click "Get Started" first to bypass the landing page
        print("Clicking Get Started...")
        await page.click("button:has-text('Get Started')")
        await page.wait_for_timeout(1000)

        # Now click Circuit Lab
        print("Clicking Circuit Lab tab...")
        await page.click("text=Circuit Lab")
        await page.wait_for_timeout(1000)

        # Close the tutorial modal if it pops up
        print("Looking for tutorial modal to close...")
        tutorial_close = page.locator("button.absolute.top-4.right-4")
        if await tutorial_close.count() > 0:
            print("Closing tutorial...")
            await tutorial_close.click()
            await page.wait_for_timeout(500)

        # Ensure we are in Hardware mode by clicking the toggle
        print("Looking for Hardware View Mode...")
        # Since it's a segmented control, we will look for the button containing "Parts" or similar
        hardware_tabs = page.locator("span:has-text('Parts')")
        if await hardware_tabs.count() > 0:
            print("Clicking Parts tab...")
            await hardware_tabs.first.click()
            await page.wait_for_timeout(500)

        # Find DC motor
        print("Looking for DC motor...")
        dc_motor_btn = page.locator("div.flex.flex-col:has-text('DC Motor')").last

        box = await dc_motor_btn.bounding_box()
        if box:
            print("Dragging DC motor to board...")
            await page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            await page.mouse.down()

            # Drag to center of board
            await page.mouse.move(600, 400, steps=10)
            await page.mouse.up()
            await page.wait_for_timeout(500)

            # Move mouse to the motor position to trigger hover effect (to show slider)
            print("Hovering over motor...")
            await page.mouse.move(600, 400)
            await page.wait_for_timeout(500)

            print("Capturing screenshot...")
            await page.screenshot(path="/home/jules/verification/screenshots/motor_load.png", full_page=True)
            print("Screenshot saved to /home/jules/verification/screenshots/motor_load.png")

        else:
            print("DC motor not found.")
            await page.screenshot(path="/home/jules/verification/screenshots/error_state.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
