'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { categories, authors, articles, global, about } = require('../data/data.json');

async function seedExampleApp() {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log('Setting up the template...');
      await importSeedData();
      console.log('Ready to go');
    } catch (error) {
      console.log('Could not import seed data');
      console.error(error);
    }
  } else {
    console.log(
      'Seed data has already been imported. We cannot reimport unless you clear your database first.'
    );
  }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  };
}

function getFileDataFromPath(relativePath) {
  const filePath = relativePath;
  const size = getFileSizeInBytes(filePath);
  const ext = filePath.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';
  const originalFileName = path.basename(filePath);
  return {
    filepath: filePath,
    originalFileName,
    size,
    mimetype: mimeType,
  };
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry }) {
  try {
    // Actually create the entry in Strapi
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
}

async function checkFileExistsBeforeUpload(files) {
  const existingFiles = [];
  const uploadedFiles = [];
  const filesCopy = [...files];

  for (const fileName of filesCopy) {
    // Check if the file already exists in Strapi
    const fileWhereName = await strapi.query('plugin::upload.file').findOne({
      where: {
        name: fileName.replace(/\..*$/, ''),
      },
    });

    if (fileWhereName) {
      // File exists, don't upload it
      existingFiles.push(fileWhereName);
    } else {
      // File doesn't exist, upload it
      const fileData = getFileData(fileName);
      const fileNameNoExtension = fileName.split('.').shift();
      const [file] = await uploadFile(fileData, fileNameNoExtension);
      uploadedFiles.push(file);
    }
  }
  const allFiles = [...existingFiles, ...uploadedFiles];
  // If only one file then return only that file
  return allFiles.length === 1 ? allFiles[0] : allFiles;
}

async function updateBlocks(blocks) {
  const updatedBlocks = [];
  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file name on the block with the actual file
      blockCopy.file = uploadedFiles;
      updatedBlocks.push(blockCopy);
    } else if (block.__component === 'shared.slider') {
      // Get files already uploaded to Strapi or upload new files
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(block.files);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file names on the block with the actual files
      blockCopy.files = existingAndUploadedFiles;
      // Push the updated block
      updatedBlocks.push(blockCopy);
    } else {
      // Just push the block as is
      updatedBlocks.push(block);
    }
  }

  return updatedBlocks;
}

async function importArticles() {
  for (const article of articles) {
    const cover = await checkFileExistsBeforeUpload([`${article.slug}.jpg`]);
    const updatedBlocks = await updateBlocks(article.blocks);

    await createEntry({
      model: 'article',
      entry: {
        ...article,
        cover,
        blocks: updatedBlocks,
        // Make sure it's not a draft
        publishedAt: Date.now(),
      },
    });
  }
}

async function importGlobal() {
  const favicon = await checkFileExistsBeforeUpload(['favicon.png']);
  const shareImage = await checkFileExistsBeforeUpload(['default-image.png']);
  return createEntry({
    model: 'global',
    entry: {
      ...global,
      favicon,
      // Make sure it's not a draft
      publishedAt: Date.now(),
      defaultSeo: {
        ...global.defaultSeo,
        shareImage,
      },
    },
  });
}

async function importAbout() {
  const updatedBlocks = await updateBlocks(about.blocks);

  await createEntry({
    model: 'about',
    entry: {
      ...about,
      blocks: updatedBlocks,
      // Make sure it's not a draft
      publishedAt: Date.now(),
    },
  });
}

async function importCategories() {
  for (const category of categories) {
    await createEntry({ model: 'category', entry: category });
  }
}

async function importAuthors() {
  for (const author of authors) {
    const avatar = await checkFileExistsBeforeUpload([author.avatar]);

    await createEntry({
      model: 'author',
      entry: {
        ...author,
        avatar,
      },
    });
  }
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    author: ['find', 'findOne'],
    global: ['find', 'findOne'],
    about: ['find', 'findOne'],
  });

  // Create all entries
  await importCategories();
  await importAuthors();
  await importArticles();
  await importGlobal();
  await importAbout();
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedExampleApp();
  await app.destroy();

  process.exit(0);
}


