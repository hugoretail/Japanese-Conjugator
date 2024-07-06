const is_kanji = (c) => {
  return /[\u3000-\u303F\u4E00-\u9FEF]/.test(c);
};

export function autofurigana(kanji, kana) {
  let pairs = []; 
  let rp = 0;
  let kana_build = "";
  let kanji_build = "";

  const build_push = () => {
    pairs.push([kanji_build, kana_build]);
    kana_build = "";
    kanji_build = "";
  };

  for (let kp = 0; kp < kanji.length; kp++) {
    kanji_build += kanji[kp];

    if (kp + 1 == kanji.length) {
      while (rp < kana.length) {
        kana_build += kana[rp]; 
        rp++;
      }

      if (!is_kanji(kanji[kp])) kana_build = null;

      build_push();
      break;
    } else if (is_kanji(kanji[kp]) && !is_kanji(kanji[kp+1])) {
      while (kanji[kp+1] !== kana[rp] || kana_build.length < kanji_build.length) {
        if (kana[rp] === undefined) {
          return null;
        }
        kana_build += kana[rp];
        rp++;
      }

      build_push();
    } else if (!is_kanji(kanji[kp]) && is_kanji(kanji[kp+1])) {
      kana_build = null;
      rp += kanji_build.length;
      build_push(); 
    }
  }

  return pairs;
}

export function autofurigana_brackets(kanji, kana) {
  let pairs = autofurigana(kanji, kana);
  let str = '';
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i][1] !== null) {
      if (i !== 0) {
        str += ' ';
      }
      str += pairs[i][0] + '[' + pairs[i][1] + ']';
    } else {
      str += pairs[i][0];
    }
  }
  return str;
}