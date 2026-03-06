# Full-Page Screenshot Script

A Selenium-based Python script that captures complete webpage screenshots, including content beyond the visible viewport.

## Features

- **Full-page capture**: Screenshots the entire page height and width, not just the visible viewport
- **Smart waiting**: Waits for complete page load including:
  - Document ready state
  - jQuery AJAX requests (if present)
  - Image loading
- **Headless mode**: Runs browser in background by default
- **Configurable**: Customizable timeout and output options

## Prerequisites

1. **Python 3.7+**
2. **Google Chrome** browser installed
3. **ChromeDriver** - Automatically managed by Selenium 4.15+

## Installation

```bash
pip install -r requirements_screenshot.txt
```

## Usage

### Basic usage:
```bash
python full_page_screenshot.py https://example.com
```

### Specify output file:
```bash
python full_page_screenshot.py https://example.com -o my_screenshot.png
```

### Run in visible mode (see the browser):
```bash
python full_page_screenshot.py https://example.com --no-headless
```

### Custom wait time:
```bash
python full_page_screenshot.py https://example.com -w 60
```

## Command Line Arguments

- `url` (required): The URL of the webpage to screenshot
- `-o, --output`: Output file path (default: `screenshot.png`)
- `--no-headless`: Run browser in visible mode instead of headless
- `-w, --wait`: Maximum wait time for page load in seconds (default: 30)

## How It Works

1. **Page Load**: Navigates to the specified URL
2. **Wait Strategy**:
   - Waits for `document.readyState === 'complete'`
   - Waits for jQuery AJAX (if present)
   - Waits for all images to load
   - Additional 2-second buffer
3. **Dimension Calculation**: Gets full page width/height including scrollable areas
4. **Window Resize**: Resizes browser window to match full page dimensions
5. **Capture**: Takes screenshot of entire visible area (which now shows the full page)

## Example Output

```
Loading URL: https://example.com
Waiting for page to load completely...
Page loaded. Calculating page dimensions...
Page dimensions: 1920x4500
Taking full-page screenshot...
Screenshot saved successfully to: screenshot.png
Browser closed.
```

## Troubleshooting

### ChromeDriver issues
If you encounter ChromeDriver errors, ensure Chrome browser is installed and updated. Selenium 4.15+ manages ChromeDriver automatically.

### Page not loading
- Increase wait time with `-w` flag
- Run with `--no-headless` to see what's happening
- Check if the URL is accessible

### Incomplete screenshots
Some dynamic content may require longer wait times. Try:
```bash
python full_page_screenshot.py https://example.com -w 60
```

## Notes

- Works best with standard web pages
- May have issues with infinite scroll pages
- Some websites may block headless browsers (use `--no-headless` if needed)
- Large pages may take more time to load and screenshot
