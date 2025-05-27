// pages/api/scrape.js
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { db } from '../../lib/firebase'; // Ensure correct path to firebase.js
import { collection, addDoc } from 'firebase/firestore';

puppeteer.use(StealthPlugin());

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Scraping logic
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000); // Increase timeout to 60 seconds
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto('https://remoteok.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('tr.job');
      return Array.from(jobElements).map((el) => ({
        title: el.querySelector('h2').innerText,
        company: el.querySelector('h3').innerText,
        link: el.querySelector('a').href,
        timestamp: new Date().toISOString(),
      })).slice(0, 10); // Limit to 10 for demo
    });

    await browser.close();

    // Store in Firestore
    console.log('Firestore instance:', db); // Debug log to check db
    for (const job of jobs) {
      await addDoc(collection(db, 'jobs'), job);
    }

    return res.status(200).json({ success: true, count: jobs.length });
  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({ error: 'Scraping failed' });
  }
}
