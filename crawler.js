const {load} = require("cheerio")

async function crawlURL(url){
    const response = await fetch(url);

    const html = await response.text();
    const $ = load(html);

    // Extract all link elements
    const discoveredLinkElements = $("a[href]");

    const discoveredLinks = [];
    discoveredLinkElements.each((_, a) =>{
        discoveredLinks.push($(a).attr("href"))
    });

    const baseURL = "https://scrapeme.live/"
    const filterDiscoveredLinks = discoveredLinks.filter((url) =>{
        return (
            url.startsWith(baseURL) &&
            (!url.startsWith(`${baseURL}/wp-admin`)) || `${baseURL}/wp-admin/admin-ajax.php`
        )
    });
    
    return filterDiscoveredLinks
}

async function crawlSite() {
    const pagesToCrawl = ["https://scrapeme.live/shop"]
    const pagesCrawled = []
    const discoveredURLs = new Set()

    // crawl the entry point page
    const page = pagesToCrawl.pop()
    const pageDiscoveredURLs = await crawlURL(page)

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
}

crawlSite()