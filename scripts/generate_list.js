const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('before_generate', function() {
  const posts = hexo.locals.get('posts').sort('-date');
  
  let content = '# 个人博客文章目录 (Blog Directory)\n\n';
  content += '> 自动更新：此列表在每次执行 `hexo generate` 或 `hexo deploy` 时自动生成并更新。\n\n';
  
  const categories = hexo.locals.get('categories');
  
  if (categories && categories.length > 0) {
    categories.forEach(category => {
      content += `## 📁 ${category.name}\n\n`;
      const catPosts = category.posts.sort('-date');
      catPosts.forEach(post => {
        // 使用配置好的永久链接
        content += `- [${post.title || 'Untitled'}](${post.permalink}) *(更新于: ${post.date.format('YYYY-MM-DD')})*\n`;
      });
      content += '\n';
    });
  } else {
    content += '## 📝 最新文章\n\n';
    posts.forEach(post => {
      content += `- [${post.title || 'Untitled'}](${post.permalink}) *(更新于: ${post.date.format('YYYY-MM-DD')})*\n`;
    });
  }
  
  // 将 LIST.md 生成到博客根目录
  const targetPath = path.join(hexo.base_dir, 'LIST.md');
  fs.writeFileSync(targetPath, content);
  hexo.log.info('Auto-generated LIST.md based on current posts.');
});
