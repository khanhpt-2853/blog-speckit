# Deployment Checklist

## ✅ Completed Pre-Deployment Checks

### Code Quality

- ✅ **ESLint**: Passed with only 4 minor warnings (React Hook exhaustive-deps)
- ✅ **Build**: Production build successful
- ✅ **TypeScript**: No type errors

### Environment Variables (Production)

Set these in your deployment platform (Vercel, etc.):

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://fopygmfgfkjymyejtakl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_godi0vpk_nANsdtGVdTFHw_D_o6VGmF
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key  # ⚠️ Update with real key

# App URL (Required)
NEXT_PUBLIC_APP_URL=https://your-domain.com  # ⚠️ Update with your production URL

# Upstash Redis (Optional - for rate limiting)
UPSTASH_REDIS_REST_URL=https://ready-ladybird-23302.upstash.io
UPSTASH_REDIS_REST_TOKEN=AVsGAAIncDFjODQ3ODA3MTZjN2M0YmZkYjc4MDEwODVjODFmNDBlZnAxMjMzMDI

# Resend (Optional - for email notifications)
RESEND_API_KEY=re_your_api_key  # ⚠️ Update if using email notifications
```

## Database Setup

### 1. Run Migrations

Execute these SQL files in your Supabase SQL editor:

```bash
# Main schema
/supabase/migrations/20260111000001_initial_schema.sql

# RLS Policy fixes (if needed)
/supabase/fix-comments-rls.sql
/supabase/fix-tags-rls.sql
```

### 2. Verify RLS Policies

Check that all RLS policies are enabled in Supabase dashboard:

- `posts` table
- `tags` table
- `post_tags` table
- `comments` table
- `likes` table

### 3. User Roles (if needed)

Currently, role checking is disabled in middleware. To enable:

1. Set up user metadata for roles in Supabase
2. Update `/middleware.ts` to uncomment role checking logic

## Security Checks

### ⚠️ Important Before Deploying

1. **Update Service Role Key**: Replace placeholder in production env vars
2. **Update APP_URL**: Set to your actual production domain
3. **Enable Rate Limiting**: Ensure Upstash Redis is configured for production
4. **Review RLS Policies**: Test that users can only access their own data
5. **Test Authentication Flow**: Register → Login → Logout
6. **Test Moderation**: Ensure moderation queue works correctly

## Deployment Steps (Vercel)

1. **Connect Repository**

   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vercel Dashboard**
   - Import project from GitHub
   - Framework Preset: Next.js
   - Root Directory: `./microblog-cms`
   - Add all environment variables from above

3. **Post-Deployment**
   - Verify build logs
   - Test all major features:
     - User registration/login
     - Post creation/editing
     - Comment moderation
     - Tag filtering
     - Pagination
   - Check error tracking in Vercel logs

## Known Issues to Monitor

1. **Middleware Warning**: Next.js shows deprecation warning for "middleware" → "proxy"
   - This is a Next.js 16 change, will need to migrate eventually
   - Currently working fine

2. **React Hook Warnings**: 4 exhaustive-deps warnings
   - Non-blocking, components work correctly
   - Can be fixed by memoizing functions or adding dependencies

3. **Rate Limiting**: Falls back to unlimited requests if Upstash not configured
   - Production should have proper rate limiting enabled

## Post-Deployment Testing

Test these critical paths:

- [ ] User registration with email confirmation
- [ ] Login and logout
- [ ] Create new post with tags
- [ ] Edit existing post
- [ ] Publish/unpublish posts
- [ ] Add comments
- [ ] Moderate comments (approve/reject)
- [ ] Like posts
- [ ] Filter by tags
- [ ] Pagination (10 posts per page)
- [ ] Pending comments badge shows correct count
- [ ] Responsive layout on mobile

## Rollback Plan

If issues occur:

1. Revert to previous deployment in Vercel dashboard
2. Check error logs in Vercel
3. Review Supabase logs for database errors
4. Test locally with production environment variables

---

**Build Date**: $(date)
**Next.js Version**: 16.1.1
**Node Version**: Check with `node -v`
