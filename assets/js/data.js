/* ============================================================
   DATA LAYER — localStorage-backed CMS for portfolio content
   ============================================================ */
(function () {
  const KEY = "tk_portfolio_v2";

  const DEFAULTS = {
    profile: {
      tagline: "AI Specialist · Vibe Coder · Digital Marketing & SEO",
      lead:
        "AI-ზე ორიენტირებული სპეციალისტი პრაქტიკული გამოცდილებით AI ინსტრუმენტების გამოყენებაში, vibe coding-ში, n8n ავტომატიზაციებსა და ციფრულ მარქეტინგში.",
      body:
        "ვქმნი AI-powered აპებს, ვავტომატიზებ სამუშაო პროცესებს და ვმართავ კონტენტ სტრატეგიას. ყოველდღიურ AI სიახლეებს ვაწვდი ქართველ აუდიტორიას.",
      email: "khatiashvilitamar35@gmail.com",
      phone: "+995 592 12 16 52",
      city: "თბილისი",
      github: "https://github.com/TakoTechie1"
    },
    skills: [
      "Claude (Anthropic)", "ChatGPT", "Gemini", "Perplexity",
      "Cursor / Windsurf", "Bolt.new", "Lovable", "Replit",
      "n8n Automations", "Make (Integromat)", "Zapier",
      "Prompt Engineering", "AI Workflow Design",
      "SEO / Ahrefs / SEMrush", "Google Analytics", "Google Search Console",
      "Content Strategy", "GitHub / VS Code", "Trello / Agile",
      "WordPress / CMS"
    ],
    projects: [
      {
        id: "kokrochina",
        tag: "Mobile · React Native",
        title: "Kokrochina App",
        description:
          "Kids edutainment აპლიკაცია (iOS, Android, Web) Expo + React Native + TypeScript-ზე. COPPA / GDPR-K standards.",
        stack: ["Expo", "React Native", "TypeScript", "AI"],
        repo: "https://github.com/TakoTechie1/kokrochina-app",
        live: "",
        emoji: "✦"
      },
      {
        id: "ai-pulse",
        tag: "Content · YouTube",
        title: "AI PULSE GEORGIA",
        description:
          "ყოველდღიური AI სიახლეები, შედარებითი მიმოხილვები (Claude, ChatGPT, Gemini, Cursor) და ავტომატიზაციების სახელმძღვანელოები ქართულ ენაზე.",
        stack: ["YouTube", "CapCut", "AI Education"],
        repo: "",
        live: "",
        emoji: "▶"
      }
    ],
    experience: [
      {
        period: "2024 – დღემდე",
        role: "AI კონტენტ შემქმნელი & ტუტორიალების ავტორი",
        company: "AI PULSE GEORGIA (CapCut / YouTube)",
        bullets: [
          "ყოველდღიური AI სიახლეები, ანალიზები და ტუტორიალები ქართულ ენაზე",
          "Claude, ChatGPT, Gemini, Cursor და სხვა ინსტრუმენტების შედარებითი მიმოხილვები",
          "n8n, Make და Zapier ავტომატიზაციების სახელმძღვანელოები",
          "AI კონცეფციების ახსნა ტექნიკური და არატექნიკური მაყურებლისთვის"
        ]
      },
      {
        period: "2024 – დღემდე",
        role: "AI Vibe Coder & App Developer",
        company: "ფრილანს პროექტები",
        bullets: [
          "ვებ/მობ აპლიკაციები Bolt.new, Lovable, Cursor, Replit-ის გამოყენებით",
          "Prompt engineering Claude-ით კომპლექსური პროდუქტების შექმნისთვის",
          "n8n workflow-ები ბიზნეს პროცესების ოპტიმიზაციისთვის",
          "GitHub-ზე კოდის ვერსიების კონტროლი და VS Code-ში გამართვა"
        ]
      },
      {
        period: "2023 – 2024",
        role: "SEO სპეციალისტი",
        company: "10XSEO (დისტანციურად)",
        bullets: [
          "საკვანძო სიტყვების კვლევა და AI-ასისტირებული კონტენტ სტრატეგია",
          "On-page და Off-page SEO ოპტიმიზაცია — Ahrefs, SEMrush, Google Search Console",
          "SEO outreach კამპანიების დაგეგმვა, Trello / Agile პროექტების მართვა"
        ]
      },
      {
        period: "2022 – 2023",
        role: "კონტენტ მენეჯერი & ვებსაიტების ადმინი",
        company: "ფრილანს კლიენტები (დისტანციურად)",
        bullets: [
          "WordPress და CMS პლატფორმებზე ვებსაიტების ყოველდღიური მართვა",
          "SEO-ოპტიმიზებული სტატიების წერა და უცხოური კონტენტის ქართულად ადაპტაცია",
          "დეველოპერებთან კოორდინაცია — ტექნიკური ბრიფები, სტრუქტურა, ეფექტურობა"
        ]
      }
    ]
  };

  const Store = {
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) {
          this.save(DEFAULTS);
          return JSON.parse(JSON.stringify(DEFAULTS));
        }
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULTS, parsed);
      } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULTS));
      }
    },
    save(data) {
      localStorage.setItem(KEY, JSON.stringify(data));
    },
    reset() {
      localStorage.removeItem(KEY);
      return this.load();
    },
    DEFAULTS
  };

  window.PortfolioStore = Store;
})();
