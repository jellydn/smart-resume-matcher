import { useState, useCallback, useMemo, useEffect } from "react";
import type { Route } from "./+types/resume";
import { JsonUpload } from "~/components/resume/json-upload";
import { PersonalInfoForm } from "~/components/resume/personal-info-form";
import { ExperienceForm } from "~/components/resume/experience-form";
import { EducationForm } from "~/components/resume/education-form";
import { SkillsForm } from "~/components/resume/skills-form";
import { LanguagesForm } from "~/components/resume/languages-form";
import { CertificationsForm } from "~/components/resume/certifications-form";
import { ProjectsForm } from "~/components/resume/projects-form";
import { OpenSourceForm } from "~/components/resume/open-source-form";
import { FormWizard, type WizardStep } from "~/components/resume/form-wizard";
import type {
  Resume,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Project,
  OpenSource,
} from "~/lib/types";
import { emptyResume } from "~/lib/types";
import { useResumeStorage } from "~/hooks/use-resume-storage";
import { useSession } from "~/hooks/use-session";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { ArrowLeft, FileText, Upload, Edit, Trash2, Download } from "lucide-react";
import { Link } from "react-router";
import { exportResumeAsJson } from "~/lib/export-json";
import { SyncIndicator } from "~/components/sync-indicator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upload Resume - Resume Matcher" },
    {
      name: "description",
      content: "Upload your resume data as JSON or fill out the form",
    },
  ];
}

