// JSON-LD 结构化数据 — Google rich snippet 用
// 在需要的页面用 <JsonLd data={...} /> 嵌入

const BASE_URL = "https://www.artifyslide.com";

export function JsonLd({ data }: { data: object | object[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}

// ── Schema 数据构造器 ───────────────────────────

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ArtifySlide",
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  description: "AI-powered presentation generator — turn words into premium magazine-style decks.",
  sameAs: ["https://x.com/ArtifySlide"],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@artifyslide.com",
    contactType: "Customer Support",
  },
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ArtifySlide",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI presentation generator that turns text into magazine-style horizontal HTML decks with conversational editing.",
  url: BASE_URL,
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "9.9",
      priceCurrency: "USD",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "9.9", priceCurrency: "USD", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "month" } },
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "19.9",
      priceCurrency: "USD",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "19.9", priceCurrency: "USD", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "month" } },
    },
    {
      "@type": "Offer",
      name: "Ultra",
      price: "49.9",
      priceCurrency: "USD",
      priceSpecification: { "@type": "UnitPriceSpecification", price: "49.9", priceCurrency: "USD", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "month" } },
    },
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ArtifySlide",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function pricingFaqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
