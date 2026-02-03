import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "zh-CN", name: "中文" },
  { code: "ar", name: "العربية" },
  { code: "hi", name: "हिन्दी" },
  { code: "ja", name: "日本語" },
  { code: "sw", name: "Kiswahili" },
];

export function LanguageSelector() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Translate script is already loaded
    if (window.google?.translate) {
      setIsLoaded(true);
      return;
    }

    // Load Google Translate script
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element"
      );
      setIsLoaded(true);
    };

    return () => {
      // Cleanup if needed
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }
  };

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" className="hidden" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Languages className="h-5 w-5" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
          {languages.map((lang) => (
            <DropdownMenuItem 
              key={lang.code} 
              onClick={() => changeLanguage(lang.code)}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
