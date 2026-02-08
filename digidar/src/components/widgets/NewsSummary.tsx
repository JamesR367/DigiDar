import { useEffect, useState } from "react";
import "../../styles/NewsSummary.css";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function NewsSummary() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const RSS_URL = "https://abcnews.go.com/abcnews/topstories";
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

        const response = await fetch(API_URL);
        const data = await response.json();

        console.log(data);
        if (data.status === "ok") {
          setNews(data.items);
        } else {
          setError("Failed to fetch news");
        }
      } catch (err) {
        setError("Error fetching news: " + err);
      }
    };

    fetchNews();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="NewsSummary-container">
      <h2>ABC Latest News</h2>
      <h3>{news.at(0)?.title}</h3>
      <p>{news.at(0)?.description}</p>
      <a href={news.at(0)?.link} target="_blank" rel="noopener noreferrer">
        Read More
      </a>
    </div>
  );
}

export default NewsSummary;
