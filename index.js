import puppeteer from "puppeteer";
import { existsSync, mkdirSync, appendFileSync } from "node:fs";

const core = async () => {
    try {
        console.log("===== Emoji Scraper Start =====");

        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: true });
        console.log("Browser launched successfully.");

        const url = 'https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md';

        console.log(`Navigating to ${url}...`);
        const page = await browser.newPage();
        await page.goto(url);
        console.log(`Successfully navigated to ${url}.`);

        console.log("Searching page for emoji tables...");
        await page.waitForSelector("table");
        console.log("Emoji tables located.");

        console.log("Retrieving emoji table data");
        /* Go through every emoji table and get the each emoji's icon and shortcode(s)
           All emoji tables follow a simmilar structure:

            |  link  | ico | shortcode |  ico | shortcode | Link |
            |----------------------------------------------------|
            |   top  | 😀 | :grinning: |  😃 | :smiley:  | top  |
            |   top  | 😄 |	:smile:    |  😁 | :grin: 	 | top  |
            |   top  | 🤣 | :rofl: 	   |  😂 | :joy:     | top  |
        */
        const emojis = await page.$$eval("tr", tableRow => {
            const data = [];

            for (const row of tableRow) {
                try {
                    // Each table row consists of 6 cells.
                    const cells = row.cells;
                    const regexp = new RegExp(/\:\w{1,}\:/);

                    // Cells of index 1 and 2 consists of a single emoji.
                    // Cell 1 = emoji icon ; Cell 2 = emoji shortcode
                    let emojiCode = cells[2].innerHTML.match(regexp);
                    let innerHTML = cells[1].innerHTML;
                    let isSupportedEmoji = (emojiCode !== null) && (innerHTML.indexOf("<g-emoji") === -1) && (innerHTML.indexOf("<img") === -1);

                    // 'isSupportedEmoji' means the the emoji consists of a shortcode, an icon and is not a GitHub Custom Emoji.
                    if (isSupportedEmoji) {
                        const emoji1 = { code: emojiCode, ico: innerHTML };
                        data.push(emoji1);
                    }

                    // Cells of index 3 and 4 consist of another emoji
                    emojiCode = cells[4].innerHTML.match(regexp);
                    innerHTML = cells[3].innerHTML;
                    isSupportedEmoji = (emojiCode !== null) && (innerHTML.indexOf("<g-emoji") === -1) && (innerHTML.indexOf("<img") === -1);

                    if (isSupportedEmoji) {
                        const emoji2 = { code: emojiCode, ico: innerHTML };
                        data.push(emoji2);
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            return data;
        });

        console.log("Emoji data successfully retrieved.");

        console.log("Closing browser...");
        await browser.close();

        console.log("Stringifying emoji data into JSON format...");
        const emojisJSON = JSON.stringify(emojis, null, 2);

        const dir = "./out";
        const fileName = `emojis_${Date.now()}`;
        const ext = ".json";

        if (!existsSync(dir)) {
            console.log(`Creating '${dir}' directory...`);
            mkdirSync(dir);
        }

        console.log("Appending emoji data into JSON file...");
        appendFileSync(`${dir}/${fileName}${ext}`, emojisJSON);
        console.log(`File '${dir}/${fileName}${ext}' created successfully.`);

        console.log("Done! Have a nice day! :)");

        console.log("===== Emoji Scraper Finish =====");
    } catch (error) {
        console.error(error);
    }
};

core();