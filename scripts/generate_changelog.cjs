const fs = require('fs');
const { execSync } = require('child_process');

try {
  // Get git log with just date and message, no file list
  const log = execSync(
    'git log --pretty=format:"%ad|%s" --date=short'
  ).toString();
  const lines = log.trim().split('\n');

  let md = '# 📝 프로젝트 업데이트 기록 (Changelog)\n\n';
  let currentDict = {};
  let dateOrder = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const firstPipe = line.indexOf('|');
    const date = line.substring(0, firstPipe);
    const msg = line.substring(firstPipe + 1);

    // Skip auto-merge commits or similar if desired
    // if (msg.startsWith('Merge branch')) continue;

    if (!currentDict[date]) {
      currentDict[date] = [];
      dateOrder.push(date);
    }
    currentDict[date].push(msg);
  }

  for (const date of dateOrder) {
    md += `## 📅 ${date}\n\n`;
    for (const msg of currentDict[date]) {
      md += `- ${msg}\n`;
    }
    md += '\n';
  }

  fs.writeFileSync('CHANGELOG.md', md, 'utf-8');
  console.log('CHANGELOG.md 자동 생성 (파일 목록 제외)');
} catch (e) {
  console.error('Changelog 생성 실패:', e);
}
