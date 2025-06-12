/** Translate text via LibreTranslate **/
async function translateText(text, targetLang) {
  const res = await fetch('https://libretranslate.com/translate',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ q:text, source:'en', target:targetLang, format:'text' }) });
  const { translatedText } = await res.json();
  return translatedText;
}
