"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n";

const EFFECTIVE_DATE = "2026-05-27";

export default function RefundPage() {
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
          <h1 className="text-3xl font-bold mb-2">退款政策</h1>
          <p className="text-sm text-muted-foreground mb-10">
            生效日期：{EFFECTIVE_DATE}
          </p>

          <p className="mb-6 leading-relaxed">
            我们希望你对 Artify Slide 的体验是值得的。如果你不满意，本退款政策说明你可以在何种条件下、
            通过何种流程申请退款。所有付款由 <strong>Creem.io</strong>（Merchant of Record）处理，
            退款由我们与 Creem 协同执行。
          </p>

          <Section title="1. 14 天满意保证">
            <p>
              自付款成功之日起 <strong>14 天内</strong>，如果你<strong>尚未使用</strong>所购买的任何付费功能，
              可以申请<strong>全额退款</strong>。我们将原路退回至你的原始支付方式。
            </p>
          </Section>

          <Section title="2. 各计费方式的退款条件">
            <ul>
              <li>
                <strong>入门版 Starter（$9.9 / 月，500 积分 / 月）</strong>：首次付款或自动续费成功后 14 天内、
                且自该计费周期起<strong>未消耗任何积分</strong>的，可全额退款。
              </li>
              <li>
                <strong>专业版 Pro（$19.9 / 月，1,500 积分 / 月）</strong>：首次付款或自动续费成功后 14 天内、
                且自该计费周期起<strong>未消耗任何积分</strong>的，可全额退款。
              </li>
              <li>
                <strong>团队版 Team（$49.9 / 月，5,000 积分 / 月）</strong>：首次付款或自动续费成功后 14 天内、
                且自该计费周期起<strong>未消耗任何积分</strong>的，可全额退款。
              </li>
            </ul>
          </Section>

          <Section title="3. 不予退款的情形">
            <p>以下情形我们无法提供退款：</p>
            <ul>
              <li>付款超过 14 天的订单；</li>
              <li>付费功能已被使用过（即便仅使用过一次）；</li>
              <li>账户因违反<Link href="/terms">服务条款</Link>被终止；</li>
              <li>同一用户存在反复购买并申请退款的滥用行为；</li>
              <li>已通过其他渠道（如信用卡 chargeback）获得退款的订单。</li>
            </ul>
          </Section>

          <Section title="4. 退款申请流程">
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                发送邮件至 <a href="mailto:support@artifyslide.com">support@artifyslide.com</a>，
                邮件主题写明 “退款申请”；
              </li>
              <li>
                邮件正文请提供：<br />
                · 注册邮箱<br />
                · Creem 订单号（在购买确认邮件中可找到）<br />
                · 购买的套餐类型<br />
                · 退款原因（简单一两句即可）；
              </li>
              <li>我们将在 <strong>3 个工作日内</strong>完成审核并回复；</li>
              <li>审核通过后，由我们与 Creem 共同发起退款；</li>
              <li>
                退款通常会在 <strong>5–10 个工作日内</strong>按原支付路径返回到你的账户
                （信用卡、支付宝、微信等具体到账时间以发卡行 / 钱包为准）。
              </li>
            </ol>
          </Section>

          <Section title="5. 部分退款与按比例退款">
            <p>
              月度订阅一般不提供按剩余天数的部分退款。若你取消订阅，
              已付费的服务期会持续到当前计费周期结束，期间你仍可正常使用，
              到期后不再续费即可。本周期内未使用的积分到期作废，不滚存至下一周期。
            </p>
          </Section>

          <Section title="6. 信用卡争议（Chargeback）">
            <p>
              如果你认为存在未授权的付款，建议先发邮件联系我们处理，通常我们能在更短时间内为你解决。
              直接向发卡行发起 chargeback 而未先联系我们的，可能导致账户被暂停。
            </p>
          </Section>

          <Section title="7. 汇率与手续费">
            <p>
              退款金额以原币种、原支付通道返回。如因汇率波动产生差额，
              Artify Slide 与 Creem 均不承担补差责任。Creem 不向你收取额外的退款手续费。
            </p>
          </Section>

          <Section title="8. 政策变更">
            <p>
              我们可能不时更新本退款政策。重大变更将在网站发布并通过邮件通知现有用户。
              已发起的退款申请按申请时点适用的版本处理。
            </p>
          </Section>

          <Section title="9. 联系我们">
            <p>
              退款相关问题请联系：<br />
              邮箱：<a href="mailto:support@artifyslide.com">support@artifyslide.com</a><br />
              我们将在 2 个工作日内回复。
            </p>
          </Section>
        </section>
        ) : (
        /* English Version */
        <section className="scroll-mt-20">
          <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Effective Date: {EFFECTIVE_DATE}
          </p>

          <p className="mb-6 leading-relaxed">
            We want your experience with Artify Slide to be worth it. This Refund Policy explains
            when and how you can request a refund. All payments are processed by{" "}
            <strong>Creem.io</strong> as our Merchant of Record, and refunds are issued jointly
            by us and Creem.
          </p>

          <Section title="1. 14-Day Satisfaction Guarantee">
            <p>
              You may request a <strong>full refund within 14 days</strong> of payment, provided
              you have <strong>not used</strong> any of the paid features included in the purchase.
              Refunds are returned via the original payment method.
            </p>
          </Section>

          <Section title="2. Refund Eligibility by Plan">
            <ul>
              <li>
                <strong>Starter ($9.9 / month, 500 credits / month)</strong>: Refundable within 14 days of
                initial payment or auto-renewal, provided <strong>no credits have been consumed</strong>{" "}
                in the current billing cycle.
              </li>
              <li>
                <strong>Pro ($19.9 / month, 1,500 credits / month)</strong>: Refundable within 14 days of
                initial payment or auto-renewal, provided <strong>no credits have been consumed</strong>{" "}
                in the current billing cycle.
              </li>
              <li>
                <strong>Team ($49.9 / month, 5,000 credits / month)</strong>: Refundable within 14 days of
                initial payment or auto-renewal, provided <strong>no credits have been consumed</strong>{" "}
                in the current billing cycle.
              </li>
            </ul>
          </Section>

          <Section title="3. Non-Refundable Cases">
            <p>Refunds will not be issued in the following situations:</p>
            <ul>
              <li>Orders paid more than 14 days ago;</li>
              <li>Paid features have been used (even once);</li>
              <li>Accounts terminated for violating the <Link href="/terms">Terms of Service</Link>;</li>
              <li>Repeated purchase-and-refund abuse by the same user;</li>
              <li>Orders for which a refund has already been obtained through other channels (such as a credit card chargeback).</li>
            </ul>
          </Section>

          <Section title="4. How to Request a Refund">
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                Email <a href="mailto:support@artifyslide.com">support@artifyslide.com</a> with the subject
                line &quot;Refund Request&quot;.
              </li>
              <li>
                In the body of the email, include:<br />
                · Your registered email address<br />
                · Your Creem order ID (found in your purchase confirmation email)<br />
                · The plan you purchased<br />
                · A brief reason for the refund.
              </li>
              <li>We will review and respond within <strong>3 business days</strong>.</li>
              <li>Upon approval, we will initiate the refund jointly with Creem.</li>
              <li>
                Refunds typically appear on your account via the original payment method within{" "}
                <strong>5–10 business days</strong> (exact timing depends on your card issuer or wallet).
              </li>
            </ol>
          </Section>

          <Section title="5. Partial / Prorated Refunds">
            <p>
              Monthly subscriptions are not refunded on a prorated basis. If you cancel, your paid
              access continues until the end of the current billing cycle and simply does not renew
              thereafter. Unused credits expire at the end of each billing cycle and do not roll over.
            </p>
          </Section>

          <Section title="6. Chargebacks">
            <p>
              If you believe a payment was unauthorized, please email us first — we can usually
              resolve such cases faster than the card-issuer chargeback process. Initiating a
              chargeback without contacting us first may result in account suspension.
            </p>
          </Section>

          <Section title="7. Exchange Rates and Fees">
            <p>
              Refunds are returned in the original currency through the original payment channel.
              Neither Artify Slide nor Creem is responsible for any differences caused by exchange rate
              fluctuations. Creem does not charge you an additional refund fee.
            </p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              We may update this Refund Policy from time to time. Material changes will be posted on
              the website and communicated to existing users by email. Submitted refund requests are
              processed under the version of the policy in effect at the time of the request.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>
              For refund inquiries, contact:<br />
              Email: <a href="mailto:support@artifyslide.com">support@artifyslide.com</a><br />
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
