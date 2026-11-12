/**
 * Every piece of interface text, in both languages.
 * Edit the words here; nothing is hard-coded in the components.
 */
export const strings = {
  el: {
    slogan: 'I shoot. You smile.', // stays in English on purpose
    timelineHeading: 'Η ιστορία', // shown uppercase: Η ΙΣΤΟΡΙΑ
    talkToMe: 'Μίλα μου',
    copied: 'Αντιγράφηκε',
    skipToContact: 'Μετάβαση στην επικοινωνία',
    notFound: 'Χάθηκες; Πάμε σπίτι.',
    privacy: 'Απόρρητο',
    playVideo: 'Αναπαραγωγή βίντεο',
    close: 'Κλείσιμο',
    previous: 'Προηγούμενη',
    next: 'Επόμενη',
    mute: 'Σίγαση',
    unmute: 'Ήχος',
    today: 'Σήμερα',
    storyBeingWritten: 'Η ιστορία γράφεται.',
    languageNav: 'Γλώσσα',
    logoLabel: 'PAPAFIOGOS – Παπαφιόγκος',
    privacyTitle: 'Απόρρητο',
    /**
     * Privacy page. {email} is filled in from site.ts (contact.email).
     * privacyAnalytics is only shown while Cloudflare Web Analytics is switched on.
     */
    privacyBody: [
      'Υπεύθυνος για αυτόν τον ιστότοπο και για τα δεδομένα σου είναι ο Αριστείδης Κάντας (PAPAFIOGOS), Πάτρα. Επικοινωνία: {email}.',
      'Ο ιστότοπος δεν χρησιμοποιεί cookies, δεν έχει φόρμες ή λογαριασμούς και δεν συλλέγει προσωπικά δεδομένα.',
      'Φιλοξενείται στο Cloudflare, το οποίο κρατά για λίγο τεχνικά στοιχεία (όπως τη διεύθυνση IP) μόνο για την ασφάλεια και τη σωστή λειτουργία του.',
      'Τα βίντεο από YouTube ή Vimeo φορτώνουν μόνο αν πατήσεις «αναπαραγωγή». Από εκεί και πέρα ισχύουν οι όροι εκείνων των υπηρεσιών.',
      'Αν μου στείλεις email ή με πάρεις τηλέφωνο, χρησιμοποιώ τα στοιχεία σου μόνο για να σου απαντήσω και δεν τα δίνω σε κανέναν. Μπορείς οποιαδήποτε στιγμή να ζητήσεις να τα δεις ή να τα διαγράψω.',
    ],
    privacyAnalytics:
      'Μετράω τις επισκέψεις ανώνυμα και χωρίς cookies, με το Cloudflare Web Analytics. Δεν ξέρω ποιος είσαι.',
    privacyUpdated: 'Τελευταία ενημέρωση: 12 Νοεμβρίου 2026',
    home: 'Αρχική',
  },
  en: {
    slogan: 'I shoot. You smile.',
    timelineHeading: 'The story',
    talkToMe: 'Talk to me',
    copied: 'Copied',
    skipToContact: 'Skip to contact',
    notFound: 'Lost? Let’s go home.',
    privacy: 'Privacy',
    playVideo: 'Play video',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    mute: 'Mute',
    unmute: 'Sound on',
    today: 'Today',
    storyBeingWritten: 'The story is being written.',
    languageNav: 'Language',
    logoLabel: 'PAPAFIOGOS – Παπαφιόγκος',
    privacyTitle: 'Privacy',
    privacyBody: [
      'This website is run by Aristeidis Kantas (PAPAFIOGOS), Patras, Greece, who is also responsible for your data. Contact: {email}.',
      'It uses no cookies, has no forms or accounts, and does not collect personal data.',
      'It is hosted on Cloudflare, which briefly keeps technical details (such as your IP address) only for security and to keep the site running.',
      'YouTube or Vimeo videos only load if you press play. From then on, those services’ own terms apply.',
      'If you email or call me, I use your details only to reply and never share them. You can ask to see them, or have them deleted, at any time.',
    ],
    privacyAnalytics:
      'Visits are counted anonymously and without cookies, with Cloudflare Web Analytics. I don’t know who you are.',
    privacyUpdated: 'Last updated: 12 November 2026',
    home: 'Home',
  },
} as const;

export type StringKey = Exclude<keyof (typeof strings)['el'], 'privacyBody'>;
