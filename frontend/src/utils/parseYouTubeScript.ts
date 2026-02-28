export interface ScriptSection {
  title: string;
  content: string[];
}

export function parseYouTubeScript(rawScript: string): ScriptSection[] {
  const sections: ScriptSection[] = [];
  const lines = rawScript.split('\n');
  
  let currentSection: ScriptSection | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a heading (starts with ###)
    if (trimmedLine.startsWith('###')) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = {
        title: trimmedLine.replace(/^###\s*/, ''),
        content: [],
      };
    } else if (trimmedLine && currentSection) {
      // Add content to current section
      currentSection.content.push(trimmedLine);
    }
  }

  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // Ensure sections are in the required order
  const orderedSectionTitles = [
    'Hook',
    'Introduction',
    'Main Points',
    'Examples / Story',
    'CTA',
    'Outro',
  ];

  const orderedSections: ScriptSection[] = [];
  
  for (const title of orderedSectionTitles) {
    const section = sections.find(s => 
      s.title.toLowerCase().includes(title.toLowerCase())
    );
    if (section) {
      orderedSections.push(section);
    }
  }

  // Add any remaining sections not in the standard order
  for (const section of sections) {
    if (!orderedSections.includes(section)) {
      orderedSections.push(section);
    }
  }

  return orderedSections;
}
