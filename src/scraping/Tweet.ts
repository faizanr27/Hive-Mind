import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';

puppeteer.use(StealthPlugin());

interface TweetInfo {
  description: string;
  creatorName: string;
}

async function giveTweetInfo(link: string): Promise<TweetInfo> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req:any) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(link, { waitUntil: "domcontentloaded" });

  try {
    await page.waitForSelector('div[data-testid="tweetText"]', { visible: true });
    await page.waitForSelector('div[data-testid="User-Name"]', { visible: true });
  } catch (error) {
    console.error("Error waiting for selectors:", error);
    await browser.close();
    return { description: "N/A", creatorName: "N/A" };
  }

  const tweet = await page.$eval('div[data-testid="tweetText"]', el => el.textContent || "N/A").catch(() => "N/A");
  const username = await page.$eval('div[data-testid="User-Name"]', el => el.textContent || "N/A").catch(() => "N/A");

  await browser.close();

  const finalText = `UserName: ${username}\n\nTweet: ${tweet}`;
  await fs.writeFile('Tweet.txt', finalText, 'utf-8');
  console.log("Tweet saved successfully.");

  return { description: tweet, creatorName: username };
}

export default giveTweetInfo;