export default function ResumePage() {
  const { isAuthenticated } = useSession();
  const {
    resume: storedResume,
    updateResumeField,
    clearResume,
    isLoaded,
    syncStatus,
  } = useResumeStorage();

  const [resume, setResume] = useState<Resume | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(
    emptyResume.personalInfo
  );
  const [experiences, setExperiences] = useState<Experience[]>(
    emptyResume.experience
  );
  const [educations, setEducations] = useState<Education[]>(
    emptyResume.education
  );
  const [skills, setSkills] = useState<Skill[]>(emptyResume.skills);
  const [languages, setLanguages] = useState<Language[]>(emptyResume.languages);
  const [certifications, setCertifications] = useState<Certification[]>(
    emptyResume.certifications
  );
  const [projects, setProjects] = useState<Project[]>(emptyResume.projects);
  const [openSourceItems, setOpenSourceItems] = useState<OpenSource[]>(
    emptyResume.openSource
  );
  const [isPersonalInfoValid, setIsPersonalInfoValid] = useState(false);
  const [isExperienceValid, setIsExperienceValid] = useState(true);
  const [isEducationValid, setIsEducationValid] = useState(true);
  const [isSkillsValid, setIsSkillsValid] = useState(true);
  const [isLanguagesValid, setIsLanguagesValid] = useState(true);
  const [isCertificationsValid, setIsCertificationsValid] = useState(true);
  const [isProjectsValid, setIsProjectsValid] = useState(true);
  const [isOpenSourceValid, setIsOpenSourceValid] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setPersonalInfo(storedResume.personalInfo);
      setExperiences(storedResume.experience);
      setEducations(storedResume.education);
      setSkills(storedResume.skills);
      setLanguages(storedResume.languages);
      setCertifications(storedResume.certifications);
      setProjects(storedResume.projects);
      setOpenSourceItems(storedResume.openSource);
    }
  }, [isLoaded, storedResume]);

  const handleUpload = (uploadedResume: Resume) => {
    setResume(uploadedResume);
  };

  const handlePersonalInfoChange = useCallback(
    (data: PersonalInfo, isValid: boolean) => {
      setPersonalInfo(data);
      setIsPersonalInfoValid(isValid);
      updateResumeField("personalInfo", data);
    },
    [updateResumeField]
  );

  const handleExperienceChange = useCallback(
    (data: Experience[], isValid: boolean) => {
      setExperiences(data);
      setIsExperienceValid(isValid);
      updateResumeField("experience", data);
    },
    [updateResumeField]
  );

  const handleEducationChange = useCallback(
    (data: Education[], isValid: boolean) => {
      setEducations(data);
      setIsEducationValid(isValid);
      updateResumeField("education", data);
    },
    [updateResumeField]
  );

  const handleSkillsChange = useCallback(
    (data: Skill[], isValid: boolean) => {
      setSkills(data);
      setIsSkillsValid(isValid);
      updateResumeField("skills", data);
    },
    [updateResumeField]
  );

  const handleLanguagesChange = useCallback(
    (data: Language[], isValid: boolean) => {
      setLanguages(data);
      setIsLanguagesValid(isValid);
      updateResumeField("languages", data);
    },
    [updateResumeField]
  );

  const handleCertificationsChange = useCallback(
    (data: Certification[], isValid: boolean) => {
      setCertifications(data);
      setIsCertificationsValid(isValid);
      updateResumeField("certifications", data);
    },
    [updateResumeField]
  );

  const handleProjectsChange = useCallback(
    (data: Project[], isValid: boolean) => {
      setProjects(data);
      setIsProjectsValid(isValid);
      updateResumeField("projects", data);
    },
    [updateResumeField]
  );

  const handleOpenSourceChange = useCallback(
    (data: OpenSource[], isValid: boolean) => {
      setOpenSourceItems(data);
      setIsOpenSourceValid(isValid);
      updateResumeField("openSource", data);
    },
    [updateResumeField]
  );

  const handleFormComplete = useCallback(() => {
    setResume({
      ...emptyResume,
      personalInfo,
      experience: experiences,
      education: educations,
      skills,
      languages,
      certifications,
      projects,
      openSource: openSourceItems,
    });
  }, [
    personalInfo,
    experiences,
    educations,
    skills,
    languages,
    certifications,
    projects,
    openSourceItems,
  ]);

  const handleClearData = useCallback(() => {
    clearResume();
    setPersonalInfo(emptyResume.personalInfo);
    setExperiences(emptyResume.experience);
    setEducations(emptyResume.education);
    setSkills(emptyResume.skills);
    setLanguages(emptyResume.languages);
    setCertifications(emptyResume.certifications);
    setProjects(emptyResume.projects);
    setOpenSourceItems(emptyResume.openSource);
    setResume(null);
  }, [clearResume]);

  const handleExportJson = useCallback(() => {
    const currentResume: Resume = {
      personalInfo,
      experience: experiences,
      education: educations,
      skills,
      languages,
      certifications,
      projects,
      openSource: openSourceItems,
    };
    exportResumeAsJson(currentResume);
  }, [
    personalInfo,
    experiences,
    educations,
    skills,
    languages,
    certifications,
    projects,
    openSourceItems,
  ]);

  const wizardSteps: WizardStep[] = useMemo(
    () => [
      {
        id: "personal-info",
        title: "Personal Info",
        description: "Enter your basic contact information",
        component: (
          <PersonalInfoForm
            initialData={personalInfo}
            onChange={handlePersonalInfoChange}
          />
        ),
        isValid: isPersonalInfoValid,
      },
      {
        id: "experience",
        title: "Experience",
        description: "Add your work experience",
        component: (
          <ExperienceForm
            initialData={experiences}
            onChange={handleExperienceChange}
          />
        ),
        isValid: isExperienceValid,
        isOptional: true,
      },
      {
        id: "education",
        title: "Education",
        description: "Add your educational background",
        component: (
          <EducationForm
            initialData={educations}
            onChange={handleEducationChange}
          />
        ),
        isValid: isEducationValid,
        isOptional: true,
      },
      {
        id: "skills",
        title: "Skills",
        description: "List your technical and professional skills",
        component: (
          <SkillsForm initialData={skills} onChange={handleSkillsChange} />
        ),
        isValid: isSkillsValid,
        isOptional: true,
      },
      {
        id: "languages",
        title: "Languages",
        description: "Add languages you speak",
        component: (
          <LanguagesForm
            initialData={languages}
            onChange={handleLanguagesChange}
          />
        ),
        isValid: isLanguagesValid,
        isOptional: true,
      },
      {
        id: "certifications",
        title: "Certifications",
        description: "Add your professional certifications",
        component: (
          <CertificationsForm
            initialData={certifications}
            onChange={handleCertificationsChange}
          />
        ),
        isValid: isCertificationsValid,
        isOptional: true,
      },
      {
        id: "projects",
        title: "Projects",
        description: "Showcase your personal or professional projects",
        component: (
          <ProjectsForm
            initialData={projects}
            onChange={handleProjectsChange}
          />
        ),
        isValid: isProjectsValid,
        isOptional: true,
      },
      {
        id: "open-source",
        title: "Open Source",
        description: "Add your open source contributions",
        component: (
          <OpenSourceForm
            initialData={openSourceItems}
            onChange={handleOpenSourceChange}
          />
        ),
        isValid: isOpenSourceValid,
        isOptional: true,
      },
    ],
    [
      personalInfo,
      handlePersonalInfoChange,
      isPersonalInfoValid,
      experiences,
      handleExperienceChange,
      isExperienceValid,
      educations,
      handleEducationChange,
      isEducationValid,
      skills,
      handleSkillsChange,
      isSkillsValid,
      languages,
      handleLanguagesChange,
      isLanguagesValid,
      certifications,
      handleCertificationsChange,
      isCertificationsValid,
      projects,
      handleProjectsChange,
      isProjectsValid,
      openSourceItems,
      handleOpenSourceChange,
      isOpenSourceValid,
    ]
  );

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground">Loading your resume data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </Button>

        <div className="flex items-center gap-4">
          <SyncIndicator status={syncStatus} isAuthenticated={isAuthenticated} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJson}>
              <Download className="h-4 w-4 mr-1" />
              Export JSON
            </Button>
            <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all resume data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your saved resume information,
                including personal info, experience, education, skills, and all
                other sections. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Your Resume</h1>
          <p className="text-muted-foreground mt-2">
            Upload a JSON file with your resume data, or use the form to enter
            your information. Your data is saved automatically.
          </p>
        </div>

        {resume ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Resume loaded successfully!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {resume.personalInfo.name}
                {resume.experience.length > 0 &&
                  ` • ${resume.experience.length} experience entries`}
                {resume.skills.length > 0 &&
                  ` • ${resume.skills.length} skills`}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setResume(null)}>
                Upload Different Resume
              </Button>
              <Button variant="outline" onClick={() => exportResumeAsJson(resume)}>
                <Download className="h-4 w-4 mr-1" />
                Export JSON
              </Button>
              <Button asChild>
                <Link to="/job">Continue to Job Description</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">
                <Edit className="h-4 w-4 mr-2" />
                Fill Form
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="mt-6">
              <FormWizard
                steps={wizardSteps}
                onComplete={handleFormComplete}
                completeButtonLabel="Save & Continue"
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-6">
              <JsonUpload onUpload={handleUpload} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
