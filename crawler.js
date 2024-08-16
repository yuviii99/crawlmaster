const {load} = require("cheerio")
const fs = require("fs/promises")
const os = require("os")

async function crawlURL(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = load(html);

        // Extract all link elements
        const discoveredLinkElements = $("a[href]");
        const discoveredLinks = [];

        discoveredLinkElements.each((_, a) => {
            const href = $(a).attr("href");
            
            if (href) {
                // Only proceed if the href is not empty
                try {
                    const absoluteUrl = new URL(href, url).href; // Normalize to absolute URL
                    discoveredLinks.push(absoluteUrl);
                } catch (err) {
                    console.error(`Skipping invalid URL: ${href}`);
                }
            }
        });

        const baseURL = "https://scrapeme.live/";
        const filteredDiscoveredLinks = discoveredLinks.filter((link) => {
            return (
                link.startsWith(baseURL) &&
                !link.startsWith(`${baseURL}/wp-admin`) &&
                !link.includes("wp-admin/admin-ajax.php")
            );
        });

        return filteredDiscoveredLinks;
    } catch (error) {
        console.error(`Failed to crawl ${url}: ${error}`);
        return [];
    }
}

async function crawlSite() {
    const pagesToCrawl = ["https://scrapeme.live/shop"]
    const pagesCrawled = []
    const discoveredURLs = new Set()

    // Crawling Logic
    while(
        pagesToCrawl.length !== 0 && discoveredURLs.size <= 300
    ){
        const currentPage = pagesToCrawl.pop()
        console.log(`Crawling Page: ${currentPage}`)

        const pageDiscoveredURLs = await crawlURL(currentPage)
        pageDiscoveredURLs.forEach(url => {
            discoveredURLs.add(url)
            if(
                !pagesCrawled.includes(url) && url!== currentPage
            ){
                pagesToCrawl.push(url)
            }
        })
        console.log(`${pageDiscoveredURLs.length} URLs found`)

        pagesCrawled.push(currentPage)
        console.log(`${discoveredURLs.size} URLs discovered so far...`)
    }

    const csvContent = [...discoveredURLs].join(os.EOL)
    // export the CSV string to an output file
    await fs.writeFile("output.csv", csvContent)

    
}

crawlSite()