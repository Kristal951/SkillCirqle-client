import LegalBlock from "@/components/legal/LegalBlock";
import LegalBlockWrapper from "@/components/legal/LegalBlockWrapper";
import LegalPageHeader from "@/components/legal/LegalPageHeader";
import LegalSection from "@/components/legal/LegalSection";
import LegalList from "@/components/legal/LegalList";
import React from "react";

const CookiesPolicyPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <LegalPageHeader
        title="Cookies Policy"
        lastUpdatedAt="Last updated: 18 May 2026"
      />

      <LegalSection id="introduction" title="1. Introduction">
        This Cookies Policy explains how SkillCirqle ("we", "our", or "us") uses
        cookies and similar technologies when you access or use our platform at
        skillcirqle.com.
        <br />
        <br />
        This policy explains:
        <LegalList
          className="mt-4"
          items={[
            "What cookies are",
            "Why we use them",
            "What types of cookies we use",
            "How third parties may use cookies",
            "How you can manage or disable cookies",
          ]}
        />
        By continuing to use SkillCirqle, you agree to our use of cookies and
        similar technologies as described in this policy.
      </LegalSection>

      <LegalSection id="what-are-cookies" title="2. What Are Cookies">
        Cookies are small text files stored on your computer, tablet, or mobile
        device when you visit a website or use an application.
        <br />
        <br />
        Cookies help websites recognize your device, remember information about
        your session, improve security, store preferences, and enhance your
        overall experience.
        <br />
        <br />
        Cookies may be:
        <LegalList
          className="mt-4"
          items={[
            <>
              <strong>Session Cookies</strong> — temporary cookies that expire
              when you close your browser
            </>,
            <>
              <strong>Persistent Cookies</strong> — cookies that remain on your
              device until deleted or expired
            </>,
            <>
              <strong>First-Party Cookies</strong> — cookies placed directly by
              SkillCirqle
            </>,
            <>
              <strong>Third-Party Cookies</strong> — cookies placed by external
              services integrated into the platform
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection
        id="how-we-use-cookies"
        title="3. How SkillCirqle Uses Cookies"
      >
        SkillCirqle uses cookies and related technologies to provide, secure,
        improve, and personalize the platform.
        <br />
        <br />
        We use cookies to:
        <LegalList
          className="mt-4"
          items={[
            "Keep users securely signed in",
            "Authenticate login sessions",
            "Remember user preferences and settings",
            "Maintain platform security",
            "Prevent spam, fraud, and abuse",
            "Analyze platform usage and performance",
            "Improve reliability and user experience",
            "Remember UI preferences such as dark mode",
            "Support essential platform functionality",
          ]}
        />
      </LegalSection>

      <LegalBlockWrapper>
        <LegalBlock title="4. Essential Cookies">
          Essential cookies are required for SkillCirqle to function properly.
          These cookies cannot be disabled because they are necessary for core
          platform operations.
          <br />
          <br />
          Essential cookies may be used for:
          <LegalList
            className="mt-4"
            items={[
              "User authentication and login sessions",
              "Maintaining secure connections",
              "Protecting accounts from unauthorized access",
              "Remembering active sessions",
              "Navigating between pages securely",
              "Preventing spam and abuse",
            ]}
          />
        </LegalBlock>

        <LegalBlock title="5. Preference Cookies">
          Preference cookies store information about your settings and
          preferences to create a more personalized experience.
          <br />
          <br />
          These cookies may remember:
          <LegalList
            className="mt-4"
            items={[
              "Dark mode or light mode preferences",
              "Language settings",
              "Region or timezone preferences",
              "Interface customization choices",
              "Accessibility settings",
            ]}
          />
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="6. Analytics and Performance Cookies">
          Analytics cookies help us understand how users interact with the
          platform so we can improve performance, reliability, and user
          experience.
          <br />
          <br />
          These cookies may collect:
          <LegalList
            className="mt-4"
            items={[
              "Pages visited",
              "Features used",
              "Session duration",
              "Navigation patterns",
              "Performance metrics",
              "Error reports and diagnostics",
              "Device and browser information",
            ]}
          />
          Analytics data helps us identify bugs, improve usability, and develop
          better platform features.
        </LegalBlock>

        <LegalBlock title="7. Security Cookies">
          Security cookies help protect SkillCirqle and its users from malicious
          activity.
          <br />
          <br />
          These cookies may be used to:
          <LegalList
            className="mt-4"
            items={[
              "Detect suspicious login attempts",
              "Prevent unauthorized account access",
              "Identify automated bot activity",
              "Reduce spam and abuse",
              "Protect user sessions",
              "Support multi-factor authentication (MFA)",
            ]}
          />
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalSection
        id="cookies-we-use"
        title="8. Examples of Cookies We May Use"
      >
        The following are examples of cookies and similar technologies that may
        be used on SkillCirqle:
      </LegalSection>

      <div className="overflow-x-auto mb-10">
        <table className="w-full border border-border rounded-lg overflow-hidden text-sm">
          <thead className="bg-surface/70">
            <tr>
              <th className="text-left p-4 border-b border-border">
                Cookie Name
              </th>
              <th className="text-left p-4 border-b border-border">Purpose</th>
              <th className="text-left p-4 border-b border-border">Type</th>
            </tr>
          </thead>

          <tbody className="text-text-secondary">
            <tr className="border-b border-border">
              <td className="p-4">sb-access-token</td>
              <td className="p-4">Maintains authenticated user sessions</td>
              <td className="p-4">Essential</td>
            </tr>

            <tr className="border-b border-border">
              <td className="p-4">sb-refresh-token</td>
              <td className="p-4">Refreshes secure login sessions</td>
              <td className="p-4">Essential</td>
            </tr>

            <tr className="border-b border-border">
              <td className="p-4">mfa-method</td>
              <td className="p-4">
                Stores the selected multi-factor authentication method during
                login (e.g. authenticator app or recovery code flow)
              </td>
              <td className="p-4">Essential</td>
            </tr>

            <tr className="border-b border-border">
              <td className="p-4">mfa-verified</td>
              <td className="p-4">
                Indicates that the user has successfully completed MFA
                verification for the current session
              </td>
              <td className="p-4">Essential</td>
            </tr>

            <tr className="border-b border-border">
              <td className="p-4">locale</td>
              <td className="p-4">Stores language or regional settings</td>
              <td className="p-4">Preference</td>
            </tr>

            <tr>
              <td className="p-4">analytics_id</td>
              <td className="p-4">
                Helps analyze platform performance and usage
              </td>
              <td className="p-4">Analytics</td>
            </tr>
          </tbody>
        </table>
      </div>

      <LegalBlockWrapper>
        <LegalBlock title="9. Third Party Cookies">
          Some third-party services integrated into SkillCirqle may place
          cookies or use similar technologies.
          <br />
          <br />
          These services may include:
          <LegalList
            className="mt-4"
            items={[
              "Supabase — authentication and database infrastructure",
              "Jitsi Meet — live video session functionality",
              "Hosting and infrastructure providers",
              "Monitoring and analytics tools",
            ]}
          />
          These third parties may collect information according to their own
          privacy and cookies policies.
        </LegalBlock>

        <LegalBlock title="10. Managing Cookies">
          Most web browsers allow you to manage, disable, or delete cookies
          through browser settings.
          <br />
          <br />
          You can:
          <LegalList
            className="mt-4"
            items={[
              "Delete stored cookies",
              "Block specific types of cookies",
              "Disable all cookies",
              "Receive notifications when cookies are being used",
            ]}
          />
          Please note that disabling certain cookies may impact platform
          functionality, including authentication, preferences, and session
          management.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="11. Do Not Track Signals">
          Some browsers offer a "Do Not Track" feature that signals websites not
          to track browsing activity.
          <br />
          <br />
          At this time SkillCirqle does not respond to Do Not Track signals
          because there is currently no universally accepted standard for
          compliance.
        </LegalBlock>

        <LegalBlock title="12. Data Protection and Security">
          Cookies used by SkillCirqle are designed to improve security and user
          experience. We implement appropriate safeguards to protect information
          associated with cookies from unauthorized access, misuse, or abuse.
          <br />
          <br />
          Sensitive authentication information is handled securely using
          encrypted connections and secure session management technologies.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalBlockWrapper>
        <LegalBlock title="13. Changes To This Cookies Policy">
          We may update this Cookies Policy from time to time as SkillCirqle
          evolves or as legal and regulatory requirements change.
          <br />
          <br />
          When material changes are made we will update the effective date and
          may provide additional notice where required.
        </LegalBlock>

        <LegalBlock title="14. Contact Us">
          If you have any questions about this Cookies Policy or how we use
          cookies and similar technologies, please contact us.
        </LegalBlock>
      </LegalBlockWrapper>

      <LegalSection
        id="local-storage"
        title="15. Local Storage and Similar Technologies"
      >
        In addition to cookies, SkillCirqle uses browser storage technologies
        such as localStorage and sessionStorage to improve your experience on
        the platform.
        <br />
        <br />
        These technologies store data directly in your browser and are not
        transmitted to our servers with every request.
        <br />
        <br />
        We use localStorage and similar technologies to:
        <ul className="list-disc pl-6 space-y-2 text-sm text-text-secondary mt-4">
          <li>Remember your theme preferences (e.g. dark or light mode)</li>
          <li>Remember your font size preferences (e.g. small medium or large)</li>
          <li>Maintain UI state such as onboarding progress</li>
          <li>Improve performance by reducing repeated data fetching</li>
          <li>Store temporary user interface settings</li>
        </ul>
        <br />
        We do not store sensitive personal data such as passwords,
        authentication tokens, or payment information in localStorage.
        <br />
        <br />
        You can clear or disable localStorage at any time through your browser
        settings. However, doing so may reset certain preferences or affect
        parts of your user experience.
      </LegalSection>
    </div>
  );
};

export default CookiesPolicyPage;
