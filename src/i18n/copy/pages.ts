/** Copy for the smaller pages: collection, projects, journal, start, contact, legal, system pages. */

const en = {
  work: {
    meta: {
      title: 'Work & Collection — windows, tables, doors, custom woodwork | DRVENO',
      description:
        'A curated collection of handmade pieces from the DRVENO workshop: wooden windows, heritage windows, tables, doors and custom woodwork. Every piece made to order and adapted to you.',
    },
    eyebrow: 'Work',
    title: 'A curated collection.',
    text: 'These pieces are not stock. They are starting points — each one made to order, to your dimensions, in the wood and finish we agree on together.',
    categoriesTitle: 'Categories',
    collectionTitle: 'Pieces',
    otherTitle: 'Have something else in mind?',
    otherText: 'Almost anything that can be built from wood can begin with a conversation.',
  },
  projects: {
    meta: {
      title: 'Projects — windows, restoration, tables and doors | DRVENO',
      description:
        'Selected projects by DRVENO: historic windows for public buildings, restoration of old houses, tables and doors — each made by hand in our workshop in Serbia.',
    },
    eyebrow: 'Projects',
    title: 'Work, one project at a time.',
    text: 'Windows for public buildings, restoration of old houses, tables and doors made for particular rooms. Each project began with a conversation.',
  },
  journal: {
    meta: {
      title: 'From the Workshop — notes on wood, windows and craft | DRVENO',
      description:
        'Articles from the DRVENO workshop: why we still build wooden windows, when an old window is worth saving, and how to care for solid wood.',
    },
    eyebrow: 'Journal',
    title: 'From the Workshop.',
    text: 'Notes on wood, windows, restoration and the slow work in between.',
  },
  start: {
    meta: {
      title: 'Start a project — tell us your idea | DRVENO',
      description:
        "Tell us what you would like us to build or restore. You don't need a finished drawing — a photo, a sketch or a few measurements are enough to begin.",
    },
    eyebrow: 'Start a project',
    title: 'What would you like us to build?',
    text: "You don't need a finished drawing. Tell us what you have in mind, add a photo or a sketch if you have one, and we will take it from there.",
    asideTitle: 'What happens next',
    aside: [
      'We read every enquiry personally.',
      'We get back to you, usually within two working days, to talk it through.',
      'Once the details are clear, you receive a written quotation.',
      'Nothing is binding until you have approved the quotation.',
    ],
    directTitle: 'Prefer to talk directly?',
  },
  contact: {
    meta: {
      title: 'Contact — DRVENO workshop in Serbia, consultation in Switzerland',
      description:
        'Contact DRVENO by email, telephone or WhatsApp. Workshop in Serbia, consultation for Swiss clients in Switzerland, delivery across Europe.',
    },
    eyebrow: 'Contact',
    title: 'Let us talk.',
    text: 'Write to us, call us or send a message. For a specific project, the project form helps us understand your idea from the start.',
    workshopTitle: 'Workshop',
    workshopText: 'Serbia',
    swissTitle: 'Consultation in Switzerland',
    formTitle: 'Send us a message',
    projectHint: 'Have a project in mind?',
  },
  privacy: {
    meta: {
      title: 'Privacy policy | DRVENO',
      description: 'How DRVENO handles personal data submitted through this website, which cookies we use and how you can change your consent.',
    },
    title: 'Privacy policy',
  },
  imprint: {
    meta: {
      title: 'Imprint | DRVENO',
      description: 'Legal information about the operator of the DRVENO website.',
    },
    title: 'Imprint',
  },
  thanks: {
    meta: { title: 'Thank you | DRVENO', description: 'Your enquiry has been sent to DRVENO.' },
  },
  notFound: {
    meta: { title: 'Page not found | DRVENO', description: 'This page could not be found.' },
  },
};

export type PagesCopy = typeof en;

