const fs = require('fs');
const path = require('path');
const schemaPath = path.join(__dirname, 'server', 'src', 'database', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Add SEO fields to Faq model
content = content.replace(
  /  isPublished  Boolean  @default\(true\) @map\("is_published"\)/,
  (match) => {
    // Only match Faq model's isPublished (after translations)
    if (content.indexOf(match) > content.indexOf('model Faq')) {
      return `  metaTitle       String?  @map("meta_title")\n  metaDescription String?  @map("meta_description")\n  metaKeywords    String?  @map("meta_keywords")\n` + match;
    }
    return match;
  }
);

fs.writeFileSync(schemaPath, content);
console.log('FAQ schema updated with SEO fields');
