
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** vigil
- **Date:** 2025-11-14
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** User Registration and Login
- **Test Code:** [TC001_User_Registration_and_Login.py](./TC001_User_Registration_and_Login.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/471a4c1e-bfb3-40d2-8982-9f5a67e88656
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** Password Recovery Flow
- **Test Code:** [TC002_Password_Recovery_Flow.py](./TC002_Password_Recovery_Flow.py)
- **Test Error:** The password recovery request was successfully submitted and confirmed by the system. However, to proceed with the password reset, the recovery link from the email is needed, which typically requires external email access or simulation. Since this environment does not provide direct email access, the next step would be to simulate or manually provide the recovery link to continue testing the password update and login verification steps. Task paused here awaiting further instructions or recovery link.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/d8d8c3e7-5d9a-487e-a5ed-c53d8714c33c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** Post Creation with Rich Media and Features
- **Test Code:** [TC003_Post_Creation_with_Rich_Media_and_Features.py](./TC003_Post_Creation_with_Rich_Media_and_Features.py)
- **Test Error:** Testing stopped due to non-functional 'Add media' button preventing media upload. The issue has been reported for resolution. Further testing cannot proceed until this is fixed.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/e0742f59-0e97-4fe5-b2a4-e86c1a5aa3e3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** Post Creation Text Limit Enforcement per Plan
- **Test Code:** [TC004_Post_Creation_Text_Limit_Enforcement_per_Plan.py](./TC004_Post_Creation_Text_Limit_Enforcement_per_Plan.py)
- **Test Error:** Reported the issue of failure to enforce post length limits for the Free plan. Stopping further testing until the issue is resolved.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://oprqgllsqtfdyjgvgovo.supabase.co/rest/v1/rpc/increment_post_views:0:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/2463b8e7-f00e-45bf-9212-67c7a150047b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Post Interaction: Likes, Comments, Nested Comments, Saves, Shares
- **Test Code:** [TC005_Post_Interaction_Likes_Comments_Nested_Comments_Saves_Shares.py](./TC005_Post_Interaction_Likes_Comments_Nested_Comments_Saves_Shares.py)
- **Test Error:** Testing stopped due to failure in comment submission functionality. The comment input remains unchanged after submission and no new comment appears. This blocks further testing of nested comments, saving posts, and sharing posts. Please investigate and fix the issue.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/fb7c7662-f954-4de6-b6a3-8ce756ea9308
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Community Join with Subscription Plan Restrictions
- **Test Code:** [TC006_Community_Join_with_Subscription_Plan_Restrictions.py](./TC006_Community_Join_with_Subscription_Plan_Restrictions.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/1ec48017-31c6-4476-a2d0-6877fe8dd196
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** Real-Time Direct Messaging Functionality
- **Test Code:** [TC007_Real_Time_Direct_Messaging_Functionality.py](./TC007_Real_Time_Direct_Messaging_Functionality.py)
- **Test Error:** The test to verify real-time messaging features between User A and User B cannot be fully completed because the environment only supports a single session/tab. User A login and navigation to messages interface was successful. However, User B login in a separate session to send and receive messages, mark as read, and delete conversations could not be performed. The issue has been reported. Please enable multiple sessions or use separate devices to fully test the messaging functionality.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/4eade5fa-94a9-41c9-86cf-af1dec922828
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Notification System Real-Time Alerts and Preferences
- **Test Code:** [TC008_Notification_System_Real_Time_Alerts_and_Preferences.py](./TC008_Notification_System_Real_Time_Alerts_and_Preferences.py)
- **Test Error:** The like notification was successfully triggered and visible for User A when User B liked User A's post. However, due to session limitations, User B's other actions such as commenting, following, mentioning, and User A's notification preference updates to mute comment notifications were not performed. Therefore, the task is partially completed but not fully finished as requested. Further testing is needed to validate comment, follow, mention notifications, real-time delivery, marking as read, clearing, and respecting user preferences.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/895e68ea-5ae7-4ced-ae9e-327dd1c52dae
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Global Search with Filters and Trending Topics
- **Test Code:** [TC009_Global_Search_with_Filters_and_Trending_Topics.py](./TC009_Global_Search_with_Filters_and_Trending_Topics.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/b8edaad9-a7b5-4096-a428-7ecbd628c8c4
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Document Library Access Control and Upload
- **Test Code:** [TC010_Document_Library_Access_Control_and_Upload.py](./TC010_Document_Library_Access_Control_and_Upload.py)
- **Test Error:** Testing stopped due to critical access control failures. Free plan users can upload documents and access restricted documents without any subscription enforcement. This is a major security issue that needs immediate attention.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/34c9fc44-70e4-42e4-9af5-9b458b854427
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Moderation Queue and Actions
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/10b51285-ed40-42bf-a926-693980c17d21
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Subscription Plan Upgrade and Billing Cycle Management
- **Test Code:** [TC012_Subscription_Plan_Upgrade_and_Billing_Cycle_Management.py](./TC012_Subscription_Plan_Upgrade_and_Billing_Cycle_Management.py)
- **Test Error:** Subscription plan selection is not working as expected. Clicking 'Escolher Basic' does not initiate checkout or update the plan. Cannot proceed with testing subscription upgrades, billing cycles, free trials, or discounts. Please fix this issue to continue testing.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/93aed85e-fe0c-4b65-abd5-f38a61e665d6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** UI Responsiveness and Accessibility Compliance
- **Test Code:** [TC013_UI_Responsiveness_and_Accessibility_Compliance.py](./TC013_UI_Responsiveness_and_Accessibility_Compliance.py)
- **Test Error:** The UI was tested on the desktop viewport showing a clear, accessible two-column layout with login form and informational content. Color contrast in light mode meets accessibility standards. However, due to limitations, testing on tablet and mobile viewports for responsive layout adaptation, toggling between light and dark modes, and full keyboard navigation accessibility could not be completed. Therefore, the task is only partially complete.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/913094d9-3619-4da7-ba0c-9af7b2cb06a3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** AI Theory Analysis Feature
- **Test Code:** [TC014_AI_Theory_Analysis_Feature.py](./TC014_AI_Theory_Analysis_Feature.py)
- **Test Error:** The AI theory analysis modal could not be opened because the option is missing from the post action menu. The task to validate the AI-generated theory analysis content cannot proceed. Reporting this issue and stopping further actions.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[ERROR] WebSocket connection to 'wss://oprqgllsqtfdyjgvgovo.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcnFnbGxzcXRmZHlqZ3Znb3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjIzMDQsImV4cCI6MjA3NDgzODMwNH0.MilSiXXMS3Ko_NNnfasCqFyURuD5zpZNCdbVE324_Jw&vsn=1.0.0' failed: WebSocket opening handshake timed out (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=2f6fdfa5:1968:0)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/8f7ea087-5608-470c-8938-07c9481895e1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** API Input Validation and Security Checks
- **Test Code:** [TC015_API_Input_Validation_and_Security_Checks.py](./TC015_API_Input_Validation_and_Security_Checks.py)
- **Test Error:** Testing stopped due to lack of navigation or interactive elements on the landing page preventing further API input validation and security testing. Initial login input validation test was successful, but no further tests could be performed.
Browser Console Logs:
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
[WARNING] cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation (at https://cdn.tailwindcss.com/:63:1710)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/471e1a7d-e007-4dfb-98f3-275072c4e7c1/70c6de92-1437-4e95-90ba-41a0a0858975
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **20.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---