import asyncio
from playwright.async_api import async_playwright
import re

async def test_shopee():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        url = "https://shopee.com.br/flash_sale"
        print(f"Opening {url}...")
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(10) # Wait for React to render
            
            # Check for cards
            # Selector from current code: "div[data-sqe='item']"
            cards = await page.query_selector_all("div[data-sqe='item']")
            print(f"Found {len(cards)} cards with 'div[data-sqe='item']'")
            
            if len(cards) == 0:
                # Try another common shopee selector
                cards = await page.query_selector_all(".flash-sale-item-card")
                print(f"Found {len(cards)} cards with '.flash-sale-item-card'")
            
            if len(cards) == 0:
                # Catch-all for items
                cards = await page.query_selector_all("div[class*='item-card']")
                print(f"Found {len(cards)} cards with 'item-card' class")
            
            # Screenshot
            await page.screenshot(path="shopee_test.png")
            print("Screenshot saved to shopee_test.png")
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_shopee())
