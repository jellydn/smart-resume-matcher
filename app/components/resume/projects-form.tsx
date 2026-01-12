import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import type { Project } from "~/lib/types";
import { projectSchema, generateId } from "~/lib/types";

interface ProjectsFormProps {
  initialData: Project[];
  onChange: (data: Project[], isValid: boolean) => void;
}

function createEmptyProject(): Project {
  return {
    id: generateId(),
    name: "",
    description: "",
    url: "",
    technologies: [],
    highlights: [],
  };
}

interface ProjectEntryProps {
  project: Project;
  index: number;
  onChange: (index: number, project: Project) => void;
  onRemove: (index: number) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onBlur: (field: string) => void;
}

function ProjectEntry({
  project,
  index,
  onChange,
  onRemove,
  errors,
  touched,
  onBlur,
}: ProjectEntryProps) {
  const [newTech, setNewTech] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  const handleChange =
    (field: keyof Project) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(index, { ...project, [field]: e.target.value });
    };

  const showError = (field: string) => {
    const key = `${index}.${field}`;
    return touched[key] && errors[key];
  };

  const handleFieldBlur = (field: string) => {
    onBlur(`${index}.${field}`);
  };

  const handleAddTech = () => {
    if (newTech.trim()) {
      onChange(index, {
        ...project,
        technologies: [...project.technologies, newTech.trim()],
      });
      setNewTech("");
    }
  };

  const handleRemoveTech = (techIndex: number) => {
    onChange(index, {
      ...project,
      technologies: project.technologies.filter((_, i) => i !== techIndex),
    });
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTech();
    }
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      onChange(index, {
        ...project,
        highlights: [...project.highlights, newHighlight.trim()],
      });
      setNewHighlight("");
    }
  };

  const handleRemoveHighlight = (highlightIndex: number) => {
    onChange(index, {
      ...project,
      highlights: project.highlights.filter((_, i) => i !== highlightIndex),
    });
  };

  const handleHighlightKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddHighlight();
    }
  };

  return (
    <Card className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove project</span>
      </Button>

      <CardContent className="pt-6">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`project-name-${index}`}>
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`project-name-${index}`}
                value={project.name}
                onChange={handleChange("name")}
                onBlur={() => handleFieldBlur("name")}
                placeholder="e.g., E-commerce Platform"
                aria-invalid={!!showError("name")}
              />
              {showError("name") && (
                <p className="text-sm text-destructive">
                  {errors[`${index}.name`]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`project-url-${index}`}>URL</Label>
              <Input
                id={`project-url-${index}`}
                type="url"
                value={project.url}
                onChange={handleChange("url")}
                onBlur={() => handleFieldBlur("url")}
                placeholder="https://..."
                aria-invalid={!!showError("url")}
              />
              {showError("url") && (
                <p className="text-sm text-destructive">
                  {errors[`${index}.url`]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`project-description-${index}`}>Description</Label>
            <Textarea
              id={`project-description-${index}`}
              value={project.description}
              onChange={handleChange("description")}
              onBlur={() => handleFieldBlur("description")}
              placeholder="Brief description of the project..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Technologies</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.technologies.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(techIndex)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="Add technology (press Enter)"
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={handleAddTech}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Highlights</Label>
            {project.highlights.length > 0 && (
              <ul className="space-y-1 mb-2">
                {project.highlights.map((highlight, highlightIndex) => (
                  <li
                    key={highlightIndex}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-muted-foreground">•</span>
                    <span className="flex-1">{highlight}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(highlightIndex)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={handleHighlightKeyDown}
                placeholder="Add highlight (press Enter)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddHighlight}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsForm({ initialData, onChange }: ProjectsFormProps) {
  const [projects, setProjects] = useState<Project[]>(
    initialData.length > 0 ? initialData : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fieldErrors: Record<string, string> = {};
    let allValid = true;

    projects.forEach((project, index) => {
      const result = projectSchema.safeParse(project);
      if (!result.success) {
        allValid = false;
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          fieldErrors[`${index}.${field}`] = issue.message;
        }
      }
    });

    setErrors(fieldErrors);
    onChange(projects, projects.length === 0 || allValid);
  }, [projects, onChange]);

  const handleAddProject = () => {
    setProjects([...projects, createEmptyProject()]);
  };

  const handleProjectChange = (index: number, project: Project) => {
    const updated = [...projects];
    updated[index] = project;
    setProjects(updated);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
    const updatedTouched: Record<string, boolean> = {};
    const updatedErrors: Record<string, string> = {};
    Object.keys(touched).forEach((key) => {
      const [keyIndex] = key.split(".");
      const numIndex = parseInt(keyIndex, 10);
      if (numIndex < index) {
        updatedTouched[key] = touched[key];
        if (errors[key]) updatedErrors[key] = errors[key];
      } else if (numIndex > index) {
        const newKey = key.replace(`${numIndex}.`, `${numIndex - 1}.`);
        updatedTouched[newKey] = touched[key];
        if (errors[key]) updatedErrors[newKey] = errors[key];
      }
    });
    setTouched(updatedTouched);
    setErrors(updatedErrors);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No projects added yet</p>
          <Button type="button" onClick={handleAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <ProjectEntry
                key={project.id}
                project={project}
                index={index}
                onChange={handleProjectChange}
                onRemove={handleRemoveProject}
                errors={errors}
                touched={touched}
                onBlur={handleBlur}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddProject}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Project
          </Button>
        </>
      )}
    </div>
  );
}
