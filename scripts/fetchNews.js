import fs from "fs";
import Parser from "rss-parser";

const parser = new Parser();

const feeds = [
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://feeds.feedburner.com/TechCrunch/",
];

const fetchArticles = async () => {
  let allArticles = [];

  for (const feedURL of feeds) {
    try {
      const feed = await parser.parseURL(feedURL);

      feed.items.forEach((item) => {
        allArticles.push({
          title: item.title,
          description: item.contentSnippet || item.summary || "",
          link: item.link,
        });
      });

      if (allArticles.length >= 50) break;
    } catch (error) {
      console.error("Error fetching feed:", feedURL, error.message);
    }
  }

  allArticles = allArticles.slice(0, 50);

  return allArticles;
};

fetchArticles().then((articles) => {
  fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));
  console.log("Saved articles.json");
});
