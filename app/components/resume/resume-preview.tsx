import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import type { Resume } from "~/lib/types";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Award,
  FolderGit2,
  GitBranch,
} from "lucide-react";

interface ResumePreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const { personalInfo } = resume;

  return (
    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
      {/* Personal Info */}
      <section>
        <h3 className="text-lg font-semibold">{personalInfo.name || "No Name"}</h3>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              Website
            </span>
          )}
        </div>
        {personalInfo.summary && (
          <p className="text-sm mt-2 text-muted-foreground line-clamp-3">
            {personalInfo.summary}
          </p>
        )}
      </section>

      {/* Experience */}
      {resume.experience.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4" />
              Experience ({resume.experience.length})
            </h4>
            <div className="space-y-2">
              {resume.experience.slice(0, 3).map((exp) => (
                <div key={exp.id} className="text-sm">
                  <p className="font-medium">
                    {exp.title} at {exp.company}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </p>
                </div>
              ))}
              {resume.experience.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ...and {resume.experience.length - 3} more
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4" />
              Education ({resume.education.length})
            </h4>
            <div className="space-y-2">
              {resume.education.slice(0, 2).map((edu) => (
                <div key={edu.id} className="text-sm">
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-muted-foreground text-xs">
                    {edu.institution}
                  </p>
                </div>
              ))}
              {resume.education.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  ...and {resume.education.length - 2} more
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Code className="h-4 w-4" />
              Skills ({resume.skills.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {resume.skills.slice(0, 10).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs">
                  {skill.name}
                </Badge>
              ))}
              {resume.skills.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{resume.skills.length - 10} more
                </Badge>
              )}
            </div>
          </section>
        </>
      )}

      {/* Languages */}
      {resume.languages.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Languages className="h-4 w-4" />
              Languages ({resume.languages.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {resume.languages.map((lang) => (
                <Badge key={lang.id} variant="outline" className="text-xs">
                  {lang.name} ({lang.proficiency})
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Award className="h-4 w-4" />
              Certifications ({resume.certifications.length})
            </h4>
            <div className="space-y-1">
              {resume.certifications.slice(0, 3).map((cert) => (
                <p key={cert.id} className="text-sm">
                  {cert.name} - {cert.issuer}
                </p>
              ))}
              {resume.certifications.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ...and {resume.certifications.length - 3} more
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <FolderGit2 className="h-4 w-4" />
              Projects ({resume.projects.length})
            </h4>
            <div className="space-y-1">
              {resume.projects.slice(0, 3).map((proj) => (
                <p key={proj.id} className="text-sm">
                  {proj.name}
                </p>
              ))}
              {resume.projects.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ...and {resume.projects.length - 3} more
                </p>
              )}
            </div>
          </section>
        </>
      )}

      {/* Open Source */}
      {resume.openSource.length > 0 && (
        <>
          <Separator />
          <section>
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4" />
              Open Source ({resume.openSource.length})
            </h4>
            <div className="space-y-1">
              {resume.openSource.slice(0, 3).map((os) => (
                <p key={os.id} className="text-sm">
                  {os.project} ({os.role})
                </p>
              ))}
              {resume.openSource.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ...and {resume.openSource.length - 3} more
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
