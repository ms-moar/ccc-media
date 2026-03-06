# Cookie Banner Dismisser - Usage Guide

A Python Selenium script that automatically dismisses cookie consent banners and unwanted popups when visiting websites.

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements_selenium.txt
```

2. Make sure you have Chrome browser installed.

3. The script will automatically download the appropriate ChromeDriver.

## Usage

### Basic Usage

Visit a single website and dismiss banners:

```python
from dismiss_banners import visit_website

visit_website("https://www.example.com", headless=False)
```

### Advanced Usage

Use the `BannerDismisser` class in your own scripts:

```python
from selenium import webdriver
from dismiss_banners import BannerDismisser, setup_driver

# Set up driver
driver = setup_driver(headless=False)
dismisser = BannerDismisser(driver)

# Visit website
driver.get("https://www.example.com")

# Dismiss banners
dismissed_count = dismisser.dismiss_banners(wait_time=3)
print(f"Dismissed {dismissed_count} banners")

# Continue with your automation...
# ...

driver.quit()
```

### Run from Command Line

Edit the script's `__main__` section and run:

```bash
python dismiss_banners.py
```

## Features

- ✅ Detects and dismisses common cookie consent banners
- ✅ Supports popular consent management platforms:
  - OneTrust
  - TrustArc
  - Cookiebot
  - Quantcast
  - Cookie Consent
- ✅ Uses multiple strategies (XPath, CSS selectors)
- ✅ Falls back to JavaScript click if normal click fails
- ✅ Headless mode support for background automation
- ✅ Configurable wait times

## Supported Banner Types

The script recognizes and dismisses:
- Cookie consent banners
- GDPR compliance popups
- Newsletter signup modals
- Generic overlay modals
- Privacy policy notifications

## Configuration

### Adjust Wait Time

```python
dismisser.dismiss_banners(wait_time=5)  # Wait up to 5 seconds for each element
```

### Headless Mode

```python
visit_website("https://www.example.com", headless=True)  # Run without visible browser
```

### Add Custom Selectors

Edit the `COOKIE_SELECTORS` list in `BannerDismisser` class to add your own selectors:

```python
COOKIE_SELECTORS = [
    # Add your custom selectors
    "#my-custom-cookie-banner button.accept",
    "//div[@class='my-banner']//button[text()='OK']",
    # ... existing selectors
]
```

## Tips

1. **For stubborn banners**: Increase the `wait_time` parameter
2. **Multiple banners**: The script attempts to dismiss all found banners
3. **Site-specific issues**: Add custom selectors for specific websites
4. **Testing**: Run with `headless=False` to see the browser and verify behavior

## Troubleshooting

### Browser driver issues
```bash
pip install --upgrade selenium webdriver-manager
```

### Element not clickable
- Some banners use shadow DOM or iframes (requires additional handling)
- Try adding the specific selector to `COOKIE_SELECTORS`

### No banners detected
- Some sites delay banner loading - increase wait time
- Check if the site uses a consent platform not yet supported
