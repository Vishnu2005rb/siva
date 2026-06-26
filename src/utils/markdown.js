// Dynamically load all markdown files from the src/content/blogs folder at build time
const modules = import.meta.glob('/src/content/blogs/*.md', { query: '?raw', import: 'default', eager: true });

/**
 * Custom browser-compatible frontmatter parser.
 * Reads YAML-like header blocks wrapped in --- and returns the parsed metadata and content.
 */
function parseFrontmatter(rawText) {
  const result = { data: {}, content: '' };
  if (!rawText) return result;

  const match = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    const yamlBlock = match[1];
    const content = match[2];

    let currentKey = null;
    let currentValueStr = '';
    const lines = yamlBlock.split('\n');

    const saveKeyValuePair = (key, valueStr) => {
      let trimmed = valueStr.trim();
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          // Parse JSON lists or maps
          result.data[key] = JSON.parse(trimmed);
        } catch (e) {
          result.data[key] = trimmed;
        }
      } else {
        // Strip wrapping quotes
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          trimmed = trimmed.substring(1, trimmed.length - 1);
        }
        result.data[key] = trimmed;
      }
    };

    let openBrackets = 0;
    let openBraces = 0;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const isNewKeyCandidate = !trimmedLine.startsWith('-') && openBrackets === 0 && openBraces === 0;

      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1 && isNewKeyCandidate) {
        if (currentKey) {
          saveKeyValuePair(currentKey, currentValueStr);
        }
        currentKey = line.substring(0, colonIndex).trim();
        currentValueStr = line.substring(colonIndex + 1).trim();
      } else {
        if (currentKey) {
          currentValueStr += '\n' + line;
        }
      }

      // Track brackets and braces to support multi-line JSON arrays and maps
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '[') openBrackets++;
        if (line[i] === ']') openBrackets--;
        if (line[i] === '{') openBraces++;
        if (line[i] === '}') openBraces--;
      }
    });

    if (currentKey) {
      saveKeyValuePair(currentKey, currentValueStr);
    }

    result.content = content;
  } else {
    result.content = rawText;
  }
  return result;
}

/**
 * Estimates reading time based on a standard 200 words-per-minute pace.
 */
function calculateReadingTime(text) {
  if (!text) return '1 min read';
  const wordsPerMinute = 200;
  const noOfWords = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(noOfWords / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Retrieves all blogs loaded dynamically from the content directory.
 * @returns {Array} List of blog objects sorted by publish date descending.
 */
export function getAllBlogs() {
  const blogs = [];

  for (const path in modules) {
    const rawText = modules[path];
    const filename = path.split('/').pop();
    const slug = filename.replace('.md', '');

    const parsed = parseFrontmatter(rawText);
    const readTime = parsed.data.readTime || calculateReadingTime(parsed.content);

    // Format tags array
    let tags = parsed.data.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags.split(',').map(t => t.trim());
      }
    }

    blogs.push({
      slug,
      content: parsed.content,
      title: parsed.data.title || slug.replace(/-/g, ' '),
      description: parsed.data.description || '',
      date: parsed.data.date || '2026-06-26',
      author: parsed.data.author || 'NK Dairy Products',
      category: parsed.data.category || 'General',
      tags: tags,
      image: parsed.data.image || 'https://res.cloudinary.com/ds0td5fre/image/upload/v1781690574/ghee_1l_qpbrwy.jpg',
      faqs: parsed.data.faqs || [],
      readTime
    });
  }

  return blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Retrieves a single blog post by its slug.
 * @param {string} slug - The slug identifier of the blog.
 * @returns {Object|null} The matching blog object or null if not found.
 */
export function getBlogBySlug(slug) {
  const all = getAllBlogs();
  return all.find(b => b.slug === slug) || null;
}
