/**
 * StructuredData Component
 * 
 * Renders JSON-LD structured data for SEO and rich snippets in search results.
 * Supports BlogPosting, Organization, WebSite, HowTo, and FAQPage schemas.
 */

import { useEffect } from 'react';

interface BlogPostingProps {
  type: 'BlogPosting';
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}

interface OrganizationProps {
  type: 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[]; // Social media URLs
}

interface WebSiteProps {
  type: 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    type: 'SearchAction';
    target: string;
    queryInput: string;
  };
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

interface HowToProps {
  type: 'HowTo';
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration format (e.g., "PT30M" for 30 minutes)
  steps: HowToStep[];
  image?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageProps {
  type: 'FAQPage';
  items: FAQItem[];
}

type StructuredDataProps = BlogPostingProps | OrganizationProps | WebSiteProps | HowToProps | FAQPageProps;

export function StructuredData(props: StructuredDataProps) {
  let jsonLd: any;

  switch (props.type) {
    case 'BlogPosting':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: props.headline,
        description: props.description,
        author: {
          '@type': 'Person',
          name: props.author,
        },
        datePublished: props.datePublished,
        dateModified: props.dateModified || props.datePublished,
        image: props.image,
        url: props.url,
        publisher: {
          '@type': 'Organization',
          name: 'Pathfinder',
          logo: {
            '@type': 'ImageObject',
            url: 'https://vetcarepath-tzppwpga.manus.space/logo.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': props.url,
        },
      };
      break;

    case 'Organization':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: props.name,
        url: props.url,
        logo: props.logo,
        description: props.description,
        sameAs: props.sameAs || [],
      };
      break;

    case 'WebSite':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: props.name,
        url: props.url,
        description: props.description,
      };

      if (props.potentialAction) {
        jsonLd.potentialAction = {
          '@type': props.potentialAction.type,
          target: props.potentialAction.target,
          'query-input': props.potentialAction.queryInput,
        };
      }
      break;

    case 'HowTo':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: props.name,
        description: props.description,
        totalTime: props.totalTime,
        image: props.image,
        step: props.steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
          image: step.image,
        })),
      };
      break;

    case 'FAQPage':
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: props.items.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      };
      break;
  }

  useEffect(() => {
    // Add structured data to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    script.id = `structured-data-${props.type}`;
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById(`structured-data-${props.type}`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [jsonLd, props.type]);

  return null; // This component doesn't render anything visible
}
