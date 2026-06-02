# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: permissions.spec.ts >> Role-Based Access Control Boundaries >> should hide action trigger buttons for staff
- Location: tests\e2e\permissions.spec.ts:26:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e6]:
      - navigation [ref=e7]:
        - generic [ref=e8]:
          - link "VenuePro Logo" [ref=e9]:
            - /url: "#"
            - img "VenuePro Logo" [ref=e10]
          - generic [ref=e11]:
            - link "Features" [ref=e12]:
              - /url: "#features"
            - link "Live Operations" [ref=e13]:
              - /url: "#workflow"
            - link "Marketplace" [ref=e14]:
              - /url: "#marketplace"
            - link "Analytics" [ref=e15]:
              - /url: "#analytics"
            - link "Help FAQ" [ref=e16]:
              - /url: "#faq"
        - generic [ref=e17]:
          - button "Log In" [ref=e18] [cursor=pointer]
          - button "Start Free Trial" [ref=e19] [cursor=pointer]
    - main [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]:
            - img [ref=e24]
            - text: India's Premium Venue Management SaaS
          - heading "Run Your Venue Like a Modern Enterprise" [level=1] [ref=e27]
          - paragraph [ref=e28]: VenuePro helps banquet halls, convention centers, resorts and wedding venues manage bookings, payments, customers, operations and staff from one intelligent platform.
          - generic [ref=e29]:
            - button "Start Free Trial" [ref=e30] [cursor=pointer]
            - link "Watch Live Demo" [ref=e31]:
              - /url: "#workflow"
              - text: Watch Live Demo
              - img [ref=e32]
        - generic [ref=e35]:
          - generic [ref=e41]:
            - img [ref=e42]
            - text: venuepro.in/calendar
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]: VP
              - generic [ref=e48]:
                - img [ref=e50]
                - img [ref=e53]
                - img [ref=e59]
                - img [ref=e62]
            - generic [ref=e65]:
              - generic [ref=e66]:
                - generic [ref=e67]:
                  - heading "Banquet Scheduler" [level=3] [ref=e68]
                  - generic [ref=e69]: June 18 – 20, 2026
                - button "New Booking" [ref=e70] [cursor=pointer]:
                  - img [ref=e71]
                  - text: New Booking
              - generic [ref=e72]:
                - generic [ref=e73]:
                  - generic [ref=e74]: Jun 18
                  - generic [ref=e75]: Jun 19
                  - generic [ref=e76]: Jun 20
                - generic [ref=e77]:
                  - generic [ref=e78]: Grand Lawn
                  - generic [ref=e79]: Crystal Hall
                  - generic [ref=e80]: Royal Banquet
                  - generic [ref=e81]:
                    - generic [ref=e82]: "Wedding: Priya"
                    - generic [ref=e83]:
                      - generic [ref=e84]: Locked
                      - img [ref=e85]
                  - generic [ref=e89] [cursor=pointer]: + Block
                  - generic [ref=e90]:
                    - generic [ref=e91]: Corp AGM
                    - generic [ref=e92]:
                      - generic [ref=e93]: Inquiry
                      - img [ref=e94]
                  - generic [ref=e98] [cursor=pointer]: + Block
                  - generic [ref=e99]:
                    - generic [ref=e100]: "Mehndi: Kapoor"
                    - generic [ref=e101]:
                      - generic [ref=e102]: Locked
                      - img [ref=e103]
                  - generic [ref=e107] [cursor=pointer]: + Block
                  - generic [ref=e108]:
                    - generic [ref=e109]: "Reception: Sen"
                    - generic [ref=e110]:
                      - generic [ref=e111]: Locked
                      - img [ref=e112]
                  - generic [ref=e116] [cursor=pointer]: + Block
                  - generic [ref=e117]:
                    - generic [ref=e118]: "B'day: Aisha"
                    - generic [ref=e119]:
                      - generic [ref=e120]: Locked
                      - img [ref=e121]
          - generic [ref=e124]:
            - generic [ref=e125]: 98%
            - generic [ref=e126]:
              - generic [ref=e127]: Occupancy
              - generic [ref=e128]: Peak Season
          - generic [ref=e129]:
            - generic [ref=e130]: WhatsApp
            - generic [ref=e131]:
              - generic [ref=e132]: Status
              - generic [ref=e133]: Reminders Sent
      - generic [ref=e134]:
        - generic [ref=e135]:
          - heading "Say Goodbye to Venue Chaos" [level=2] [ref=e136]
          - paragraph [ref=e137]: Transform traditional registers and loose billing receipts into a streamlined digital operational ecosystem.
        - generic [ref=e138]:
          - generic [ref=e139]:
            - generic [ref=e140]: Old Way
            - heading "Traditional Venue Disarray" [level=3] [ref=e141]
            - generic [ref=e142]:
              - generic [ref=e143]:
                - generic [ref=e144]: ✕
                - generic [ref=e145]:
                  - generic [ref=e146]: Double Booking Overlaps
                  - paragraph [ref=e147]: Two events locked for the same date because of paper register pencil overrides.
              - generic [ref=e148]:
                - generic [ref=e149]: ✕
                - generic [ref=e150]:
                  - generic [ref=e151]: Loose Advances & Payment Delays
                  - paragraph [ref=e152]: Advances collected without invoice trails. Payment tracking gets missed.
              - generic [ref=e153]:
                - generic [ref=e154]: ✕
                - generic [ref=e155]:
                  - generic [ref=e156]: Manual WhatsApp PDF Sharing
                  - paragraph [ref=e157]: Manually typing estimation items and converting Word sheets for clients.
          - generic [ref=e158]:
            - generic [ref=e159]: Transformation
            - heading "Intelligent Clarity with VenuePro" [level=3] [ref=e160]
            - generic [ref=e161]:
              - generic [ref=e162]:
                - generic [ref=e163]: ✓
                - generic [ref=e164]:
                  - generic [ref=e165]: 100% Calendar Locking
                  - paragraph [ref=e166]: Slot blocked instantly across all coordinators. No overlaps, no mistakes.
              - generic [ref=e167]:
                - generic [ref=e168]: ✓
                - generic [ref=e169]:
                  - generic [ref=e170]: Automated GST Receipts
                  - paragraph [ref=e171]: Auto-generates billing invoices. Reminders sent automatically on WhatsApp.
              - generic [ref=e172]:
                - generic [ref=e173]: ✓
                - generic [ref=e174]:
                  - generic [ref=e175]: Instant Digital Quotes
                  - paragraph [ref=e176]: Send professional digital estimate sheets with GST splits in one tap.
      - generic [ref=e177]:
        - generic [ref=e178]:
          - generic [ref=e179]: Core Capabilities
          - heading "An Connected Operational Network" [level=2] [ref=e180]
          - paragraph [ref=e181]: Every detail of your venue synchronized in real time. Click on any node to preview its capabilities.
        - generic [ref=e182]:
          - generic [ref=e183]:
            - button "100% Instant" [ref=e184] [cursor=pointer]:
              - img [ref=e186]
              - generic [ref=e188]:
                - generic [ref=e189]: 100%
                - generic [ref=e190]: Instant
            - button "3x Smart" [ref=e191] [cursor=pointer]:
              - img [ref=e193]
              - generic [ref=e198]:
                - generic [ref=e199]: 3x
                - generic [ref=e200]: Smart
            - button "Zero Automated" [ref=e201] [cursor=pointer]:
              - img [ref=e203]
              - generic [ref=e205]:
                - generic [ref=e206]: Zero
                - generic [ref=e207]: Automated
            - button "98% WhatsApp" [ref=e208] [cursor=pointer]:
              - img [ref=e210]
              - generic [ref=e212]:
                - generic [ref=e213]: 98%
                - generic [ref=e214]: WhatsApp
            - button "Effortless Venue" [ref=e215] [cursor=pointer]:
              - img [ref=e217]
              - generic [ref=e219]:
                - generic [ref=e220]: Effortless
                - generic [ref=e221]: Venue
            - button "35% Financial" [ref=e222] [cursor=pointer]:
              - img [ref=e224]
              - generic [ref=e226]:
                - generic [ref=e227]: 35%
                - generic [ref=e228]: Financial
            - button "Get Discoverability" [ref=e229] [cursor=pointer]:
              - img [ref=e231]
              - generic [ref=e234]:
                - generic [ref=e235]: Get
                - generic [ref=e236]: Discoverability
            - button "Complete Roles" [ref=e237] [cursor=pointer]:
              - img [ref=e239]
              - generic [ref=e242]:
                - generic [ref=e243]: Complete
                - generic [ref=e244]: Roles
          - generic [ref=e246]:
            - generic [ref=e247]:
              - img [ref=e249]
              - generic [ref=e251]:
                - heading "Instant Calendar Lock" [level=3] [ref=e252]
                - generic [ref=e253]: 100% Calendar Accuracy
            - paragraph [ref=e254]: Avoid double-booking disputes. Lock dates with real-time slot synchronization across all staff devices.
            - button "Try this feature" [ref=e256] [cursor=pointer]:
              - text: Try this feature
              - img [ref=e257]
      - generic [ref=e259]:
        - generic [ref=e260]:
          - generic [ref=e261]: Event Lifecycle
          - heading "Visualizing the Flow of Operations" [level=2] [ref=e262]
          - paragraph [ref=e263]: From the initial wedding inquiry to the final settlement check, VenuePro handles the entire operational sequence.
        - generic [ref=e264]:
          - generic [ref=e266]:
            - generic [ref=e267]:
              - generic [ref=e268]: "01"
              - img [ref=e269]
            - heading "Inquiry pinged" [level=3] [ref=e271]
            - paragraph [ref=e272]: Customer details registered automatically via website or phone call log.
          - generic [ref=e276]:
            - generic [ref=e277]:
              - generic [ref=e278]: "02"
              - img [ref=e279]
            - heading "Advance received" [level=3] [ref=e282]
            - paragraph [ref=e283]: Secure advance split entered. System generates confirmation voucher.
          - generic [ref=e287]:
            - generic [ref=e288]:
              - generic [ref=e289]: "03"
              - img [ref=e290]
            - heading "Calendar locked" [level=3] [ref=e292]
            - paragraph [ref=e293]: Date cell flashes locked across all coordinators. Duplicate blocks are forbidden.
          - generic [ref=e297]:
            - generic [ref=e298]:
              - generic [ref=e299]: "04"
              - img [ref=e300]
            - heading "Checklist active" [level=3] [ref=e303]
            - paragraph [ref=e304]: Catering, menu plate counts, and decorations templates assigned to team.
          - generic [ref=e308]:
            - generic [ref=e309]:
              - generic [ref=e310]: "05"
              - img [ref=e311]
            - heading "Settlement logged" [level=3] [ref=e313]
            - paragraph [ref=e314]: CA-ready invoice with balance calculations shared on WhatsApp.
      - generic [ref=e318]:
        - generic [ref=e319]:
          - generic [ref=e320]: Discoverability
          - heading "Unlock Organic Inquiries with the Discovery Network" [level=2] [ref=e321]
          - paragraph [ref=e322]: VenuePro links your private dashboard to our guest-facing portal. Show available slots to wedding organizers in your city and receive direct digital bookings.
          - button "Join the Network" [ref=e324] [cursor=pointer]:
            - text: Join the Network
            - img [ref=e325]
        - generic [ref=e329]:
          - generic [ref=e330]:
            - generic [ref=e331]:
              - img [ref=e332]
              - generic [ref=e335]: Mumbai West Resorts
            - generic [ref=e336]: June 18
          - generic [ref=e337]:
            - generic [ref=e338]: Resort
            - generic [ref=e339]:
              - text: Lux Premier
              - heading "Royal Heritage Lawn & Hall" [level=3] [ref=e340]
              - paragraph [ref=e341]: "Capacity: 300 - 800 guests • Juhu, Mumbai"
              - generic [ref=e342]:
                - generic [ref=e343]: "Veg: ₹1,500/plate"
                - generic [ref=e344]: Slot Available
      - generic [ref=e346]:
        - generic [ref=e348]:
          - generic [ref=e349]:
            - generic [ref=e350]: VP
            - generic [ref=e351]:
              - generic [ref=e352]: VenuePro Auto-Billing
              - text: Online
          - generic [ref=e354]:
            - text: Namaste, can we get a quick price estimate for June 18th event?
            - generic [ref=e355]: 11:00 AM
          - button "Send Response Invitation" [ref=e357] [cursor=pointer]
        - generic [ref=e358]:
          - generic [ref=e359]: WhatsApp Usability
          - heading "Mobile-First Sharing for Busy Managers" [level=2] [ref=e360]
          - paragraph [ref=e361]: Clients demand quick answers. Instantly generate estimate sheets or GST tax logs and share them directly via WhatsApp. No PDF downloads or manual file transfers needed.
          - button "Start Free Trial" [ref=e363] [cursor=pointer]
      - generic [ref=e365]:
        - generic [ref=e366]:
          - generic [ref=e367]: Occupancy Analytics
          - heading "Intelligent Cash Flow & Occupancy Insights" [level=2] [ref=e368]
          - paragraph [ref=e369]: Track slot utilization graphs and outstanding balance collection curves. Analyze high-performance periods and manage seasonal catering costs.
          - button "Open Dashboard Account" [ref=e371] [cursor=pointer]
        - generic [ref=e373]:
          - generic [ref=e374]:
            - generic [ref=e375]:
              - heading "Executive Dashboard" [level=3] [ref=e376]
              - paragraph [ref=e377]: Real-time performance analytics
            - generic [ref=e378]:
              - button "30 Days" [ref=e379] [cursor=pointer]
              - button "Quarter" [ref=e380] [cursor=pointer]
              - button "Year" [ref=e381] [cursor=pointer]
          - generic [ref=e382]:
            - generic [ref=e383]:
              - generic [ref=e384]: Bookings
              - generic [ref=e385]:
                - generic [ref=e386]: "84"
                - generic [ref=e387]: +14%
            - generic [ref=e388]:
              - generic [ref=e389]: Net Sales
              - generic [ref=e390]:
                - generic [ref=e391]: ₹52.8L
                - generic [ref=e392]: +19%
            - generic [ref=e393]:
              - generic [ref=e394]: Occupancy
              - generic [ref=e395]:
                - generic [ref=e396]: 91%
                - generic [ref=e397]: +5%
          - generic [ref=e398]:
            - generic [ref=e399]:
              - generic [ref=e400]: Revenue Flow
              - generic [ref=e401]: "Scale: Relative %"
            - generic [ref=e402]:
              - generic [ref=e403]:
                - generic: 55%
                - generic [ref=e405]: Jan
              - generic [ref=e406]:
                - generic: 70%
                - generic [ref=e408]: Feb
              - generic [ref=e409]:
                - generic: 85%
                - generic [ref=e411]: Mar
              - generic [ref=e412]:
                - generic: 60%
                - generic [ref=e414]: Apr
              - generic [ref=e415]:
                - generic: 95%
                - generic [ref=e417]: May
              - generic [ref=e418]:
                - generic: 75%
                - generic [ref=e420]: Jun
          - generic [ref=e421]:
            - generic [ref=e422]: Active Operations Log
            - generic [ref=e423]:
              - generic [ref=e424]:
                - generic [ref=e425]:
                  - img [ref=e427]
                  - generic [ref=e429]:
                    - generic [ref=e430]: Dev & Priya Wedding
                    - generic [ref=e431]: Grand Lawn • Jun 18
                - generic [ref=e432]:
                  - generic [ref=e433]: ₹12.4 Lakhs
                  - generic [ref=e434]: Locked
              - generic [ref=e435]:
                - generic [ref=e436]:
                  - img [ref=e438]
                  - generic [ref=e440]:
                    - generic [ref=e441]: Tech Summit 2026
                    - generic [ref=e442]: Ruby Banquet • Jun 25
                - generic [ref=e443]:
                  - generic [ref=e444]: ₹4.8 Lakhs
                  - generic [ref=e445]: Locked
              - generic [ref=e446]:
                - generic [ref=e447]:
                  - img [ref=e449]
                  - generic [ref=e451]:
                    - generic [ref=e452]: Rohan Engagement
                    - generic [ref=e453]: Sapphire Hall • Jul 02
                - generic [ref=e454]:
                  - generic [ref=e455]: ₹3.2 Lakhs
                  - generic [ref=e456]: Deposit Paid
      - generic [ref=e457]:
        - generic [ref=e458]:
          - generic [ref=e459]: Pricing Plans
          - heading "Simple, Transparent Pricing for Venue Owners" [level=2] [ref=e460]
          - paragraph [ref=e461]:
            - text: Start with our
            - strong [ref=e462]: 14-day free trial
            - text: on the Pro plan to explore all features. No credit card required.
          - generic [ref=e464]:
            - button "Yearly Billing Save 20%" [ref=e465] [cursor=pointer]:
              - text: Yearly Billing
              - generic [ref=e466]: Save 20%
            - button "Monthly" [ref=e467] [cursor=pointer]
        - generic [ref=e468]:
          - generic [ref=e469]:
            - generic [ref=e470]:
              - generic [ref=e471]:
                - heading "Starter" [level=3] [ref=e472]
                - paragraph [ref=e473]: For single halls or local banquet spaces.
              - generic [ref=e474]:
                - generic [ref=e475]: ₹9,999
                - generic [ref=e476]: /year
              - list [ref=e477]:
                - listitem [ref=e478]:
                  - img [ref=e479]
                  - generic [ref=e481]: 1 Active Venue/Hall Profile
                - listitem [ref=e482]:
                  - img [ref=e483]
                  - generic [ref=e485]: Unlimited Booking Slots
                - listitem [ref=e486]:
                  - img [ref=e487]
                  - generic [ref=e489]: Leads & Customer Inquiries CRM
                - listitem [ref=e490]:
                  - img [ref=e491]
                  - generic [ref=e493]: Basic Invoicing (Plain PDF)
                - listitem [ref=e494]:
                  - img [ref=e495]
                  - generic [ref=e497]: Up to 2 Staff Accounts
                - listitem [ref=e498]:
                  - img [ref=e499]
                  - generic [ref=e501]: Local Browser Offline Sync
            - button "Start 14-Day Free Trial" [ref=e502] [cursor=pointer]
          - generic [ref=e503]:
            - generic [ref=e504]: Best Value / Popular
            - generic [ref=e505]:
              - generic [ref=e506]:
                - heading "Pro Enterprise" [level=3] [ref=e507]
                - paragraph [ref=e508]: Complete automated operations for premium banquets & resorts.
              - generic [ref=e509]:
                - generic [ref=e510]: ₹14,999
                - generic [ref=e511]: /year
              - list [ref=e512]:
                - listitem [ref=e513]:
                  - img [ref=e514]
                  - generic [ref=e516]: Unlimited Halls & Spaces Profiles
                - listitem [ref=e517]:
                  - img [ref=e518]
                  - generic [ref=e520]: Unlimited Bookings Calendar
                - listitem [ref=e521]:
                  - img [ref=e522]
                  - generic [ref=e524]: WhatsApp Automated Receipts & Reminders
                - listitem [ref=e525]:
                  - img [ref=e526]
                  - generic [ref=e528]: Full CFO Expense & Category Analytics
                - listitem [ref=e529]:
                  - img [ref=e530]
                  - generic [ref=e532]: Staff Roles & Permissions (RBAC)
                - listitem [ref=e533]:
                  - img [ref=e534]
                  - generic [ref=e536]: Discovery Marketplace Premium Listing
                - listitem [ref=e537]:
                  - img [ref=e538]
                  - generic [ref=e540]: Bulk Excel/CSV Import Wizard
                - listitem [ref=e541]:
                  - img [ref=e542]
                  - generic [ref=e544]: Priority 24/7 Phone & Chat Support
            - button "Start 14-Day Free Trial" [ref=e545] [cursor=pointer]
          - generic [ref=e546]:
            - generic [ref=e547]:
              - generic [ref=e548]:
                - heading "Enterprise" [level=3] [ref=e549]
                - paragraph [ref=e550]: Custom operations scale for multi-city venues.
              - generic [ref=e551]:
                - generic [ref=e552]: Custom
                - generic [ref=e553]: /bespoke setup
              - list [ref=e554]:
                - listitem [ref=e555]:
                  - img [ref=e556]
                  - generic [ref=e558]: Multi-Location & Chain Dashboards
                - listitem [ref=e559]:
                  - img [ref=e560]
                  - generic [ref=e562]: Bespoke Billing & GST Tax Layouts
                - listitem [ref=e563]:
                  - img [ref=e564]
                  - generic [ref=e566]: Dedicated Account Operations Manager
                - listitem [ref=e567]:
                  - img [ref=e568]
                  - generic [ref=e570]: Bespoke WhatsApp Notification Packs
                - listitem [ref=e571]:
                  - img [ref=e572]
                  - generic [ref=e574]: Advanced API Data Access & Webhooks
                - listitem [ref=e575]:
                  - img [ref=e576]
                  - generic [ref=e578]: Custom Staff Coaching & Onboarding
            - link "Contact Sales Team" [ref=e579]:
              - /url: mailto:support@venuepro.in?subject=Enterprise Inquiry
      - generic [ref=e582]:
        - heading "Modernize Your Venue Operations Today" [level=2] [ref=e583]
        - paragraph [ref=e584]: Eliminate errors, protect client calendars, and get clean digital accounting reports. Join hundreds of Indian banquets and resorts.
        - generic [ref=e585]:
          - button "Start Your Free Trial" [ref=e586] [cursor=pointer]
          - link "Request Customized Demo" [ref=e587]:
            - /url: mailto:support@venuepro.in?subject=Demo Inquiry
      - generic [ref=e588]:
        - generic [ref=e589]:
          - heading "Operational Frequently Asked Questions" [level=2] [ref=e590]
          - paragraph [ref=e591]: We respond to the most common day-to-day doubts of banquet hall and resort managers.
        - generic [ref=e592]:
          - generic [ref=e593]:
            - button "All Questions" [ref=e594] [cursor=pointer]
            - button "Usage & Setup" [ref=e595] [cursor=pointer]
            - button "Revenue Benefits" [ref=e596] [cursor=pointer]
            - button "Staff & Control" [ref=e597] [cursor=pointer]
            - button "Offline Support" [ref=e598] [cursor=pointer]
          - generic [ref=e599]:
            - button "How easy is it to migrate from paper registers and Excel sheets to VenuePro?" [ref=e601] [cursor=pointer]:
              - generic [ref=e602]: How easy is it to migrate from paper registers and Excel sheets to VenuePro?
              - img [ref=e603]
            - button "How does VenuePro guarantee a boost in booking occupancy?" [ref=e606] [cursor=pointer]:
              - generic [ref=e607]: How does VenuePro guarantee a boost in booking occupancy?
              - img [ref=e608]
            - button "Can I restrict staff access so they don't see my cash flow and profits?" [ref=e611] [cursor=pointer]:
              - generic [ref=e612]: Can I restrict staff access so they don't see my cash flow and profits?
              - img [ref=e613]
            - button "What happens if we lose internet connection during a busy wedding season?" [ref=e616] [cursor=pointer]:
              - generic [ref=e617]: What happens if we lose internet connection during a busy wedding season?
              - img [ref=e618]
    - contentinfo [ref=e620]:
      - generic [ref=e621]:
        - generic [ref=e622]:
          - img "VenuePro Logo" [ref=e624]
          - paragraph [ref=e625]: The simple B2B system for wedding halls, banquets, and event centers. Made in India, built for everyone.
        - generic [ref=e626]:
          - generic [ref=e627]: Product Links
          - list [ref=e628]:
            - listitem [ref=e629]:
              - link "Platform Features" [ref=e630]:
                - /url: "#features"
            - listitem [ref=e631]:
              - link "Operational Timeline" [ref=e632]:
                - /url: "#workflow"
            - listitem [ref=e633]:
              - link "Revenue Analytics" [ref=e634]:
                - /url: "#analytics"
            - listitem [ref=e635]:
              - link "Help FAQ Center" [ref=e636]:
                - /url: "#faq"
        - generic [ref=e637]:
          - generic [ref=e638]: Legal & Trust
          - list [ref=e639]:
            - listitem [ref=e640]:
              - link "Privacy Policy" [ref=e641]:
                - /url: /privacy
            - listitem [ref=e642]:
              - link "Terms of Service" [ref=e643]:
                - /url: /terms
            - listitem [ref=e644]:
              - link "Data Encryption SLA" [ref=e645]:
                - /url: "#"
        - generic [ref=e646]:
          - generic [ref=e647]: Help & Support
          - paragraph [ref=e648]:
            - text: "EMAIL US:"
            - strong [ref=e649]: support@venuepro.in
  - button "Feedback" [ref=e651] [cursor=pointer]:
    - img [ref=e652]
    - generic: Feedback
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Role-Based Access Control Boundaries', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Clear state and log in as staff
  8  |     await page.evaluate(() => localStorage.clear());
  9  |     await page.reload();
  10 |     
