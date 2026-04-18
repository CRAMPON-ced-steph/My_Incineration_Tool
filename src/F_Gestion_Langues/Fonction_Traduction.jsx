export const getTranslatedParameter = (parameter) => {
  return parameter;
};

export const getLanguageCode = (currentLang) => {
  if (!currentLang) return 'en'; // default fallback

  const langString = currentLang.toString().toLowerCase();

  if (langString.includes('français') || langString.includes('francais') || langString === 'fr') {
    return 'fr';
  } else if (langString.includes('english') || langString === 'en') {
    return 'en';
  } else if (langString.includes('español') || langString.includes('espanol') || langString === 'es') {
    return 'es';
  } else if (langString.includes('deutsch') || langString === 'de') {
    return 'de';
  } else if (langString.includes('italiano') || langString === 'it') {
    return 'it';
  } else if (langString.includes('português') || langString.includes('portugues') || langString === 'pt') {
    return 'pt';
  } else if (langString.includes('中文') || langString.includes('chinese') || langString === 'zh') {
    return 'zh';
  } else if (langString.includes('日本語') || langString.includes('japanese') || langString === 'ja') {
    return 'ja';
  } else if (langString.includes('русский') || langString.includes('russian') || langString === 'ru') {
    return 'ru';
  } else if (langString.includes('العربية') || langString.includes('arabic') || langString === 'ar') {
    return 'ar';
  } else {
    return 'en'; // default to English if not found
  }
};

