/**
 * Legal texts (Markdown). These are a careful starting point, written to
 * match how this site actually works (consent-gated analytics, no PII in
 * analytics, forms). They MUST be reviewed by a legal professional and the
 * bracketed placeholders completed before launch.
 */
import { site } from '../../config/site';

const email = site.contact.email;

const privacy = {
  en: `
_Last updated: October 2026_

## Who is responsible

The website drveno.com is operated by ${site.legalName}, [registered address, Serbia]. For any question about your personal data, write to [${email}](mailto:${email}).

## What we collect when you contact us

When you send us a project enquiry, a consultation request or a message, we receive the details you enter: your name, email address, phone number (if given), country, city or postcode (if given), your description and any files you attach. We use these details only to reply to you, to prepare a quotation and — if you go ahead — to carry out your project.

We keep enquiries for as long as needed to handle them and for any statutory retention periods. You can ask us to delete your enquiry at any time.

## Form delivery and hosting

The website and its forms are delivered by our hosting provider, which processes form submissions on our behalf and may store them on servers outside Serbia and Switzerland. We have chosen providers that offer appropriate safeguards for international data transfers.

## Cookies and similar technologies

**Essential** — We store your language choice and your cookie settings in your browser so the site works as you expect. These are always active.

**Analytics** (only with your consent) — We use Google Tag Manager and Google Analytics to understand which pages are useful. We use Google Consent Mode: until you agree, analytics cookies are not set. We never send names, email addresses, phone numbers, messages, addresses or file names to analytics tools.

**Marketing** (only with your consent) — Allows us to measure the effect of advertising campaigns.

You can change your choice at any time via "Cookie settings" at the bottom of every page.

## Your rights

Depending on where you live, you have the right to access, correct or delete your personal data, to restrict or object to its processing, to data portability and to withdraw consent at any time. You may also lodge a complaint with a supervisory authority — in Switzerland the FDPIC, in Serbia the Commissioner for Information of Public Importance and Personal Data Protection, or the authority in your EU country of residence.

## Contact

[${email}](mailto:${email})
`,
  de: `
_Stand: Oktober 2026_

## Verantwortliche Stelle

Die Website drveno.com wird betrieben von ${site.legalName}, [Geschäftsadresse, Serbien]. Bei Fragen zu Ihren Personendaten schreiben Sie uns an [${email}](mailto:${email}).

## Welche Daten wir bei einer Anfrage erhalten

Wenn Sie uns eine Projektanfrage, eine Beratungsanfrage oder eine Nachricht senden, erhalten wir die von Ihnen eingegebenen Angaben: Name, E-Mail-Adresse, Telefonnummer (falls angegeben), Land, Ort oder PLZ (falls angegeben), Ihre Beschreibung sowie allfällige Dateien. Wir verwenden diese Angaben ausschliesslich, um Ihnen zu antworten, eine Offerte zu erstellen und — wenn Sie uns beauftragen — Ihr Projekt auszuführen.

Wir bewahren Anfragen so lange auf, wie es für deren Bearbeitung und allfällige gesetzliche Aufbewahrungsfristen nötig ist. Sie können jederzeit die Löschung Ihrer Anfrage verlangen.

## Formularübermittlung und Hosting

Die Website und ihre Formulare werden von unserem Hosting-Anbieter bereitgestellt, der Formulareingaben in unserem Auftrag verarbeitet und sie auch auf Servern ausserhalb Serbiens und der Schweiz speichern kann. Wir haben Anbieter gewählt, die geeignete Garantien für internationale Datenübermittlungen bieten.

## Cookies und ähnliche Technologien

**Notwendig** — Wir speichern Ihre Sprachwahl und Ihre Cookie-Einstellungen in Ihrem Browser, damit die Website wie erwartet funktioniert. Diese sind immer aktiv.

**Analyse** (nur mit Ihrer Einwilligung) — Wir verwenden Google Tag Manager und Google Analytics, um zu verstehen, welche Seiten nützlich sind. Wir nutzen den Google Consent Mode: Solange Sie nicht zustimmen, werden keine Analyse-Cookies gesetzt. Namen, E-Mail-Adressen, Telefonnummern, Nachrichten, Adressen oder Dateinamen werden nie an Analysewerkzeuge übermittelt.

**Marketing** (nur mit Ihrer Einwilligung) — Ermöglicht es uns, die Wirkung von Werbekampagnen zu messen.

Sie können Ihre Wahl jederzeit über «Cookie-Einstellungen» am Ende jeder Seite ändern.

## Ihre Rechte

Je nach Wohnsitz haben Sie das Recht auf Auskunft, Berichtigung und Löschung Ihrer Personendaten, auf Einschränkung der Bearbeitung, auf Widerspruch, auf Datenherausgabe sowie auf jederzeitigen Widerruf Ihrer Einwilligung. Sie können sich zudem bei einer Aufsichtsbehörde beschweren — in der Schweiz beim EDÖB, in Serbien beim Beauftragten für Informationen von öffentlicher Bedeutung und Schutz personenbezogener Daten oder bei der Behörde Ihres EU-Wohnsitzstaates.

## Kontakt

[${email}](mailto:${email})
`,
  sr: `
_Poslednje ažuriranje: oktobar 2026._

## Ko je odgovoran

Sajt drveno.com vodi ${site.legalName}, [adresa sedišta, Srbija]. Za sva pitanja o vašim ličnim podacima pišite nam na [${email}](mailto:${email}).

## Šta prikupljamo kada nas kontaktirate

Kada nam pošaljete upit za projekat, zahtev za konsultaciju ili poruku, dobijamo podatke koje unesete: ime i prezime, imejl adresu, broj telefona (ako ga navedete), državu, grad ili poštanski broj (ako ih navedete), vaš opis i eventualne priložene datoteke. Ove podatke koristimo isključivo da bismo vam odgovorili, pripremili ponudu i — ako se odlučite — realizovali vaš projekat.

Upite čuvamo onoliko dugo koliko je potrebno za njihovu obradu i eventualne zakonske rokove čuvanja. U svakom trenutku možete zatražiti brisanje svog upita.

## Slanje obrazaca i hosting

Sajt i njegove obrasce isporučuje naš hosting provajder, koji u naše ime obrađuje poslate obrasce i može da ih čuva na serverima van Srbije i Švajcarske. Izabrali smo provajdere koji pružaju odgovarajuće garancije za međunarodni prenos podataka.

## Kolačići i slične tehnologije

**Neophodni** — U vašem pregledaču čuvamo izabrani jezik i podešavanja kolačića, kako bi sajt radio onako kako očekujete. Uvek su uključeni.

**Analitika** (samo uz vašu saglasnost) — Koristimo Google Tag Manager i Google Analytics da bismo razumeli koje su stranice korisne. Koristimo Google Consent Mode: dok ne date saglasnost, analitički kolačići se ne postavljaju. Imena, imejl adrese, brojevi telefona, poruke, adrese i nazivi datoteka nikada se ne šalju analitičkim alatima.

**Marketing** (samo uz vašu saglasnost) — Omogućava nam da merimo efekat reklamnih kampanja.

Svoj izbor možete promeniti u bilo kom trenutku preko opcije „Podešavanja kolačića“ na dnu svake stranice.

## Vaša prava

U zavisnosti od mesta prebivališta, imate pravo na pristup, ispravku i brisanje ličnih podataka, na ograničenje obrade, na prigovor, na prenosivost podataka i na povlačenje saglasnosti u bilo kom trenutku. Možete podneti i pritužbu nadzornom organu — u Srbiji Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti, u Švajcarskoj FDPIC-u, ili organu u državi EU u kojoj živite.

## Kontakt

[${email}](mailto:${email})
`,
};

