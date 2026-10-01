const en = {
  meta: {
    title: 'How we work — from your idea to delivery | DRVENO',
    description:
      'Five steps from an idea to a handmade piece in your home: your idea, consultation, design and quotation, handmade in Serbia in about 1–2 weeks, delivery in about one more week.',
  },
  hero: {
    eyebrow: 'How we work',
    title: 'Every project starts with a conversation.',
    text: "You don't need a finished drawing. A photograph, a sketch or a few measurements are enough to begin. From there, we take five steps together.",
  },
  steps: [
    {
      n: '01',
      title: 'Your idea',
      text: 'Send us whatever you have. It does not need to be complete.',
      list: ['A photograph', 'A sketch', 'Measurements', 'Architectural plans', 'An inspiration image', 'A reference project', 'A written description'],
    },
    {
      n: '02',
      title: 'Consultation',
      text: 'We talk it through — what you need, what the building or room asks for, what is possible.',
      list: ['Online', 'By telephone', 'By video call', 'In person through our Swiss contact presence'],
    },
    {
      n: '03',
      title: 'Design & quotation',
      text: 'We put everything on paper and agree on it together before any wood is cut.',
      list: ['Dimensions', 'Wood species', 'Finish', 'Construction', 'Details', 'Delivery location', 'Timeline', 'Price'],
    },
    {
      n: '04',
      title: 'Handmade in Serbia',
      text: 'Your piece is made by hand in our workshop. Typically this takes about 1–2 weeks after the final specifications are confirmed. Complex projects can take longer.',
      list: [],
    },
    {
      n: '05',
      title: 'Delivery',
      text: 'Shipping typically takes about one additional week, depending on destination and project size.',
      list: [],
    },
  ],
  highlight: 'Made in Serbia. Delivered to Switzerland and across Europe.',
  timing: {
    title: 'How long does it take?',
    production: { label: 'Production', value: 'about 1–2 weeks', note: 'after final specifications are confirmed' },
    delivery: { label: 'Delivery', value: 'about 1 more week', note: 'depending on destination and size' },
    note: 'These are typical times. Complex or larger projects can require longer — we will always tell you honestly before we start.',
  },
};

export type ProcessCopy = typeof en;

const de: ProcessCopy = {
  meta: {
    title: 'So arbeiten wir — von Ihrer Idee bis zur Lieferung | DRVENO',
    description:
      'Fünf Schritte von der Idee zum handgefertigten Stück bei Ihnen zu Hause: Ihre Idee, Beratung, Entwurf und Offerte, Fertigung in Serbien in rund 1–2 Wochen, Lieferung in etwa einer weiteren Woche.',
  },
  hero: {
    eyebrow: 'So arbeiten wir',
    title: 'Jedes Projekt beginnt mit einem Gespräch.',
    text: 'Sie brauchen keinen fertigen Plan. Ein Foto, eine Skizze oder ein paar Masse genügen für den Anfang. Danach gehen wir gemeinsam fünf Schritte.',
  },
  steps: [
    {
      n: '01',
      title: 'Ihre Idee',
      text: 'Schicken Sie uns, was Sie haben. Es muss nicht vollständig sein.',
      list: ['Ein Foto', 'Eine Skizze', 'Masse', 'Architektenpläne', 'Ein Inspirationsbild', 'Ein Referenzprojekt', 'Eine Beschreibung in Worten'],
    },
    {
      n: '02',
      title: 'Beratung',
      text: 'Wir besprechen alles — was Sie brauchen, was das Gebäude oder der Raum verlangt, was möglich ist.',
      list: ['Online', 'Am Telefon', 'Per Videogespräch', 'Persönlich über unseren Kontakt in der Schweiz'],
    },
    {
      n: '03',
      title: 'Entwurf & Offerte',
      text: 'Wir halten alles schriftlich fest und stimmen es gemeinsam ab, bevor das erste Brett zugeschnitten wird.',
      list: ['Masse', 'Holzart', 'Oberfläche', 'Konstruktion', 'Details', 'Lieferort', 'Zeitplan', 'Preis'],
    },
    {
      n: '04',
      title: 'Von Hand gefertigt in Serbien',
      text: 'Ihr Stück entsteht von Hand in unserer Werkstatt. In der Regel dauert das rund 1–2 Wochen, nachdem alle Details festgelegt sind. Aufwendige Projekte brauchen mehr Zeit.',
      list: [],
    },
    {
      n: '05',
      title: 'Lieferung',
      text: 'Der Transport dauert in der Regel etwa eine weitere Woche, je nach Bestimmungsort und Grösse des Projekts.',
      list: [],
    },
  ],
  highlight: 'Gefertigt in Serbien. Geliefert in die Schweiz und in ganz Europa.',
  timing: {
    title: 'Wie lange dauert es?',
    production: { label: 'Fertigung', value: 'rund 1–2 Wochen', note: 'nachdem alle Details festgelegt sind' },
    delivery: { label: 'Lieferung', value: 'etwa 1 weitere Woche', note: 'je nach Bestimmungsort und Grösse' },
    note: 'Das sind übliche Zeiten. Aufwendige oder grössere Projekte können länger dauern — das sagen wir Ihnen immer offen, bevor wir beginnen.',
  },
};

