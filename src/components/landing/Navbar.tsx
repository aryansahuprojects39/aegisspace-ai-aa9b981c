import { useState, useEffect } from "react";
import { Menu, X, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
        <a href="#home" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg gradient-cyan-pink flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-heading text-foreground">
            Aegis<span className="gradient-text">Space</span> AI
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted/30"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary rounded-full">
            Login
          </Button>
          <button className="btn-pill gradient-cyan-pink text-primary-foreground text-sm">
            Try Free
          </button>
        </div>

        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden glass-strong mt-2 mx-4 rounded-2xl p-4 space-y-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block px-4 py-3 text-sm text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/30 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground rounded-full">Login</Button>
            <button className="btn-pill gradient-cyan-pink text-primary-foreground text-sm w-full">Try Free</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
