# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: permissions.spec.ts >> Role-Based Access Control Boundaries >> should hide financial pages from sidebar for staff
- Location: tests\e2e\permissions.spec.ts:16:3

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
          - link "VenuePro Logo" [ref=e9] [cursor=pointer]:
            - /url: "#"
            - img "VenuePro Logo" [ref=e10]
          - generic [ref=e11]:
            - link "Features" [ref=e12] [cursor=pointer]:
              - /url: "#features"
            - link "Live Operations" [ref=e13] [cursor=pointer]:
              - /url: "#workflow"
            - link "Marketplace" [ref=e14] [cursor=pointer]:
              - /url: "#marketplace"
            - link "Analytics" [ref=e15] [cursor=pointer]:
              - /url: "#analytics"
            - link "Help FAQ" [ref=e16] [cursor=pointer]:
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
            - link "Watch Live Demo" [ref=e31] [cursor=pointer]:
              - /url: "#workflow"
              - text: Watch Live Demo
              - img [ref=e32]
        - generic [ref=e36]:
          - generic [ref=e42]:
            - img [ref=e43]
            - text: venuepro.in/calendar
          - generic [ref=e46]:
            - generic [ref=e47]:
              - generic [ref=e48]: VP
              - generic [ref=e49]:
                - img [ref=e51]
                - img [ref=e57]
                - img [ref=e63]
                - img [ref=e69]
            - generic [ref=e75]:
              - generic [ref=e76]:
                - generic [ref=e77]:
                  - heading "Banquet Scheduler" [level=3] [ref=e78]
                  - generic [ref=e79]: June 18 – 20, 2026
                - button "New Booking" [ref=e80] [cursor=pointer]:
                  - img [ref=e81]
                  - text: New Booking
              - generic [ref=e84]:
                - generic [ref=e85]:
                  - generic [ref=e86]: Jun 18
                  - generic [ref=e87]: Jun 19
                  - generic [ref=e88]: Jun 20
                - generic [ref=e89]:
                  - generic [ref=e90]: Grand Lawn
                  - generic [ref=e91]: Crystal Hall
                  - generic [ref=e92]: Royal Banquet
                  - generic [ref=e93]:
                    - generic [ref=e94]: "Wedding: Priya"
                    - generic [ref=e95]:
                      - generic [ref=e96]: Locked
                      - img [ref=e97]
                  - generic [ref=e101] [cursor=pointer]: + Block
                  - generic [ref=e102]:
                    - generic [ref=e103]: Corp AGM
                    - generic [ref=e104]:
                      - generic [ref=e105]: Inquiry
                      - img [ref=e106]
                  - generic [ref=e110] [cursor=pointer]: + Block
                  - generic [ref=e111]:
                    - generic [ref=e112]: "Mehndi: Kapoor"
                    - generic [ref=e113]:
                      - generic [ref=e114]: Locked
                      - img [ref=e115]
                  - generic [ref=e119] [cursor=pointer]: + Block
                  - generic [ref=e120]:
                    - generic [ref=e121]: "Reception: Sen"
                    - generic [ref=e122]:
                      - generic [ref=e123]: Locked
                      - img [ref=e124]
                  - generic [ref=e128] [cursor=pointer]: + Block
                  - generic [ref=e129]:
                    - generic [ref=e130]: "B'day: Aisha"
                    - generic [ref=e131]:
                      - generic [ref=e132]: Locked
                      - img [ref=e133]
          - generic [ref=e136]:
            - generic [ref=e137]: 98%
            - generic [ref=e138]:
              - generic [ref=e139]: Occupancy
              - generic [ref=e140]: Peak Season
          - generic [ref=e141]:
            - generic [ref=e142]: WhatsApp
            - generic [ref=e143]:
              - generic [ref=e144]: Status
              - generic [ref=e145]: Reminders Sent
      - generic [ref=e146]:
        - generic [ref=e147]:
          - heading "Say Goodbye to Venue Chaos" [level=2] [ref=e148]
          - paragraph [ref=e149]: Transform traditional registers and loose billing receipts into a streamlined digital operational ecosystem.
        - generic [ref=e150]:
          - generic [ref=e151]:
            - generic [ref=e152]: Old Way
            - heading "Traditional Venue Disarray" [level=3] [ref=e153]
            - generic [ref=e154]:
              - generic [ref=e155]:
                - generic [ref=e156]: ✕
                - generic [ref=e157]:
                  - generic [ref=e158]: Double Booking Overlaps
                  - paragraph [ref=e159]: Two events locked for the same date because of paper register pencil overrides.
              - generic [ref=e160]:
                - generic [ref=e161]: ✕
                - generic [ref=e162]:
                  - generic [ref=e163]: Loose Advances & Payment Delays
                  - paragraph [ref=e164]: Advances collected without invoice trails. Payment tracking gets missed.
              - generic [ref=e165]:
                - generic [ref=e166]: ✕
                - generic [ref=e167]:
                  - generic [ref=e168]: Manual WhatsApp PDF Sharing
                  - paragraph [ref=e169]: Manually typing estimation items and converting Word sheets for clients.
          - generic [ref=e170]:
            - generic [ref=e171]: Transformation
            - heading "Intelligent Clarity with VenuePro" [level=3] [ref=e172]
            - generic [ref=e173]:
              - generic [ref=e174]:
                - generic [ref=e175]: ✓
                - generic [ref=e176]:
                  - generic [ref=e177]: 100% Calendar Locking
                  - paragraph [ref=e178]: Slot blocked instantly across all coordinators. No overlaps, no mistakes.
              - generic [ref=e179]:
                - generic [ref=e180]: ✓
                - generic [ref=e181]:
                  - generic [ref=e182]: Automated GST Receipts
                  - paragraph [ref=e183]: Auto-generates billing invoices. Reminders sent automatically on WhatsApp.
              - generic [ref=e184]:
                - generic [ref=e185]: ✓
                - generic [ref=e186]:
                  - generic [ref=e187]: Instant Digital Quotes
                  - paragraph [ref=e188]: Send professional digital estimate sheets with GST splits in one tap.
      - generic [ref=e189]:
        - generic [ref=e190]:
          - generic [ref=e191]: Core Capabilities
          - heading "An Connected Operational Network" [level=2] [ref=e192]
          - paragraph [ref=e193]: Every detail of your venue synchronized in real time. Click on any node to preview its capabilities.
        - generic [ref=e194]:
          - generic [ref=e195]:
            - button "100% Instant" [ref=e196] [cursor=pointer]:
              - img [ref=e198]
              - generic [ref=e203]:
                - generic [ref=e204]: 100%
                - generic [ref=e205]: Instant
            - button "3x Smart" [ref=e206] [cursor=pointer]:
              - img [ref=e208]
              - generic [ref=e213]:
                - generic [ref=e214]: 3x
                - generic [ref=e215]: Smart
            - button "Zero Automated" [ref=e216] [cursor=pointer]:
              - img [ref=e218]
              - generic [ref=e221]:
                - generic [ref=e222]: Zero
                - generic [ref=e223]: Automated
            - button "98% WhatsApp" [ref=e224] [cursor=pointer]:
              - img [ref=e226]
              - generic [ref=e228]:
                - generic [ref=e229]: 98%
                - generic [ref=e230]: WhatsApp
            - button "Effortless Venue" [ref=e231] [cursor=pointer]:
              - img [ref=e233]
              - generic [ref=e235]:
                - generic [ref=e236]: Effortless
                - generic [ref=e237]: Venue
            - button "35% Financial" [ref=e238] [cursor=pointer]:
              - img [ref=e240]
              - generic [ref=e245]:
                - generic [ref=e246]: 35%
                - generic [ref=e247]: Financial
            - button "Get Discoverability" [ref=e248] [cursor=pointer]:
              - img [ref=e250]
              - generic [ref=e253]:
                - generic [ref=e254]: Get
                - generic [ref=e255]: Discoverability
            - button "Complete Roles" [ref=e256] [cursor=pointer]:
              - img [ref=e258]
              - generic [ref=e261]:
                - generic [ref=e262]: Complete
                - generic [ref=e263]: Roles
          - generic [ref=e265]:
            - generic [ref=e266]:
              - img [ref=e268]
              - generic [ref=e273]:
                - heading "Instant Calendar Lock" [level=3] [ref=e274]
                - generic [ref=e275]: 100% Calendar Accuracy
            - paragraph [ref=e276]: Avoid double-booking disputes. Lock dates with real-time slot synchronization across all staff devices.
            - button "Try this feature" [ref=e278] [cursor=pointer]:
              - text: Try this feature
              - img [ref=e279]
      - generic [ref=e282]:
        - generic [ref=e283]:
          - generic [ref=e284]: Event Lifecycle
          - heading "Visualizing the Flow of Operations" [level=2] [ref=e285]
          - paragraph [ref=e286]: From the initial wedding inquiry to the final settlement check, VenuePro handles the entire operational sequence.
        - generic [ref=e287]:
          - generic [ref=e289]:
            - generic [ref=e290]:
              - generic [ref=e291]: "01"
              - img [ref=e292]
            - heading "Inquiry pinged" [level=3] [ref=e294]
            - paragraph [ref=e295]: Customer details registered automatically via website or phone call log.
          - generic [ref=e299]:
            - generic [ref=e300]:
              - generic [ref=e301]: "02"
              - img [ref=e302]
            - heading "Advance received" [level=3] [ref=e308]
            - paragraph [ref=e309]: Secure advance split entered. System generates confirmation voucher.
          - generic [ref=e313]:
            - generic [ref=e314]:
              - generic [ref=e315]: "03"
              - img [ref=e316]
            - heading "Calendar locked" [level=3] [ref=e321]
            - paragraph [ref=e322]: Date cell flashes locked across all coordinators. Duplicate blocks are forbidden.
          - generic [ref=e326]:
            - generic [ref=e327]:
              - generic [ref=e328]: "04"
              - img [ref=e329]
            - heading "Checklist active" [level=3] [ref=e332]
            - paragraph [ref=e333]: Catering, menu plate counts, and decorations templates assigned to team.
          - generic [ref=e337]:
            - generic [ref=e338]:
              - generic [ref=e339]: "05"
              - img [ref=e340]
            - heading "Settlement logged" [level=3] [ref=e343]
            - paragraph [ref=e344]: CA-ready invoice with balance calculations shared on WhatsApp.
      - generic [ref=e348]:
        - generic [ref=e349]:
          - generic [ref=e350]: Discoverability
          - heading "Unlock Organic Inquiries with the Discovery Network" [level=2] [ref=e351]
          - paragraph [ref=e352]: VenuePro links your private dashboard to our guest-facing portal. Show available slots to wedding organizers in your city and receive direct digital bookings.
          - button "Join the Network" [ref=e354] [cursor=pointer]:
            - text: Join the Network
            - img [ref=e355]
        - generic [ref=e359]:
          - generic [ref=e360]:
            - generic [ref=e361]:
              - img [ref=e362]
              - generic [ref=e365]: Mumbai West Resorts
            - generic [ref=e366]: June 18
          - generic [ref=e367]:
            - generic [ref=e368]: Resort
            - generic [ref=e369]:
              - text: Lux Premier
              - heading "Royal Heritage Lawn & Hall" [level=3] [ref=e370]
              - paragraph [ref=e371]: "Capacity: 300 - 800 guests • Juhu, Mumbai"
              - generic [ref=e372]:
                - generic [ref=e373]: "Veg: ₹1,500/plate"
                - generic [ref=e374]: Slot Available
      - generic [ref=e376]:
        - generic [ref=e378]:
          - generic [ref=e379]:
            - generic [ref=e380]: VP
            - generic [ref=e381]:
              - generic [ref=e382]: VenuePro Auto-Billing
              - text: Online
          - generic [ref=e384]:
            - text: Namaste, can we get a quick price estimate for June 18th event?
            - generic [ref=e385]: 11:00 AM
          - button "Send Response Invitation" [ref=e387] [cursor=pointer]
        - generic [ref=e388]:
          - generic [ref=e389]: WhatsApp Usability
          - heading "Mobile-First Sharing for Busy Managers" [level=2] [ref=e390]
          - paragraph [ref=e391]: Clients demand quick answers. Instantly generate estimate sheets or GST tax logs and share them directly via WhatsApp. No PDF downloads or manual file transfers needed.
          - button "Start Free Trial" [ref=e393] [cursor=pointer]
      - generic [ref=e395]:
        - generic [ref=e396]:
          - generic [ref=e397]: Occupancy Analytics
          - heading "Intelligent Cash Flow & Occupancy Insights" [level=2] [ref=e398]
          - paragraph [ref=e399]: Track slot utilization graphs and outstanding balance collection curves. Analyze high-performance periods and manage seasonal catering costs.
          - button "Open Dashboard Account" [ref=e401] [cursor=pointer]
        - generic [ref=e403]:
          - generic [ref=e404]:
            - generic [ref=e405]:
              - heading "Executive Dashboard" [level=3] [ref=e406]
              - paragraph [ref=e407]: Real-time performance analytics
            - generic [ref=e408]:
              - button "30 Days" [ref=e409] [cursor=pointer]
              - button "Quarter" [ref=e410] [cursor=pointer]
              - button "Year" [ref=e411] [cursor=pointer]
          - generic [ref=e412]:
            - generic [ref=e413]:
              - generic [ref=e414]: Bookings
              - generic [ref=e415]:
                - generic [ref=e416]: "84"
                - generic [ref=e417]: +14%
            - generic [ref=e418]:
              - generic [ref=e419]: Net Sales
              - generic [ref=e420]:
                - generic [ref=e421]: ₹52.8L
                - generic [ref=e422]: +19%
            - generic [ref=e423]:
              - generic [ref=e424]: Occupancy
              - generic [ref=e425]:
                - generic [ref=e426]: 91%
                - generic [ref=e427]: +5%
          - generic [ref=e428]:
            - generic [ref=e429]:
              - generic [ref=e430]: Revenue Flow
              - generic [ref=e431]: "Scale: Relative %"
            - generic [ref=e432]:
              - generic [ref=e433]:
                - generic: 55%
                - generic [ref=e435]: Jan
              - generic [ref=e436]:
                - generic: 70%
                - generic [ref=e438]: Feb
              - generic [ref=e439]:
                - generic: 85%
                - generic [ref=e441]: Mar
              - generic [ref=e442]:
                - generic: 60%
                - generic [ref=e444]: Apr
              - generic [ref=e445]:
                - generic: 95%
                - generic [ref=e447]: May
              - generic [ref=e448]:
                - generic: 75%
                - generic [ref=e450]: Jun
          - generic [ref=e451]:
            - generic [ref=e452]: Active Operations Log
            - generic [ref=e453]:
              - generic [ref=e454]:
                - generic [ref=e455]:
                  - img [ref=e457]
                  - generic [ref=e462]:
                    - generic [ref=e463]: Dev & Priya Wedding
                    - generic [ref=e464]: Grand Lawn • Jun 18
                - generic [ref=e465]:
                  - generic [ref=e466]: ₹12.4 Lakhs
                  - generic [ref=e467]: Locked
              - generic [ref=e468]:
                - generic [ref=e469]:
                  - img [ref=e471]
                  - generic [ref=e476]:
                    - generic [ref=e477]: Tech Summit 2026
                    - generic [ref=e478]: Ruby Banquet • Jun 25
                - generic [ref=e479]:
                  - generic [ref=e480]: ₹4.8 Lakhs
                  - generic [ref=e481]: Locked
              - generic [ref=e482]:
                - generic [ref=e483]:
                  - img [ref=e485]
                  - generic [ref=e490]:
                    - generic [ref=e491]: Rohan Engagement
                    - generic [ref=e492]: Sapphire Hall • Jul 02
                - generic [ref=e493]:
                  - generic [ref=e494]: ₹3.2 Lakhs
                  - generic [ref=e495]: Deposit Paid
      - generic [ref=e496]:
        - generic [ref=e497]:
          - generic [ref=e498]: Pricing Plans
          - heading "Simple, Transparent Pricing for Venue Owners" [level=2] [ref=e499]
          - paragraph [ref=e500]:
            - text: Start with our
            - strong [ref=e501]: 14-day free trial
            - text: on the Pro plan to explore all features. No credit card required.
          - generic [ref=e503]:
            - button "Yearly Billing Save 20%" [ref=e504] [cursor=pointer]:
              - text: Yearly Billing
              - generic [ref=e505]: Save 20%
            - button "Monthly" [ref=e506] [cursor=pointer]
        - generic [ref=e507]:
          - generic [ref=e508]:
            - generic [ref=e509]:
              - generic [ref=e510]:
                - heading "Starter" [level=3] [ref=e511]
                - paragraph [ref=e512]: For single halls or local banquet spaces.
              - generic [ref=e513]:
                - generic [ref=e514]: ₹9,999
                - generic [ref=e515]: /year
              - list [ref=e516]:
                - listitem [ref=e517]:
                  - img [ref=e518]
                  - generic [ref=e520]: 1 Active Venue/Hall Profile
                - listitem [ref=e521]:
                  - img [ref=e522]
                  - generic [ref=e524]: Unlimited Booking Slots
                - listitem [ref=e525]:
                  - img [ref=e526]
                  - generic [ref=e528]: Leads & Customer Inquiries CRM
                - listitem [ref=e529]:
                  - img [ref=e530]
                  - generic [ref=e532]: Basic Invoicing (Plain PDF)
                - listitem [ref=e533]:
                  - img [ref=e534]
                  - generic [ref=e536]: Up to 2 Staff Accounts
                - listitem [ref=e537]:
                  - img [ref=e538]
                  - generic [ref=e540]: Local Browser Offline Sync
            - button "Start 14-Day Free Trial" [ref=e541] [cursor=pointer]
          - generic [ref=e542]:
            - generic [ref=e543]: Best Value / Popular
            - generic [ref=e544]:
              - generic [ref=e545]:
                - heading "Pro Enterprise" [level=3] [ref=e546]
                - paragraph [ref=e547]: Complete automated operations for premium banquets & resorts.
              - generic [ref=e548]:
                - generic [ref=e549]: ₹14,999
                - generic [ref=e550]: /year
              - list [ref=e551]:
                - listitem [ref=e552]:
                  - img [ref=e553]
                  - generic [ref=e555]: Unlimited Halls & Spaces Profiles
                - listitem [ref=e556]:
                  - img [ref=e557]
                  - generic [ref=e559]: Unlimited Bookings Calendar
                - listitem [ref=e560]:
                  - img [ref=e561]
                  - generic [ref=e563]: WhatsApp Automated Receipts & Reminders
                - listitem [ref=e564]:
                  - img [ref=e565]
                  - generic [ref=e567]: Full CFO Expense & Category Analytics
                - listitem [ref=e568]:
                  - img [ref=e569]
                  - generic [ref=e571]: Staff Roles & Permissions (RBAC)
                - listitem [ref=e572]:
                  - img [ref=e573]
                  - generic [ref=e575]: Discovery Marketplace Premium Listing
                - listitem [ref=e576]:
                  - img [ref=e577]
                  - generic [ref=e579]: Bulk Excel/CSV Import Wizard
                - listitem [ref=e580]:
                  - img [ref=e581]
                  - generic [ref=e583]: Priority 24/7 Phone & Chat Support
            - button "Start 14-Day Free Trial" [ref=e584] [cursor=pointer]
          - generic [ref=e585]:
            - generic [ref=e586]:
              - generic [ref=e587]:
                - heading "Enterprise" [level=3] [ref=e588]
                - paragraph [ref=e589]: Custom operations scale for multi-city venues.
              - generic [ref=e590]:
                - generic [ref=e591]: Custom
                - generic [ref=e592]: /bespoke setup
              - list [ref=e593]:
                - listitem [ref=e594]:
                  - img [ref=e595]
                  - generic [ref=e597]: Multi-Location & Chain Dashboards
                - listitem [ref=e598]:
                  - img [ref=e599]
                  - generic [ref=e601]: Bespoke Billing & GST Tax Layouts
                - listitem [ref=e602]:
                  - img [ref=e603]
                  - generic [ref=e605]: Dedicated Account Operations Manager
                - listitem [ref=e606]:
                  - img [ref=e607]
                  - generic [ref=e609]: Bespoke WhatsApp Notification Packs
                - listitem [ref=e610]:
                  - img [ref=e611]
                  - generic [ref=e613]: Advanced API Data Access & Webhooks
                - listitem [ref=e614]:
                  - img [ref=e615]
                  - generic [ref=e617]: Custom Staff Coaching & Onboarding
            - link "Contact Sales Team" [ref=e618] [cursor=pointer]:
              - /url: mailto:support@venuepro.in?subject=Enterprise Inquiry
      - generic [ref=e621]:
        - heading "Modernize Your Venue Operations Today" [level=2] [ref=e622]
        - paragraph [ref=e623]: Eliminate errors, protect client calendars, and get clean digital accounting reports. Join hundreds of Indian banquets and resorts.
        - generic [ref=e624]:
          - button "Start Your Free Trial" [ref=e625] [cursor=pointer]
          - link "Request Customized Demo" [ref=e626] [cursor=pointer]:
            - /url: mailto:support@venuepro.in?subject=Demo Inquiry
      - generic [ref=e627]:
        - generic [ref=e628]:
          - heading "Operational Frequently Asked Questions" [level=2] [ref=e629]
          - paragraph [ref=e630]: We respond to the most common day-to-day doubts of banquet hall and resort managers.
        - generic [ref=e631]:
          - generic [ref=e632]:
            - button "All Questions" [ref=e633] [cursor=pointer]
            - button "Usage & Setup" [ref=e634] [cursor=pointer]
            - button "Revenue Benefits" [ref=e635] [cursor=pointer]
            - button "Staff & Control" [ref=e636] [cursor=pointer]
            - button "Offline Support" [ref=e637] [cursor=pointer]
          - generic [ref=e638]:
            - button "How easy is it to migrate from paper registers and Excel sheets to VenuePro?" [ref=e640] [cursor=pointer]:
              - generic [ref=e641]: How easy is it to migrate from paper registers and Excel sheets to VenuePro?
              - img [ref=e642]
            - button "How does VenuePro guarantee a boost in booking occupancy?" [ref=e645] [cursor=pointer]:
              - generic [ref=e646]: How does VenuePro guarantee a boost in booking occupancy?
              - img [ref=e647]
            - button "Can I restrict staff access so they don't see my cash flow and profits?" [ref=e650] [cursor=pointer]:
              - generic [ref=e651]: Can I restrict staff access so they don't see my cash flow and profits?
              - img [ref=e652]
            - button "What happens if we lose internet connection during a busy wedding season?" [ref=e655] [cursor=pointer]:
              - generic [ref=e656]: What happens if we lose internet connection during a busy wedding season?
              - img [ref=e657]
    - contentinfo [ref=e659]:
      - generic [ref=e660]:
        - generic [ref=e661]:
          - img "VenuePro Logo" [ref=e663]
          - paragraph [ref=e664]: The simple B2B system for wedding halls, banquets, and event centers. Made in India, built for everyone.
        - generic [ref=e665]:
          - generic [ref=e666]: Product Links
          - list [ref=e667]:
            - listitem [ref=e668]:
              - link "Platform Features" [ref=e669] [cursor=pointer]:
                - /url: "#features"
            - listitem [ref=e670]:
              - link "Operational Timeline" [ref=e671] [cursor=pointer]:
                - /url: "#workflow"
            - listitem [ref=e672]:
              - link "Revenue Analytics" [ref=e673] [cursor=pointer]:
                - /url: "#analytics"
            - listitem [ref=e674]:
              - link "Help FAQ Center" [ref=e675] [cursor=pointer]:
                - /url: "#faq"
        - generic [ref=e676]:
          - generic [ref=e677]: Legal & Trust
          - list [ref=e678]:
            - listitem [ref=e679]:
              - link "Privacy Policy" [ref=e680] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e681]:
              - link "Terms of Service" [ref=e682] [cursor=pointer]:
                - /url: /terms
            - listitem [ref=e683]:
              - link "Data Encryption SLA" [ref=e684] [cursor=pointer]:
                - /url: "#"
        - generic [ref=e685]:
          - generic [ref=e686]: Help & Support
          - paragraph [ref=e687]:
            - text: "EMAIL US:"
            - strong [ref=e688]: support@venuepro.in
  - button "Feedback" [ref=e690] [cursor=pointer]:
    - img [ref=e691]
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