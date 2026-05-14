const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'client/src/messages');
const langs = ['es', 'fr', 'de', 'ar', 'pt', 'ru', 'ja', 'ko'];

// Contact translations per language
const contactLocale = {
  es: {
    contactInfo: 'Información de Contacto', mobile: 'Móvil',
    ourLocation: 'Nuestra Ubicación', aboutUs: 'Sobre Nosotros',
    formTitle: 'Envíenos un Mensaje', sendMessage: 'Enviar Mensaje'
  },
  fr: {
    contactInfo: 'Coordonnées', mobile: 'Mobile',
    ourLocation: 'Notre Emplacement', aboutUs: 'À Propos',
    formTitle: 'Envoyez-nous un Message', sendMessage: 'Envoyer le Message'
  },
  de: {
    contactInfo: 'Kontaktinformationen', mobile: 'Mobil',
    ourLocation: 'Unser Standort', aboutUs: 'Über Uns',
    formTitle: 'Senden Sie uns eine Nachricht', sendMessage: 'Nachricht Senden'
  },
  ar: {
    contactInfo: 'معلومات الاتصال', mobile: 'الجوال',
    ourLocation: 'موقعنا', aboutUs: 'معلومات عنا',
    formTitle: 'أرسل لنا رسالة', sendMessage: 'إرسال الرسالة'
  },
  pt: {
    contactInfo: 'Informações de Contato', mobile: 'Celular',
    ourLocation: 'Nossa Localização', aboutUs: 'Sobre Nós',
    formTitle: 'Envie-nos uma Mensagem', sendMessage: 'Enviar Mensagem'
  },
  ru: {
    contactInfo: 'Контактная Информация', mobile: 'Мобильный',
    ourLocation: 'Наше Местоположение', aboutUs: 'О Нас',
    formTitle: 'Отправьте Нам Сообщение', sendMessage: 'Отправить Сообщение'
  },
  ja: {
    contactInfo: 'お問い合わせ情報', mobile: '携帯電話',
    ourLocation: '所在地', aboutUs: '会社概要',
    formTitle: 'メッセージを送信', sendMessage: '送信する'
  },
  ko: {
    contactInfo: '연락처 정보', mobile: '휴대전화',
    ourLocation: '회사 위치', aboutUs: '회사 소개',
    formTitle: '메시지 보내기', sendMessage: '보내기'
  }
};

for (const lang of langs) {
  const file = path.join(messagesDir, `${lang}.json`);
  if (!fs.existsSync(file)) { console.log(`SKIP ${lang}: file not found`); continue; }

  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const loc = contactLocale[lang];

  data.contact.contactInfo = loc.contactInfo;
  data.contact.mobile = loc.mobile;
  data.contact.ourLocation = loc.ourLocation;
  data.contact.aboutUs = loc.aboutUs;
  data.contact.formTitle = loc.formTitle;
  data.contact.sendMessage = loc.sendMessage;

  // Ensure followUs exists (might be missing in some)
  if (!data.contact.followUs) data.contact.followUs = 'Follow Us';

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`Updated ${lang}.json`);
}
