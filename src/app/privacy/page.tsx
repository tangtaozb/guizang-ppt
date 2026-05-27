"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n";

const EFFECTIVE_DATE = "2026-05-27";

export default function PrivacyPage() {
  const { locale } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="text-lg font-bold tracking-tight">
            One<span className="text-accent">PPT</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 prose-content">
        {locale === "zh" ? (
        /* 中文版 */
        <section className="scroll-mt-20">
          <h1 className="text-3xl font-bold mb-2">隐私政策</h1>
          <p className="text-sm text-muted-foreground mb-10">
            生效日期：{EFFECTIVE_DATE}
          </p>

          <p className="mb-6 leading-relaxed">
            我们（以下简称 “One PPT” 或 “我们”）非常重视用户的隐私和个人信息保护。
            本隐私政策说明我们在你使用 One PPT 服务（包括网站 oneppt.com 及相关功能）时，
            如何收集、使用、存储、共享和保护你的信息。
          </p>

          <Section title="1. 我们收集的信息">
            <p>我们仅收集为提供服务所必需的信息：</p>
            <ul>
              <li><strong>账户信息</strong>：电子邮箱地址、登录验证码。</li>
              <li><strong>使用内容</strong>：你输入用于生成 PPT 的文本内容、与 AI 的对话记录、生成的 PPT 文件。这些内容用于向你交付服务，不会被用于训练第三方模型。</li>
              <li><strong>设备与日志</strong>：IP 地址、浏览器类型、设备型号、访问时间、页面浏览记录等技术信息。</li>
              <li><strong>支付信息</strong>：你的支付凭证（信用卡号、银行卡信息等）<strong>由我们的支付处理商 Creem（Merchant of Record）独立收集与存储，One PPT 本身不会接触或保存任何支付卡信息</strong>。我们仅接收 Creem 返回的订单号、支付状态、商品 ID。</li>
              <li><strong>Cookie</strong>：用于维持登录状态和分析网站使用情况。</li>
            </ul>
          </Section>

          <Section title="2. 信息的使用目的">
            <ul>
              <li>提供、维护和改进 One PPT 服务；</li>
              <li>处理订单、订阅与账户管理；</li>
              <li>客户支持与通知发送；</li>
              <li>检测和预防欺诈、滥用与违法行为；</li>
              <li>分析服务使用情况以优化体验。</li>
            </ul>
          </Section>

          <Section title="3. 第三方服务">
            <p>为提供服务，我们与以下第三方共享必要的信息：</p>
            <ul>
              <li><strong>Creem.io</strong>：支付处理与 Merchant of Record，处理你的支付与税务合规。</li>
              <li><strong>Supabase</strong>：数据库与身份认证服务。</li>
              <li><strong>大型语言模型服务商</strong>（如 OpenAI、Anthropic 等）：用于 PPT 内容生成。</li>
              <li><strong>Vercel</strong>：网站托管与内容分发。</li>
              <li><strong>邮件发送服务</strong>：用于发送验证码与服务通知。</li>
            </ul>
            <p>除上述情形外，我们不会将你的个人信息出售或出租给任何第三方。</p>
          </Section>

          <Section title="4. 数据存储与保留">
            <p>
              我们将你的账户数据保留到你主动删除账户为止。删除账户后，相关数据将在 30 天内从主数据库中清除，
              备份系统中的数据将在 90 天内一并删除。
              你输入的文本内容与生成结果默认保留在你的账户中，你可在仪表板内手动删除。
            </p>
          </Section>

          <Section title="5. 你的权利">
            <p>你享有以下权利：</p>
            <ul>
              <li>访问和导出你的个人信息；</li>
              <li>更正不准确的信息；</li>
              <li>删除账户与全部数据；</li>
              <li>撤回授权同意；</li>
              <li>欧盟用户：GDPR 项下的全部权利；加州居民：CCPA 项下的全部权利。</li>
            </ul>
            <p>如需行使权利，请发送邮件至 <a href="mailto:support@oneppt.com">support@oneppt.com</a>。</p>
          </Section>

          <Section title="6. Cookie">
            <p>
              我们使用必要 Cookie 维持登录状态，使用分析类 Cookie 了解服务使用情况。
              你可以通过浏览器设置禁用 Cookie，但这可能导致部分功能无法正常使用。
            </p>
          </Section>

          <Section title="7. 儿童隐私">
            <p>
              One PPT 不面向 13 岁以下的儿童提供服务。
              我们不会有意收集 13 岁以下儿童的个人信息。
            </p>
          </Section>

          <Section title="8. 国际数据传输">
            <p>
              你的数据可能在中国大陆与海外（包括欧盟、美国等）的服务器之间传输与存储。
              我们采取合理的安全措施保护跨境传输的数据。
            </p>
          </Section>

          <Section title="9. 数据安全">
            <p>
              我们采用 HTTPS 加密传输、数据库加密存储、最小化访问权限等技术与管理措施保护你的信息，
              但请注意，互联网传输不存在绝对安全的方式。
            </p>
          </Section>

          <Section title="10. 政策更新">
            <p>
              我们可能不时更新本隐私政策。如有重大变更，我们将通过邮件或站内通知方式告知你。
              继续使用服务视为接受更新后的政策。
            </p>
          </Section>

          <Section title="11. 联系我们">
            <p>
              如对本政策有任何疑问、投诉或请求，请联系：<br />
              邮箱：<a href="mailto:support@oneppt.com">support@oneppt.com</a><br />
              我们将在 2 个工作日内回复。
            </p>
          </Section>
        </section>
        ) : (
        /* English Version */
        <section className="scroll-mt-20">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Effective Date: {EFFECTIVE_DATE}
          </p>

          <p className="mb-6 leading-relaxed">
            We (&quot;One PPT&quot;, &quot;we&quot;, &quot;us&quot;) respect your privacy. This Privacy Policy
            explains how we collect, use, store, share, and protect your information when you use
            One PPT services (the website oneppt.com and related features).
          </p>

          <Section title="1. Information We Collect">
            <p>We collect only the information necessary to provide our service:</p>
            <ul>
              <li><strong>Account information</strong>: Email address and login verification codes.</li>
              <li><strong>Content you provide</strong>: Text input used to generate slides, chat history with AI, and generated PPT files. This content is used solely to deliver the service to you and is not used to train third-party models.</li>
              <li><strong>Device and log data</strong>: IP address, browser type, device model, access timestamps, page views, and similar technical information.</li>
              <li><strong>Payment information</strong>: Your payment credentials (card numbers, bank details, etc.) are <strong>collected and stored exclusively by our payment processor Creem (Merchant of Record). One PPT does not access, store, or process any payment card information.</strong> We only receive the order ID, payment status, and product ID returned by Creem.</li>
              <li><strong>Cookies</strong>: Used to maintain login sessions and analyze service usage.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <ul>
              <li>To provide, maintain, and improve the One PPT service;</li>
              <li>To process orders, subscriptions, and account management;</li>
              <li>To provide customer support and send service notifications;</li>
              <li>To detect and prevent fraud, abuse, and illegal activity;</li>
              <li>To analyze service usage and optimize the user experience.</li>
            </ul>
          </Section>

          <Section title="3. Third-Party Services">
            <p>We share necessary information with the following third parties to deliver the service:</p>
            <ul>
              <li><strong>Creem.io</strong> — Payment processor and Merchant of Record, handling all payment processing and tax compliance.</li>
              <li><strong>Supabase</strong> — Database and authentication infrastructure.</li>
              <li><strong>Large Language Model providers</strong> (such as OpenAI, Anthropic) — Used for AI-powered PPT generation.</li>
              <li><strong>Vercel</strong> — Website hosting and content delivery.</li>
              <li><strong>Transactional email providers</strong> — Used to deliver verification codes and service notifications.</li>
            </ul>
            <p>We do not sell or rent your personal information to any third party.</p>
          </Section>

          <Section title="4. Data Storage and Retention">
            <p>
              We retain your account data until you delete your account. Upon account deletion,
              your data is removed from our primary database within 30 days and from backup systems within 90 days.
              Content you input and generated outputs remain in your account by default and can be manually deleted at any time through the dashboard.
            </p>
          </Section>

          <Section title="5. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li>Access and export your personal information;</li>
              <li>Correct inaccurate information;</li>
              <li>Delete your account and all associated data;</li>
              <li>Withdraw your consent at any time;</li>
              <li>EU residents have full rights under the GDPR; California residents have full rights under the CCPA, including the right to opt out of the sale of personal information (note: we do not sell personal information).</li>
            </ul>
            <p>To exercise any of these rights, email <a href="mailto:support@oneppt.com">support@oneppt.com</a>.</p>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use essential cookies to maintain login sessions and analytical cookies to understand
              service usage. You may disable cookies in your browser settings, but some features may not work properly.
            </p>
          </Section>

          <Section title="7. Children&apos;s Privacy">
            <p>
              One PPT is not intended for children under the age of 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected such information, please contact us.
            </p>
          </Section>

          <Section title="8. International Data Transfers">
            <p>
              Your data may be transferred and stored on servers located in mainland China and overseas
              (including the EU, United States, etc.). We implement reasonable safeguards to protect cross-border data transfers.
            </p>
          </Section>

          <Section title="9. Data Security">
            <p>
              We use HTTPS encryption in transit, encryption at rest, and minimum-privilege access controls
              to protect your data. No method of internet transmission is 100% secure, however.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. For material changes, we will notify you
              via email or in-product notice. Continued use of the service constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For questions, complaints, or requests regarding this policy, contact:<br />
              Email: <a href="mailto:support@oneppt.com">support@oneppt.com</a><br />
              We respond within 2 business days.
            </p>
          </Section>
        </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3 mt-8">{title}</h2>
      <div className="text-[15px] leading-relaxed text-foreground/80 space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-accent [&_a]:underline">
        {children}
      </div>
    </section>
  );
}
