/**
 * PostSEO — injects per-post HTML meta tags into document.head.
 *
 * Handles:
 *   • <title>
 *   • <meta name="description">
 *   • <link rel="canonical">
 *   • Open Graph (og:title, og:description, og:image, og:url, og:type)
 *   • Twitter Card (twitter:card, twitter:title, twitter:description, twitter:image)
 *
 * All tags are cleaned up on unmount so they don't bleed into other pages.
 */
import { useEffect } from "react";

interface PostSEOProps {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  publishedAt?: Date | null;
  authorName?: string;
}

function setMeta(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}

export function PostSEO({ title, description, url, image, publishedAt, authorName }: PostSEOProps) {
  useEffect(() => {
    const prevTitle = document.title;

    // <title>
    document.title = title;

    // Standard meta
    const descMeta = setMeta("description", description, true);
    const canonicalLink = setLink("canonical", url);

    // Open Graph
    const ogType = setMeta("og:type", "article");
    const ogTitle = setMeta("og:title", title);
    const ogDesc = setMeta("og:description", description);
    const ogUrl = setMeta("og:url", url);
    const ogImage = image ? setMeta("og:image", image) : null;

    // Article-specific OG
    const ogPublished = publishedAt
      ? setMeta("article:published_time", publishedAt.toISOString())
      : null;
    const ogAuthor = authorName ? setMeta("article:author", authorName) : null;

    // Twitter Card
    const twCard = setMeta("twitter:card", image ? "summary_large_image" : "summary", true);
    const twTitle = setMeta("twitter:title", title, true);
    const twDesc = setMeta("twitter:description", description, true);
    const twImage = image ? setMeta("twitter:image", image, true) : null;

    return () => {
      // Restore previous title
      document.title = prevTitle;

      // Remove tags that were added (leave pre-existing ones intact)
      const added = [
        descMeta, canonicalLink, ogType, ogTitle, ogDesc, ogUrl, ogImage,
        ogPublished, ogAuthor, twCard, twTitle, twDesc, twImage,
      ].filter(Boolean) as Element[];

      added.forEach((el) => {
        // Only remove if we created it (no pre-existing content attribute before mount)
        if (el.parentNode === document.head) {
          document.head.removeChild(el);
        }
      });
    };
  }, [title, description, url, image, publishedAt, authorName]);

  return null;
}
