#!/usr/bin/env node
/**
 * 앱인토스 미니앱 검수 전 자동 검증
 * 사용법: npm run verify
 *
 * 새 앱 생성 시 아래 NAME, APP_ID를 실제 값으로 교체하세요.
 */
const fs = require("fs");
const path = require("path");

// ★★★ 새 앱 생성 시 이 2개를 실제 콘솔 정보로 교체 ★★★
const NAME = "%%displayName%%"; // 콘솔 국문 이름
const APP_ID = "%%appName%%"; // 콘솔 앱 ID

const isPlaceholder = NAME.includes("%%") || APP_ID.includes("%%");
const errors = [];
const warnings = [];
const passed = [];

function check(name, ok, msg) {
  if (ok) {
    passed.push("\u2705 " + name);
  } else {
    errors.push("\u274C " + name + ": " + msg);
  }
}

console.log(
  "\n\uD83D\uDD0D \uC571\uC778\uD1A0\uC2A4 \uAC80\uC218 \uC804 \uC790\uB3D9 \uAC80\uC99D\n",
);

// --- 플레이스홀더 경고 ---
if (isPlaceholder) {
  console.log(
    "\u26A0\uFE0F  scripts/verify-build.js\uC758 NAME, APP_ID\uAC00 \uD50C\uB808\uC774\uC2A4\uD640\uB354\uC785\uB2C8\uB2E4.",
  );
  console.log(
    "   \uCF58\uC194 \uC815\uBCF4\uB85C \uAD50\uCCB4 \uD6C4 \uB2E4\uC2DC \uC2E4\uD589\uD558\uC138\uC694.\n",
  );
}

// ===== 1. granite.config.ts =====
console.log("\uD83D\uDCCB granite.config.ts \uAC80\uC0AC...");
try {
  const c = fs.readFileSync("granite.config.ts", "utf-8");

  check(
    "displayName \uD50C\uB808\uC774\uC2A4\uD640\uB354 \uC81C\uAC70",
    !c.includes('displayName: "%%'),
    "%%displayName%% \uB0A8\uC544\uC788\uC74C",
  );
  check(
    "appName \uD50C\uB808\uC774\uC2A4\uD640\uB354 \uC81C\uAC70",
    !c.includes('appName: "%%'),
    "%%appName%% \uB0A8\uC544\uC788\uC74C",
  );
  check(
    "\uC544\uC774\uCF58 \uC124\uC815",
    !/icon:\s*["']\s*["']/.test(c),
    "icon\uC774 \uBE48 \uBB38\uC790\uC5F4",
  );

  if (!isPlaceholder) {
    check(
      "displayName 일치",
      c.includes('"' + NAME + '"') || c.includes("'" + NAME + "'"),
      NAME + "과 불일치",
    );
    check(
      "appName 일치",
      c.includes('"' + APP_ID + '"') || c.includes("'" + APP_ID + "'"),
      APP_ID + "와 불일치",
    );
    check(
      "appName 영문만 사용",
      /^[a-zA-Z0-9_-]+$/.test(APP_ID),
      "appName은 영어(a-z, 0-9, _, -)만 사용 가능",
    );
    check(
      "appName 20자 이내",
      APP_ID.length <= 20,
      `appName이 ${APP_ID.length}자 — 20자 이내로 줄여주세요`,
    );
  }
} catch (e) {
  errors.push("\u274C granite.config.ts \uC77D\uAE30 \uC2E4\uD328");
}

// ===== 2. index.html =====
console.log("\uD83D\uDCCB index.html \uAC80\uC0AC...");
try {
  const h = fs.readFileSync("index.html", "utf-8");

  check(
    "\uD540\uCE58\uC90C \uBE44\uD65C\uC131\uD654",
    h.includes("user-scalable=no") || h.includes("user-scalable=0"),
    "user-scalable=no \uC5C6\uC74C",
  );
  check(
    "maximum-scale",
    h.includes("maximum-scale=1"),
    "maximum-scale=1.0 \uC5C6\uC74C",
  );
  check(
    "title \uAE30\uBCF8\uAC12 \uBCC0\uACBD",
    !h.includes("<title>toss-webview-kit</title>"),
    'title\uC774 "toss-webview-kit"(\uAE30\uBCF8\uAC12)\uC784',
  );

  if (!isPlaceholder) {
    check(
      "title \uC77C\uCE58",
      h.includes("<title>" + NAME + "</title>"),
      NAME + "\uACFC \uBD88\uC77C\uCE58",
    );
  }
} catch (e) {
  errors.push("\u274C index.html \uC77D\uAE30 \uC2E4\uD328");
}

// ===== 3. 소스코드 패턴 =====
console.log(
  "\uD83D\uDCCB \uC18C\uC2A4\uCF54\uB4DC \uD328\uD134 \uAC80\uC0AC...",
);

function scan(dir) {
  let files = [];
  try {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      if (e.name === "node_modules" || e.name === "dist") return;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        files = files.concat(scan(p));
      } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
        files.push(p);
      }
    });
  } catch (e) {
    /* skip */
  }
  return files;
}

