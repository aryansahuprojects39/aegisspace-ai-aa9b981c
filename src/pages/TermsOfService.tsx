import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ParallaxStars from "@/components/landing/ParallaxStars";

const TermsOfService = () => (
  <div className="relative min-h-screen bg-background">
    <ParallaxStars />
    <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-bold font-heading text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 11, 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using AegisSpace AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
          <p>AegisSpace AI provides real-time satellite launch monitoring, telemetry visualization, and AI-powered anomaly detection. The Service processes data from hardware sensors and presents it through a web-based mission control dashboard.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or its infrastructure</li>
            <li>Transmit malicious code or attempt to exploit vulnerabilities</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Telemetry Data</h2>
          <p>Telemetry data transmitted to the Service from your devices is stored securely. You retain ownership of your telemetry data. We may use anonymized, aggregated data to improve our anomaly detection algorithms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Intellectual Property</h2>
          <p>All content, features, and functionality of the Service are owned by AegisSpace AI and are protected by international copyright, trademark, and other intellectual property laws.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
          <p>The Service is provided "as is" without warranties of any kind. AegisSpace AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. The Service is not intended for safety-critical decision-making without independent verification.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Termination</h2>
          <p>We may terminate or suspend your access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p>For questions about these Terms, contact us at <span className="text-primary">legal@aegisspace.ai</span>.</p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsOfService;
