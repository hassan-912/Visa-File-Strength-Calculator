import type { Metadata } from "next";
import Header from "@/components/Header";
import JobSeekerPortal from "@/components/JobSeekerPortal";

export const metadata: Metadata = {
  title: "Job Seeker Portal | Germany, Austria & Sweden | MG Visa",
  description: "Check job seeker pathways, points and proof of funds for Germany, Austria and Sweden, including Germany's vocational training search visa.",
};

export default function JobSeekerPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <Header title="Job Seeker Portal" />
      <JobSeekerPortal />
      <footer className="mt-auto px-6 py-10 text-center text-sm" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text-on-dark)" }}>
        <p className="font-bold">MG International Visa Consultancy</p>
        <p className="mt-2 text-xs text-slate-300">Preliminary assessment only. Authorities assess eligibility and supporting documents.</p>
        <a className="mt-4 inline-block underline underline-offset-4" href="https://mg-visa.com" target="_blank" rel="noopener noreferrer">mg-visa.com</a>
      </footer>
    </div>
  );
}
