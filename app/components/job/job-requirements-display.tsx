import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import type { JobRequirements } from "~/lib/types";
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Clock,
  Gift,
  Tag,
  Building2,
} from "lucide-react";

interface JobRequirementsDisplayProps {
  requirements: JobRequirements;
}

export function JobRequirementsDisplay({
  requirements,
}: JobRequirementsDisplayProps) {
  const {
    title,
    company,
    requiredSkills,
    preferredSkills,
    qualifications,
    experienceYears,
    responsibilities,
    benefits,
    keywords,
  } = requirements;

  const hasHeader = title || company;
  const hasExperience = experienceYears?.min || experienceYears?.max;

  const formatExperience = () => {
    if (!experienceYears) return "";
    const { min, max } = experienceYears;
    if (min && max) {
      return min === max ? `${min} years` : `${min}-${max} years`;
    }
    if (min) return `${min}+ years`;
    if (max) return `Up to ${max} years`;
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Requirements Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasHeader && (
          <>
            <div className="space-y-2">
              {title && (
                <h3 className="text-xl font-semibold text-foreground">
                  {title}
                </h3>
              )}
              {company && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {company}
                </p>
              )}
            </div>
            <Separator />
          </>
        )}

        {hasExperience && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Experience Required
            </h4>
            <p className="text-muted-foreground ml-6">{formatExperience()}</p>
          </div>
        )}

        {requiredSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-primary" />
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-2 ml-6">
              {requiredSkills.map((skill, index) => (
                <Badge key={index} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {preferredSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              Preferred Skills
            </h4>
            <div className="flex flex-wrap gap-2 ml-6">
              {preferredSkills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {qualifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              Qualifications
            </h4>
            <ul className="list-disc list-inside space-y-1 ml-6 text-muted-foreground">
              {qualifications.map((qual, index) => (
                <li key={index}>{qual}</li>
              ))}
            </ul>
          </div>
        )}

        {responsibilities.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-foreground">
              <ListChecks className="h-4 w-4 text-primary" />
              Key Responsibilities
            </h4>
            <ul className="list-disc list-inside space-y-1 ml-6 text-muted-foreground">
              {responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>
        )}

        {benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-foreground">
              <Gift className="h-4 w-4 text-primary" />
              Benefits
            </h4>
            <ul className="list-disc list-inside space-y-1 ml-6 text-muted-foreground">
              {benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium text-foreground">
              <Tag className="h-4 w-4 text-primary" />
              Keywords for Resume Matching
            </h4>
            <div className="flex flex-wrap gap-2 ml-6">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
