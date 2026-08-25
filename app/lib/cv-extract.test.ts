import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	extractTextFromCvFile,
	getCvFileFormat,
	getCvFileFormatLabel,
	MAX_CV_FILE_SIZE,
} from "~/lib/cv-extract";

// The heavy extraction libraries are lazy-loaded via dynamic import inside
// cv-extract.ts; mock them so the dispatch paths are exercised without loading
// real pdfjs/mammoth (or booting the pdfjs worker) in a unit test.
const { getDocumentMock, extractRawTextMock } = vi.hoisted(() => ({
	getDocumentMock: vi.fn(),
	extractRawTextMock: vi.fn(),
}));

vi.mock("pdfjs-dist", () => ({
	GlobalWorkerOptions: { workerPort: null },
	getDocument: getDocumentMock,
}));

vi.mock("pdfjs-dist/build/pdf.worker.mjs?worker", () => ({
	default: class PdfWorkerMock {},
}));

vi.mock("mammoth/mammoth.browser.min.js", () => ({
	extractRawText: extractRawTextMock,
}));

import * as pdfjs from "pdfjs-dist";

function makeFile(
	name: string,
	content: string | Uint8Array<ArrayBuffer>,
): File {
	return new File([content], name);
}

describe("getCvFileFormat", () => {
	it("detects pdf files", () => {
		expect(getCvFileFormat("resume.pdf")).toBe("pdf");
	});

	it("detects docx files", () => {
		expect(getCvFileFormat("resume.docx")).toBe("docx");
	});

	it("detects txt and md as text files", () => {
		expect(getCvFileFormat("resume.txt")).toBe("text");
		expect(getCvFileFormat("resume.md")).toBe("text");
	});

	it("is case-insensitive", () => {
		expect(getCvFileFormat("RESUME.PDF")).toBe("pdf");
		expect(getCvFileFormat("Resume.DocX")).toBe("docx");
		expect(getCvFileFormat("RESUME.MD")).toBe("text");
	});

	it("returns null for unsupported extensions", () => {
		expect(getCvFileFormat("resume.png")).toBeNull();
		expect(getCvFileFormat("resume.pdf.exe")).toBeNull();
		expect(getCvFileFormat("resume")).toBeNull();
		expect(getCvFileFormat("")).toBeNull();
	});
});

describe("getCvFileFormatLabel", () => {
	it("returns a human-readable label per format", () => {
		expect(getCvFileFormatLabel("pdf")).toBe("PDF");
		expect(getCvFileFormatLabel("docx")).toBe("Word document");
		expect(getCvFileFormatLabel("text")).toBe("text file");
	});
});

describe("MAX_CV_FILE_SIZE", () => {
	it("caps uploads at 5 MB", () => {
		expect(MAX_CV_FILE_SIZE).toBe(5 * 1024 * 1024);
	});
});

describe("extractTextFromCvFile", () => {
	beforeEach(() => {
		getDocumentMock.mockReset();
		extractRawTextMock.mockReset();
	});

	it("throws for unsupported file types", async () => {
		await expect(
			extractTextFromCvFile(makeFile("resume.png", "x")),
		).rejects.toThrow("Unsupported file type");
	});

	it("throws for files over the size cap", async () => {
		const tooBig = makeFile("resume.pdf", new Uint8Array(MAX_CV_FILE_SIZE + 1));
		await expect(extractTextFromCvFile(tooBig)).rejects.toThrow(
			"File is too large",
		);
	});

	it("returns the raw text for txt files", async () => {
		const text = await extractTextFromCvFile(
			makeFile("resume.txt", "My resume text"),
		);
		expect(text).toBe("My resume text");
	});

	it("returns the raw text for md files", async () => {
		const text = await extractTextFromCvFile(
			makeFile("resume.md", "# Dung Huynh Duc"),
		);
		expect(text).toBe("# Dung Huynh Duc");
	});

	it("dispatches docx extraction through mammoth", async () => {
		extractRawTextMock.mockResolvedValue({ value: "Extracted DOCX text" });

		const text = await extractTextFromCvFile(makeFile("resume.docx", "x"));

		expect(text).toBe("Extracted DOCX text");
		expect(extractRawTextMock).toHaveBeenCalledWith({
			arrayBuffer: expect.any(ArrayBuffer),
		});
	});

	it("dispatches pdf extraction through pdfjs and wires the worker", async () => {
		getDocumentMock.mockReturnValue({
			promise: Promise.resolve({
				numPages: 1,
				getPage: async () => ({
					getTextContent: async () => ({
						items: [
							{ str: "Hello", hasEOL: false },
							{ str: " World", hasEOL: true },
						],
					}),
				}),
			}),
			destroy: vi.fn(),
		});

		const text = await extractTextFromCvFile(makeFile("resume.pdf", "x"));

		expect(text).toBe("Hello World\n");
		expect(getDocumentMock).toHaveBeenCalledWith({
			data: expect.any(ArrayBuffer),
		});
		// The module worker is constructed and assigned to the pdfjs worker port
		expect(pdfjs.GlobalWorkerOptions.workerPort).not.toBeNull();
	});

	it("joins multiple pdf pages with a blank line", async () => {
		getDocumentMock.mockReturnValue({
			promise: Promise.resolve({
				numPages: 2,
				getPage: async () => ({
					getTextContent: async () => ({
						items: [{ str: "Page", hasEOL: false }],
					}),
				}),
			}),
			destroy: vi.fn(),
		});

		const text = await extractTextFromCvFile(makeFile("resume.pdf", "x"));

		expect(text).toBe("Page\n\nPage");
	});
});
