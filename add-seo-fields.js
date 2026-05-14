const fs = require('fs');
const path = require('path');
const schemaPath = path.join(__dirname, 'server', 'src', 'database', 'prisma', 'schema.prisma');

let content = fs.readFileSync(schemaPath, 'utf8');

// Add SEO fields to Product (before isPublished)
content = content.replace(
  /  isPublished  Boolean(\s+)@default\(true\) @map\("is_published"\)/,
  (match, ws) => `  metaTitle       String?         @map("meta_title")\n  metaDescription String?         @map("meta_description")\n  metaKeywords    String?         @map("meta_keywords")\n  isPublished  Boolean${ws}@default(true) @map("is_published")`
);

// Add SEO fields to Case
content = content.replace(
  /  coverImage   String\?\s+@map\("cover_image"\)\n  isPublished/,
  '  coverImage   String?  @map("cover_image")\n  metaTitle       String? @map("meta_title")\n  metaDescription String? @map("meta_description")\n  metaKeywords    String? @map("meta_keywords")\n  isPublished'
);

// Add SEO fields to News
content = content.replace(
  /  coverImage   String\?\s+@map\("cover_image"\)\n  isPublished/,
  '  coverImage   String?    @map("cover_image")\n  metaTitle       String?  @map("meta_title")\n  metaDescription String?  @map("meta_description")\n  metaKeywords    String?  @map("meta_keywords")\n  isPublished'
);

fs.writeFileSync(schemaPath, content);
console.log('Schema updated with SEO fields');
