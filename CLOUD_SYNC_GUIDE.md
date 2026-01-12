# 🔄 Strapi Cloud Data Sync Guide

## Quick Reference

### If you DON'T have data on Strapi Cloud yet (Fresh Deployment)

1. **Export your local data:**
   ```bash
   npm run export:data
   ```

2. **Deploy to Strapi Cloud:**
   - Go to Strapi admin → Settings → Cloud → Deploy

3. **Import your data:**
   ```bash
   # Edit scripts/import-to-cloud.js (set API_URL and API_TOKEN)
   npm run import:cloud
   ```

---

### If you ALREADY have data on Strapi Cloud

You have several options:

#### Option 1: Update Existing Data (Recommended)

Sync your local data to Cloud, updating existing entries:

```bash
# 1. Export local data
npm run export:data

# 2. Edit scripts/sync-to-cloud.js:
#    - Set API_URL to your Strapi Cloud URL
#    - Set API_TOKEN (from Strapi Cloud admin)
#    - Set UPDATE_EXISTING = true
#    - Set DRY_RUN = false

# 3. Run sync
npm run sync:cloud
```

**What happens:**
- ✅ Existing articles/categories/authors are **updated** with local data
- ✅ New entries are **created** if they don't exist
- ✅ No duplicates are created

#### Option 2: Add New Data Only (No Updates)

Add new entries without touching existing ones:

```bash
# 1. Export local data
npm run export:data

# 2. Edit scripts/sync-to-cloud.js:
#    - Set UPDATE_EXISTING = false
#    - Set DRY_RUN = false

# 3. Run sync
npm run sync:cloud
```

**What happens:**
- ✅ New entries are **created**
- ⏭️ Existing entries are **skipped** (not updated)

#### Option 3: Preview Changes (Dry Run)

See what would happen without making changes:

```bash
# 1. Export local data
npm run export:data

# 2. Edit scripts/sync-to-cloud.js:
#    - Set DRY_RUN = true

# 3. Run sync
npm run sync:cloud
```

**What happens:**
- 👀 Shows what would be created/updated/skipped
- 🚫 No actual changes are made

---

## How It Works

### Finding Existing Entries

The sync script finds existing entries by:
- **Articles**: By `slug` or `title`
- **Categories**: By `name`
- **Authors**: By `name`
- **Single Types** (Global, About, Home): Always updated (only one exists)

### Update vs Create

- **If entry exists** + `UPDATE_EXISTING = true` → **Updates** the entry
- **If entry exists** + `UPDATE_EXISTING = false` → **Skips** the entry
- **If entry doesn't exist** → **Creates** new entry

---

## Common Scenarios

### Scenario 1: "I edited articles locally, want to push changes to Cloud"

```javascript
// sync-to-cloud.js
UPDATE_EXISTING = true;  // Update existing
DRY_RUN = false;         // Apply changes
```

### Scenario 2: "I added new articles locally, want to add them to Cloud"

```javascript
// sync-to-cloud.js
UPDATE_EXISTING = false; // Don't update, just add new
DRY_RUN = false;
```

### Scenario 3: "I want to merge local and cloud data"

1. First, export from Cloud (if possible) or manually note what's there
2. Export local data
3. Use `UPDATE_EXISTING = true` to update Cloud with local data
4. Or manually merge in the JSON files before syncing

### Scenario 4: "I'm not sure what will happen"

```javascript
// sync-to-cloud.js
UPDATE_EXISTING = true;
DRY_RUN = true;  // Preview first!
```

Run it, check the output, then set `DRY_RUN = false` to apply.

---

## Getting Your API Token

1. Go to your Strapi Cloud admin panel
2. Navigate to: **Settings → API Tokens**
3. Click **Create new API Token**
4. Name it (e.g., "Data Sync")
5. Set permissions: **Full access** or **Read & Write**
6. Copy the token (you won't see it again!)

---

## Troubleshooting

### "403 Forbidden" Error
- Check that your API token has the correct permissions
- Make sure the token hasn't expired

### "Entry already exists" but it's not updating
- Set `UPDATE_EXISTING = true` in the sync script
- The script finds entries by slug/name/title - make sure these match

### Media files not syncing
- Media files need to be uploaded separately
- Use the Strapi admin panel to upload images
- Or use the Strapi upload API programmatically

### Relationships broken after sync
- Make sure categories and authors are synced before articles
- The sync script handles this automatically
- If issues persist, check that IDs match or use slugs/names for relationships

---

## Best Practices

1. **Always export before syncing** - Keep backups!
2. **Use dry run first** - Preview changes before applying
3. **Test with one entry** - Try syncing one article first
4. **Backup Cloud data** - Export from Cloud before major syncs
5. **Check relationships** - Verify article-author and article-category links after sync

---

## Scripts Summary

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `export-data.js` | Export all content to JSON | Before any migration/sync |
| `import-to-cloud.js` | Import to fresh Cloud instance | First time deployment |
| `sync-to-cloud.js` | Sync/update existing Cloud data | When Cloud already has data |

