const express = require('express');
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();

app.get('/trending-keywords', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://trends.google.com/trends/trendingsearches/daily?geo=KR');
        await page.waitForSelector('.feed-item-container', { timeout: 60000 });
        const trendingKeywords = await page.evaluate(() => {
            const keywordElements = document.querySelectorAll('.feed-item-container .title-and-desc');
            return Array.from(keywordElements).map(element => element.textContent);
        });
        await browser.close();

        // Write the results to a CSV file
        const csvWriter = createCsvWriter({
            path: 'trending_keywords.csv',
            header: [
                { id: 'keyword', title: 'Keyword' }
            ]
        });

        const records = trendingKeywords.map(keyword => ({ keyword }));

        csvWriter.writeRecords(records)       // returns a promise
            .then(() => {
                console.log('...Done');
            });

        res.json(trendingKeywords);
    } catch (error) {
        console.log("An error has occurred: " + error);
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});




// Run the command npm init -y to create a package.json file
// Run the command npm i express puppeteer to install express and puppeteer
// Run the command node server.js to start the server.
//http://localhost:3000/trending-keywords 결과 값 보기