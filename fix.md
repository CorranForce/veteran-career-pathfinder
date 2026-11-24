CorranForce/veteran-career-pathfinder fix list

Default branch: main. Write access: yes. Visibility: public.

Checked against the current tree. pnpm 10.4.1 audit of pnpm-lock.yaml on 24 Nov 2026 reported 197 findings across 958 dependencies. The split is 6 critical, 70 high, 104 moderate, and 17 low. This run had no node_modules directory. The audit still read the lockfile. Every resolve was marked as a production dependency, including vitest, vite, postcss, and pnpm. package.json declares those four as devDependencies.

Critical

- fast-xml-parser 5.2.5 is a transitive dependency.
  - Entity encoding can be bypassed in DOCTYPE entity names.
  - Path: @aws-sdk/client-s3 then @aws-sdk/core then @aws-sdk/xml-builder then fast-xml-parser.
  - Raise the copy to 5.12.0 or later.
  - Critical: GHSA-m7jm-9gc2-mpf2.
  - High: GHSA-37qj-frw5-hhjh, GHSA-jmr7-xgp7-cmfj, GHSA-8gc5-j5rx-235r.
  - Moderate: GHSA-jp2q-39xq-3w4g, GHSA-gh4j-gqv2-49f6.
  - Low: GHSA-fj3w-jwp8-x2g3, GHSA-474x-hrwr-fgx4.

- proxy-addr 2.0.7 is a transitive dependency.
  - An IPv4-mapped IPv6 address can spoof the trusted client IP.
  - Path: express then proxy-addr.
  - Raise the copy to 2.0.8 or later.
  - Critical: GHSA-jqcg-44mw-7w3h.

- tar 7.5.1 is a transitive dependency.
  - A hostile archive can force a decompression denial of service.
  - Path: @tailwindcss/vite then @tailwindcss/oxide then tar.
  - Raise the copy to 7.5.21 or later.
  - Critical: GHSA-23hp-3jrh-7fpw.
  - High: GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97, GHSA-83g3-92jg-28cx, GHSA-qffp-2rhf-9h96, GHSA-9ppj-qmqm-q256, GHSA-r6q2-hw4h-h46w, GHSA-8x88-c5mf-7j5w, GHSA-r292-9mhp-454m.
  - Moderate: GHSA-29xp-372q-xqph, GHSA-vmf3-w455-68vh, GHSA-w8wr-v893-vjvp, GHSA-gvwx-54wh-qm9j.

- tinypool 1.1.1 is a transitive dependency.
  - A prototype pollution gadget in worker options can lead to remote code execution.
  - Path: vitest then tinypool.
  - Raise the copy to 2.1.2 or later.
  - Critical: GHSA-5gmw-xhrv-c9v3, GHSA-85c8-ppgw-ccpr.

- vitest 2.1.9 is a devDependency.
  - The Vitest UI server can read and execute files while it is listening.
  - Path: vitest.
  - Raise vitest to 4.1.12 or later. That line also clears the nested mocker advisory.
  - Critical: GHSA-5xrq-8626-4rwp.
  - Moderate: GHSA-82fw-gwwq-j7x9.

- server/_core/index.ts line 42 sets trust proxy to 1. The proxy-addr finding above sits on that client IP path.
- Fix: upgrade the parents that pull these copies, refresh pnpm-lock.yaml, and run pnpm audit again.

High

- No root README
  - File: missing README.md
  - Setup notes exist in GOOGLE_OAUTH_SETUP.md, GOOGLE_SEARCH_CONSOLE_SETUP.md, and GA4_SETUP.md. A newcomer has no start page.
  - Fix: add a README that covers what the app is, how to run it, required env var names (not values), and test commands.

- Session signing continues when JWT_SECRET is empty
  - server/_core/env.ts line 3 reads JWT_SECRET and defaults to an empty string.
  - server/_core/session.ts line 4 replaces that empty value with a hardcoded string and still signs tokens.
  - Email login, Google login, and request context use that signer. See server/routers/emailAuth.ts, server/routers/googleAuth.ts, server/routers/auth.ts, and server/_core/context.ts line 3.
  - Server boot continues when JWT_SECRET is empty.
  - server/_core/sdk.ts lines 157 to 159 encode the empty cookie secret for a second signer. server/_core/oauth.ts uses that signer.
  - Fix: stop production boot when JWT_SECRET is empty. Remove the hardcoded fallback. Sign every session with the env value.

