"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n";

const EFFECTIVE_DATE = "2026-05-27";

export default function TermsPage() {
  const { locale } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Artify<span className="text-accent">Slide</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="flex-1 mx-auto max-w-3xl px-6 py-16 prose-content">
        {locale === "zh" ? (
        /* 中文版 */
        <section className="scroll-mt-20">
          <h1 className="text-3xl font-bold mb-2">服务条款</h1>
          <p className="text-sm text-muted-foreground mb-10">
            生效日期：{EFFECTIVE_DATE}
          </p>

          <p className="mb-6 leading-relaxed">
            欢迎使用 Artify Slide。本服务条款（以下简称 “本条款”）是你与 Artify Slide 之间就使用 Artify Slide 服务
            （包括网站 artifyslide.com 及相关功能，以下统称 “服务”）所订立的协议。
            注册账户、订阅或使用本服务即表示你已阅读、理解并同意本条款。
          </p>

          <Section title="1. 服务说明">
            <p>
              Artify Slide 提供基于人工智能的演示文稿生成服务，主要功能包括：
            </p>
            <ul>
              <li>输入文本素材，由 AI 自动生成杂志风格的横向翻页 PPT；</li>
              <li>通过自然语言对话调整与编辑 PPT 内容；</li>
              <li>下载生成结果为独立的 HTML 文件；</li>
              <li>项目历史管理。</li>
            </ul>
          </Section>

          <Section title="2. 账户注册">
            <ul>
              <li>你须年满 13 周岁方可注册和使用本服务，未满 18 周岁者须在监护人同意下使用。</li>
              <li>注册时须提供真实、准确的电子邮箱，并妥善保管账户与登录凭证。</li>
              <li>因账户被他人使用而产生的责任由账户持有人承担。</li>
            </ul>
          </Section>

          <Section title="3. 用户行为规范">
            <p>你同意在使用服务时不得：</p>
            <ul>
              <li>上传、生成或传播违反法律法规、侵犯他人权利、涉及色情、暴力、仇恨或欺诈的内容；</li>
              <li>逆向工程、爬取、滥用 API 或绕过任何使用限制；</li>
              <li>转售、转让或滥用账户；</li>
              <li>利用服务从事任何对他人或我方造成损害的活动。</li>
            </ul>
            <p>违反上述规定的，我们有权暂停或终止你的账户而不予退款。</p>
          </Section>

          <Section title="4. 知识产权">
            <ul>
              <li>你保留对自己输入的原始素材的全部权利。</li>
              <li>对于 AI 生成的 PPT 文件，你享有商业和非商业用途的使用权。</li>
              <li>Artify Slide 网站、品牌、UI 设计、模板、代码与文档归 Artify Slide 所有，未经授权不得复制、修改或再发行。</li>
            </ul>
          </Section>

          <Section title="5. 付款与订阅">
            <p>
              本服务通过 <strong>Creem.io</strong>（Merchant of Record）处理所有支付。
              当你完成购买时，Creem 作为销售方代我们收取款项并承担相应税务责任。
              支付卡信息由 Creem 独立收集与存储，Artify Slide 不会接触你的支付凭证。
            </p>
            <p>当前提供的计费方式包括：</p>
            <ul>
              <li><strong>入门版（Starter）</strong>：$9.9 / 月，每月 4,500 积分（约可生成 180 份 PPT），月度自动续费至取消；</li>
              <li><strong>专业版（Pro）</strong>：$19.9 / 月，每月 10,000 积分（约可生成 400 份 PPT），月度自动续费至取消；</li>
              <li><strong>Ultra</strong>：$49.9 / 月，每月 25,000 积分（约可生成 1,000 份 PPT），月度自动续费至取消。</li>
            </ul>
            <p>
              订阅在每个计费周期开始时通过 Creem 自动扣款。你可随时在账户中取消订阅，取消后服务将持续到当前计费周期结束。
              我们保留调整价格的权利，价格变更将提前 7 日通知现有订阅用户。
            </p>
          </Section>

          <Section title="6. 退款政策">
            <p>
              我们重视用户体验，提供以下退款条件：
            </p>
            <ul>
              <li><strong>14 天无理由退款</strong>：自付款或续费成功之日起 14 天内，若你<strong>尚未消耗任何积分</strong>，可申请全额退款。</li>
              <li><strong>订阅续费</strong>：自动续费后 14 天内，且自上一次扣费起<strong>未消耗任何积分</strong>的，可申请退款。</li>
              <li><strong>不予退款的情形</strong>：超过 14 天的订单、当前计费周期已消耗过任何积分（含已生成 PPT 等任何付费操作）、违反本条款被终止账户的情形。</li>
            </ul>
            <p>
              退款流程：发送邮件至 <a href="mailto:support@artifyslide.com">support@artifyslide.com</a>，
              说明订单号与退款原因。我们将在 3 个工作日内审核并协调 Creem 处理退款，
              款项通常会在 5–10 个工作日内原路返回。
            </p>
          </Section>

          <Section title="7. AI 生成内容的免责声明">
            <p>
              Artify Slide 使用第三方大型语言模型生成内容。AI 生成的结果可能包含错误、不准确或不适当的内容，
              你应自行审核并对最终用途负责。我们不对生成内容的准确性、适用性或合法性作出保证。
            </p>
          </Section>

          <Section title="8. 服务可用性">
            <p>
              我们尽力维持服务的稳定可用，但<strong>按 “现状”（AS IS）提供服务</strong>，
              不对持续可用性、无错误运行或满足你的特定需求作出明示或默示的保证。
              我们可能因维护、升级或不可抗力因素临时中断服务。
            </p>
          </Section>

          <Section title="9. 责任限制">
            <p>
              在法律允许的最大范围内，对于因使用或无法使用服务所产生的任何间接、附带、特殊或后果性损害，
              Artify Slide 不承担责任。我们的总责任上限不超过你在事件发生前 6 个月内向我们支付的费用总额。
            </p>
          </Section>

          <Section title="10. 服务终止">
            <p>
              你可随时停止使用并删除账户。我们也可在你严重违反本条款时单方终止你的账户，
              并保留追究法律责任的权利。
            </p>
          </Section>

          <Section title="11. 适用法律与争议解决">
            <p>
              本条款适用中华人民共和国法律。因本条款产生的争议，双方应先友好协商解决；
              协商不成的，提交至 Artify Slide 运营所在地有管辖权的法院诉讼解决。
            </p>
          </Section>

          <Section title="12. 条款变更">
            <p>
              我们可能不时修订本条款。重大变更将通过站内通知或邮件方式提前告知。
              你在条款变更后继续使用服务，视为接受新版条款。
            </p>
          </Section>

          <Section title="13. 联系我们">
            <p>
              如对本条款有任何疑问，请联系：<br />
              邮箱：<a href="mailto:support@artifyslide.com">support@artifyslide.com</a>
            </p>
          </Section>
        </section>
        ) : (
        /* English Version */
        <section className="scroll-mt-20">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Effective Date: {EFFECTIVE_DATE}
          </p>

          <p className="mb-6 leading-relaxed">
            Welcome to Artify Slide. These Terms of Service (the &quot;Terms&quot;) form a binding
            agreement between you and Artify Slide regarding your use of the Artify Slide service
            (the website artifyslide.com and related features, collectively the &quot;Service&quot;).
            By registering, subscribing to, or using the Service, you acknowledge that you have
            read, understood, and agree to be bound by these Terms.
          </p>

          <Section title="1. The Service">
            <p>Artify Slide provides an AI-powered presentation generation service, including:</p>
            <ul>
              <li>Generating magazine-style horizontal-swipe presentations from text input;</li>
              <li>Natural-language conversational editing of generated slides;</li>
              <li>Downloading the output as standalone HTML files;</li>
              <li>Project history management.</li>
            </ul>
          </Section>

          <Section title="2. Account Registration">
            <ul>
              <li>You must be at least 13 years old to register. Users under 18 must have parental or guardian consent.</li>
              <li>You agree to provide accurate email information and to keep your account credentials secure.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </Section>

          <Section title="3. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Upload, generate, or distribute content that is illegal, infringes the rights of others, or that is pornographic, violent, hateful, or fraudulent;</li>
              <li>Reverse-engineer, scrape, abuse the API, or circumvent any usage limits;</li>
              <li>Resell, transfer, or otherwise misuse your account;</li>
              <li>Use the Service to engage in any activity that causes harm to others or to us.</li>
            </ul>
            <p>We may suspend or terminate your account without refund for violations of this section.</p>
          </Section>

          <Section title="4. Intellectual Property">
            <ul>
              <li>You retain all rights to the original material you input.</li>
              <li>You own the AI-generated PPT outputs and may use them for both commercial and non-commercial purposes.</li>
              <li>The Artify Slide website, brand, UI design, templates, code, and documentation are the property of Artify Slide and may not be copied, modified, or redistributed without authorization.</li>
            </ul>
          </Section>

          <Section title="5. Payment and Subscriptions">
            <p>
              All payments are processed by <strong>Creem.io</strong>, which acts as the Merchant of Record
              for purchases made through Artify Slide. Creem collects payment on our behalf and assumes responsibility
              for applicable taxes. <strong>Payment card information is collected and stored exclusively by Creem;
              Artify Slide does not access or retain any payment credentials.</strong>
            </p>
            <p>Current pricing options:</p>
            <ul>
              <li><strong>Starter</strong>: $9.9 / month, 4,500 credits per month (approximately 180 deck generations), auto-renews monthly until canceled;</li>
              <li><strong>Pro</strong>: $19.9 / month, 10,000 credits per month (approximately 400 deck generations), auto-renews monthly until canceled;</li>
              <li><strong>Ultra</strong>: $49.9 / month, 25,000 credits per month (approximately 1,000 deck generations), auto-renews monthly until canceled.</li>
            </ul>
            <p>
              Subscriptions are billed automatically by Creem at the start of each billing cycle.
              You may cancel anytime in your account; access continues through the end of the current cycle.
              We reserve the right to adjust pricing with at least 7 days&apos; prior notice to existing subscribers.
            </p>
          </Section>

          <Section title="6. Refund Policy">
            <p>We offer the following refund terms:</p>
            <ul>
              <li><strong>14-day money-back guarantee</strong>: You may request a full refund within 14 days of payment or renewal if you have <strong>not consumed any credits</strong>.</li>
              <li><strong>Subscription renewals</strong>: Refundable within 14 days of the renewal date if <strong>no credits have been consumed</strong> since the most recent charge.</li>
              <li><strong>Non-refundable cases</strong>: Orders made more than 14 days ago, subscriptions where any credits in the current billing cycle have already been consumed (including any PPT generation or other paid action), and accounts terminated for violation of these Terms.</li>
            </ul>
            <p>
              To request a refund, email <a href="mailto:support@artifyslide.com">support@artifyslide.com</a> with your order ID and reason.
              We will review within 3 business days and coordinate with Creem to process the refund.
              Funds typically appear via the original payment method within 5–10 business days.
            </p>
          </Section>

          <Section title="7. AI-Generated Content Disclaimer">
            <p>
              Artify Slide relies on third-party large language models to generate content. AI output may contain
              errors, inaccuracies, or inappropriate material. You are responsible for reviewing the output
              and for any use you make of it. We make no warranty as to the accuracy, suitability, or legality
              of generated content.
            </p>
          </Section>

          <Section title="8. Service Availability">
            <p>
              We strive to keep the Service available and reliable, but the Service is provided <strong>&quot;AS IS&quot;</strong>
              without express or implied warranties of continuous availability, error-free operation, or
              fitness for a particular purpose. We may temporarily suspend the Service for maintenance,
              upgrades, or force majeure events.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Artify Slide shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of or inability to use the Service.
              Our total aggregate liability shall not exceed the amount you paid us in the 6 months preceding the event.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              You may stop using the Service and delete your account at any time. We may unilaterally
              terminate your account for serious violations of these Terms and reserve the right to pursue
              legal remedies.
            </p>
          </Section>

          <Section title="11. Governing Law and Disputes">
            <p>
              These Terms are governed by the laws of the People&apos;s Republic of China. Any dispute arising from
              these Terms shall first be resolved through good-faith negotiation; failing that, it shall be
              submitted to the competent court in the jurisdiction where Artify Slide operates.
            </p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>
              We may revise these Terms from time to time. Material changes will be communicated via
              in-product notice or email with advance notice. Your continued use of the Service after the
              effective date of the revised Terms constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              For questions regarding these Terms, contact:<br />
              Email: <a href="mailto:support@artifyslide.com">support@artifyslide.com</a>
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