const de: PagesCopy = {
  work: {
    meta: {
      title: 'Arbeiten & Kollektion — Fenster, Tische, Türen, Holzarbeiten nach Mass | DRVENO',
      description:
        'Eine kuratierte Auswahl handgefertigter Stücke aus der Werkstatt DRVENO: Holzfenster, historische Fenster, Tische, Türen und Holzarbeiten nach Mass. Jedes Stück auf Bestellung gefertigt und auf Sie abgestimmt.',
    },
    eyebrow: 'Arbeiten',
    title: 'Eine kuratierte Auswahl.',
    text: 'Diese Stücke sind keine Lagerware. Sie sind Ausgangspunkte — jedes wird auf Bestellung gefertigt, nach Ihren Massen, im Holz und mit der Oberfläche, die wir gemeinsam festlegen.',
    categoriesTitle: 'Kategorien',
    collectionTitle: 'Stücke',
    otherTitle: 'Sie haben etwas anderes im Sinn?',
    otherText: 'Fast alles, was sich aus Holz bauen lässt, kann mit einem Gespräch beginnen.',
  },
  projects: {
    meta: {
      title: 'Projekte — Fenster, Restaurierung, Tische und Türen | DRVENO',
      description:
        'Ausgewählte Projekte von DRVENO: historische Fenster für öffentliche Bauten, Restaurierung alter Häuser, Tische und Türen — jedes von Hand gefertigt in unserer Werkstatt in Serbien.',
    },
    eyebrow: 'Projekte',
    title: 'Ein Projekt nach dem anderen.',
    text: 'Fenster für öffentliche Bauten, die Restaurierung alter Häuser, Tische und Türen für bestimmte Räume. Jedes Projekt begann mit einem Gespräch.',
  },
  journal: {
    meta: {
      title: 'Aus der Werkstatt — über Holz, Fenster und Handwerk | DRVENO',
      description:
        'Beiträge aus der Werkstatt DRVENO: warum wir noch Holzfenster bauen, wann sich ein altes Fenster lohnt und wie man Massivholz pflegt.',
    },
    eyebrow: 'Journal',
    title: 'Aus der Werkstatt.',
    text: 'Notizen über Holz, Fenster, Restaurierung und die langsame Arbeit dazwischen.',
  },
  start: {
    meta: {
      title: 'Projekt starten — erzählen Sie uns Ihre Idee | DRVENO',
      description:
        'Erzählen Sie uns, was wir für Sie bauen oder restaurieren dürfen. Sie brauchen keinen fertigen Plan — ein Foto, eine Skizze oder ein paar Masse genügen für den Anfang.',
    },
    eyebrow: 'Projekt starten',
    title: 'Was dürfen wir für Sie bauen?',
    text: 'Sie brauchen keinen fertigen Plan. Erzählen Sie uns, was Sie im Sinn haben, fügen Sie ein Foto oder eine Skizze hinzu, wenn Sie eines haben — den Rest besprechen wir gemeinsam.',
    asideTitle: 'Wie es weitergeht',
    aside: [
      'Wir lesen jede Anfrage persönlich.',
      'Wir melden uns, in der Regel innerhalb von zwei Arbeitstagen, um alles zu besprechen.',
      'Sobald die Details klar sind, erhalten Sie eine schriftliche Offerte.',
      'Verbindlich wird erst, was Sie in der Offerte bestätigt haben.',
    ],
    directTitle: 'Lieber direkt sprechen?',
  },
  contact: {
    meta: {
      title: 'Kontakt — Werkstatt DRVENO in Serbien, Beratung in der Schweiz',
      description:
        'Kontaktieren Sie DRVENO per E-Mail, Telefon oder WhatsApp. Werkstatt in Serbien, Beratung für Kundinnen und Kunden in der Schweiz, Lieferung in ganz Europa.',
    },
    eyebrow: 'Kontakt',
    title: 'Sprechen wir miteinander.',
    text: 'Schreiben Sie uns, rufen Sie an oder senden Sie eine Nachricht. Für ein konkretes Projekt hilft uns das Projektformular, Ihre Idee von Anfang an zu verstehen.',
    workshopTitle: 'Werkstatt',
    workshopText: 'Serbien',
    swissTitle: 'Beratung in der Schweiz',
    formTitle: 'Schreiben Sie uns',
    projectHint: 'Sie haben ein Projekt im Sinn?',
  },
  privacy: {
    meta: {
      title: 'Datenschutzerklärung | DRVENO',
      description: 'Wie DRVENO mit Personendaten umgeht, die über diese Website übermittelt werden, welche Cookies wir verwenden und wie Sie Ihre Einwilligung ändern können.',
    },
    title: 'Datenschutzerklärung',
  },
  imprint: {
    meta: {
      title: 'Impressum | DRVENO',
      description: 'Rechtliche Angaben zur Betreiberin der Website DRVENO.',
    },
    title: 'Impressum',
  },
  thanks: {
    meta: { title: 'Vielen Dank | DRVENO', description: 'Ihre Anfrage wurde an DRVENO gesendet.' },
  },
  notFound: {
    meta: { title: 'Seite nicht gefunden | DRVENO', description: 'Diese Seite wurde nicht gefunden.' },
  },
};