async function ensureMarketingPermissions() {
  await setPublicPermissions({
    'homepage': ['find'],
    'why-nrtech': ['find'],
    'solution': ['find', 'findOne'],
    'case-study': ['find', 'findOne'],
    'technical-resource': ['find', 'findOne'],
    'compliance-guide': ['find', 'findOne'],
    'compliance-status': ['find'],
    'team': ['find']
  });
}

async function ensureOfficialAssets() {
  try {
    const dir = path.join('data', 'uploads', 'official');
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.'));
    for (const f of files) {
      const nameNoExt = f.replace(/\..*$/, '');
      const existing = await strapi.query('plugin::upload.file').findOne({
        where: { name: nameNoExt },
      });
      if (existing) continue;
      const fileData = getFileDataFromPath(path.join('data', 'uploads', 'official', f));
      const displayName = nameNoExt;
      try {
        await uploadFile(fileData, displayName);
      } catch (e) {
        // noop
      }
    }
  } catch (e) {
    // noop
  }
}

module.exports = async () => {
  try {
    await ensureMarketingPermissions();
  } catch (e) {}
  try {
    await ensureOfficialAssets();
  } catch (e) {}
  try {
    await ensureHeadshotsAssets();
  } catch (e) {}
  await seedExampleApp();
  try {
    await seedSolutions();
  } catch (e) {}
  try {
    await seedComplianceStatus();
  } catch (e) {}
  try {
    await seedTeam();
  } catch (e) {}
};

async function ensureHeroImages() {
  try {
    const fileByBase = async (base) =>
      await strapi.query('plugin::upload.file').findOne({ where: { name: base } });

    const assignHeroImage = async (uid, baseName) => {
      const file = await fileByBase(baseName.replace(/\..*$/, ''));
      if (!file) return;
      const existing = await strapi.entityService.findMany(uid, { fields: ['id'], populate: { hero: true } });
      const doc = Array.isArray(existing) ? existing[0] : existing;
      if (doc?.id) {
        await strapi.entityService.update(uid, doc.id, {
          data: {
            hero: {
              ...(doc.hero || {}),
              image: file.id,
            },
          },
        });
      } else {
        await strapi.entityService.create(uid, {
          data: {
            hero: { image: file.id },
          },
        });
      }
    };

    await assignHeroImage('api::homepage.homepage', 'Slide-1_opt.jpg');
    await assignHeroImage('api::why-nrtech.why-nrtech', 'Equipment_1-1.jpg');
  } catch (e) {
  }
}

