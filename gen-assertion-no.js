const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'src', 'app');
const ASSERTION_REGEX = /Assertion\.no\(\s*\)/g;
const ASSERTION_NUMBER_REGEX = /Assertion\.no\((\d+)\)/g;

function getAllTsFiles(dir) {
    const files = fs.readdirSync(dir);
    let tsFiles = [];
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            tsFiles = tsFiles.concat(getAllTsFiles(fullPath));
        } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
            tsFiles.push(fullPath);
        }
    }
    return tsFiles;
}

function main() {
    const tsFiles = getAllTsFiles(TARGET_DIR);
    let usedNumbers = new Map(); // number -> [file, line]
    let nextNumber = 1;
    let replaceCount = 0;

    // 既存の番号を収集
    for (const file of tsFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        let match;
        while ((match = ASSERTION_NUMBER_REGEX.exec(content)) !== null) {
            const num = Number(match[1]);
            if (!usedNumbers.has(num)) {
                usedNumbers.set(num, []);
            }
            usedNumbers.get(num).push(`${file}:${content.substr(0, match.index).split('\n').length}`);
        }
    }

    // 空引数のAssertion.no()を置換
    for (const file of tsFiles) {
        let content = fs.readFileSync(file, 'utf-8');
        let changed = false;
        content = content.replace(ASSERTION_REGEX, () => {
            // 未使用の番号を探す
            while (usedNumbers.has(nextNumber)) {
                nextNumber++;
            }
            usedNumbers.set(nextNumber, [`${file}`]);
            changed = true;
            replaceCount++;
            return `Assertion.no(${nextNumber++})`;
        });
        if (changed) {
            fs.writeFileSync(file, content, 'utf-8');
            console.log(`Updated: ${file}`);
        }
    }

    // 重複チェック
    let hasDuplicate = false;
    for (const [num, locations] of usedNumbers.entries()) {
        if (locations.length > 1) {
            hasDuplicate = true;
            console.warn(`重複番号: ${num} -> ${locations.join(', ')}`);
        }
    }
    if (!hasDuplicate) {
        console.log('Assertion.no()の番号に重複はありません。');
    }
    console.log(`自動割り当て・置換数: ${replaceCount}`);
}

main(); 