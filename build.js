const path = require('path');
const fs = require('fs');

async function main() {
  const {
    TwaManifest,
    TwaGenerator,
    Config,
    GradleWrapper,
    JarSigner,
    AndroidSdkTools,
    JdkHelper,
  } = require('@bubblewrap/core');

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
    splashScreenFadeOutDuration: 300,
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
  console.log('1. 프로젝트 생성 중...');
  await generator.createTwaProject(targetDir, twaManifest, config);
  console.log('2. 프로젝트 생성 완료!');

  // build.gradle의 splashScreenFadeOutDuration 값 확인 및 수정
  const buildGradlePath = path.resolve(targetDir, 'app/build.gradle');
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  buildGradle = buildGradle.replace(
    /splashScreenFadeOutDuration:\s*,/g,
    'splashScreenFadeOutDuration: 300,'
  );
  fs.writeFileSync(buildGradlePath, buildGradle);
  console.log('2-1. build.gradle 수정 완료!');

  const jdkHelper = new JdkHelper(process, config);
  console.log('3. JdkHelper 초기화 완료!');

  const androidSdkTools = await AndroidSdkTools.create(process, config, jdkHelper);
  console.log('4. AndroidSdkTools 초기화 완료!');

  const keyPassword = process.env.KEY_PASSWORD;
  const gradleWrapper = new GradleWrapper(process, androidSdkTools, targetDir);
  console.log('5. Gradle 빌드 중...');
  await gradleWrapper.bundleRelease();
  console.log('6. Gradle 빌드 완료!');

  const jarSigner = new JarSigner(config);
  const unsignedAab = path.resolve(targetDir, 'app/build/outputs/bundle/release/app-release.aab');
  const signedAab = path.resolve(targetDir, 'app-release-signed.aab');

  console.log('7. 서명 중...');
  await jarSigner.sign(
    path.resolve(targetDir, 'signing.keystore'),
    'dvsoft',
    keyPassword,
    keyPassword,
    unsignedAab,
    signedAab
  );
  console.log('8. 서명 완료!');
  console.log('AAB 파일:', signedAab);
}

main().catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
