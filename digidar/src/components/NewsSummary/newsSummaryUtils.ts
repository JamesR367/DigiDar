export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

const RSS_URL = "https://abcnews.go.com/abcnews/topstories";
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

export async function fetchNews(): Promise<NewsItem[]> {
  const response = await fetch(API_URL);
  const data = await response.json();

  if (data.status === "ok") {
    return data.items as NewsItem[];
  }

  throw new Error("Failed to fetch news");
}