async function ensureHeadshotsAssets() {
  try {
    const dir = path.join('public', 'uploads', 'headshots');
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.'));
    for (const f of files) {
      const nameNoExt = f.replace(/\..*$/, '');
      const existing = await strapi.query('plugin::upload.file').findOne({
        where: { name: nameNoExt },
      });
      if (existing) continue;
      const fileData = getFileDataFromPath(path.join('public', 'uploads', 'headshots', f));
      const displayName = nameNoExt;
      try {
        await uploadFile(fileData, displayName);
      } catch {}
    }
  } catch {}
}
async function seedSolutions() {
  const existing = await strapi.documents('api::solution.solution').findMany({ limit: 1 });
  if (Array.isArray(existing) && existing.length > 0) return;
  const items = [
    {
      title: 'Regional Blenders',
      slug: 'regional-blenders',
      hero: { title: 'Regional Blenders', subtitle: 'Flexible MOQs and technical partnership.', primaryCtaLabel: 'Schedule Scoping', primaryCtaUrl: '/schedule' },
      summary: '<p>Flexible MOQs starting at 10,000 gallons and tailored solutions.</p>',
      benefits: [
        { title: 'Flexible MOQs', description: 'Start at realistic volumes.' },
        { title: 'Custom Formulations', description: '4–6 week guarantee.' }
      ],
      primaryCta: { title: 'Start your project', description: '', ctaLabel: 'Schedule Scoping', ctaUrl: '/schedule' }
    },
    {
      title: 'Bio‑Based Additives',
      slug: 'bio-based-additives',
      hero: { title: 'Bio‑Based Additives', subtitle: 'NSF/Ecolabel aligned portfolio.', primaryCtaLabel: 'Request Assessment', primaryCtaUrl: '/schedule' },
      summary: '<p>Compliance-ready bio‑based solutions with high performance.</p>',
      benefits: [
        { title: 'Compliance Alignment', description: 'NSF, LuSC paths.' },
        { title: 'High Performance', description: 'Without trade‑offs.' }
      ],
      primaryCta: { title: 'Assess compliance', description: '', ctaLabel: 'Request Assessment', ctaUrl: '/schedule' }
    },
    {
      title: 'Custom Formulation',
      slug: 'custom-formulation',
      hero: { title: 'Custom Formulation', subtitle: 'Your toughest challenges deserve custom solutions.', primaryCtaLabel: 'Start Scoping', primaryCtaUrl: '/schedule' },
      summary: '<p>Scoping → Lab → Testing → Pilot → Scale‑up.</p>',
      benefits: [
        { title: 'Rapid Development', description: 'Lab in 2–3 weeks.' },
        { title: 'Pilot & Scale', description: 'From 20kg to production.' }
      ],
      primaryCta: { title: 'Start scoping', description: '', ctaLabel: 'Start Scoping', ctaUrl: '/schedule' }
    },
    {
      title: 'Aftermarket & Private Label',
      slug: 'aftermarket-private-label',
      hero: { title: 'Aftermarket & Private Label', subtitle: 'Contract manufacturing and co‑branding options.', primaryCtaLabel: 'Discuss Opportunity', primaryCtaUrl: '/schedule' },
      summary: '<p>GDI detergents, winterizers, fuel system cleaners.</p>',
      benefits: [
        { title: 'Contract Manufacturing', description: 'For aftermarket brands.' },
        { title: 'Custom Packages', description: 'GDI, cold flow improvers.' }
      ],
      primaryCta: { title: 'Discuss opportunity', description: '', ctaLabel: 'Discuss Opportunity', ctaUrl: '/schedule' }
    }
  ];
  for (const s of items) {
    try {
      await strapi.documents('api::solution.solution').create({ data: { ...s, publishedAt: Date.now() } });
    } catch {}
  }
}

async function seedComplianceStatus() {
  try {
    const existing = await strapi.documents('api::compliance-status.compliance-status').findMany({ limit: 1 });
    if (Array.isArray(existing) && existing.length > 0) return;
    await strapi.documents('api::compliance-status.compliance-status').create({ data: { nsfStatus: 'In Progress — ETA Q2 2026', nsfProgress: 65, apiStatus: 'In Progress — ETA Q4 2026', apiProgress: 40, isoStatus: 'Planned — ETA Q3 2026', isoProgress: 0, publishedAt: Date.now() } });
  } catch {}
}

async function seedTeam() {
  try {
    const existing = await strapi.documents('api::team.team').findMany({ limit: 1 });
    if (Array.isArray(existing) && existing.length > 0) return;
    const headshotNames = ['Headshot1', 'Screenshot 2024-09-06 at 8.10.31 p.m.', 'Screenshot 2024-09-06 at 8.11.04 p.m.'];
    const photos = [];
    for (const base of headshotNames) {
      const file = await strapi.query('plugin::upload.file').findOne({ where: { name: base } });
      if (file) photos.push(file.id);
    }
    const m = [
      { name: 'Chief Technical Officer', title: 'CTO', bio: 'PhD Chemistry, 20+ years.', photo: photos[0] || null },
      { name: 'Senior Formulation Chemist', title: 'R&D', bio: 'NSF, Ecolabel expertise.', photo: photos[1] || null },
      { name: 'Quality Control Director', title: 'QC', bio: 'Rigorous testing and data transparency.', photo: photos[2] || null },
    ];
    await strapi.documents('api::team.team').create({ data: { members: m, publishedAt: Date.now() } });
  } catch {}
}
