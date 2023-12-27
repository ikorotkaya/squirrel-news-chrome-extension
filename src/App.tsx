import SearchBar from "./components/SearchBar";
import NewsBar from "./components/NewsBar";
import firebaseConfig from "../firebase-config.json";
import { useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { Article, useAppStore } from "./store";

firebase.initializeApp(firebaseConfig);

export default function App() {
  const { setArticles } = useAppStore();

  useEffect(() => {
    const fetchIssues = async () => {
      const db = firebase.firestore();

      try {
        const issuesSnapshot = await db
          .collection("issues")
          .where("language", "==", "en")
          .orderBy("publishedAt", "desc")
          .limit(1)
          .get();

        if (!issuesSnapshot.empty) {
          const lastIssueId = issuesSnapshot.docs[0].id;

          const articlesSnapshot = await db
            .collection("issues")
            .doc(lastIssueId)
            .collection("articles")
            .limit(4)
            .get();

          const articlesData = articlesSnapshot.docs.map((doc) => {
            const article = doc.data();

            return {
              id: doc.id,
              credit: article.credit,
              dateCreated: article.dateCreated?.seconds * 1000,
              image: article.imageUrl,
              language: article.language,
              source: article.source,
              teaser: article.teaser,
              title: article.title,
              url: article.url,
            };
          });

          setArticles(articlesData as Article[]);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };

    fetchIssues();
  }, [setArticles]);

  return (
    <div className="h-screen container font-lato">
      <SearchBar />
      <NewsBar />
    </div>
  );
}
