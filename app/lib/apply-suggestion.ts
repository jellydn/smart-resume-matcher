import type { Resume, Suggestion } from "~/lib/types";

export function applySuggestionToResume(
  resume: Resume,
  suggestion: Suggestion
): Resume {
  const { sectionType, itemId, field, suggestedContent } = suggestion;
  const updatedResume = { ...resume };

  switch (sectionType) {
    case "summary":
      updatedResume.personalInfo = {
        ...updatedResume.personalInfo,
        summary: suggestedContent,
      };
      break;

    case "experience":
      if (itemId) {
        updatedResume.experience = updatedResume.experience.map((exp) => {
          if (exp.id !== itemId) return exp;

          if (field === "description") {
            return { ...exp, description: suggestedContent };
          }

          if (field.startsWith("highlights.")) {
            const highlightIndex = parseInt(field.split(".")[1], 10);
            const newHighlights = [...exp.highlights];
            if (!isNaN(highlightIndex) && highlightIndex < newHighlights.length) {
              newHighlights[highlightIndex] = suggestedContent;
            }
            return { ...exp, highlights: newHighlights };
          }

          if (field === "title") {
            return { ...exp, title: suggestedContent };
          }

          return exp;
        });
      }
      break;

    case "education":
      if (itemId) {
        updatedResume.education = updatedResume.education.map((edu) => {
          if (edu.id !== itemId) return edu;

          if (field === "degree") {
            return { ...edu, degree: suggestedContent };
          }

          return edu;
        });
      }
      break;

    case "projects":
      if (itemId) {
        updatedResume.projects = updatedResume.projects.map((proj) => {
          if (proj.id !== itemId) return proj;

          if (field === "description") {
            return { ...proj, description: suggestedContent };
          }

          if (field.startsWith("highlights.")) {
            const highlightIndex = parseInt(field.split(".")[1], 10);
            const newHighlights = [...proj.highlights];
            if (!isNaN(highlightIndex) && highlightIndex < newHighlights.length) {
              newHighlights[highlightIndex] = suggestedContent;
            }
            return { ...proj, highlights: newHighlights };
          }

          return proj;
        });
      }
      break;

    case "openSource":
      if (itemId) {
        updatedResume.openSource = updatedResume.openSource.map((os) => {
          if (os.id !== itemId) return os;

          if (field === "description") {
            return { ...os, description: suggestedContent };
          }

          if (field.startsWith("contributions.")) {
            const contribIndex = parseInt(field.split(".")[1], 10);
            const newContributions = [...os.contributions];
            if (!isNaN(contribIndex) && contribIndex < newContributions.length) {
              newContributions[contribIndex] = suggestedContent;
            }
            return { ...os, contributions: newContributions };
          }

          return os;
        });
      }
      break;

    case "skills":
      break;
  }

  return updatedResume;
}

export function revertSuggestionFromResume(
  resume: Resume,
  suggestion: Suggestion
): Resume {
  const { sectionType, itemId, field, originalContent } = suggestion;
  const updatedResume = { ...resume };

  switch (sectionType) {
    case "summary":
      updatedResume.personalInfo = {
        ...updatedResume.personalInfo,
        summary: originalContent,
      };
      break;

    case "experience":
      if (itemId) {
        updatedResume.experience = updatedResume.experience.map((exp) => {
          if (exp.id !== itemId) return exp;

          if (field === "description") {
            return { ...exp, description: originalContent };
          }

          if (field.startsWith("highlights.")) {
            const highlightIndex = parseInt(field.split(".")[1], 10);
            const newHighlights = [...exp.highlights];
            if (!isNaN(highlightIndex) && highlightIndex < newHighlights.length) {
              newHighlights[highlightIndex] = originalContent;
            }
            return { ...exp, highlights: newHighlights };
          }

          if (field === "title") {
            return { ...exp, title: originalContent };
          }

          return exp;
        });
      }
      break;

    case "education":
      if (itemId) {
        updatedResume.education = updatedResume.education.map((edu) => {
          if (edu.id !== itemId) return edu;

          if (field === "degree") {
            return { ...edu, degree: originalContent };
          }

          return edu;
        });
      }
      break;

    case "projects":
      if (itemId) {
        updatedResume.projects = updatedResume.projects.map((proj) => {
          if (proj.id !== itemId) return proj;

          if (field === "description") {
            return { ...proj, description: originalContent };
          }

          if (field.startsWith("highlights.")) {
            const highlightIndex = parseInt(field.split(".")[1], 10);
            const newHighlights = [...proj.highlights];
            if (!isNaN(highlightIndex) && highlightIndex < newHighlights.length) {
              newHighlights[highlightIndex] = originalContent;
            }
            return { ...proj, highlights: newHighlights };
          }

          return proj;
        });
      }
      break;

    case "openSource":
      if (itemId) {
        updatedResume.openSource = updatedResume.openSource.map((os) => {
          if (os.id !== itemId) return os;

          if (field === "description") {
            return { ...os, description: originalContent };
          }

          if (field.startsWith("contributions.")) {
            const contribIndex = parseInt(field.split(".")[1], 10);
            const newContributions = [...os.contributions];
            if (!isNaN(contribIndex) && contribIndex < newContributions.length) {
              newContributions[contribIndex] = originalContent;
            }
            return { ...os, contributions: newContributions };
          }

          return os;
        });
      }
      break;

    case "skills":
      break;
  }

  return updatedResume;
}
