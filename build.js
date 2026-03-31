const path = require('path');
const fs = require('fs');

async function main() {
  const { TwaManifest, TwaGenerator, Config, KeyTool, SigningKeyInfo } = require('@bubblewrap/core');

  const manifest = new TwaManifest({
    packageId: 'kr.dvsoft.churchcms',
    host: 'dvsoft.kr',
    name: '디바인교회관리',
    launcherName: '교회관리',
    display: 'standalone',
    themeColor: '#2c3e52',
    navigationColor: '#2c3e52',
    backgroundColor: '#2c3e52',
    enableNotifications: false,
    startUrl: '/mobile/',
    iconUrl: 'https://dvsoft.kr/mobile/icon-512.png',
    maskableIconUrl: 'https://dvsoft.kr/mobile/icon-512.png',
    appVersionCode: 2,
    appVersion: '2.0.0',
    signingKey: {
      path: path.resolve('./signing.keystore'),
      alias: 'dvsoft',
    },
    webManifestUrl: 'https://dvsoft.kr/mobile/manifest.json',
    fallbackType: 'customtabs',
    features: {
      locationDelegation: { enabled: false },
      playBilling: { enabled: false },
    },
    orientation: 'portrait',
  });

  const config = new Config(
    process.env.JAVA_HOME,
    process.env.ANDROID_SDK_ROOT
  );

  const generator = new TwaGenerator();
  await generator.createTwaProject('./', manifest);

  const keyPassword = process.env.KEY_PASSWORD;
  const signingInfo = new SigningKeyInfo(
    path.resolve('./signing.keystore'),
    'dvsoft',
    keyPassword,
    keyPassword
  );

  await generator.buildTwaProject('./', signingInfo);
  console.log('빌드 완료!');
}

main().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
