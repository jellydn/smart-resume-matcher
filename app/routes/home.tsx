import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { FileText, Upload, Sparkles, Download } from "lucide-react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Matcher - Tailor Your Resume to Job Descriptions" },
    {
      name: "description",
      content:
        "AI-powered tool to tailor your resume to specific job descriptions. Upload your resume, paste a job description, and get AI suggestions.",
    },
  ];
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Tailor Your Resume
            <br />
            <span className="text-muted-foreground">to Any Job</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Upload your resume, paste a job description, and let AI help you
            highlight the most relevant experience. No fabrication, just smart
            optimization.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link to="/resume">
              <FileText className="mr-2 h-5 w-5" />
              Get Started
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-12 w-full max-w-4xl">
          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">1. Enter Resume</h3>
            <p className="text-sm text-muted-foreground text-center">
              Upload JSON or fill out the form
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">2. Paste Job</h3>
            <p className="text-sm text-muted-foreground text-center">
              Add the job description
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">3. AI Tailoring</h3>
            <p className="text-sm text-muted-foreground text-center">
              Review and accept suggestions
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">4. Download</h3>
            <p className="text-sm text-muted-foreground text-center">
              Get PDF or DOCX ready to submit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