let allSrc = "";
const srcFiles = scan("src");
const fileContents = {};

srcFiles.forEach((f) => {
  const content = fs.readFileSync(f, "utf-8");
  allSrc += content + "\n";
  fileContents[f] = content;
});

check(
  "intoss-private \uBBF8\uC0AC\uC6A9",
  !allSrc.includes("intoss-private://"),
  "intoss-private:// \uBC1C\uACAC",
);
check(
  "AsyncStorage 미사용",
  !/from\s+['"]@react-native-async-storage\/async-storage['"]/.test(allSrc),
  "AsyncStorage import 발견 — SDK Storage 사용할 것",
);
check(
  "localStorage \uBBF8\uC0AC\uC6A9",
  !allSrc.includes("localStorage"),
  "localStorage \uC9C1\uC811 \uC0AC\uC6A9 \uBC1C\uACAC (SDK Storage \uC0AC\uC6A9\uD560 \uAC83)",
);

// 외부 링크 검사
Object.keys(fileContents).forEach((file) => {
  if (/window\.open/.test(fileContents[file])) {
    warnings.push(
      "\u26A0\uFE0F  \uC678\uBD80 \uB9C1\uD06C(window.open) \uC758\uC2EC: " +
        file,
    );
  }
});

// 해요체 검사
Object.keys(fileContents).forEach((file) => {
  if (
    /['"`].*(\uD569\uB2C8\uB2E4|\uC2B5\uB2C8\uB2E4|\uD558\uC2ED\uC2DC\uC624).*['"`]/.test(
      fileContents[file],
    )
  ) {
    warnings.push(
      "\u26A0\uFE0F  \uD574\uC694\uCCB4 \uBBF8\uC900\uC218 \uBB38\uAD6C \uC758\uC2EC: " +
        file,
    );
  }
});

// 자체 뒤로가기 버튼 검사 (상단 헤더 내, App.tsx 라우터 제외)
Object.keys(fileContents).forEach((file) => {
  if (file.endsWith("App.tsx")) return; // 라우터의 goBack은 정상 사용
  const content = fileContents[file];
  if (
    /navigate\s*\(\s*-1\s*\)/.test(content) ||
    /history\.back/.test(content)
  ) {
    warnings.push(
      "⚠️  자체 뒤로가기 의심: " + file,
    );
  }
});

// ===== 4. 빌드 결과물 =====
console.log("\uD83D\uDCCB \uBE4C\uB4DC \uACB0\uACFC\uBB3C \uAC80\uC0AC...");

if (fs.existsSync("dist")) {
  function dirSize(d) {
    let s = 0;
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      s += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
    });
    return s;
  }

  const mb = (dirSize("dist") / 1048576).toFixed(2);
  if (mb > 10) {
    warnings.push(
      "\u26A0\uFE0F  \uBC88\uB4E4 " +
        mb +
        "MB \u2014 CDN \uBD84\uB9AC \uAD8C\uC7A5",
    );
  } else {
    passed.push("\u2705 \uBC88\uB4E4 " + mb + "MB");
  }

  // 빌드된 index.html에서 title 재확인
  if (fs.existsSync("dist/index.html") && !isPlaceholder) {
    const builtHtml = fs.readFileSync("dist/index.html", "utf-8");
    check(
      "\uBE4C\uB4DC \uACB0\uACFC title \uC77C\uCE58",
      builtHtml.includes("<title>" + NAME + "</title>"),
      "\uBE4C\uB4DC \uACB0\uACFC\uBB3C\uC758 title\uC774 " +
        NAME +
        "\uACFC \uB2E4\uB984",
    );
  }
} else {
  warnings.push(
    "\u26A0\uFE0F  dist/ \uC5C6\uC74C \u2014 npm run build \uBA3C\uC800 \uC2E4\uD589",
  );
}

// ===== 결과 출력 =====
console.log("\n" + "=".repeat(45));
console.log("\u2705 \uD1B5\uACFC: " + passed.length + "\uAC1C");
passed.forEach((p) => {
  console.log("  " + p);
});

if (warnings.length) {
  console.log(
    "\n\u26A0\uFE0F  \uD655\uC778 \uD544\uC694: " + warnings.length + "\uAC1C",
  );
  warnings.forEach((w) => {
    console.log("  " + w);
  });
}

if (errors.length) {
  console.log("\n\u274C \uC624\uB958: " + errors.length + "\uAC1C");
  errors.forEach((e) => {
    console.log("  " + e);
  });
}

console.log("=".repeat(45));
if (errors.length === 0) {
  console.log(
    "\uD83C\uDF89 \uD1B5\uACFC! QR \uD14C\uC2A4\uD2B8\uB85C \uC9C4\uD589\uD558\uC138\uC694.",
  );
} else {
  console.log(
    "\uD83D\uDEA8 \uC624\uB958 \uC218\uC815 \uD6C4 \uC7AC\uAC80\uC99D\uD558\uC138\uC694.",
  );
  process.exit(1);
}
