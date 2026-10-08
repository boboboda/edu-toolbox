import Link from "next/link";
import type { Listing } from "@/lib/listings";
import styles from "./listing.module.css";

type Props = {
  title: string;
  lead: string;
  items: Listing[];
  emptyText: string;
};

export default function ListingPage({ title, lead, items, emptyText }: Props) {
  return (
    <section className="container section">
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>{emptyText}</p>
          <div className={styles.actions}>
            <Link href="/request" className="btn btn-primary">
              필요한 걸 요청하기
            </Link>
            <Link href="/tools" className="btn btn-outline">
              도구함 보기
            </Link>
          </div>
        </div>
      ) : (
        <div className="card-row">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="tool-card"
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
              {item.tags && item.tags.length > 0 && (
                <div className="tags">
                  {item.tags.map((t) => (
                    <span key={t} className="tag tag-plain">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <span className="open-link">열기 →</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
