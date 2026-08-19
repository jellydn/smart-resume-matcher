export const MAX_CV_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export type CvFileFormat = "pdf" | "docx" | "text";

export function getCvFileFormat(fileName: string): CvFileFormat | null {
	const lower = fileName.toLowerCase();
	if (lower.endsWith(".pdf")) return "pdf";
	if (lower.endsWith(".docx")) return "docx";
	if (lower.endsWith(".txt") || lower.endsWith(".md")) return "text";
	return null;
}

export function getCvFileFormatLabel(format: CvFileFormat): string {
	switch (format) {
		case "pdf":
			return "PDF";
		case "docx":
			return "Word document";
		case "text":
			return "text file";
	}
}
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
	const pdfjsLib = await import("pdfjs-dist");
	const PdfWorker = (await import("pdfjs-dist/build/pdf.worker.mjs?worker"))
		.default;
	// Create the worker through Vite's worker pipeline (module worker); the
	// minified worker build has known minification bugs ("toHex is not a
	// function"), so use the non-minified one.
	pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

	const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
	const pdf = await loadingTask.promise;
	try {
		const pages: string[] = [];
		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const content = await page.getTextContent();
			const pageText = content.items
				.map((item) => {
					if ("str" in item) {
						return item.hasEOL ? `${item.str}\n` : item.str;
					}
					return "";
				})
				.join("");
			pages.push(pageText);
		}
		return pages.join("\n\n");
	} finally {
		await loadingTask.destroy();
	}
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
	const mammoth = await import("mammoth/mammoth.browser.min.js");
	const result = await mammoth.extractRawText({ arrayBuffer });
	return result.value;
}

export async function extractTextFromCvFile(file: File): Promise<string> {
	const format = getCvFileFormat(file.name);
	if (!format) {
		throw new Error(
			"Unsupported file type. Please upload a .pdf, .docx, .txt, or .md file.",
		);
	}
	if (file.size > MAX_CV_FILE_SIZE) {
		throw new Error("File is too large. Maximum size is 5 MB.");
	}

	switch (format) {
		case "pdf":
			return extractTextFromPdf(await file.arrayBuffer());
		case "docx":
			return extractTextFromDocx(await file.arrayBuffer());
		case "text":
			return await file.text();
	}
}