> 11 |     await page.fill('input[type="email"]', 'staff@venuepro.com');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  12 |     await page.fill('input[type="password"]', 'password123');
  13 |     await page.click('button:has-text("Sign In")');
  14 |   });
  15 | 
  16 |   test('should hide financial pages from sidebar for staff', async ({ page }) => {
  17 |     // Payments navigation item should NOT exist in the DOM
  18 |     const paymentsLink = page.locator('nav >> a:has-text("Payments")');
  19 |     await expect(paymentsLink).not.toBeVisible();
  20 |     
  21 |     // Expenses navigation item should NOT exist in the DOM
  22 |     const expensesLink = page.locator('nav >> a:has-text("Expenses")');
  23 |     await expect(paymentsLink).not.toBeVisible();
  24 |   });
  25 | 
  26 |   test('should hide action trigger buttons for staff', async ({ page }) => {
  27 |     // Bookings page: New Booking button should be absent
  28 |     await page.goto('/bookings');
  29 |     const newBookingBtn = page.locator('button:has-text("New Booking")');
  30 |     await expect(newBookingBtn).not.toBeVisible();
  31 | 
  32 |     // Leads page: Add Lead button should be absent
  33 |     await page.goto('/leads');
  34 |     const addLeadBtn = page.locator('button:has-text("Add Lead")');
  35 |     await expect(addLeadBtn).not.toBeVisible();
  36 | 
  37 |     // Venues page: Add Space button should be absent
  38 |     await page.goto('/venues');
  39 |     const addSpaceBtn = page.locator('button:has-text("Add Space")');
  40 |     await expect(addSpaceBtn).not.toBeVisible();
  41 |   });
  42 | });
  43 | 
```