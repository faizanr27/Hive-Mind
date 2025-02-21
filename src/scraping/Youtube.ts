import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs/promises';

puppeteer.use(StealthPlugin());


interface YoutubeInfo {
    title: string;
    description: string;
    content: string;
}

async function giveYoutubeInfo(link: string): Promise<YoutubeInfo> {
    const browser = await puppeteer.launch({
        headless: false, // Set to false for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        console.log("Navigating to the page...");
        await page.goto(link, { waitUntil: "networkidle2" });
        console.log("Page loaded");

        await page.screenshot({ path: 'page-loaded.png' }); // Debug screenshot

        // Extract title
        let title = await page.evaluate(() => {
            return document.querySelector("#title > h1")?.textContent?.trim() || "N/A";
        });
        console.log("Video Title:", title);

        // Click "Show More" button
        try {
            await page.waitForSelector("#bottom-row", { timeout: 5000 });
            await page.click("#bottom-row > #description");
            console.log("Clicked Show More");
        } catch (error) {
            console.warn("Show More button not found or not clickable:", error);
        }

        // Extract description
        let description = await page.evaluate(() => {
            return document.querySelector("#description-inline-expander > yt-attributed-string > span > span:nth-child(1)")?.textContent?.trim() || "N/A";
        });
        console.log("Video Description:", description);

        // Click transcript button
        try {
            await page.waitForSelector('#primary-button', { timeout: 5000 });
            await page.evaluate(() => window.scrollBy(0, 500));
            await page.evaluate(() => {
                (document.querySelector('#primary-button > ytd-button-renderer > yt-button-shape > button') as HTMLButtonElement)?.click();
            });
            await page.waitForSelector('#segments-container', { timeout: 5000 });
        } catch (error) {
            console.warn("Transcript button not found or not clickable:", error);
        }

        // Extract transcript
        let content = await page.$$eval(
            '#segments-container > ytd-transcript-segment-renderer',
            elements => elements.map(el => {
                return el.querySelector('div > yt-formatted-string')?.textContent?.trim() || "N/A";
            })
        );

        console.log(content.join("\n"));

        const finalText = `Title: ${title}\n\nDescription: ${description}\n\nTranscript:\n${content.join("\n")}`;
        await fs.writeFile('transcript.txt', finalText, 'utf-8');
        console.log("Transcript saved successfully.");

        await browser.close();

        return {
            title,
            description,
            content: content.join("\n")
        };
    } catch (error) {
        console.error("Error during page navigation or interaction:", error);
        await browser.close();
        return {
            title: "N/A",
            description: "N/A",
            content: "N/A"
        };
    }
}

export default giveYoutubeInfo;