import React from 'react';
import { ExternalLink, Code2 } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string; // Changed from githubLink and liveLink
}

interface ProjectsSectionProps {
  projects: Project[];
  title: string;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, title }) => {
  return (
    // Added shadow-xl, rounded-lg, and background color using the unified CSS variable
    <section id='projects'
      className="container mx-auto px-4 py-16 shadow-xl"
     // Removed inline style/variable reference for background, handled by Tailwind theme
    >
      <h2 className="text-3xl font-bold text-center mb-12 text-title">
        {/* Removed inline style: color: 'var(--title-color)' */}
        {title}
      </h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"  > 
        {projects.map((project, index) => {
          const ProjectContent = (
            <>
              <div className="flex justify-between items-start mb-4 ">
                <Code2 className="text-primary" size={24} />
                {/* Link icon if link exists */}
                {project.link && (
                  <ExternalLink size={20} className="text-gray-500 "  />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-h3title">
                {/* Removed inline style: color: 'var(--h3title-color)' */}
                {project.title}
              </h3>
              <p className="text-text" >
                {/* Removed redundant text-gray-400 */}
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-3 py-1 rounded-full text-sm bg-primary text-text">{tag}</span>
                ))}
              </div>
            </>
          );

          return project.link ? (
            <a 
              key={index} 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              // Added base shadow-lg and sectionbg class
              className="block  p-6 shadow-lg hover:bg-gray-700 transition-colors hover:shadow-xl bg-section" // Replaced sectionbg with bg-section
            >
              {ProjectContent}
            </a>
          ) : (
             // Added shadow-lg
            <div key={index} className=" p-6 shadow-lg bg-section" >
              {ProjectContent}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProjectsSection;
