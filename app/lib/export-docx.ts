import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ExternalHyperlink,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import type { Resume } from "./types";

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const [year, month] = dateString.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
}

function proficiencyLabel(proficiency: string): string {
  const labels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    basic: "Basic",
    conversational: "Conversational",
    professional: "Professional",
    native: "Native",
  };
  return labels[proficiency] || proficiency;
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    contributor: "Contributor",
    maintainer: "Maintainer",
    creator: "Creator",
  };
  return labels[role] || role;
}

function createSectionTitle(title: string): Paragraph {
  return new Paragraph({
    text: title.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: {
      bottom: {
        color: "e5e5e5",
        space: 4,
        size: 6,
        style: BorderStyle.SINGLE,
      },
    },
  });
}

function createBulletPoint(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `• ${text}`,
        size: 18,
        color: "555555",
      }),
    ],
    spacing: { after: 40 },
    indent: { left: convertInchesToTwip(0.25) },
  });
}

export function createResumeDocx(resume: Resume): Document {
  const { personalInfo, experience, education, skills, languages, certifications, projects, openSource } = resume;

  const children: Paragraph[] = [];

  // Header - Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: personalInfo.name,
          bold: true,
          size: 48,
          color: "1a1a1a",
        }),
      ],
      spacing: { after: 100 },
    })
  );

  // Contact info
  const contactParts: (TextRun | ExternalHyperlink)[] = [];
  if (personalInfo.email) {
    contactParts.push(new TextRun({ text: personalInfo.email, size: 18, color: "666666" }));
  }
  if (personalInfo.phone) {
    if (contactParts.length > 0) contactParts.push(new TextRun({ text: "  •  ", size: 18, color: "666666" }));
    contactParts.push(new TextRun({ text: personalInfo.phone, size: 18, color: "666666" }));
  }
  if (personalInfo.location) {
    if (contactParts.length > 0) contactParts.push(new TextRun({ text: "  •  ", size: 18, color: "666666" }));
    contactParts.push(new TextRun({ text: personalInfo.location, size: 18, color: "666666" }));
  }
  if (personalInfo.linkedin) {
    if (contactParts.length > 0) contactParts.push(new TextRun({ text: "  •  ", size: 18, color: "666666" }));
    contactParts.push(
      new ExternalHyperlink({
        link: personalInfo.linkedin,
        children: [new TextRun({ text: "LinkedIn", size: 18, color: "2563eb" })],
      })
    );
  }
  if (personalInfo.website) {
    if (contactParts.length > 0) contactParts.push(new TextRun({ text: "  •  ", size: 18, color: "666666" }));
    contactParts.push(
      new ExternalHyperlink({
        link: personalInfo.website,
        children: [new TextRun({ text: "Website", size: 18, color: "2563eb" })],
      })
    );
  }

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: contactParts,
        spacing: { after: 100 },
      })
    );
  }

  // Summary
  if (personalInfo.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.summary,
            size: 20,
            color: "444444",
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Divider after header
  children.push(
    new Paragraph({
      border: {
        bottom: {
          color: "e5e5e5",
          space: 1,
          size: 6,
          style: BorderStyle.SINGLE,
        },
      },
      spacing: { after: 200 },
    })
  );

  // Experience
  if (experience.length > 0) {
    children.push(createSectionTitle("Experience"));

    for (const exp of experience) {
      // Title and date on same line
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 22,
              color: "1a1a1a",
            }),
            new TextRun({
              text: `\t${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate)}`,
              size: 18,
              color: "666666",
            }),
          ],
          tabStops: [{ type: AlignmentType.RIGHT, position: convertInchesToTwip(6.5) }],
          spacing: { before: 150, after: 40 },
        })
      );

      // Company and location
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ` • ${exp.location}` : ""}`,
              size: 20,
              color: "444444",
            }),
          ],
          spacing: { after: 60 },
        })
      );

      // Description
      if (exp.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: 18,
                color: "555555",
              }),
            ],
            spacing: { after: 60 },
          })
        );
      }

      // Highlights
      for (const highlight of exp.highlights) {
        children.push(createBulletPoint(highlight));
      }
    }
  }

  // Education
  if (education.length > 0) {
    children.push(createSectionTitle("Education"));

    for (const edu of education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
              color: "1a1a1a",
            }),
            ...(edu.graduationDate
              ? [
                  new TextRun({
                    text: `\t${formatDate(edu.graduationDate)}`,
                    size: 18,
                    color: "666666",
                  }),
                ]
              : []),
          ],
          tabStops: [{ type: AlignmentType.RIGHT, position: convertInchesToTwip(6.5) }],
          spacing: { before: 120, after: 40 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.institution}${edu.location ? ` • ${edu.location}` : ""}`,
              size: 20,
              color: "444444",
            }),
          ],
          spacing: { after: 40 },
        })
      );

      if (edu.gpa) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `GPA: ${edu.gpa}`,
                size: 18,
                color: "666666",
              }),
            ],
            spacing: { after: 60 },
          })
        );
      }
    }
  }

  // Skills
  if (skills.length > 0) {
    children.push(createSectionTitle("Skills"));

    const skillTexts = skills.map((s) => `${s.name} (${proficiencyLabel(s.proficiency)})`);
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: skillTexts.join("  •  "),
            size: 18,
            color: "374151",
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  // Languages
  if (languages.length > 0) {
    children.push(createSectionTitle("Languages"));

    for (const lang of languages) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${lang.name} – ${proficiencyLabel(lang.proficiency)}`,
              size: 18,
              color: "555555",
            }),
          ],
          spacing: { after: 40 },
        })
      );
    }
  }

  // Certifications
  if (certifications.length > 0) {
    children.push(createSectionTitle("Certifications"));

    for (const cert of certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 20,
              color: "1a1a1a",
            }),
          ],
          spacing: { before: 80, after: 40 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${cert.issuer}${cert.date ? ` • ${formatDate(cert.date)}` : ""}`,
              size: 18,
              color: "666666",
            }),
          ],
          spacing: { after: 60 },
        })
      );
    }
  }

  // Projects
  if (projects.length > 0) {
    children.push(createSectionTitle("Projects"));

    for (const proj of projects) {
      const projectChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          size: 22,
          color: "1a1a1a",
        }),
      ];

      if (proj.url) {
        projectChildren.push(new TextRun({ text: " ", size: 22 }));
        projectChildren.push(
          new ExternalHyperlink({
            link: proj.url,
            children: [new TextRun({ text: "(link)", size: 18, color: "2563eb" })],
          })
        );
      }

      children.push(
        new Paragraph({
          children: projectChildren,
          spacing: { before: 120, after: 40 },
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: proj.description,
                size: 18,
                color: "555555",
              }),
            ],
            spacing: { after: 40 },
          })
        );
      }

      if (proj.technologies.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: proj.technologies.join(", "),
                size: 16,
                color: "4b5563",
                italics: true,
              }),
            ],
            spacing: { after: 40 },
          })
        );
      }

      for (const highlight of proj.highlights) {
        children.push(createBulletPoint(highlight));
      }
    }
  }

  // Open Source
  if (openSource.length > 0) {
    children.push(createSectionTitle("Open Source"));

    for (const os of openSource) {
      const osChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: os.project,
          bold: true,
          size: 22,
          color: "1a1a1a",
        }),
        new TextRun({
          text: ` [${roleLabel(os.role)}]`,
          size: 16,
          color: "2563eb",
        }),
      ];

      if (os.url) {
        osChildren.push(new TextRun({ text: " ", size: 22 }));
        osChildren.push(
          new ExternalHyperlink({
            link: os.url,
            children: [new TextRun({ text: "(link)", size: 18, color: "2563eb" })],
          })
        );
      }

      children.push(
        new Paragraph({
          children: osChildren,
          spacing: { before: 120, after: 40 },
        })
      );

      if (os.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: os.description,
                size: 18,
                color: "555555",
              }),
            ],
            spacing: { after: 40 },
          })
        );
      }

      for (const contribution of os.contributions) {
        children.push(createBulletPoint(contribution));
      }
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  });
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function exportResumeAsDocx(
  resume: Resume,
  jobTitle?: string,
  companyName?: string
): Promise<void> {
  const doc = createResumeDocx(resume);
  const blob = await Packer.toBlob(doc);

  let filename = "resume";
  if (resume.personalInfo.name) {
    filename = sanitizeFilename(resume.personalInfo.name);
  }
  if (jobTitle) {
    filename += `-${sanitizeFilename(jobTitle)}`;
  } else if (companyName) {
    filename += `-${sanitizeFilename(companyName)}`;
  }
  filename += ".docx";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