- @trpc/server 11.7.2 is a direct dependency.
  - Prototype pollution is possible in experimental_nextAppDirCaller.
  - Path: @trpc/server.
  - Raise the package to 11.8.0 or later.
  - High: GHSA-43p4-m455-4f4j.

- axios 1.12.2 is a direct dependency.
  - Findings include prototype pollution, header injection, proxy credential leaks, and denial of service.
  - Path: axios.
  - Raise the package to 1.20.0 or later.
  - High: GHSA-pmwg-cvhr-8vh7, GHSA-pf86-5x62-jrwf, GHSA-6chq-wfr3-2hj9, GHSA-43fc-jf86-j433, GHSA-q8qp-cvcw-x6jj, GHSA-hfxv-24rg-xrqf, GHSA-777c-7fjr-54vf, GHSA-p92q-9vqr-4j8v, GHSA-j5f8-grm9-p9fc, GHSA-3g43-6gmg-66jw, GHSA-35jp-ww65-95wh.
  - Moderate: GHSA-3p68-rc4w-qgx5, GHSA-w9j2-pvgh-6h63, GHSA-3w6x-2g7m-8v23, GHSA-445q-vr5w-6q77, GHSA-m7pr-hjqh-92cm, GHSA-5c9x-8gcm-mpgx, GHSA-vf2m-468p-8v99, GHSA-xx6v-rp6x-q39c, GHSA-fvcv-3m26-pcqx, GHSA-62hf-57xw-28j9, GHSA-898c-q2cr-xwhg, GHSA-mmx7-hfxf-jppx, GHSA-pmv8-rq9r-6j72, GHSA-7q8q-rj6j-mhjq, GHSA-jqh4-m9w3-8hp9, GHSA-42h9-826w-cgv3, GHSA-vh66-26gq-q6x8, GHSA-9fr6-4gfg-395g, GHSA-j8rh-479h-cp32, GHSA-4hqw-qxg8-jxx2.
  - Low: GHSA-xhjh-pmcv-23jw.

- drizzle-orm 0.44.7 is a direct dependency.
  - Improperly escaped SQL identifiers can allow SQL injection.
  - Path: drizzle-orm.
  - Raise the package to 0.45.2 or later.
  - High: GHSA-gpj5-g38j-94v9.

- mysql2 3.15.3 is a direct dependency.
  - An auth plugin downgrade can leak database credentials.
  - Path: mysql2.
  - Raise the package to 3.23.1 or later.
  - High: GHSA-3f6p-5ww8-9rcr.
  - Moderate: GHSA-rgwj-5xj2-c3m3.

- nanoid installs 5.1.6 as a direct dependency and 3.3.11 under postcss.
  - Bad generator sizes can loop, and another advisory covers integer overflow.
  - Path: nanoid. Path: postcss then nanoid.
  - Raise the direct 5.1.6 copy to 5.1.16 or later.
  - Raise the postcss 3.3.11 copy to 3.3.18 or later.
  - package.json and pnpm-lock.yaml override tailwindcss nanoid to 3.3.7.
  - The audit reported no installed 3.3.7 copy. That pin is still below 3.3.18.
  - High: GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8, GHSA-xwg4-73v4-xw9w.

- zod 4.1.12 is a direct dependency.
  - Oversized collections can exhaust memory during validation.
  - Path: zod.
  - Raise the package to 4.6.6 or later.
  - High: GHSA-mrhx-c7xc-m3w5.

- body-parser 1.20.3 is a transitive dependency.
  - Path: express then body-parser.
  - Raise the copy to 1.20.9 or later.
  - High: GHSA-27r3-jxmh-p828.
  - Low: GHSA-v422-hmwv-36x6.

- brace-expansion 2.0.2 is a transitive dependency.
  - Path: google-auth-library then gaxios then rimraf then glob then minimatch then brace-expansion.
  - Raise the copy to 2.1.7 or later.
  - High: GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895, GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p.
  - Moderate: GHSA-f886-m6hf-6m8v, GHSA-q2hr-2g5m-vwhr.

