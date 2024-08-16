const {load} = require("cheerio")

async function crawlSite(){
    const response = await fetch("https://scrapeme.live/shop")
    const html = await response.text()
    const $ = load(html)
}

crawlSite();