import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { Resume, TailoringResult, Suggestion } from "~/lib/types";
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
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Target,
  Check,
  X,
  Undo2,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface TailoredResumePreviewProps {
  resume: Resume;
  tailoringResult: TailoringResult;
  onAcceptSuggestion?: (suggestion: Suggestion) => void;
  onRejectSuggestion?: (suggestion: Suggestion) => void;
  onUndoSuggestion?: (suggestion: Suggestion) => void;
}

interface SuggestionInlineProps {
  suggestion: Suggestion;
  onAccept?: () => void;
  onReject?: () => void;
  onUndo?: () => void;
}

function SuggestionInline({ suggestion, onAccept, onReject, onUndo }: SuggestionInlineProps) {
  const isPending = suggestion.status === "pending";
  const isAccepted = suggestion.status === "accepted";
  const isRejected = suggestion.status === "rejected";

  if (isRejected) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      {!isAccepted && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 border-l-4 border-muted-foreground/30">
          <span className="text-sm text-muted-foreground line-through">
            {suggestion.originalContent}
          </span>
        </div>
      )}
      <div className={cn(
        "flex items-start gap-2 p-3 rounded-md border-l-4",
        isAccepted 
          ? "bg-green-500/10 border-green-500" 
          : "bg-primary/10 border-primary"
      )}>
        {isAccepted ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        )}
        <div className="flex-1 space-y-1">
          <span className={cn(
            "text-sm font-medium",
            isAccepted ? "text-green-700 dark:text-green-300" : "text-foreground"
          )}>
            {suggestion.suggestedContent}
          </span>
          <p className="text-xs text-muted-foreground italic">{suggestion.reason}</p>
          
          {isPending && (onAccept || onReject) && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="default"
                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                onClick={onAccept}
              >
                <Check className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={onReject}
              >
                <X className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          )}
          
          {(isAccepted || isRejected) && onUndo && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={onUndo}
              >
                <Undo2 className="h-3 w-3 mr-1" />
                Undo
              </Button>
              {isAccepted && (
                <span className="text-xs text-green-600 flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Applied
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchScoreDisplay({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    if (score >= 40) return "bg-orange-500/20";
    return "bg-red-500/20";
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative flex items-center justify-center w-24 h-24 rounded-full",
          getScoreBackground(score)
        )}
      >
        <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
          <span className={cn("text-3xl font-bold", getScoreColor(score))}>
            {score}%
          </span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg">Match Score</h3>
        <p className="text-sm text-muted-foreground">
          {score >= 80
            ? "Excellent match!"
            : score >= 60
              ? "Good match"
              : score >= 40
                ? "Moderate match"
                : "Needs improvement"}
        </p>
      </div>
    </div>
  );
}

function SkillMatchSection({ tailoringResult }: { tailoringResult: TailoringResult }) {
  const { matchedSkills, missingSkills } = tailoringResult;

  return (
    <div className="space-y-4">
      {matchedSkills.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Matched Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((match, index) => (
              <Badge
                key={index}
                variant={match.matchType === "exact" ? "default" : "secondary"}
                className={cn(
                  match.matchType === "exact" && "bg-green-600 hover:bg-green-700",
                  match.matchType === "partial" && "bg-blue-600 hover:bg-blue-700",
                  match.matchType === "related" && ""
                )}
              >
                {match.skill}
                {match.matchType !== "exact" && match.fromResume && (
                  <span className="ml-1 text-xs opacity-75">
                    ← {match.fromResume}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {missingSkills.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 font-medium text-sm">
            <XCircle className="h-4 w-4 text-orange-600" />
            Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="border-dashed border-orange-400 text-orange-600">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightsSection({ tailoringResult }: { tailoringResult: TailoringResult }) {
  const { strengths, improvementAreas } = tailoringResult;

  return (
    <div className="space-y-4">
      {strengths.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 font-medium text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Strengths
          </h4>
          <ul className="space-y-1 ml-6">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm text-muted-foreground list-disc">
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvementAreas.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 font-medium text-sm">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            Areas for Improvement
          </h4>
          <ul className="space-y-1 ml-6">
            {improvementAreas.map((area, index) => (
              <li key={index} className="text-sm text-muted-foreground list-disc">
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TailoredResumePreview({
  resume,
  tailoringResult,
  onAcceptSuggestion,
  onRejectSuggestion,
  onUndoSuggestion,
}: TailoredResumePreviewProps) {
  const { personalInfo } = resume;
  const { suggestions, matchScore } = tailoringResult;

  const getSuggestionsForSection = (
    sectionType: Suggestion["sectionType"],
    itemId?: string,
    field?: string
  ): Suggestion[] => {
    return suggestions.filter((s) => {
      if (s.sectionType !== sectionType) return false;
      if (itemId !== undefined && s.itemId !== itemId) return false;
      if (field !== undefined && !s.field.startsWith(field)) return false;
      return true;
    });
  };

  const summarySuggestions = getSuggestionsForSection("summary");
  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const acceptedSuggestions = suggestions.filter(s => s.status === "accepted");
  const hasSuggestions = suggestions.length > 0;
  const hasVisibleSuggestions = suggestions.filter(s => s.status !== "rejected").length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Tailoring Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <MatchScoreDisplay score={matchScore} />
          <Separator />
          <SkillMatchSection tailoringResult={tailoringResult} />
          <Separator />
          <InsightsSection tailoringResult={tailoringResult} />
        </CardContent>
      </Card>

      {hasSuggestions && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Suggestions
              </CardTitle>
              <div className="flex gap-2 text-sm">
                {pendingSuggestions.length > 0 && (
                  <Badge variant="secondary">
                    {pendingSuggestions.length} pending
                  </Badge>
                )}
                {acceptedSuggestions.length > 0 && (
                  <Badge className="bg-green-600">
                    {acceptedSuggestions.length} accepted
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hasVisibleSuggestions && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All suggestions have been processed.
              </p>
            )}

            {hasVisibleSuggestions && (
              <>
                <section>
                  <h3 className="text-lg font-semibold">
                    {personalInfo.name || "No Name"}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                    {personalInfo.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {personalInfo.email}
                      </span>
                    )}
                    {personalInfo.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {personalInfo.phone}
                      </span>
                    )}
                    {personalInfo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {personalInfo.location}
                      </span>
                    )}
                    {personalInfo.linkedin && (
                      <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Linkedin className="h-3 w-3" />
                        LinkedIn
                      </a>
                    )}
                    {personalInfo.website && (
                      <a
                        href={personalInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                      </a>
                    )}
                  </div>

                  {personalInfo.summary && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        {personalInfo.summary}
                      </p>
                      {summarySuggestions.map((suggestion) => (
                        <SuggestionInline
                          key={suggestion.id}
                          suggestion={suggestion}
                          onAccept={onAcceptSuggestion ? () => onAcceptSuggestion(suggestion) : undefined}
                          onReject={onRejectSuggestion ? () => onRejectSuggestion(suggestion) : undefined}
                          onUndo={onUndoSuggestion ? () => onUndoSuggestion(suggestion) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {resume.experience.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4" />
                        Work Experience
                      </h4>
                      <div className="space-y-4">
                        {resume.experience.map((exp) => {
                          const expSuggestions = getSuggestionsForSection(
                            "experience",
                            exp.id
                          );
                          return (
                            <div key={exp.id} className="space-y-2">
                              <div>
                                <p className="font-medium">
                                  {exp.title} at {exp.company}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {exp.startDate} -{" "}
                                  {exp.current ? "Present" : exp.endDate}
                                  {exp.location && ` • ${exp.location}`}
                                </p>
                              </div>
                              {exp.description && (
                                <p className="text-sm text-muted-foreground">
                                  {exp.description}
                                </p>
                              )}
                              {exp.highlights.length > 0 && (
                                <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-muted-foreground">
                                  {exp.highlights.map((highlight, idx) => (
                                    <li key={idx}>{highlight}</li>
                                  ))}
                                </ul>
                              )}
                              {expSuggestions.map((suggestion) => (
                                <SuggestionInline
                                  key={suggestion.id}
                                  suggestion={suggestion}
                                  onAccept={onAcceptSuggestion ? () => onAcceptSuggestion(suggestion) : undefined}
                                  onReject={onRejectSuggestion ? () => onRejectSuggestion(suggestion) : undefined}
                                  onUndo={onUndoSuggestion ? () => onUndoSuggestion(suggestion) : undefined}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </>
                )}

                {resume.education.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <GraduationCap className="h-4 w-4" />
                        Education
                      </h4>
                      <div className="space-y-3">
                        {resume.education.map((edu) => {
                          const eduSuggestions = getSuggestionsForSection(
                            "education",
                            edu.id
                          );
                          return (
                            <div key={edu.id}>
                              <p className="font-medium">{edu.degree}</p>
                              <p className="text-muted-foreground text-sm">
                                {edu.institution}
                                {edu.graduationDate && ` • ${edu.graduationDate}`}
                                {edu.gpa && ` • GPA: ${edu.gpa}`}
                              </p>
                              {eduSuggestions.map((suggestion) => (
                                <SuggestionInline
                                  key={suggestion.id}
                                  suggestion={suggestion}
                                  onAccept={onAcceptSuggestion ? () => onAcceptSuggestion(suggestion) : undefined}
                                  onReject={onRejectSuggestion ? () => onRejectSuggestion(suggestion) : undefined}
                                  onUndo={onUndoSuggestion ? () => onUndoSuggestion(suggestion) : undefined}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </>
                )}

                {resume.skills.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <Code className="h-4 w-4" />
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills.map((skill) => {
                          const isMatched = tailoringResult.matchedSkills.some(
                            (m) =>
                              m.skill.toLowerCase() === skill.name.toLowerCase() ||
                              m.fromResume?.toLowerCase() === skill.name.toLowerCase()
                          );
                          return (
                            <Badge
                              key={skill.id}
                              variant={isMatched ? "default" : "secondary"}
                              className={cn(
                                isMatched && "bg-green-600 hover:bg-green-700"
                              )}
                            >
                              {skill.name}
                              {isMatched && (
                                <CheckCircle2 className="h-3 w-3 ml-1" />
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </section>
                  </>
                )}

                {resume.languages.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Languages className="h-4 w-4" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {resume.languages.map((lang) => (
                          <Badge key={lang.id} variant="outline">
                            {lang.name} ({lang.proficiency})
                          </Badge>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {resume.certifications.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4" />
                        Certifications
                      </h4>
                      <div className="space-y-2">
                        {resume.certifications.map((cert) => (
                          <p key={cert.id} className="text-sm">
                            {cert.name} - {cert.issuer}
                            {cert.date && ` (${cert.date})`}
                          </p>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {resume.projects.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <FolderGit2 className="h-4 w-4" />
                        Projects
                      </h4>
                      <div className="space-y-3">
                        {resume.projects.map((proj) => {
                          const projSuggestions = getSuggestionsForSection(
                            "projects",
                            proj.id
                          );
                          return (
                            <div key={proj.id}>
                              <p className="font-medium">{proj.name}</p>
                              {proj.description && (
                                <p className="text-sm text-muted-foreground">
                                  {proj.description}
                                </p>
                              )}
                              {proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {proj.technologies.map((tech, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {projSuggestions.map((suggestion) => (
                                <SuggestionInline
                                  key={suggestion.id}
                                  suggestion={suggestion}
                                  onAccept={onAcceptSuggestion ? () => onAcceptSuggestion(suggestion) : undefined}
                                  onReject={onRejectSuggestion ? () => onRejectSuggestion(suggestion) : undefined}
                                  onUndo={onUndoSuggestion ? () => onUndoSuggestion(suggestion) : undefined}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </>
                )}

                {resume.openSource.length > 0 && (
                  <>
                    <Separator />
                    <section>
                      <h4 className="font-medium flex items-center gap-2 mb-3">
                        <GitBranch className="h-4 w-4" />
                        Open Source
                      </h4>
                      <div className="space-y-3">
                        {resume.openSource.map((os) => {
                          const osSuggestions = getSuggestionsForSection(
                            "openSource",
                            os.id
                          );
                          return (
                            <div key={os.id}>
                              <p className="font-medium">
                                {os.project}{" "}
                                <span className="font-normal text-muted-foreground">
                                  ({os.role})
                                </span>
                              </p>
                              {os.description && (
                                <p className="text-sm text-muted-foreground">
                                  {os.description}
                                </p>
                              )}
                              {osSuggestions.map((suggestion) => (
                                <SuggestionInline
                                  key={suggestion.id}
                                  suggestion={suggestion}
                                  onAccept={onAcceptSuggestion ? () => onAcceptSuggestion(suggestion) : undefined}
                                  onReject={onRejectSuggestion ? () => onRejectSuggestion(suggestion) : undefined}
                                  onUndo={onUndoSuggestion ? () => onUndoSuggestion(suggestion) : undefined}
                                />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
