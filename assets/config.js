/* AMORA — настройки подключения (рабочая версия). */
window.AMORA_CONFIG = {
  // Вставьте объект firebaseConfig из Firebase Console → Project settings → Your apps → Web app
  firebase: {
    apiKey: "AIzaSyCyRSjgqop_7gAvLKDimF9yrQh9NLh9Fek",
    authDomain: "amora-kapan.firebaseapp.com",
    projectId: "amora-kapan",
    storageBucket: "amora-kapan.firebasestorage.app",
    messagingSenderId: "303981555117",
    appId: "1:303981555117:web:91e3d7aa391361b518c524"
  },
  // Ключ сайта reCAPTCHA v3 для Firebase App Check (защита базы от ботов). Пусто — App Check выключен.
  appCheckKey: "",
  // Адрес Cloudflare Worker для Telegram, напр. "https://amora-bot.<аккаунт>.workers.dev"
  telegramWorker: "",
  // Имя Telegram-бота без @, напр. "amora_kapan_bot"
  telegramBot: "",
  // Адрес сайта — используется в QR-кодах столов
  siteUrl: "https://amora.am/",
  contact: {
    phone: "+374 94 410 140",
    instagram: "amora.cafe.lounge",
    mapUrl: "https://maps.google.com/?cid=8388215835638994954"
  }
};
