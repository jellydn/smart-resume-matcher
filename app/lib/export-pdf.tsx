import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Link,
} from "@react-pdf/renderer";
import type { Resume } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333333",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #e5e5e5",
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
    fontFamily: "Helvetica-Bold",
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    fontSize: 9,
    color: "#666666",
  },
  contactItem: {
    marginRight: 12,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  summary: {
    fontSize: 10,
    color: "#444444",
    marginTop: 10,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1 solid #e5e5e5",
    paddingBottom: 4,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  experienceTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  experienceDate: {
    fontSize: 9,
    color: "#666666",
  },
  experienceCompany: {
    fontSize: 10,
    color: "#444444",
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 4,
  },
  highlightsList: {
    paddingLeft: 12,
  },
  highlightItem: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 2,
  },
  bullet: {
    marginRight: 6,
  },
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  degree: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  institution: {
    fontSize: 10,
    color: "#444444",
  },
  gpa: {
    fontSize: 9,
    color: "#666666",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillItem: {
    fontSize: 9,
    backgroundColor: "#f3f4f6",
    padding: "3 8",
    borderRadius: 3,
    color: "#374151",
  },
  languageItem: {
    marginBottom: 3,
    fontSize: 9,
  },
  certificationItem: {
    marginBottom: 6,
  },
  certificationName: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  certificationIssuer: {
    fontSize: 9,
    color: "#666666",
  },
  projectItem: {
    marginBottom: 10,
  },
  projectName: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  projectDescription: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 3,
  },
  techContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 3,
  },
  techItem: {
    fontSize: 8,
    backgroundColor: "#e5e7eb",
    padding: "2 6",
    borderRadius: 2,
    color: "#4b5563",
  },
  openSourceItem: {
    marginBottom: 10,
  },
  roleTag: {
    fontSize: 8,
    color: "#2563eb",
    marginLeft: 6,
  },
});

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

interface ResumePDFProps {
  resume: Resume;
}

export function ResumePDF({ resume }: ResumePDFProps) {
  const { personalInfo, experience, education, skills, languages, certifications, projects, openSource } = resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.name}</Text>
          <View style={styles.contactInfo}>
            {personalInfo.email && (
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            )}
            {personalInfo.linkedin && (
              <Link src={personalInfo.linkedin} style={[styles.contactItem, styles.link]}>
                LinkedIn
              </Link>
            )}
            {personalInfo.website && (
              <Link src={personalInfo.website} style={[styles.contactItem, styles.link]}>
                Website
              </Link>
            )}
          </View>
          {personalInfo.summary && (
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          )}
        </View>

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{exp.title}</Text>
                  <Text style={styles.experienceDate}>
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.experienceCompany}>
                  {exp.company}{exp.location ? ` • ${exp.location}` : ""}
                </Text>
                {exp.description && (
                  <Text style={styles.experienceDescription}>{exp.description}</Text>
                )}
                {exp.highlights.length > 0 && (
                  <View style={styles.highlightsList}>
                    {exp.highlights.map((highlight, idx) => (
                      <Text key={idx} style={styles.highlightItem}>
                        <Text style={styles.bullet}>•</Text> {highlight}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  {edu.graduationDate && (
                    <Text style={styles.experienceDate}>{formatDate(edu.graduationDate)}</Text>
                  )}
                </View>
                <Text style={styles.institution}>
                  {edu.institution}{edu.location ? ` • ${edu.location}` : ""}
                </Text>
                {edu.gpa && <Text style={styles.gpa}>GPA: {edu.gpa}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skillItem}>
                  {skill.name} ({proficiencyLabel(skill.proficiency)})
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {languages.map((lang) => (
              <Text key={lang.id} style={styles.languageItem}>
                {lang.name} – {proficiencyLabel(lang.proficiency)}
              </Text>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.certificationItem}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationIssuer}>
                  {cert.issuer}{cert.date ? ` • ${formatDate(cert.date)}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.projectItem}>
                <Text style={styles.projectName}>
                  {proj.name}
                  {proj.url && (
                    <Link src={proj.url} style={styles.link}> (link)</Link>
                  )}
                </Text>
                {proj.description && (
                  <Text style={styles.projectDescription}>{proj.description}</Text>
                )}
                {proj.technologies.length > 0 && (
                  <View style={styles.techContainer}>
                    {proj.technologies.map((tech, idx) => (
                      <Text key={idx} style={styles.techItem}>{tech}</Text>
                    ))}
                  </View>
                )}
                {proj.highlights.length > 0 && (
                  <View style={styles.highlightsList}>
                    {proj.highlights.map((h, idx) => (
                      <Text key={idx} style={styles.highlightItem}>
                        <Text style={styles.bullet}>•</Text> {h}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Open Source */}
        {openSource.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Open Source</Text>
            {openSource.map((os) => (
              <View key={os.id} style={styles.openSourceItem}>
                <Text style={styles.projectName}>
                  {os.project}
                  <Text style={styles.roleTag}>[{roleLabel(os.role)}]</Text>
                  {os.url && (
                    <Link src={os.url} style={styles.link}> (link)</Link>
                  )}
                </Text>
                {os.description && (
                  <Text style={styles.projectDescription}>{os.description}</Text>
                )}
                {os.contributions.length > 0 && (
                  <View style={styles.highlightsList}>
                    {os.contributions.map((c, idx) => (
                      <Text key={idx} style={styles.highlightItem}>
                        <Text style={styles.bullet}>•</Text> {c}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function exportResumeAsPdf(
  resume: Resume,
  jobTitle?: string,
  companyName?: string
): Promise<void> {
  const blob = await pdf(<ResumePDF resume={resume} />).toBlob();

  let filename = "resume";
  if (resume.personalInfo.name) {
    filename = sanitizeFilename(resume.personalInfo.name);
  }
  if (jobTitle) {
    filename += `-${sanitizeFilename(jobTitle)}`;
  } else if (companyName) {
    filename += `-${sanitizeFilename(companyName)}`;
  }
  filename += ".pdf";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
