import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

// import { PdfReader } from 'pdfreader';

// import pdfParse from 'pdf-parse';
const { PDFParse } = require('pdf-parse');

import * as sbd from 'sbd';

@Injectable()
export class FileCorpusService {
  private abbreviations = [
    'Mr',
    'Mrs',
    'Ms',
    'Dr',
    'Prof',
    'Sr',
    'Jr',
    'vs',
    'etc',
    'e.g',
    'i.e',
    'Fig',
    'fig',
    'Eq',
    'eq',
    'Inc',
    'Ltd',
    'St',
  ];

  async extractTextFromTxt(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  async extractTextFromDocx(filePath: string): Promise<string> {
    // const doc = await fs.promises.readFile(filePath);
    // const { Document } = require('docx');
    // const docx = await Document.load(doc);
    // return docx.paragraphs.map((p: any) => p.text).join('\n');

    const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
  }

  async extractTextFromPdf(filePath: string): Promise<string[]> {
    const parser = new PDFParse({ url: filePath });
    const result = await parser.getText();
    return result.text.split('\n').filter((t) => t.trim().length > 0).slice(0, -1);
  }

  cleanText(text: string): string {
    // 1. Fix hyphenation at line breaks
    text = text.replace(/-\s*\n\s*/g, '');

    // 2. Protect newlines that indicate bullets/dashes
    text = text.replace(/\n\s*[-•]\s*/g, ' <NEWLINE_DASH> ');

    // 3. Merge remaining newlines
    text = text.replace(/\s*\n\s*/g, ' ');

    // 4. Normalize multiple spaces
    text = text.replace(/\s+/g, ' ').trim();

    // 5. Protect abbreviations
    for (const abbr of this.abbreviations) {
      const regex = new RegExp(`\\b${abbr}\\.`, 'g');
      text = text.replace(regex, `${abbr}<ABBR>`);
    }

    // 6. Split into sentences
    let sentences = sbd.sentences(text, { abbreviations: this.abbreviations });

    // 7. Restore abbreviations and placeholders
    sentences = sentences.map((s) =>
      s.replace(/<ABBR>/g, '.').replace(/\s*<NEWLINE_DASH>\s*/g, '\n- '),
    );

    // 8. Split on surviving newlines
    const finalSentences: string[] = [];
    for (const s of sentences) {
      finalSentences.push(
        ...s
          .split(/\n+/)
          .map((p) => p.trim())
          .filter((p) => p),
      );
    }

    return finalSentences.join('\n');
  }

  async convertFileToCorpus(
    filePath: string,
    outputPath?: string,
  ): Promise<string[]> {
    console.log("Filepath: ", filePath);
    const ext = path.extname(filePath).toLowerCase();
    let text: string;

    if (ext === '.txt') text = await this.extractTextFromTxt(filePath);
    else if (ext === '.docx') text = await this.extractTextFromDocx(filePath);
    else if (ext === '.pdf')
      text = (await this.extractTextFromPdf(filePath)).join(' ');
    else
      throw new Error(
        'Unsupported file format. Please use .txt, .docx, or .pdf',
      );

    const cleanedText = this.cleanText(text);
    const lines = cleanedText.split('\n');
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const totalLines = lines.length;

    const blocknames: string[] = [];

    if (outputPath && !fs.existsSync(outputPath))
      fs.mkdirSync(outputPath, { recursive: true });

    lines.forEach((line, i) => {
      const filename =
        path.basename(filePath, ext) +
        `_${timestamp}_${String(i + 1).padStart(String(totalLines).length, '0')}.txt`;
      const fullPath = outputPath ? path.join(outputPath, filename) : filename;
      fs.writeFileSync(fullPath, line, 'utf-8');
      console.log(fullPath);
      blocknames.push(filename);
    });

    return blocknames;
  }
}
