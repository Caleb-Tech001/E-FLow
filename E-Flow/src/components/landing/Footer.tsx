import { Target, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Past Analyses", href: "/analyses" },
      { label: "Settings", href: "/settings" },
    ],
    resources: [
      { label: "Documentation", href: "/documentation" },
      { label: "API Reference", href: "/api-reference" },
      { label: "Changelog", href: "/changelog" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "mailto:sengageflow@gmail.com", isExternal: true },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  };

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 text-center flex flex-col items-center">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EngageFlow</span>
            </a>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Transform your B2B contacts into actionable GTM playbooks with AI-powered segmentation and personalized actions.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://x.com/yhungprof0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/caleboladepo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com/Caleb-Tech001" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="mailto:sengageflow@gmail.com" 
                className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-10 pt-6 flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Powered by FullEnrich API for deep B2B enrichment
          </p>
          <p className="text-sm text-muted-foreground">
            © {currentYear} EngageFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