- browserslist 4.26.3 is a transitive dependency.
  - Path: @vitejs/plugin-react then @babel/core then @babel/helper-compilation-targets then browserslist.
  - Raise the copy to 4.28.7 or later.
  - High: GHSA-c83g-rgw3-j3cx, GHSA-73wf-gq98-2v4g.

- form-data 4.0.4 is a transitive dependency.
  - Path: axios then form-data.
  - Raise the copy to 4.0.6 or later.
  - High: GHSA-hmw2-7cc7-3qxx.

- ip-address 10.1.0 is a transitive dependency.
  - Path: express-rate-limit then ip-address.
  - Raise the copy to 10.7.4 or later.
  - High: GHSA-mwp4-54f8-5fhr.
  - Moderate: GHSA-v2v4-37r5-5v8g, GHSA-rpw4-54j3-4h4q, GHSA-j6r3-76f7-8jcv, GHSA-h3mg-xc3c-68pw, GHSA-rxp7-6hxx-x8q5.

- lodash 4.17.21 is a transitive dependency.
  - Path: recharts then lodash.
  - Raise the copy to 4.18.0 or later.
  - High: GHSA-r5fr-rjxr-66jc.
  - Moderate: GHSA-xxjr-mmjv-4gpg.

- lodash-es 4.17.21 is a transitive dependency.
  - Path: streamdown then mermaid then lodash-es.
  - Raise the copy to 4.18.0 or later.
  - High: GHSA-r5fr-rjxr-66jc.
  - Moderate: GHSA-xxjr-mmjv-4gpg.

- minimatch 9.0.5 is a transitive dependency.
  - Path: google-auth-library then gaxios then rimraf then glob then minimatch.
  - Raise the copy to 11.0.1 or later.
  - High: GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74.
  - Moderate: GHSA-g3hv-75wg-m249.

- path-to-regexp 0.1.12 is a transitive dependency.
  - Path: express then path-to-regexp.
  - Raise the copy to 0.1.13 or later.
  - High: GHSA-37ch-88jc-xwx2.

- picomatch 4.0.3 is a transitive dependency.
  - Path: vite then picomatch.
  - Raise the copy to 4.0.4 or later.
  - High: GHSA-c2c7-rcm5-vvqj.
  - Moderate: GHSA-3v7f-55p6-f55p.

- pnpm 10.18.1 is a devDependency.
  - Findings include lifecycle script bypass, lockfile integrity bypass, path traversal, and command injection.
  - Path: pnpm.
  - Raise the installed package to 10.34.5 or later. package.json packageManager also pins pnpm 10.4.1, which is below that line.
  - High: GHSA-379q-355j-w6rj, GHSA-7vhp-vf5g-r2fw, GHSA-2phv-j68v-wwqx, GHSA-rxhj-4m44-96r4, GHSA-hwx4-2j3j-g496, GHSA-5wx6-mg75-v57r, GHSA-w466-c33r-3gjp, GHSA-72r4-9c5j-mj57, GHSA-fr4h-3cph-29xv, GHSA-qrv3-253h-g69c, GHSA-gj8w-mvpf-x27x, GHSA-vx52-2968-3vc6, GHSA-c59q-g84q-2gj5, GHSA-vq4v-j7r6-jq4m.
  - Moderate: GHSA-v253-rj99-jwpq, GHSA-6pfh-p556-v868, GHSA-6x96-7vc8-cm3p, GHSA-xpqm-wm3m-f34h, GHSA-m733-5w8f-5ggw, GHSA-hg3w-7f8c-63hp, GHSA-cjhr-43r9-cfmw, GHSA-p4xf-rf54-rj3x, GHSA-q6j5-fjx5-2mc3, GHSA-54hh-g5mx-jqcp, GHSA-3qhv-2rgh-x77r, GHSA-4gxm-v5v7-fqc4.

- postcss 8.5.6 is a devDependency.
  - A hostile CSS source map comment can disclose local files.
  - Path: postcss.
  - Raise the package to 8.5.23 or later.
  - High: GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849.
  - Moderate: GHSA-qx2v-qp2m-jg93, GHSA-fxqj-rqcc-2cmp.

