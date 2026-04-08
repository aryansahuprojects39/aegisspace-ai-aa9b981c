import { Rocket } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="relative py-16 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-cyan-pink flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-heading text-foreground">AegisSpace AI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time satellite launch monitoring powered by AI and real hardware telemetry.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: ["Features", "Dashboard", "Pricing", "API Docs"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact"],
            },
            {
              title: "Legal",
              links: ["Privacy Policy", "Terms of Service", "Security"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-foreground mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AegisSpace AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Twitter", "GitHub", "Discord"].map((s) => (
              <a key={s} href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
