import fs from 'fs';
import path from 'path';

interface ReportItem {
  description: string;
  data: {
    test: string;
    data: TestItem[];
  }[];
}

interface TestItem {
  description: string;
  test: string;
  tag: string;
  fileData: {
    actualFilePath: string;
    baselineFilePath: string;
    diffFilePath?: string;
  };
  misMatchPercentage: string;
  rawMisMatchPercentage: number;
}

const inputJsonPath = '.tmp/actual/output.json';
const outputDir = path.join(process.cwd(), 'visual-report');

function getImageBase64(filePath: string): string {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).toLowerCase();
  let mimeType = 'image/png'; // default

  if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
  else if (ext === '.gif') mimeType = 'image/gif';
  else if (ext === '.webp') mimeType = 'image/webp';
  else if (ext === '.svg') mimeType = 'image/svg+xml';

  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

if (!fs.existsSync(inputJsonPath)) {
  console.error(`Arquivo JSON não encontrado: ${inputJsonPath}`);
  process.exit(1);
}

const reportData: ReportItem[] = JSON.parse(fs.readFileSync(inputJsonPath, 'utf-8'));

const tags = new Set<string>();
const descs = new Set<string>();
const tests = new Set<string>();

let htmlCards = '';
let globalIndex = 0;

for (const group of reportData) {
  for (const testGroup of group.data) {
    for (const item of testGroup.data) {
      if (item.rawMisMatchPercentage === 0) continue;

      const { fileData, tag, description, test, misMatchPercentage } = item;

      const actualDataUri = getImageBase64(fileData.actualFilePath);
      const baselineDataUri = getImageBase64(fileData.baselineFilePath);
      const diffDataUri = fileData.diffFilePath ? getImageBase64(fileData.diffFilePath) : '';

      globalIndex++;

      tags.add(tag);
      descs.add(description);
      tests.add(test);

      const collapsedClass = globalIndex === 1 ? '' : 'collapsed';
      const displayStyle = globalIndex === 1 ? 'block' : 'none';
      const expandedAttr = globalIndex === 1 ? 'true' : 'false';

      htmlCards += `
      <div class="card ${collapsedClass}" data-tag="${tag}" data-desc="${description}" data-test="${test}">
        <div class="card-header" tabindex="0" role="button" aria-expanded="${expandedAttr}" aria-controls="content-${tag}-${test}-${globalIndex}">
          <h3>${description} - ${test} (${tag})</h3>
          <button class="toggle-btn">${collapsedClass ? 'Expand' : 'Collapse'}</button>
        </div>
        <div class="card-content" id="content-${tag}-${test}-${globalIndex}" style="display: ${displayStyle}">
          <p class="mismatch">Mismatch: ${misMatchPercentage}%</p>
          <div class="img-row">
            <div class="img-container">
              <p>Actual</p>
              <img src="${actualDataUri}" alt="Actual Image" />
            </div>
            <div class="img-container">
              <p>Baseline</p>
              <img src="${baselineDataUri}" alt="Baseline Image" />
            </div>
            ${diffDataUri ? `<div class="img-container">
              <p>Diff</p>
              <img src="${diffDataUri}" alt="Diff Image" />
            </div>` : ''}
          </div>
        </div>
      </div>
      `;
    }
  }
}

