import LegalBlock from "@/components/legal/LegalBlock";
import LegalBlockWrapper from "@/components/legal/LegalBlockWrapper";
import LegalList from "@/components/legal/LegalList";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
import LegalSection from "@/components/legal/LegalSection";
import React from "react";

const CommunityCuidelinesPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <LegalPageHeader
        title="Community Guidelines"
        lastUpdatedAt="Last updated: 18 May 2026"
      />
      <LegalSection id="introduction" title="1. Introduction">
        Welcome to SkillCirqle. Our platform is designed to help people learn,
        teach, collaborate, network, and grow professionally through meaningful
        interactions and skill sharing. To maintain a safe, respectful, and
        productive environment for everyone, all users must follow these
        Community Guidelines when using SkillCirqle. By using SkillCirqle, you
        agree to comply with these guidelines, our Terms of Service, and all
        applicable laws.
      </LegalSection>

      <LegalBlockWrapper>
        <LegalBlock title="1. Respectful Conduct">
          Users must treat others with respect, professionalism, and courtesy at
          all times. You may not:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Harass or bully others</li>
            <li>Use hateful or discriminatory language</li>
            <li>Threaten, intimidate, or abuse users</li>

            <li>
              attempt to or Engage in personal attacks or targeted harassment
            </li>
            <li>Promote violence or hostility toward individuals or groups</li>
          </ul>
          We encourage healthy discussions and constructive feedback, but
          disrespectful behavior is not tolerated.
        </LegalBlock>

        <LegalBlock title="2. Harassment & Bullying">
          SkillCirqle has zero tolerance for harassment or bullying. Prohibited
          behavior includes:
          <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary">
            <li>Repeated unwanted contact</li>
            <li>Stalking or intimidation</li>
            <li>Public humiliation or shaming</li>

            <li>Sending abusive messages</li>
            <li>Doxxing or sharing private information</li>
            <li>Encouraging others to harass a user</li>
          </ul>
          Harassment through comments, messages, usernames, profiles, uploaded
          media, or any platform feature is strictly prohibited.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="4. Inappropriate & Sexual Content">
          Users may not upload, share, or distribute:
          <LegalList
            items={[
              "Pornographic content",
              "Explicit sexual material",
              "Nudity intended for sexual gratification",
              "Sexually exploitative content",
              "Sexual harassment or solicitation",
            ]}
          />
          Any content involving the exploitation or endangerment of minors will
          result in immediate account termination and may be reported to law
          enforcement.
        </LegalBlock>

        <LegalBlock title="5. Child Safety">
          SkillCirqle is committed to protecting minors. Users may not:
          <LegalList
            items={[
              "Engage in grooming behavior",
              "Share child sexual abuse material (CSAM)",
              "Exploit minors in any way",
              "Encourage inappropriate interactions with minors",
            ]}
          />
          We reserve the right to report illegal activity involving minors to
          relevant authorities.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="6. Violence & Dangerous Activities">
          Content that promotes or glorifies violence is prohibited. Users may
          not:
          <LegalList
            items={[
              "Threaten physical harm",
              "Encourage violent acts",
              "Promote dangerous challenges",
              "Share graphic violence intended to shock or harm",
              "Encourage self-harm or suicide",
            ]}
          />
        </LegalBlock>

        <LegalBlock title="7. Spam and Platform abuse">
          Users may not misuse the platform through:
          <LegalList
            items={[
              "Spam messages or comments",
              "Fake engagement",
              "Mass unsolicited messaging",
              "Phishing attempts",
              "Fraudulent promotions",
              "Automated bot activity",
              "Manipulation of platform systems",
            ]}
          />
          Creating fake accounts or artificially inflating engagement is
          prohibited.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="8. Fraud & Impersonation">
          Users may not:
          <LegalList
            items={[
              "Impersonate another person or organization",
              "Use fake identities or credentials",
              "Misrepresent qualifications or certifications",
              "Engage in scams or deceptive practices",
              "Attempt financial fraud",
            ]}
          />
          SkillCirqle may verify accounts, credentials, or user information
          where necessary.
        </LegalBlock>

        <LegalBlock title="9. Educational Integrity">
          SkillCirqle promotes authentic learning and collaboration. Users may
          not:
          <LegalList
            items={[
              "Plagiarize content",
              "Submit stolen work",
              "Sell or distribute cheating services",
              "Falsify educational achievements",
              "Mislead others regarding expertise or certifications",
            ]}
          />
          Always provide proper credit when using another person's work.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="10. Intellectual Property">
          Users retain ownership of the content they upload. However, users may
          only upload content they have the legal right to share. You may not:
          <LegalList
            items={[
              "Upload copyrighted content without permission",
              "Infringe trademarks or intellectual property rights",
              "Redistribute stolen content",
            ]}
          />
          SkillCirqle may remove infringing content and suspend repeat
          offenders.
        </LegalBlock>

        <LegalBlock title="11. Privacy & Personal Information">
          Protect your privacy and the privacy of others. Users may not:
          <LegalList
            items={[
              "Share private or confidential information",
              "Publish personal addresses or phone numbers",
              "Expose banking details or identification documents",
              "Doxx or reveal another user's sensitive information",
            ]}
          />
          Never share passwords or account credentials with others.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="12. Illegal & Unsafe Activities">
          SkillCirqle prohibits content or activity related to:
          <LegalList
            items={[
              "Illegal drugs",
              "Human exploitation",
              "Malware or hacking tools",
              "Financial fraud",
              "Weapon trafficking",
              "Criminal activity",
              "Unauthorized access to systems",
            ]}
          />
          Any illegal activity may be reported to authorities.
        </LegalBlock>

        <LegalBlock title="13. AI-Generated & Misleading Content">
          Users may not use AI-generated content to:
          <LegalList
            items={[
              "Impersonate individuals",
              "Spread misinformation",
              "Create deceptive media",
              "Manipulate or scam others",
            ]}
          />
          SkillCirqle may label, restrict, or remove misleading synthetic
          content.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="14. Account Security">
          Users are responsible for maintaining the security of their accounts.
          We strongly recommend:
          <LegalList
            items={[
              "Using strong passwords",
              "Enabling multi-factor authentication (MFA)",
              "Keeping login credentials confidential",
            ]}
          />
          Unauthorized access attempts or suspicious activity may result in
          account restrictions.
        </LegalBlock>

        <LegalBlock title="15. Reporting Violations">
          Users can report content or accounts that violate these guidelines.
          Reports should be made in good faith and include accurate information.
          False or malicious reports may themselves violate these guidelines.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="16. Enforcement Actions">
          SkillCirqle may take enforcement action against accounts or content
          that violate these guidelines. Actions may include:
          <LegalList
            items={[
              "Content removal",
              "Warning notices",
              "Temporary restrictions",
              "Account suspension",
              "Permanent account bans",
              "Reporting to law enforcement where required",
            ]}
          />
          Repeated or severe violations may result in immediate permanent
          removal from the platform.
        </LegalBlock>

        <LegalBlock title="17. Moderator Discretion">
          SkillCirqle reserves the right to take action against behavior that
          threatens the safety, integrity, or operation of the platform, even if
          the behavior is not explicitly listed in these guidelines.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="18. Updates to These Guidelines">
          We may update these Community Guidelines periodically. Continued use
          of SkillCirqle after updates means you accept the revised guidelines.
        </LegalBlock>

        <LegalBlock title="19. Contact Us">
          For questions or reports related to these guidelines, contact us.
        </LegalBlock>
      </LegalBlockWrapper>
    </div>
  );
};

export default CommunityCuidelinesPage;
