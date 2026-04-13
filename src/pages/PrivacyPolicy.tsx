import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ParallaxStars } from "@/components";

const PrivacyPolicy = () => (
  <div className="relative min-h-screen bg-background">
    <ParallaxStars />
    <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-bold font-heading text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 11, 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly, including your email address, display name, and profile picture. We also collect telemetry data transmitted from your connected devices (ESP32 modules).</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain the Service</li>
            <li>To authenticate your identity and manage your account</li>
            <li>To process and display real-time telemetry data</li>
            <li>To detect anomalies using AI-powered analysis</li>
            <li>To send notifications about critical system events</li>
            <li>To improve our anomaly detection algorithms using anonymized data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. Telemetry data is transmitted over secure channels and stored in encrypted databases. We implement appropriate technical and organizational measures to protect your data.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Google OAuth for authentication</li>
            <li>Cloud infrastructure providers for data storage and processing</li>
            <li>AI services for anomaly detection analysis</li>
          </ul>
          <p>These services have their own privacy policies governing their use of your data.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Data Retention</h2>
          <p>We retain your account information for as long as your account is active. Telemetry data is retained according to your subscription plan. You may request deletion of your data at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your telemetry data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Children's Privacy</h2>
          <p>The Service is not intended for users under 13 years of age. We do not knowingly collect data from children.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact Us</h2>
          <p>For privacy-related questions, contact us at <span className="text-primary">privacy@aegisspace.ai</span>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
