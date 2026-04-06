import { useEffect, useState } from "react";
import "./NewsSummary.css";
import LeftArrow from "../../assets/leftArrow.svg?react";
import RightArrow from "../../assets/rightArrow.svg?react";
import type { NewsItem } from "../../utils/newsSummaryUtils";
import { fetchNews } from "../../utils/newsSummaryUtils";

function NewsSummary() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const [error, setError] = useState("");
  const [goingRight, setGoingRight] = useState(true);
  const [animationTrigger, setAnimationTrigger] = useState(true);

  useEffect(() => {
    fetchNews()
      .then((items) => setNews(items))
      .catch((err) => setError("Error fetching news: " + err));
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      changeArticle(1);
    }, 11000);

    return () => clearInterval(intervalId);
  }, [newsIndex, news.length]);

  if (error) return <div>Error: {error}</div>;

  const changeArticle = (direction: number) => {
    switch (true) {
      case newsIndex === news.length - 1 && direction > 0:
        setGoingRight(true);
        setNewsIndex(0);
        break;
      case newsIndex === 0 && direction < 0:
        setGoingRight(false);
        setNewsIndex(news.length - 1);
        break;
      case direction === 1:
        setGoingRight(true);
        setNewsIndex(newsIndex + direction);
        break;
      case direction === -1:
        setGoingRight(false);
        setNewsIndex(newsIndex + direction);
        break;
      default:
        break;
    }
    setAnimationTrigger(!animationTrigger);
  };

  return (
    <div className="NewsSummary-container">
      <div className="NewsSummary-nav-container">
        <a
          className="direction-arrow-container"
          onClick={() => changeArticle(-1)}
        >
          <LeftArrow className="direction-arrow" />
        </a>
        <div
          className={
            goingRight
              ? "NewsSummary-content-right"
              : "NewsSummary-content-left"
          }
          key={String(animationTrigger)}
        >
          <h2>ABC Latest News</h2>
          <h3>{news.at(newsIndex)?.title}</h3>
          <p>{news.at(newsIndex)?.description}</p>
        </div>
        <a
          className="direction-arrow-container"
          onClick={() => changeArticle(1)}
        >
          <RightArrow className="direction-arrow" />
        </a>
      </div>
    </div>
  );
}

export default NewsSummary;