const tagsArr = Array.from(tags);
const descsArr = Array.from(descs);
const testsArr = Array.from(tests);

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Visual Test Report</title>
<style>
  body {
    margin: 0; padding: 1rem;
    font-family: Arial, sans-serif;
    background: #f5f5f5;
  }
  .filters {
    position: sticky;
    top: 0;
    background: white;
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  select {
    padding: 0.3rem;
    font-size: 1rem;
  }
  .card {
    background: white;
    margin: 1rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 0 8px rgba(0,0,0,0.1);
    max-width: 100vw;
    overflow: hidden;
  }
  .card-header {
    padding: 0.5rem 1rem;
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .card-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  .toggle-btn {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .card.collapsed .card-content {
    display: none;
  }
  .card-content {
    padding: 0 1rem 1rem 1rem;
  }
  .mismatch {
    margin: 0.3rem 0 0.8rem 0;
    font-weight: bold;
  }
  .img-row {
    display: flex;
    gap: 0.5rem;
    overflow-x: hidden;
    max-width: 100vw;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    justify-content: center; /* centraliza as imagens horizontalmente */
    align-items: flex-start;
    flex-wrap: nowrap; /* só uma linha */
  }
  .img-container {
    flex: 0 1 auto; /* encolhe se necessário, não cresce além do necessário */
    text-align: center;
    max-width: 33%; /* não ocupa mais que 1/3 da linha */
    min-width: 0; /* evita overflow */
    display: inline-block;
  }
  .img-container p {
    margin: 0.5rem 0;
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
  }
  .img-container img {
    width: auto;
    max-width: 100%;
    max-height: 600px;
    height: auto;
    display: block;
    border-radius: 4px;
    background: #f5f5f5;
    box-shadow: 0 0 4px rgba(0,0,0,0.1);
    user-select: none;
    object-fit: contain;
    flex-shrink: 1;
  }
</style>
</head>
<body>
  <div class="filters">
    <label>Tag:
      <select id="tagFilter"><option value="">All</option></select>
    </label>
    <label>Description:
      <select id="descFilter"><option value="">All</option></select>
    </label>
    <label>Test:
      <select id="testFilter"><option value="">All</option></select>
    </label>
  </div>
  <div id="container">
    ${htmlCards}
  </div>

<script>
  const tagFilter = document.getElementById('tagFilter');
  const descFilter = document.getElementById('descFilter');
  const testFilter = document.getElementById('testFilter');
  const cards = document.querySelectorAll('.card');

  const tags = ${JSON.stringify(tagsArr)};
  const descs = ${JSON.stringify(descsArr)};
  const tests = ${JSON.stringify(testsArr)};

  function populateSelect(select, options) {
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });
  }

  populateSelect(tagFilter, tags);
  populateSelect(descFilter, descs);
  populateSelect(testFilter, tests);

  function applyFilters() {
    const tag = tagFilter.value;
    const desc = descFilter.value;
    const test = testFilter.value;

    let firstShown = true;

    cards.forEach(card => {
      const matchTag = !tag || card.dataset.tag === tag;
      const matchDesc = !desc || card.dataset.desc === desc;
      const matchTest = !test || card.dataset.test === test;

      const shouldShow = matchTag && matchDesc && matchTest;
      card.style.display = shouldShow ? '' : 'none';

      const content = card.querySelector('.card-content');
      const btn = card.querySelector('.toggle-btn');
      const header = card.querySelector('.card-header');

      if (shouldShow && firstShown) {
        card.classList.remove('collapsed');
        content.style.display = 'block';
        btn.textContent = 'Collapse';
        header.setAttribute('aria-expanded', 'true');
        firstShown = false;
      } else {
        card.classList.add('collapsed');
        content.style.display = 'none';
        btn.textContent = 'Expand';
        header.setAttribute('aria-expanded', 'false');
      }
    });
  }

  [tagFilter, descFilter, testFilter].forEach(el => {
    el.addEventListener('change', applyFilters);
  });

  document.querySelectorAll('.card-header').forEach(header => {
    header.addEventListener('click', () => {
      const currentCard = header.parentElement;
      const isCollapsed = currentCard.classList.contains('collapsed');

      document.querySelectorAll('.card').forEach(card => {
        const content = card.querySelector('.card-content');
        const btn = card.querySelector('.toggle-btn');
        const hdr = card.querySelector('.card-header');
        card.classList.add('collapsed');
        content.style.display = 'none';
        btn.textContent = 'Expand';
        hdr.setAttribute('aria-expanded', 'false');
      });

      if (isCollapsed) {
        currentCard.classList.remove('collapsed');
        const content = currentCard.querySelector('.card-content');
        const btn = currentCard.querySelector('.toggle-btn');
        header.setAttribute('aria-expanded', 'true');
        content.style.display = 'block';
        btn.textContent = 'Collapse';
      }
    });
  });
</script>

</body>
</html>
`;

fs.writeFileSync(path.join(outputDir, 'index.html'), html);

console.log('✅ visual-report gerado em:', outputDir);
