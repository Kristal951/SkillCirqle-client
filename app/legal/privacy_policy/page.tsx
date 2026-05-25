import LegalBlock from "@/components/legal/LegalBlock";
import LegalBlockWrapper from "@/components/legal/LegalBlockWrapper";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
import LegalSection from "@/components/legal/LegalSection";
import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <LegalPageHeader
        title="Privacy Policy"
        lastUpdatedAt="Last updated: 18 May 2026"
      />

      <LegalSection id="introduction" title="1. Introduction">
        SkillCirqle ("we", "our", or "us") is committed to protecting your
        personal information and your right to privacy. This Privacy Policy
        explains how we collect, use, share and protect information about you
        when you use our platform at skillcirqle.com. By creating an account and
        using SkillCirqle you agree to the collection and use of your
        information as described in this Privacy Policy. If you do not agree
        with this policy please do not use the platform.
      </LegalSection>

      <LegalSection
        id="information-we-collect"
        title="2. Information We Collect"
      >
        We collect information you provide directly to us when creating an
        account, completing your profile, participating in skill exchanges,
        communicating with other users or contacting support. This information
        may include your name, email address, username, profile photo, bio,
        skills, learning interests, session activity, reviews, messages and any
        content you choose to upload or share on the platform.
      </LegalSection>

      <LegalBlockWrapper>
        <LegalBlock title="2.1 Information You Provide Directly">
          When you create an account and use SkillCirqle you provide us with the
          following information:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Your full name</li>
            <li>Your email address</li>
            <li>
              Your password — stored securely and never readable by our team
            </li>
            <li>Your profile photo — uploaded voluntarily</li>
            <li>
              Skills you can teach — added by you during onboarding or from your
              profile
            </li>
            <li>
              Skills you want to learn — added by you during onboarding or from
              your profile
            </li>
            <li>
              Your skill tier level per skill — self declared during onboarding
            </li>
            <li>
              Portfolio links or work samples — submitted voluntarily when
              seeking skill tier verification
            </li>
            <li>
              Skill demo videos — submitted voluntarily when seeking skill tier
              verification
            </li>
            <li>Messages sent to other users through the platform chat</li>
            <li>Ratings and written reviews submitted after sessions</li>
            <li>
              Your bio and any other profile information you choose to add
            </li>
          </ul>
        </LegalBlock>

        <LegalBlock title="2.2 Information Collected Automatically">
          When you use SkillCirqle we automatically collect certain technical
          information:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Your IP address</li>
            <li> Browser type and version</li>
            <li>Device type and operating system</li>
            <li>Pages you visit on the platform</li>
            <li>Features you use and actions you take</li>
            <li>Time and date of your activity</li>
            <li>Session duration and frequency of visits</li>
          </ul>
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="2.3 Information From Sessions">
          When you participate in skill exchange sessions on the platform we
          collect:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Session start and end times</li>
            <li>Session type — Quick Swap, Standard Swap or Deep Swap</li>
            <li>The skills exchanged during the session</li>
            <li>Ratings and reviews submitted after each session</li>
            <li>SkillCredits earned and spent per session</li>
          </ul>
          Please note: SkillCirqle does not record or store the video or audio
          content of your live sessions. Sessions happen through Jitsi Meet and
          the video content is not stored by SkillCirqle.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="3. How We Use Your Information">
          We use the information we collect to:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Create and manage your account</li>
            <li>Display your profile to other users on the platform</li>
            <li>Match you with suitable skill exchange partners</li>
            <li>Facilitate skill exchange sessions between users</li>
            <li>
              Manage the SkillCredits economy — tracking credits earned and
              spent
            </li>
            <li>
              {" "}
              Assign and update your skill tier levels based on session
              performance
            </li>
            <li>
              Send you notifications about proposals, messages, session updates
              and credits
            </li>
            <li>Improve the platform and develop new features</li>
            <li>
              Detect and prevent fraud, fake accounts and abuse of the platform
            </li>
            <li>Respond to your support requests and enquiries</li>
            <li>Enforce our Terms of Service</li>
            <li>Comply with our legal obligations</li>
          </ul>
        </LegalBlock>
        <LegalBlock title="4. What We Do Not Collect">
          To be completely transparent, the following information is NOT
          collected by SkillCirqle:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>
              Your phone number — unless you choose to provide it voluntarily in
              your bio
            </li>
            <li>Your physical address or location</li>
            <li>
              Your bank account or card details — SkillCirqle does not process
              payments at this stage
            </li>
            <li>Government identification documents</li>
            <li>Video or audio recordings of your live sessions</li>
            <li>Your browsing history outside of SkillCirqle</li>
          </ul>
        </LegalBlock>
      </LegalBlockWrapper>

      {/* <LegalBlockWrapper>
            <LegalBlock></LegalBlock>
            <LegalBlock></LegalBlock>
        </LegalBlockWrapper> */}

      <LegalSection
        id="how-we-share-your-information"
        title="5. How We Share Your Information"
      >
        We do not sell your personal information to third parties. However, we
        may share certain information when necessary to operate, improve and
        protect SkillCirqle.
      </LegalSection>

      <LegalBlockWrapper>
        <LegalBlock title="5.1 With Other Users">
          Your public profile information is visible to other registered users
          of the platform. This includes:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Your name and profile photo</li>
            <li>Skills you teach with their tier levels</li>
            <li>Skills you want to learn</li>
            <li>Your rating average and number of sessions completed</li>
            <li>Reviews written about you by other users</li>
            <li>Any bio information you choose to add</li>
          </ul>
          Your email address, password and private messages are never shared
          with other users.
        </LegalBlock>
        <LegalBlock title="5.2 With Service Providers">
          We share limited information with trusted third party service
          providers who help us operate the platform. These include:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>
              Supabase — our database provider who stores your account data
              securely
            </li>
            <li>
              Jitsi Meet — the video session service used for live skill
              exchanges
            </li>
            <li>
              Our hosting provider for running the platform infrastructure
            </li>
          </ul>
          All service providers are contractually obligated to protect your
          information and use it only for the purposes we specify.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title=" 5.3 Legal Requirements">
          We may disclose your information where required by law, court order or
          government authority, or where we believe disclosure is necessary to
          protect the rights and safety of SkillCirqle, its users or the public.
        </LegalBlock>
        <LegalBlock title="5.4 Business Transfers">
          In the event of a merger, acquisition or sale of SkillCirqle, your
          information may be transferred as part of that transaction. We will
          notify you before your information is transferred and becomes subject
          to a different privacy policy.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="6. SkillCredits and Transactions">
          SkillCredits are the internal currency of the SkillCirqle platform.
          They have no monetary value outside the platform and cannot be
          exchanged for cash. We collect and store the following SkillCredits
          related information:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Your current SkillCredits balance</li>
            <li>
              A history of credits earned — including the reason and timestamp
              for each
            </li>
            <li>
              A history of credits spent — including the reason and timestamp
              for each
            </li>
          </ul>
          This information is stored securely in your account and is visible
          only to you in your wallet. SkillCirqle does not currently process any
          real money payments. If this changes in the future this Privacy Policy
          will be updated accordingly.
        </LegalBlock>
        <LegalBlock title="7. Skill Tier Verification">
          If you choose to seek verification for a skill tier you may
          voluntarily submit proof of your skill. This can include a portfolio
          link, a work sample file or a short skill demo video. This information
          is:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Submitted entirely voluntarily — it is never mandatory</li>
            <li>Used only to verify your claimed skill tier level</li>
            <li>Stored securely in your account profile</li>
            <li>
              Visible to other users as a Verified badge on your skill tag
            </li>
          </ul>
          You may remove your submitted proof at any time from your profile
          settings.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="8. Data Storage and Security">
          Your data is stored securely using Supabase, which implements
          enterprise-grade security protocols including encryption at rest and
          in transit. We take the security of your personal information
          seriously and implement appropriate technical and organisational
          measures to protect it. Despite our best efforts no method of
          transmission over the internet or electronic storage is 100 percent
          secure. We cannot guarantee the absolute security of your data. In the
          event of a data breach that affects your personal information we will
          notify you as required by applicable law.
        </LegalBlock>
        <LegalBlock title="9. Your Rights">
          You have the following rights regarding your personal information:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>
              Access — you can request a copy of the personal information we
              hold about you
            </li>
            <li>
              Correction — you can update or correct inaccurate information
              directly from your profile settings
            </li>
            <li>
              Deletion — you can request deletion of your account and personal
              information
            </li>
            <li>
              Portability — you can request a copy of your data in a portable
              format
            </li>
            <li>
              Objection — you can object to certain types of processing of your
              information
            </li>
          </ul>
          To exercise any of these rights please contact us at
          hello@skillcirqle.com. We will respond to your request within 30 days.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="10. Data Retention">
          We retain your personal information for as long as your account is
          active. If you delete your account we will delete your personal
          information within 30 days, except where we are required to retain it
          for legal or regulatory purposes. Session records and ratings may be
          retained in anonymised form for platform quality and safety purposes
          after account deletion.
        </LegalBlock>
        <LegalBlock title="11. Children's Privacy">
          SkillCirqle is not directed at children under 16 years of age. We do
          not knowingly collect personal information from anyone under 16. If we
          become aware that a user is under 16 we will take immediate steps to
          delete their account and associated information. If you believe a
          child under 16 has created an account on SkillCirqle please contact us
          immediately at hello@skillcirqle.com.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="12. Cookies">
          SkillCirqle uses cookies and similar tracking technologies to maintain
          your session, remember your preferences such as dark or light mode,
          and improve your experience on the platform. You can control cookie
          settings through your browser. Note that disabling certain cookies may
          affect the functionality of the platform including keeping you logged
          in.
        </LegalBlock>
        <LegalBlock title="13. Third Party Links">
          Some users may share portfolio links or external websites on their
          profiles. SkillCirqle is not responsible for the privacy practices of
          any third party websites. We encourage you to read the privacy policy
          of any third party website you visit.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="14. Changes To This Policy">
          We may update this Privacy Policy from time to time as the platform
          grows and evolves. We will notify you of any material changes by
          posting the updated policy on the platform and updating the effective
          date at the top of this document. Your continued use of SkillCirqle
          after any changes to this policy constitutes your acceptance of the
          updated policy.
        </LegalBlock>
        <LegalBlock title="15. Contact Us">
          If you have any questions, concerns or requests regarding this Privacy
          Policy or how we handle your personal information please contact us.
        </LegalBlock>
      </LegalBlockWrapper>
    </div>
  );
};

export default PrivacyPolicyPage;
