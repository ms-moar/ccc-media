#!/usr/bin/env python3
"""
Full-page screenshot script using Selenium WebDriver.
Captures entire scrollable page by stitching viewport screenshots (like GoFullPage).
"""

import time
import os
from io import BytesIO
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from PIL import Image
import argparse


def wait_for_page_load(driver, timeout=30):
    """
    Wait for page to be completely loaded using multiple strategies.

    Args:
        driver: Selenium WebDriver instance
        timeout: Maximum time to wait in seconds
    """
    # Wait for document ready state
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )

    # Wait for jQuery if it exists
    try:
        WebDriverWait(driver, 5).until(
            lambda d: d.execute_script("return typeof jQuery === 'undefined' || jQuery.active === 0")
        )
    except TimeoutException:
        pass  # jQuery might not be present

    # Small buffer to ensure everything is settled
    time.sleep(2)


def scroll_and_stitch_screenshot(driver, output_path, scroll_pause=0.5, max_scrolls=50):
    """
    Take full-page screenshot by scrolling and stitching viewport screenshots.
    This mimics the behavior of GoFullPage extension.
    Handles infinite scroll pages by continuing to scroll until no new content loads.

    Args:
        driver: Selenium WebDriver instance
        output_path: Path where screenshot will be saved
        scroll_pause: Time to pause between scrolls (seconds)
        max_scrolls: Maximum number of scroll sections to capture (prevents infinite loops)
    """
    # Get viewport dimensions
    viewport_width = driver.execute_script("return window.innerWidth")
    viewport_height = driver.execute_script("return window.innerHeight")

    print(f"Viewport: {viewport_width}x{viewport_height}")

    # Scroll to top first
    driver.execute_script("window.scrollTo(0, 0)")
    time.sleep(scroll_pause)

    screenshots = []
    scroll_positions = []
    current_scroll = 0
    last_height = 0
    no_change_count = 0

    print("Capturing page sections (with infinite scroll detection)...")

    # Calculate scroll step (slightly less than viewport to ensure overlap)
    scroll_step = viewport_height - 100  # 100px overlap for smooth stitching

    # Capture screenshots while scrolling
    section = 0
    while section < max_scrolls:
        # Get current page height (updates as infinite scroll loads content)
        current_height = driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)")

        # Scroll to position
        driver.execute_script(f"window.scrollTo(0, {current_scroll})")
        time.sleep(scroll_pause)

        # Wait for any lazy-loaded content (longer wait for infinite scroll)
        time.sleep(0.8)

        # Check if new content loaded
        new_height = driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)")

        # Get actual scroll position (may differ due to page constraints)
        actual_scroll = driver.execute_script("return window.pageYOffset")

        # Take screenshot
        screenshot = driver.get_screenshot_as_png()
        screenshots.append(Image.open(BytesIO(screenshot)))
        scroll_positions.append(actual_scroll)

        section += 1
        print(f"  Section {section} captured (scroll: {actual_scroll}px, page height: {new_height}px)")

        # Check if we've reached the bottom (no scroll movement)
        if len(scroll_positions) > 1 and actual_scroll == scroll_positions[-2]:
            # Check if height is still changing (infinite scroll might be loading)
            if new_height == last_height:
                no_change_count += 1
                if no_change_count >= 2:
                    print("  Reached bottom - no more content loading")
                    break
            else:
                no_change_count = 0

        last_height = new_height

        # Move to next section
        current_scroll += scroll_step

        # If we're past the current page height, check if we should continue
        if current_scroll > new_height:
            # Wait a bit to see if more content loads
            time.sleep(1)
            final_height = driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)")
            if final_height == new_height:
                # No new content loaded, we're done
                break

    if section >= max_scrolls:
        print(f"  Reached maximum scroll limit ({max_scrolls} sections)")

    print(f"Captured {len(screenshots)} sections. Stitching together...")

    # Calculate final image height
    if len(screenshots) == 1:
        # Single screenshot, just save it
        final_image = screenshots[0]
    else:
        # Stitch screenshots together
        # The last screenshot shows the bottom, so we calculate backwards
        final_height = scroll_positions[-1] + viewport_height

        # Create blank canvas
        final_image = Image.new('RGB', (viewport_width, final_height))

        # Paste each screenshot at its scroll position
        for i, (screenshot, scroll_pos) in enumerate(zip(screenshots, scroll_positions)):
            # For all but the last screenshot, we may need to crop the bottom to avoid duplication
            if i < len(screenshots) - 1:
                # Calculate how much to use from this screenshot
                next_scroll = scroll_positions[i + 1]
                visible_height = min(viewport_height, next_scroll - scroll_pos)

                # Crop and paste
                cropped = screenshot.crop((0, 0, viewport_width, visible_height))
                final_image.paste(cropped, (0, scroll_pos))
            else:
                # Last screenshot - paste the whole thing
                final_image.paste(screenshot, (0, scroll_pos))

    # Save the final image
    final_image.save(output_path, 'PNG', optimize=True)
    print(f"Final image size: {final_image.width}x{final_image.height}")

    return final_image.width, final_image.height


def take_full_page_screenshot(url, output_path, headless=True, wait_time=30, scroll_pause=0.5, max_scrolls=50):
    """
    Take a full-page screenshot of a given URL using scroll and stitch method.

    Args:
        url: The URL to capture
        output_path: Path where screenshot will be saved
        headless: Whether to run browser in headless mode
        wait_time: Maximum time to wait for page load
        scroll_pause: Time to pause between scrolls
        max_scrolls: Maximum number of scroll sections (for infinite scroll pages)
    """
    # Setup Chrome options
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless=new")

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    # Disable images loading for faster capture (optional - comment out if you want images)
    # chrome_options.add_argument("--blink-settings=imagesEnabled=false")

    # Initialize driver
    driver = webdriver.Chrome(options=chrome_options)

    try:
        print(f"Loading URL: {url}")
        driver.get(url)

        print("Waiting for page to load completely...")
        wait_for_page_load(driver, timeout=wait_time)

        # Take scrolling screenshot
        width, height = scroll_and_stitch_screenshot(driver, output_path, scroll_pause, max_scrolls)

        print(f"Screenshot saved successfully to: {output_path}")
        print(f"Final dimensions: {width}x{height}")

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise

    finally:
        driver.quit()
        print("Browser closed.")


def main():
    # Get script directory (project root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    default_output = os.path.join(script_dir, "screenshot.png")

    parser = argparse.ArgumentParser(
        description="Take a full-page screenshot of a webpage using scroll and stitch method (like GoFullPage)"
    )
    parser.add_argument(
        "url",
        help="URL of the webpage to screenshot"
    )
    parser.add_argument(
        "-o", "--output",
        default=default_output,
        help=f"Output file path (default: {default_output})"
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Run browser in visible mode"
    )
    parser.add_argument(
        "-w", "--wait",
        type=int,
        default=30,
        help="Maximum wait time for page load in seconds (default: 30)"
    )
    parser.add_argument(
        "-s", "--scroll-pause",
        type=float,
        default=0.5,
        help="Pause between scrolls in seconds (default: 0.5)"
    )
    parser.add_argument(
        "-m", "--max-scrolls",
        type=int,
        default=50,
        help="Maximum number of scroll sections to capture (default: 50)"
    )

    args = parser.parse_args()

    take_full_page_screenshot(
        url=args.url,
        output_path=args.output,
        headless=not args.no_headless,
        wait_time=args.wait,
        scroll_pause=args.scroll_pause,
        max_scrolls=args.max_scrolls
    )


if __name__ == "__main__":
    main()