- rollup 4.52.4 is a transitive dependency.
  - Path: vite then rollup.
  - Raise the copy to 4.59.0 or later.
  - High: GHSA-mw96-cpmx-2vgc.

- source-map-js 1.2.1 is a transitive dependency.
  - Path: @tailwindcss/vite then @tailwindcss/node then source-map-js.
  - Raise the copy to 1.2.2 or later.
  - High: GHSA-68fv-2mgg-jv7q.

- vite installs 7.1.9 as a direct devDependency and 5.4.20 under vitest.
  - Dev server findings include file read and a file deny-list bypass.
  - Path: vite. Path: vitest then vite.
  - Raise the direct 7.1.9 copy to 7.3.7 or later.
  - Raise the vitest copy from 5.4.20 to 6.4.4 or later by upgrading vitest.
  - High: GHSA-v2wj-q39q-566r, GHSA-p9ff-h696-f583, GHSA-587h-7wmj-h5pm.
  - Moderate: GHSA-93m4-6634-74q7, GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-rq7h-c2jc-7f22, GHSA-fx2h-pf6j-xcff.
  - Low: GHSA-9jrq-w75r-8gcw.

- Fix: raise the direct packages to the patch lines above, then refresh the lockfile and run pnpm audit again.

Medium

- No CI workflow
  - Files: no .github/workflows directory. pnpm-lock.yaml is present. package-lock.json is absent. package.json is present.
  - package.json scripts include build, check, and test.
  - pnpm audit runs in this environment and the findings are listed in this file.
  - Fix: add a CI workflow that uses pnpm and the lockfile, runs test, check, and build, and runs pnpm audit.

- package.json declares license MIT, and the repo has no LICENSE file
  - File: package.json line 4. LICENSE is missing.
  - Fix: add a LICENSE file that matches the declared MIT license.

- Server boot continues when DATABASE_URL is empty
  - server/_core/env.ts line 4 defaults DATABASE_URL to an empty string.
  - server/db.ts line 14 skips pool creation when the variable is empty.
  - Server boot continues and leaves the pool uncreated.
  - drizzle.config.ts lines 3 to 5 throw only when a drizzle command runs.
  - Fix: stop production boot when DATABASE_URL is empty.

- @vitest/mocker 2.1.9 is a transitive dependency.
  - Path: vitest then @vitest/mocker.
  - Raise the copy to 4.1.12 or later by upgrading vitest.
  - Moderate: GHSA-82fw-gwwq-j7x9, GHSA-qxg6-89mg-rqv8.

- baseline-browser-mapping 2.8.13 is a transitive dependency.
  - Path: @vitejs/plugin-react then @babel/core then @babel/helper-compilation-targets then browserslist then baseline-browser-mapping.
  - Raise the copy to 2.11.0 or later.
  - Moderate: GHSA-w5vr-8v7q-w6rv.

- dompurify 3.3.0 is a transitive dependency.
  - Path: streamdown then mermaid then dompurify.
  - Raise the copy to 3.4.17 or later for the advisories that name a patch. GHSA-x4vx-rjvf-j5p4 lists no installable patch.
  - Moderate: GHSA-v2wj-7wpq-c8vv, GHSA-h7mw-gpvr-xq4m, GHSA-crv5-9vww-q3g8, GHSA-v9jr-rg53-9pgp, GHSA-hpcv-96wg-7vj8, GHSA-r47g-fvhr-h676, GHSA-rp9w-3fw7-7cwq, GHSA-cmwh-pvxp-8882, GHSA-76mc-f452-cxcm, GHSA-39q2-94rc-95cp, GHSA-cjmm-f4jc-qw8r, GHSA-cj63-jhhr-wcxv, GHSA-h8r8-wccr-v5f2, GHSA-55q2-fjhq-7xh7.
  - Low: GHSA-vxr8-fq34-vvx9, GHSA-gvmj-g25r-r7wr, GHSA-x4vx-rjvf-j5p4, GHSA-c2j3-45gr-mqc4, GHSA-6688-9rhm-gjv2, GHSA-c6gr-qvv4-5v3f, GHSA-mrv2-3pqr-j5jr.

