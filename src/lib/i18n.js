import enLocales from '../locales/en.json';
import cnLocales from '../locales/cn.json';
import hkLocales from '../locales/hk.json';
import jaLocales from '../locales/ja.json';
import koLocales from '../locales/ko.json';
import esLocales from '../locales/es.json';
import ptLocales from '../locales/pt.json';
import itLocales from '../locales/it.json';
import frLocales from '../locales/fr.json';
import deLocales from '../locales/de.json';
import thLocales from '../locales/th.json';
import trLocales from '../locales/tr.json';
import ruLocales from '../locales/ru.json';
import viLocales from '../locales/vi.json';
import hiLocales from '../locales/hi.json';
import bnLocales from '../locales/bn.json';
import urLocales from '../locales/ur.json';

export const locales = {
  "en": {
    name: "English",
    locales: enLocales
  },
  "zh-CN": {
    name: "简体中文",
    locales: cnLocales
  },
  "zh-HK": {
    name: "繁體中文",
    locales: hkLocales
  },
  "hi": {
    name: "हिन्दी",
    locales: hiLocales
  },
  "es": {
    name: "Español",
    locales: esLocales
  },
  "fr": {
    name: "Français",
    locales: frLocales
  },
  "de": {
    name: "Deutsch",
    locales: deLocales
  },
  "bn": {
    name: "বাংলা",
    locales: bnLocales
  },
  "ru": {
    name: "Русский",
    locales: ruLocales
  },
  "pt": {
    name: "Português",
    locales: ptLocales
  },
  "ur": {
    name: "اردو",
    locales: urLocales
  },
  "ja": {
    name: "日本語",
    locales: jaLocales
  },
  "ko": {
    name: "한국어",
    locales: koLocales
  },
  "vi": {
    name: "Tiếng Việt",
    locales: viLocales
  },
  "it": {
    name: "Italiano",
    locales: itLocales
  },
  "th": {
    name: "ไทย",
    locales: thLocales
  },
  "tr": {
    name: "Türkçe",
    locales: trLocales
  }
};

export function getLocale(locale) {
  return locales[locale] || locales.en;
}

export function findLocaleFromPathname(){
  if(typeof window === 'undefined') return 'en';
  const pathname = window.location.pathname;
  const locale = Object.keys(locales).find(locale => pathname.startsWith(`/${locale}`));
  return locale || 'en';
}

export function autoTranslation(key,...args){
  const locale = findLocaleFromPathname();
  return getTranslation(locale, key,args);
}

export function getTranslation(locale, key,...args) {
  const localeData = getLocale(locale);
  
  // 直接访问键，不再使用 split
  let result = localeData.locales[key];
  
  if (result === undefined) {
    console.log(`Translation not found for key: ${key} in locale: ${locale}`);
    return key;
  }

  args.forEach((arg, index) => {
    const placeholder = `$${index + 1}`;
    result = result.replace(new RegExp('\\' + placeholder, 'g'), arg);
  });

  return result;
}