const imprint = {
  en: `
**${site.legalName}**
[Registered business name and legal form]
[Street and number]
[Postcode, town], Serbia

Registration number: [PIB / MB]
Responsible for content: [Name]

Email: [${email}](mailto:${email})

### Consultation in Switzerland

Contact for clients in Switzerland: ${site.contact.switzerland.phone}

### Images

Photography on this site is a placeholder and will be replaced with photographs of DRVENO's own work.
`,
  de: `
**${site.legalName}**
[Eingetragener Firmenname und Rechtsform]
[Strasse und Hausnummer]
[PLZ, Ort], Serbien

Registernummer: [PIB / MB]
Verantwortlich für den Inhalt: [Name]

E-Mail: [${email}](mailto:${email})

### Beratung in der Schweiz

Kontakt für Kundinnen und Kunden in der Schweiz: ${site.contact.switzerland.phone}

### Bilder

Die Bilder auf dieser Website sind Platzhalter und werden durch Fotografien eigener Arbeiten von DRVENO ersetzt.
`,
  sr: `
**${site.legalName}**
[Registrovani naziv i pravna forma]
[Ulica i broj]
[Poštanski broj, mesto], Srbija

Matični broj / PIB: [MB / PIB]
Odgovorno lice za sadržaj: [Ime]

Imejl: [${email}](mailto:${email})

### Konsultacije u Švajcarskoj

Kontakt za klijente u Švajcarskoj: ${site.contact.switzerland.phone}

### Fotografije

Fotografije na ovom sajtu su privremene i biće zamenjene fotografijama radova radionice DRVENO.
`,
};

export const legal = { privacy, imprint };