- esbuild 0.18.20 and 0.21.5 are nested copies.
  - Path: drizzle-kit then @esbuild-kit/esm-loader then @esbuild-kit/core-utils then esbuild.
  - Path: vitest then vite then esbuild.
  - The direct devDependency resolves to 0.25.10 and sits outside this advisory.
  - Raise the 0.18.20 copy and the 0.21.5 copy to 0.25.0 or later.
  - Moderate: GHSA-67mh-4wv8-2f99.

- follow-redirects 1.15.11 is a transitive dependency.
  - Path: axios then follow-redirects.
  - Raise the copy to 1.16.0 or later.
  - Moderate: GHSA-r4q5-vmmm-2653.

- glob 10.5.0 is a transitive dependency.
  - Path: google-auth-library then gaxios then rimraf then glob.
  - Raise the copy to 14.0.2 or later.
  - Moderate: GHSA-3g3m-2fjr-6pw4.

- mdast-util-to-hast 13.2.0 is a transitive dependency.
  - Path: streamdown then react-markdown then mdast-util-to-hast.
  - Raise the copy to 13.2.1 or later.
  - Moderate: GHSA-4fh9-h7wg-q85m.

- mermaid 11.12.0 is a transitive dependency.
  - Path: streamdown then mermaid.
  - Raise the copy to 11.16.1 or later.
  - Moderate: GHSA-ghcm-xqfw-q4vr, GHSA-xcj9-5m2h-648r, GHSA-6m6c-36f7-fhxh, GHSA-87f9-hvmw-gh4p, GHSA-6x64-9x62-f2gx, GHSA-3rrr-jr9j-h3q3, GHSA-2v8p-3f2j-5mp7, GHSA-rhh3-jpg6-66xh.
  - Low: GHSA-c4c3-pg64-4m4v.

- postcss-selector-parser 6.0.10 is a transitive dependency.
  - Path: @tailwindcss/typography then postcss-selector-parser.
  - Raise the copy to 6.1.5 or later.
  - Moderate: GHSA-rj75-hqrm-r3gf.

- qs 6.13.0 is a transitive dependency.
  - Path: express then qs.
  - Raise the copy to 6.16.1 or later.
  - Moderate: GHSA-6rw7-vpxm-498p, GHSA-q8mj-m7cp-5q26, GHSA-4mjr-xmp4-gh2g, GHSA-6pq8-jhm2-2vcw.
  - Low: GHSA-w7fw-mjwx-w883.

- uuid 10.0.0 and 11.1.0 are transitive copies.
  - Path: resend then svix then uuid.
  - Path: streamdown then mermaid then uuid.
  - Both copies sit inside the vulnerable range.
  - The advisory patch line is 11.1.1 or later.
  - Moderate: GHSA-w5hq-g745-h8pq.

Low

- .gitignore lines 11 to 15 ignore .env, .env.local, .env.development.local, .env.test.local, and .env.production.local.
  - Missing ignore rules: .env.development, .env.production, and .env.test.
  - Git tracks no .env file.
  - Fix: ignore those three names as well.

- Stripe boot fails closed
  - server/stripe.ts lines 4 to 6 throw when STRIPE_SECRET_KEY is empty.
  - server/routers/payment.ts imports that module. server/routers.ts imports the payment router. server/_core/index.ts loads the app router at startup.
  - A missing Stripe secret stops boot.

- server/googleAuth.credentials.test.ts lines 13 and 14 read GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from the environment.
  - Both values come from the environment.

- GOOGLE_OAUTH_SETUP.md line 6 contains a Google OAuth client id.
  - Line 7 names the client secret as an environment value.
  - Fix: remove the client id from the public document.

- CAESARS_STRATEGY_CAREER_TRANSITIONS_DRAFT.md is tracked in this public repo.
  - Move it out, or make the repo private, if that draft should stay internal.

- @babel/core 7.28.4 is a transitive dependency.
  - Path: @vitejs/plugin-react then @babel/core.
  - Raise the copy to 7.29.6 or later.
  - Low: GHSA-4x5r-pxfx-6jf8.

- katex 0.16.25 is a transitive dependency.
  - Path: streamdown then katex.
  - Raise the copy to 0.18.2 or later.
  - Low: GHSA-238p-pmpm-9mq7.
