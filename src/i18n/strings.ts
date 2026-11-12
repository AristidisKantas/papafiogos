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
    /** [OWNER INPUT] final privacy wording */
    privacyBody: [
      'Αυτός ο ιστότοπος δεν συλλέγει προσωπικά δεδομένα και δεν χρησιμοποιεί cookies.',
      'Τα στατιστικά επισκεψιμότητας (αν είναι ενεργά) είναι ανώνυμα και χωρίς cookies, μέσω του Cloudflare Web Analytics.',
      'Τα βίντεο από YouTube ή Vimeo φορτώνουν μόνο αν πατήσεις «αναπαραγωγή».',
      'Για οποιαδήποτε ερώτηση, μίλα μου.',
    ],
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
    /** [OWNER INPUT] final privacy wording */
    privacyBody: [
      'This website does not collect personal data and does not use cookies.',
      'Visitor statistics (if enabled) are anonymous and cookieless, via Cloudflare Web Analytics.',
      'YouTube or Vimeo videos only load if you press play.',
      'Any questions? Talk to me.',
    ],
    home: 'Home',
  },
} as const;

export type StringKey = Exclude<keyof (typeof strings)['el'], 'privacyBody'>;
