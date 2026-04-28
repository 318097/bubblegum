### Bubblegum v2

- [ ] Debug Mixpanel tracking for Vercel
- [ ] Auth
  - [ ] Google
  - [ ] OTP
- [ ] Setup system down or API crashes alerts
- [ ] Implement Redis caching
  - [ ] Notion data
  - [ ] Fusion data

---

### Bubblegum Server

#### Todo

- [x] Reset password
- [x] Forgot password
- [x] Netlify-Express lambda
- [x] Enable encrypt password
- [x] Track JWTs
- [x] Add status & active date for all apps
- [x] Add compound indexes for Posts
- [x] Add support for email
- [x] Set expiry for JWT
- [x] Change password
- [x] Emails
  - [x] Account verification
  - [x] Welcome
  - [x] Login
  - [x] Reset password
  - [x] Password updated
- [x] Refactor protectedRoutes, transparent, externalAccess
- [x] Append userId to req
- [x] Integrate account statuses. Return proper error message on failure
- [x] Logout api (expire token)
- [x] All sessions should logout after password change/reset
- [x] Access products from an API
- [x] Expose email trigger from other services
- [x] Soft delete everything
- [x] Send Welcome mail when registered from Google
- [x] Sentry
- [x] Separate out tags into a different collection (tags from notebase, timeline, etc) All tags from all the projects should be in a single collection
- [x] Remove previous default values
- [x] Separate timeline, collections from user model
- [x] Setting operations should work independent of model
- [ ] Advance search for posts
- [ ] Remove keys from PRODUCTS.json

#### Bugs

- [x] All the fields are getting created in task collection for fireboard

#### New app requirements/tools

- [ ] General - Feedback (Intercom), About, Emailing (Sendgrid), Forgot/Reset password page
- [ ] Others - Analytics, Sentry, Mixpanel, Landing pages, Hotjar, Adsense, Sponsers, Buy me a coffee
- [ ] Promotions - Linkedin, fb, insta, twitter, product hunt, hackernews, reddit, quora, youtube, medium, dev, indiehacker
