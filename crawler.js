const {load} = require("cheerio")

async function crawlSite(){
    const response = await fetch("https://scrapeme.live/shop");
    const html = await response.text();
    const $ = load(html);

    // Extract all link elements
    const discoveredLinkElements = $("a[href]");

    const discoveredLinks = [];
    discoveredLinkElements.each((_, a) =>{
        discoveredLinks.push($(a).attr("href"))
    });
}

crawlSite();