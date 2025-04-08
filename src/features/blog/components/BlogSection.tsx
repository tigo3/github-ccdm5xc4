import React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../admin/sections/Pages/types'; // Corrected path

interface BlogSectionProps {
  dynamicPages: Page[];
}

const BlogSection: React.FC<BlogSectionProps> = ({ dynamicPages }) => {
  return (
    <section id='blog' className="container mx-auto px-4 py-16 shadow-xl backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-title">
          Blog
        </h2>
        {dynamicPages && dynamicPages.length > 0 && (
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
            {dynamicPages.map(page => (
              <Link
                key={page.id}
                to={`/${page.slug}`}
                className="block p-6 shadow-lg hover:bg-gray-700 transition-colors bg-section"
              >
                {page.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};


export default BlogSection;
