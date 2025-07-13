import fs from 'fs';
import path from 'path';
import { inlineSource } from 'inline-source';

/**
 * Caminho para o diretório do relatório gerado pelo @wdio/visual-reporter
 */
const reportPath = path.resolve(__dirname, '../visual-report/report');
const inputFile = path.join(reportPath, 'index.html');
const outputFile = path.join(reportPath, 'index-packed.html');

async function inlineReport(): Promise<void> {
  try {
    const html = await inlineSource(inputFile, {
      rootpath: reportPath,
      compress: false,
      swallowErrors: false,
    });

    fs.writeFileSync(outputFile, html);
    console.log(`✅ Packed report saved as ${outputFile}`);
  } catch (error) {
    console.error('❌ Failed to inline report:', error);
    process.exit(1);
  }
}

inlineReport();