const sr: ProcessCopy = {
  meta: {
    title: 'Kako radimo — od vaše ideje do isporuke | DRVENO',
    description:
      'Pet koraka od ideje do ručno izrađenog komada u vašem domu: vaša ideja, konsultacija, nacrt i ponuda, izrada u Srbiji za oko 1–2 nedelje, isporuka za još oko nedelju dana.',
  },
  hero: {
    eyebrow: 'Kako radimo',
    title: 'Svaki projekat počinje razgovorom.',
    text: 'Nije vam potreban gotov nacrt. Fotografija, skica ili nekoliko mera dovoljni su za početak. Odatle zajedno prolazimo kroz pet koraka.',
  },
  steps: [
    {
      n: '01',
      title: 'Vaša ideja',
      text: 'Pošaljite nam sve što imate. Ne mora da bude potpuno.',
      list: ['Fotografiju', 'Skicu', 'Mere', 'Arhitektonske planove', 'Sliku koja vas inspiriše', 'Referentni projekat', 'Pisani opis'],
    },
    {
      n: '02',
      title: 'Konsultacija',
      text: 'Razgovaramo o svemu — šta vam je potrebno, šta zgrada ili prostor traže, šta je moguće.',
      list: ['Onlajn', 'Telefonom', 'Video pozivom', 'Lično, preko našeg kontakta u Švajcarskoj'],
    },
    {
      n: '03',
      title: 'Nacrt i ponuda',
      text: 'Sve stavljamo na papir i zajedno dogovaramo pre nego što se iseče prva daska.',
      list: ['Mere', 'Vrsta drveta', 'Završna obrada', 'Konstrukcija', 'Detalji', 'Mesto isporuke', 'Rokovi', 'Cena'],
    },
    {
      n: '04',
      title: 'Ručna izrada u Srbiji',
      text: 'Vaš komad nastaje ručno u našoj radionici. Obično to traje oko 1–2 nedelje od potvrde konačne specifikacije. Složeniji projekti zahtevaju više vremena.',
      list: [],
    },
    {
      n: '05',
      title: 'Isporuka',
      text: 'Prevoz obično traje još oko nedelju dana, u zavisnosti od odredišta i veličine projekta.',
      list: [],
    },
  ],
  highlight: 'Izrađeno u Srbiji. Isporučeno u Švajcarsku i širom Evrope.',
  timing: {
    title: 'Koliko traje?',
    production: { label: 'Izrada', value: 'oko 1–2 nedelje', note: 'od potvrde konačne specifikacije' },
    delivery: { label: 'Isporuka', value: 'još oko 1 nedelja', note: 'u zavisnosti od odredišta i veličine' },
    note: 'To su uobičajeni rokovi. Složeniji ili veći projekti mogu da traju duže — o tome vam uvek otvoreno kažemo pre početka.',
  },
};

export const process = { en, de, sr };
