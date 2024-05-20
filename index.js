import puppeteer from "puppeteer";

const core = async () => {
    console.log("===== Core Start =====");

    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: true });
        console.log("Browser launched successfully.");

        console.log("Navigating to 'https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md'...");
        const page = await browser.newPage();
        await page.goto("https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md");
        console.log("Successfully navigated to 'https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md'.");

        console.log("Waiting for 'table' elements...");
        await page.waitForSelector("table");
        console.log("'table' elements located.");

        const emojis = await page.$$eval("tr", tableRow => {
            const data = [];

            for (const row of tableRow) {
                try {
                    const cells = row.cells;
                    const regexp = new RegExp(/\:\w{1,}\:/);
                    const emoji1 = { code: cells[2].innerHTML.match(regexp), ico: cells[1].innerHTML };
                    const emoji2 = { code: cells[4].innerHTML.match(regexp), ico: cells[3].innerHTML };
                    data.push(emoji1, emoji2);
                } catch (err) {
                    console.error(err);
                }
            }

            return data;
        })

        const emojisJSON = JSON.stringify(emojis);

        console.log(emojisJSON);

        setTimeout(async () => {
            console.log("Closing browser...");
            await browser.close();

            console.log("===== Core Finish =====");
        }, 5000);
    } catch (error) {
        console.error(error);
    }
};

core();