import LegalBlock from "@/components/legal/LegalBlock";
import LegalBlockWrapper from "@/components/legal/LegalBlockWrapper";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
import LegalSection from "@/components/legal/LegalSection";
import { Download } from "lucide-react";
import React from "react";

const TermsOfServicePage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <LegalPageHeader
        title="Terms of Service"
        lastUpdatedAt="Last updated: 18 May 2026"
      />
      
      <LegalSection id="acceptance-of-terms" title="1. Acceptance of Terms">
        By accessing or using SkillCirqle ("the Platform", "we", "us", or "our")
        you agree to be bound by these Terms of Service. If you do not agree,
        you may not access or use the Platform. SkillCirqle is owned and
        operated by SkillCirqle, Nigeria.
      </LegalSection>

      <div className="w-full flex flex-col md:flex-row gap-10 md:gap-20">
        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-2xl font-bold mb-3">2. What SkillCirqle Is</h2>

          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            SkillCirqle is a peer-to-peer skill exchange platform where users
            teach skills they know and learn skills they want. The platform
            operates through two exchange methods:
          </p>

          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>
              <strong>Direct Swap</strong> — two users agree to teach each other
              their respective skills directly. No credits required.
            </li>

            <li>
              <strong>SkillCredits Exchange</strong> — users teach anyone to
              earn SkillCredits and spend those credits to learn from anyone
              else on the platform. No direct match required.
            </li>
          </ul>

          <p className="text-sm text-text-secondary leading-relaxed mt-4">
            SkillCirqle also uses a skill tier system where each skill is rated
            as T1 Basic, T2 Capable, or T3 Strong, reflecting teaching ability.
          </p>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <h2 className="text-2xl font-bold mb-3">3. Eligibility</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            SkillCirqle is intended for users aged 16 and above. By creating an
            account you confirm that:
          </p>

          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>You are at least 16 years of age</li>
            <li>
              You have the legal capacity to enter into a binding agreement
            </li>
            <li>You will comply with these Terms at all times</li>

            <li>
              You are not prohibited from using the Platform under any
              applicable law
            </li>
          </ul>

          <p className="text-sm text-text-secondary leading-relaxed mt-4">
            {" "}
            We do not knowingly allow anyone under 16 to create an account. If
            we discover a user is under 16 we will immediately suspend and
            delete their account.
          </p>
        </div>
      </div>

      <LegalSection id="your-account" title="4. Your Account">
        You are responsible for maintaining the security of your account and
        ensuring that all information provided during registration remains
        accurate and up to date. You must not share your account credentials
        with any third party. Any activity conducted under your account will be
        deemed your responsibility. SkillCirqle reserves the right to suspend or
        terminate accounts suspected of unauthorized or fraudulent activity.
      </LegalSection>

      <LegalBlockWrapper>
        <LegalBlock title="4.1. Registration">
          To use SkillCirqle you must create an account with your real name, a
          valid email address and a secure password. You agree to provide
          accurate and complete information.
        </LegalBlock>
        <LegalBlock title="4.2 Account Security">
          You are responsible for maintaining the confidentiality of your login
          credentials and for all activity that occurs under your account.
          Notify us immediately at hello@skillcirqle.com if you suspect
          unauthorised access.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="4.3 One Account Per Person">
          Each user may only create one account. Creating multiple accounts to
          accumulate SkillCredits or abuse the platform is strictly prohibited
          and will result in permanent suspension of all associated accounts.
        </LegalBlock>
        <LegalBlock title="4.4 Account Suspension and Termination">
          We reserve the right to suspend or permanently terminate your account
          at any time for violation of these Terms, fraudulent activity, abusive
          behaviour, or any conduct we determine to be harmful to the platform
          or its users.
        </LegalBlock>
      </LegalBlockWrapper>

      <div className="flex flex-col gap-2 flex-1 mt-8">
        <h2 className="text-2xl font-bold mb-3">5. Skill Tiers</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          SkillCirqle uses a per-skill tier system to help learners choose the
          right teacher. Each skill on your profile has an independent tier:
        </p>

        <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
          <li>
            T1 — Basic: Still developing the skill. First session offered free
            to attract your first review.
          </li>
          <li>
            T2 — Capable: Confident in the skill and able to teach beginners
            clearly.
          </li>
          <li>
            T3 — Strong: Highly experienced. Consistently receives excellent
            ratings.
          </li>
        </ul>

        <p className="text-sm text-text-secondary leading-relaxed mt-4">
          {" "}
          Tiers are self-declared during onboarding but are automatically
          adjusted based on your actual session ratings over time. Deliberately
          misrepresenting your skill tier to attract learners is a violation of
          these Terms and may result in account suspension.
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          Users who submit proof of their skill — such as a portfolio link, work
          sample or demo video — may receive a Verified badge for that skill
          tier. Proof submission is entirely voluntary.
        </p>
      </div>

      <LegalSection id="skillcredits" title="6. SkillCredits">
        SkillCredits are the internal exchange currency used on SkillCirqle to
        facilitate learning between users. Users may earn SkillCredits by
        teaching others and may spend SkillCredits to access lessons from other
        users on the platform. SkillCredits have no cash value and cannot be
        exchanged, withdrawn, or transferred outside the Platform unless
        explicitly permitted by SkillCirqle. We reserve the right to adjust,
        modify, or revoke SkillCredits in cases of abuse, fraud, or system
        errors.
      </LegalSection>

      <LegalBlockWrapper>
        <LegalBlock title="6.1 What SkillCredits Are">
          SkillCredits are the internal currency of SkillCirqle. They have no
          monetary value outside the platform and cannot be exchanged for cash
          or any other currency.
        </LegalBlock>
        <LegalBlock title="6.2 Earning Credits">
          Users earn SkillCredits by teaching sessions, completing their
          profile, inviting new members and through other activities as
          specified on the platform.
        </LegalBlock>
      </LegalBlockWrapper>
      <LegalBlockWrapper>
        <LegalBlock title="6.3 Spending Credits">
          Users spend SkillCredits to book learning sessions from other users.
          The credit cost of a session depends on the teacher's skill tier and
          the session type selected.
        </LegalBlock>
        <LegalBlock title="6.4 Credits Are Non-Transferable">
          SkillCredits cannot be transferred between accounts. Credits
          accumulated through fraudulent activity will be removed without
          notice.
        </LegalBlock>
      </LegalBlockWrapper>
      <LegalBlockWrapper>
        <LegalBlock title="6.5 Credits Expiry">
          SkillCredits do not expire while your account remains active. Credits
          are forfeited upon account termination.
        </LegalBlock>
        <LegalBlock title="6.6 Teach To Learn Ratio">
          To maintain a balanced platform economy users are required to
          contribute by teaching or swapping before continuing to learn beyond
          their initial welcome credits. Users who reach the contribution
          threshold will be prompted to teach a session or find a direct swap
          before booking further learning sessions.
        </LegalBlock>
      </LegalBlockWrapper>

      <div className="flex flex-col gap-2 flex-1 mt-8">
        <h2 className="text-2xl font-bold mb-3">7. Session Types</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          SkillCirqle offers three session types. All session types are
          available to all users with no restrictions:
        </p>

        <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
          <li>
            Quick Swap — 15 to 20 minutes. Ideal for a specific question or
            quick skill taste.
          </li>
          <li>
            Standard Swap — 45 to 60 minutes. The core full learning session
          </li>
          <li>
            Deep Swap — 3 structured sessions across 1 to 2 weeks. A mini course
            experience. Credits are locked upfront when the proposal is
            accepted.
          </li>
        </ul>

        <p className="text-sm text-text-secondary leading-relaxed mt-4">
          {" "}
          The credit cost of each session type varies based on the teacher's
          skill tier. Costs are shown clearly on the proposal form before any
          booking is confirmed.
        </p>
      </div>

      <LegalSection id="session conduct" title="8. Session Conduct">
        All users are expected to behave respectfully, professionally, and
        honestly during sessions conducted through SkillCirqle. Harassment,
        discrimination, hate speech, explicit content, intimidation, or any
        abusive behaviour is strictly prohibited. SkillCirqle reserves the right
        to suspend or terminate accounts that violate these conduct standards.
      </LegalSection>

      <LegalBlockWrapper>
        <LegalBlock title="8.1 Professional Behaviour">
          All skill exchange sessions must be conducted professionally and
          respectfully. Sessions must remain focused on the agreed skill subject
          matter.
        </LegalBlock>
        <LegalBlock title="8.2 No Recording">
          You may not record any video or audio session conducted through
          SkillCirqle without the explicit consent of all participants.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="8.3 Ratings Are Required">
          After every completed session both users are required to submit a star
          rating and written review. SkillCredits are only released to the
          teacher after both users have submitted their ratings.
        </LegalBlock>
        <LegalBlock title="8.4 Cancellations">
          If a teacher cancels after accepting a proposal the learner receives a
          full credit refund. If a learner cancels within 24 hours of a
          scheduled session the teacher receives half the session credits as
          compensation for their time.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="8.5 No-Shows">
          Repeated no-shows without notice may result in account restrictions.
          Users who consistently fail to attend accepted sessions may have their
          ability to send or accept proposals temporarily suspended.
        </LegalBlock>
      </LegalBlockWrapper>

      {/* // Todo: put section 9.0 in community guidelines  */}

      <LegalBlockWrapper>
        <LegalBlock title="9. Matching and Learning Rules.">
          Direct swaps are only available between users of the same skill tier
          for the skill being exchanged. This ensures balanced and fair
          exchanges for both parties. Credit-based learning sessions allow users
          to learn from teachers at their own tier or one tier above, giving
          access to higher quality teaching as users progress. When no same-tier
          swap partner is available users may join a waitlist or use their
          SkillCredits to book a session instead.
        </LegalBlock>
        <LegalBlock title="10. Intellectual Property">
          All content, features and functionality on SkillCirqle including text,
          graphics, logos, icons and software are the property of SkillCirqle
          and protected by applicable intellectual property laws. You retain
          ownership of content you create and share on the platform — including
          your profile, skills and session materials — but you grant SkillCirqle
          a non-exclusive licence to display and use such content in connection
          with operating the platform.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="11. Privacy">
          Your use of SkillCirqle is governed by our Privacy Policy which is
          incorporated into these Terms by reference. Please read our Privacy
          Policy carefully to understand how we collect, use and protect your
          information.
        </LegalBlock>
        <LegalBlock title="12. Disclaimers">
          The platform is provided on an <strong>"AS IS"</strong> and{" "}
          <strong>"AS AVAILABLE"</strong> basis. SkillCirqle makes no
          warranties, express or implied, regarding the platform including
          warranties of merchantability, fitness for a particular purpose, or
          non-infringement. SKILLCIRQLE DOES NOT WARRANT THAT THE PLATFORM WILL
          BE UNINTERRUPTED ERROR-FREE OR FREE OF HARMFUL COMPONENTS. SKILLCIRQLE
          IS NOT RESPONSIBLE FOR THE QUALITY ACCURACY OR OUTCOMES OF ANY SKILL
          EXCHANGE SESSION. THE QUALITY OF TEACHING IS THE RESPONSIBILITY OF
          INDIVIDUAL USERS AND IS REFLECTED IN THE PLATFORM RATING SYSTEM.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="13. Limitation of Liability">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW SKILLCIRQLE SHALL NOT BE LIABLE
          FOR ANY INDIRECT INCIDENTAL SPECIAL CONSEQUENTIAL OR PUNITIVE DAMAGES
          ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM EVEN IF
          SKILLCIRQLE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </LegalBlock>
        <LegalBlock title="14. Changes to These Terms">
          We may update these Terms from time to time as the platform grows. We
          will notify you of material changes by posting the updated Terms on
          the platform and updating the effective date. Your continued use of
          the platform after changes constitutes your acceptance.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="15. Governing Law">
          These Terms are governed by the laws of the Federal Republic of
          Nigeria. Any disputes arising under these Terms shall be subject to
          the exclusive jurisdiction of the courts of Nigeria.
        </LegalBlock>
        <LegalBlock title="16. Contact Us">
          If you have any questions about these Terms please contact us.
        </LegalBlock>
      </LegalBlockWrapper>
    </div>
  );
};

export default TermsOfServicePage;