const sr: PagesCopy = {
  work: {
    meta: {
      title: 'Radovi i kolekcija — prozori, stolovi, vrata, izrada po meri | DRVENO',
      description:
        'Pažljivo odabrani ručno izrađeni komadi iz radionice DRVENO: drveni prozori, istorijski prozori, stolovi, vrata i izrada po meri. Svaki komad se pravi po porudžbini i prilagođava vama.',
    },
    eyebrow: 'Radovi',
    title: 'Pažljivo odabrana kolekcija.',
    text: 'Ovi komadi nisu na lageru. Oni su polazne tačke — svaki se pravi po porudžbini, po vašim merama, od drveta i sa završnom obradom koje zajedno dogovorimo.',
    categoriesTitle: 'Kategorije',
    collectionTitle: 'Komadi',
    otherTitle: 'Imate nešto drugo na umu?',
    otherText: 'Gotovo sve što može da se napravi od drveta može da počne razgovorom.',
  },
  projects: {
    meta: {
      title: 'Projekti — prozori, restauracija, stolovi i vrata | DRVENO',
      description:
        'Izabrani projekti radionice DRVENO: istorijski prozori za javne objekte, restauracija starih kuća, stolovi i vrata — sve ručno izrađeno u našoj radionici u Srbiji.',
    },
    eyebrow: 'Projekti',
    title: 'Projekat po projekat.',
    text: 'Prozori za javne objekte, restauracija starih kuća, stolovi i vrata za određene prostore. Svaki projekat počeo je razgovorom.',
  },
  journal: {
    meta: {
      title: 'Iz radionice — o drvetu, prozorima i zanatu | DRVENO',
      description:
        'Tekstovi iz radionice DRVENO: zašto i dalje pravimo drvene prozore, kada vredi sačuvati stari prozor i kako se neguje masivno drvo.',
    },
    eyebrow: 'Iz radionice',
    title: 'Iz radionice.',
    text: 'Beleške o drvetu, prozorima, restauraciji i sporom radu između.',
  },
  start: {
    meta: {
      title: 'Pokrenite projekat — podelite svoju ideju | DRVENO',
      description:
        'Recite nam šta želite da napravimo ili obnovimo. Nije vam potreban gotov nacrt — fotografija, skica ili nekoliko mera dovoljni su za početak.',
    },
    eyebrow: 'Pokrenite projekat',
    title: 'Šta želite da napravimo za vas?',
    text: 'Nije vam potreban gotov nacrt. Recite nam šta imate na umu, dodajte fotografiju ili skicu ako je imate, a mi ćemo nastaviti odatle.',
    asideTitle: 'Šta sledi',
    aside: [
      'Svaki upit čitamo lično.',
      'Javljamo vam se, obično u roku od dva radna dana, da razgovaramo o svemu.',
      'Kada su detalji jasni, dobijate pisanu ponudu.',
      'Ništa nije obavezujuće dok ne potvrdite ponudu.',
    ],
    directTitle: 'Radije biste razgovarali direktno?',
  },
  contact: {
    meta: {
      title: 'Kontakt — radionica DRVENO u Srbiji, konsultacije u Švajcarskoj',
      description:
        'Kontaktirajte DRVENO imejlom, telefonom ili putem WhatsApp-a. Radionica u Srbiji, konsultacije za klijente u Švajcarskoj, isporuka širom Evrope.',
    },
    eyebrow: 'Kontakt',
    title: 'Hajde da razgovaramo.',
    text: 'Pišite nam, pozovite nas ili pošaljite poruku. Za konkretan projekat, obrazac za projekat pomaže nam da od početka razumemo vašu ideju.',
    workshopTitle: 'Radionica',
    workshopText: 'Srbija',
    swissTitle: 'Konsultacije u Švajcarskoj',
    formTitle: 'Pošaljite nam poruku',
    projectHint: 'Imate projekat na umu?',
  },
  privacy: {
    meta: {
      title: 'Politika privatnosti | DRVENO',
      description: 'Kako DRVENO postupa sa ličnim podacima poslatim preko ovog sajta, koje kolačiće koristimo i kako možete da promenite svoju saglasnost.',
    },
    title: 'Politika privatnosti',
  },
  imprint: {
    meta: {
      title: 'Impresum | DRVENO',
      description: 'Pravne informacije o vlasniku sajta DRVENO.',
    },
    title: 'Impresum',
  },
  thanks: {
    meta: { title: 'Hvala vam | DRVENO', description: 'Vaš upit je poslat radionici DRVENO.' },
  },
  notFound: {
    meta: { title: 'Stranica nije pronađena | DRVENO', description: 'Ova stranica nije pronađena.' },
  },
};

export const pages = { en, de, sr };
