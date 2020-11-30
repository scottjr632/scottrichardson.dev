const fs = require('fs');

require('isomorphic-fetch');
require(`dotenv`).config({
  path: `.env`,
});

const file = 'index.mdx';
const contentDir = './content/posts';
const spaceId = `5wszs19rrw5y`;
const contentUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries`;
const previewUrl = `https://preview.contentful.com/spaces/${spaceId}/environments/master/entries`;

/**
 * @typedef ContentfulData
 * @type {{
 *  title: string
 *  date: string
 *  slug: string
 *  tags?: string[]
 *  canonicalUrl?: string
 *  content?: string
 * }}
 */

/**
 * @typedef FieldResponse
 * @type {{
 *  fields: ContentfulData
 * }}
 */

/**
 * @returns {Promise<FieldResponse[]>}
 */
function getContentfulStuff(preview=false) {
  let fullUrl = `${preview ? previewUrl : contentUrl}?access_token=${preview ? process.env.CONTENTFUL_PREVIEW_TOKEN : process.env.CONTENTFUL_ACCESS_TOKEN}`;
  return new Promise((resolve, reject) => {
    fetch(fullUrl).then(res => {
      if (res.statusText != 'OK') {
        reject(`received status code: ${res.status} ${res.statusText}`)
      }
      return res.json();
    })
    .then(res => {
      resolve(res.items);
    })
    .catch(err => {
      console.error(err);
      reject(err);
    })
  })
}

/**
 * @param {ContentfulData} meta
 * @returns {string}
 */
const buildTopMeta = (meta) => {
  let begin = `---
title: ${meta.title}
date: ${meta.date}
slug: "${meta.slug}"
`
  if (meta.canonicalUrl)
    begin += `canonicalUrl: "${meta.canonicalUrl}"\n`;
  if (meta.tags) {
    begin += `tags:\n`
    meta.tags.forEach(tag => {
      begin += `  - ${tag}\n`
    })
  }
  return begin + `\n---\n`
}

/**
 * @param {ContentfulData} meta Metadata object
 * @returns {Promise<void>}
 */
function writeNewPost(meta) {
  const top = buildTopMeta(meta);
  const filename = meta.slug.replace('/', '').toLocaleLowerCase();
  const path = `${contentDir}/${filename}`;

  if (!fs.existsSync(contentDir))
    fs.mkdirSync(contentDir)

  if (!fs.existsSync(path))
    fs.mkdirSync(path);

  return new Promise((resolve) => {
    fs.writeFile(`${path}/${file}`, `${top}\n${meta.content}`, () => {
      resolve()
    })
  })
}

/**
 * 
 * @param {FieldResponse[]} posts 
 */
async function syncContentful(posts) {
  const remotePosts = new Set();
  const postPromises = posts.map(post => {
    const filename = post.fields.slug.replace('/', '').toLocaleLowerCase();
    remotePosts.add(filename);

    return writeNewPost(post.fields)
  });
  
  for (let path of fs.readdirSync(contentDir)) {
    if (!remotePosts.has(path)) {
      console.log(`removing ${path}...`);
      fs.rmdirSync(`content/posts/${path}`, { recursive: true, force: true })
    }
  }
  await Promise.all(postPromises);
}

(async () => {
  console.log('Syncing with contentful...');
  const posts = await getContentfulStuff(process.env.NODE_ENV === 'development');
  await syncContentful(posts)
})();