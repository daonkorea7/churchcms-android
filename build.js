const path = require('path');
const fs = require('fs');

async function main() {
  const bubblewrap = require('@bubblewrap/core');
  console.log('Available exports:', Object.keys(bubblewrap));

  const { TwaManifest, TwaGenerator, Config } = bubblewrap;

  const targetDir = path.resolve('./twa-project');
  fs.mkdirSync(targetDir, { recursive: true });

  fs.copyFileSync(
    path.resolve('./signing.keystore'),
    path.resolve(targetDir, 'signing.keystore')
  );

  const twaManifest = new TwaManifest({
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
      path: './signing.keystore',
      alias: 'dvsoft',
    },
    webManifestUrl: 'https://dvsoft.kr/mobile/manifest.json',
    fallbackType: 'customtabs',
    features: {
      locationDelegation: { enabled: false },
      playBilling: { enabled: false },
    },
    orientation: 'portrait',
    shortcuts: [],
    fingerprints: [],
  });

  const config = new Config(
    process.env.JAVA_HOME,
    process.env.ANDROID_SDK_ROOT
  );

  const generator = new TwaGenerator();
  console.log('프로젝트 생성 중...');
  await generator.createTwaProject(targetDir, twaManifest, config);
  console.log('프로젝트 생성 완료!');

  const keyPassword = process.env.KEY_PASSWORD;
  console.log('빌드 중...');
  await generator.buildTwaProject(targetDir, {
    signingKeyPath: path.resolve(targetDir, 'signing.keystore'),
    signingKeyAlias: 'dvsoft',
    signingKeyPassword: keyPassword,
    signingKeyStorePassword: keyPassword,
  }, config);

  console.log('빌드 완료!');
}

main().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
